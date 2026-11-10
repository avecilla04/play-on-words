// ============================================================
// RACHA DIARIA
// ============================================================
//
// Un día cuenta como practicado si has contestado al menos
// una palabra. Los días se calculan en hora de España.
// ============================================================

export const APP_TIME_ZONE = "Europe/Madrid";

// "2026-11-10"
export function dayKey(date: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function shiftDay(key: string, days: number) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));

  return date.toISOString().slice(0, 10);
}

export type StreakInfo = {
  current: number;
  best: number;
  practicedToday: boolean;
  // Últimos 7 días, del más antiguo a hoy
  week: { key: string; label: string; practiced: boolean; isToday: boolean }[];
};

const WEEKDAY_LABELS = ["D", "L", "M", "X", "J", "V", "S"];

export function computeStreak(
  practicedDays: Iterable<string>,
  today: string = dayKey()
): StreakInfo {
  const days = new Set(practicedDays);

  const practicedToday = days.has(today);

  // Si hoy aún no has jugado, la racha sigue viva hasta
  // medianoche y se cuenta desde ayer.
  let cursor = practicedToday ? today : shiftDay(today, -1);
  let current = 0;

  while (days.has(cursor)) {
    current += 1;
    cursor = shiftDay(cursor, -1);
  }

  // Mejor racha histórica
  let best = 0;
  let run = 0;
  let previous: string | null = null;

  for (const key of Array.from(days).sort()) {
    run = previous && shiftDay(previous, 1) === key ? run + 1 : 1;
    best = Math.max(best, run);
    previous = key;
  }

  const week = Array.from({ length: 7 }, (_, index) => {
    const key = shiftDay(today, index - 6);
    const [year, month, day] = key.split("-").map(Number);
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

    return {
      key,
      label: WEEKDAY_LABELS[weekday],
      practiced: days.has(key),
      isToday: key === today,
    };
  });

  return { current, best: Math.max(best, current), practicedToday, week };
}
