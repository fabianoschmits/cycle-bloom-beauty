const PILL_KEY = "luna.pill.v1";
const PILL_UPDATE = "luna:pill-update";

export interface PillRecord {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  takenAt: string; // ISO
}

const isBrowser = () => typeof window !== "undefined";

export function getPillRecords(): Record<string, PillRecord> {
  if (!isBrowser()) return {};
  const raw = localStorage.getItem(PILL_KEY);
  return raw ? (JSON.parse(raw) as Record<string, PillRecord>) : {};
}

export function takePillNow(): PillRecord {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const record: PillRecord = { date, time, takenAt: now.toISOString() };
  const all = getPillRecords();
  all[date] = record;
  localStorage.setItem(PILL_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(PILL_UPDATE));
  return record;
}

/** Register pill taken on a specific date (retroactive). Uses noon as time if not provided. */
export function takePillOnDate(date: string, time = "12:00"): PillRecord {
  const record: PillRecord = { date, time, takenAt: new Date(`${date}T${time}:00`).toISOString() };
  const all = getPillRecords();
  all[date] = record;
  localStorage.setItem(PILL_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(PILL_UPDATE));
  return record;
}

export function undoPillToday() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  undoPillOnDate(date);
}

/** Remove pill record for a specific date. */
export function undoPillOnDate(date: string) {
  const all = getPillRecords();
  delete all[date];
  localStorage.setItem(PILL_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(PILL_UPDATE));
}

/** Average usual time (HH:mm) from last 30 records, or null if none. */
export function getUsualTime(): string | null {
  const records = Object.values(getPillRecords());
  if (records.length === 0) return null;
  const recent = records
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 30);
  const totalMin = recent.reduce((sum, r) => {
    const [h, m] = r.time.split(":").map(Number);
    return sum + h * 60 + m;
  }, 0);
  const avg = Math.round(totalMin / recent.length);
  const h = Math.floor(avg / 60);
  const m = avg % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}`;
}
