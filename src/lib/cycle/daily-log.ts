import type { DailyLog } from "./types";

export function hasDailyLog(log?: DailyLog): boolean {
  if (!log) return false;
  return Boolean(
    log.flow ||
      log.mood ||
      (log.symptoms?.length ?? 0) > 0 ||
      log.crampsIntensity != null ||
      log.sleepHours != null ||
      log.activityMinutes != null ||
      log.weightKg != null ||
      log.basalTemp != null ||
      log.sex?.happened ||
      (log.medications?.length ?? 0) > 0 ||
      log.contraceptive ||
      log.notes,
  );
}

export function dailyLogSummary(log?: DailyLog): string[] {
  if (!log) return [];
  const items: string[] = [];
  if (log.mood) items.push("humor");
  if (log.flow) items.push("fluxo");
  if ((log.symptoms?.length ?? 0) > 0) items.push("sintomas");
  if (log.sleepHours != null) items.push("sono");
  if (log.activityMinutes != null) items.push("atividade");
  if (log.weightKg != null) items.push("peso");
  if (log.basalTemp != null) items.push("temperatura");
  return items;
}
