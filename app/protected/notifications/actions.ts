"use server";

import { createClient, getAuthUser } from "@/lib/supabase/server";
import { pushIsConfigured, sendPush } from "@/lib/push";

type Result = { success: boolean; message: string };

type BrowserSubscription = {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
};

// ------------------------------------------------------------
// Guardar la suscripción de este dispositivo
// ------------------------------------------------------------

export async function savePushSubscription(
  subscription: BrowserSubscription
): Promise<Result> {
  const supabase = await createClient();
  const user = await getAuthUser(supabase);

  if (!user) {
    return { success: false, message: "Debes iniciar sesión." };
  }

  const endpoint = subscription.endpoint;
  const p256dh = subscription.keys?.p256dh;
  const auth = subscription.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    return { success: false, message: "Suscripción no válida." };
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      { user_id: user.id, endpoint, p256dh, auth },
      { onConflict: "endpoint" }
    );

  if (error) {
    console.error("Error guardando suscripción:", error);
    return {
      success: false,
      message: "No se pudo activar el recordatorio.",
    };
  }

  return { success: true, message: "Recordatorio activado." };
}

// ------------------------------------------------------------
// Borrar la suscripción de este dispositivo
// ------------------------------------------------------------

export async function deletePushSubscription(
  endpoint: string
): Promise<Result> {
  const supabase = await createClient();
  const user = await getAuthUser(supabase);

  if (!user) {
    return { success: false, message: "Debes iniciar sesión." };
  }

  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  return { success: true, message: "Recordatorio desactivado." };
}

// ------------------------------------------------------------
// Notificación de prueba (para comprobar que todo funciona)
// ------------------------------------------------------------

export async function sendTestNotification(): Promise<Result> {
  if (!pushIsConfigured()) {
    return {
      success: false,
      message: "Faltan las claves VAPID en las variables de entorno.",
    };
  }

  const supabase = await createClient();
  const user = await getAuthUser(supabase);

  if (!user) {
    return { success: false, message: "Debes iniciar sesión." };
  }

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", user.id);

  if (!subscriptions?.length) {
    return {
      success: false,
      message: "Este dispositivo no tiene el recordatorio activado.",
    };
  }

  const results = await Promise.all(
    subscriptions.map((subscription) =>
      sendPush(subscription, {
        title: "🔔 ¡Funciona!",
        body: "Así te recordaré cada día que practiques tu vocabulario.",
        url: "/protected",
      })
    )
  );

  const gone = subscriptions.filter((_, index) => results[index] === "gone");

  if (gone.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in(
        "endpoint",
        gone.map((subscription) => subscription.endpoint)
      );
  }

  const sent = results.filter((result) => result === "sent").length;

  return sent > 0
    ? { success: true, message: "Notificación enviada. Debería llegarte en unos segundos." }
    : { success: false, message: "No se pudo enviar la notificación." };
}
