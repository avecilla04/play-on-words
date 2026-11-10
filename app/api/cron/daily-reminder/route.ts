import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { pushIsConfigured, sendPush } from "@/lib/push";
import { computeStreak, dayKey } from "@/lib/streak";

// ============================================================
// RECORDATORIO DIARIO
// ============================================================
//
// Vercel llama a esta ruta una vez al día (ver vercel.json).
// Envía una notificación a quien todavía no haya practicado
// hoy, con un mensaje según su racha.
//
// Variables de entorno necesarias (además de las VAPID):
//   SUPABASE_SECRET_KEY  → clave secreta de Supabase
//   CRON_SECRET          → contraseña que Vercel envía al llamar
// ============================================================

export const maxDuration = 60;

function reminderFor(streak: number) {
  if (streak >= 2) {
    return {
      title: `🔥 ¡No pierdas tu racha de ${streak} días!`,
      body: `Unos minutos de vocabulario y mañana serán ${streak + 1}.`,
    };
  }

  if (streak === 1) {
    return {
      title: "🔥 ¡Vas por el segundo día!",
      body: "Practica hoy y empieza a construir tu racha.",
    };
  }

  return {
    title: "📚 Hora de practicar",
    body: "Unas pocas palabras al día marcan la diferencia en tu B2.",
  };
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (
    !cronSecret ||
    request.headers.get("authorization") !== `Bearer ${cronSecret}`
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const secretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secretKey || !pushIsConfigured()) {
    return NextResponse.json(
      { error: "Faltan variables de entorno" },
      { status: 500 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secretKey,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  // 1. Dispositivos con el recordatorio activado
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("user_id, endpoint, p256dh, auth");

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!subscriptions?.length) {
    return NextResponse.json({ sent: 0, skipped: 0 });
  }

  const userIds = Array.from(new Set(subscriptions.map((s) => s.user_id)));

  // 2. Días practicados (últimos 2 meses) para calcular rachas
  const since = new Date(Date.now() - 62 * 24 * 60 * 60 * 1000);

  const { data: practice } = await supabase
    .from("practice_days")
    .select("user_id, day")
    .in("user_id", userIds)
    .gte("day", dayKey(since));

  const daysByUser = new Map<string, string[]>();

  for (const row of practice ?? []) {
    const days = daysByUser.get(row.user_id) ?? [];
    days.push(row.day);
    daysByUser.set(row.user_id, days);
  }

  // 3. Enviar a quien no haya practicado hoy
  let sent = 0;
  let skipped = 0;
  const gone: string[] = [];

  await Promise.all(
    subscriptions.map(async (subscription) => {
      const streak = computeStreak(daysByUser.get(subscription.user_id) ?? []);

      if (streak.practicedToday) {
        skipped += 1;
        return;
      }

      const result = await sendPush(subscription, {
        ...reminderFor(streak.current),
        url: "/protected/play",
      });

      if (result === "sent") sent += 1;
      if (result === "gone") gone.push(subscription.endpoint);
    })
  );

  // 4. Limpiar dispositivos que ya no existen
  if (gone.length > 0) {
    await supabase.from("push_subscriptions").delete().in("endpoint", gone);
  }

  return NextResponse.json({ sent, skipped, removed: gone.length });
}
