import type { DailyLog, UserProfile } from "./types";

const PROFILE_KEY = "luna.profile.v1";
const LOGS_KEY = "luna.logs.v1";
const PERIODS_KEY = "luna.periods.v1";

const isBrowser = () => typeof window !== "undefined";

export function getProfile(): UserProfile | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? (JSON.parse(raw) as UserProfile) : null;
}

export function saveProfile(profile: UserProfile) {
  if (!isBrowser()) return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event("luna:update"));
}

export function getLogs(): Record<string, DailyLog> {
  if (!isBrowser()) return {};
  const raw = localStorage.getItem(LOGS_KEY);
  return raw ? (JSON.parse(raw) as Record<string, DailyLog>) : {};
}

export function saveLog(log: DailyLog) {
  const all = getLogs();
  all[log.date] = { ...all[log.date], ...log };
  localStorage.setItem(LOGS_KEY, JSON.stringify(all));
  // Track period starts when flow logged
  if (log.flow) addPeriodDay(log.date);
  window.dispatchEvent(new Event("luna:update"));
}

export function getLog(date: string): DailyLog | undefined {
  return getLogs()[date];
}

export function getPeriodDays(): string[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(PERIODS_KEY);
  return raw ? (JSON.parse(raw) as string[]) : [];
}

function addPeriodDay(date: string) {
  const days = new Set(getPeriodDays());
  days.add(date);
  localStorage.setItem(PERIODS_KEY, JSON.stringify(Array.from(days).sort()));
}

export function removePeriodDay(date: string) {
  const days = getPeriodDays().filter((d) => d !== date);
  localStorage.setItem(PERIODS_KEY, JSON.stringify(days));
  const logs = getLogs();
  if (logs[date]) {
    delete logs[date].flow;
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  }
  window.dispatchEvent(new Event("luna:update"));
}

export function exportAll(): string {
  return JSON.stringify(
    {
      profile: getProfile(),
      logs: getLogs(),
      periods: getPeriodDays(),
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  );
}

export function importAll(json: string) {
  const data = JSON.parse(json);
  if (data.profile) localStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile));
  if (data.logs) localStorage.setItem(LOGS_KEY, JSON.stringify(data.logs));
  if (data.periods) localStorage.setItem(PERIODS_KEY, JSON.stringify(data.periods));
  window.dispatchEvent(new Event("luna:update"));
}

export function clearAll() {
  if (!isBrowser()) return;
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(LOGS_KEY);
  localStorage.removeItem(PERIODS_KEY);
  localStorage.removeItem("luna.pill.v1");
  window.dispatchEvent(new Event("luna:update"));
}
