import { createClient, getAuthUser } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/streak";
import NotificationToggle from "./notification-toggle";

// ============================================================
// TARJETA DE RACHA DIARIA (pantalla de inicio)
// ============================================================

export default async function DailyStreak() {
  const supabase = await createClient();
  const user = await getAuthUser(supabase);

  if (!user) return null;

  const { data, error } = await supabase
    .from("practice_days")
    .select("day")
    .eq("user_id", user.id)
    .order("day", { ascending: false })
    .limit(1000);

  // Si aún no se ha creado la tabla en Supabase, no mostramos nada.
  if (error) return null;

  const streak = computeStreak((data ?? []).map((row) => row.day));

  return (
    <section className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
              streak.current > 0 ? "bg-orange-50" : "bg-slate-100 grayscale"
            }`}
          >
            🔥
          </div>

          <div>
            <p className="text-2xl font-bold leading-none text-slate-900">
              {streak.current} {streak.current === 1 ? "día" : "días"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {streak.practicedToday
                ? "¡Hoy ya has practicado!"
                : streak.current > 0
                  ? "Juega hoy para no perder tu racha"
                  : "Juega hoy para empezar una racha"}
            </p>
          </div>
        </div>

        {streak.best > 1 && (
          <div className="text-right">
            <p className="text-xs text-slate-400">Récord</p>
            <p className="font-bold text-slate-700">{streak.best}</p>
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1.5">
        {streak.week.map((day) => (
          <div key={day.key} className="flex flex-col items-center gap-1.5">
            <span
              className={`text-xs ${
                day.isToday ? "font-bold text-slate-900" : "text-slate-400"
              }`}
            >
              {day.label}
            </span>

            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                day.practiced
                  ? "bg-orange-500 text-white"
                  : day.isToday
                    ? "border-2 border-dashed border-orange-300 bg-white"
                    : "bg-slate-100"
              }`}
            >
              {day.practiced ? "✓" : ""}
            </span>
          </div>
        ))}
      </div>

      <NotificationToggle />
    </section>
  );
}
