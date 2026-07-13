import { useEffect, useState } from "react";
import { getPillRecords, getUsualTime, type PillRecord } from "@/lib/cycle/pill";

const PILL_UPDATE = "luna:pill-update";

function todayKey(now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function minutesNow(now = new Date()) {
  return now.getHours() * 60 + now.getMinutes();
}

function timeToMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export type PillTodayState = {
  todayKey: string;
  takenToday?: PillRecord;
  usual: string | null;
  overdue: boolean;
};

function readPillState(now = new Date()): PillTodayState {
  const key = todayKey(now);
  const takenToday = getPillRecords()[key];
  const usual = getUsualTime();
  const overdue = !takenToday && usual !== null && minutesNow(now) > timeToMin(usual) + 30;
  return { todayKey: key, takenToday, usual, overdue };
}

/** Lightweight pill state for the home screen — avoids reloading all Luna data on each tap. */
export function usePillToday() {
  const [state, setState] = useState<PillTodayState>(() =>
    typeof window === "undefined" ? { todayKey: "", usual: null, overdue: false } : readPillState(),
  );

  useEffect(() => {
    const refresh = () => setState(readPillState());

    refresh();
    window.addEventListener(PILL_UPDATE, refresh);
    window.addEventListener("luna:update", refresh);

    let timeoutId: number | undefined;
    const scheduleOverdueCheck = () => {
      window.clearTimeout(timeoutId);
      const current = readPillState();
      if (current.takenToday || !current.usual) return;

      const targetMin = timeToMin(current.usual) + 30;
      const nowMin = minutesNow();
      const delayMs = nowMin < targetMin ? (targetMin - nowMin) * 60_000 + 500 : 60_000;
      timeoutId = window.setTimeout(() => {
        setState(readPillState());
        scheduleOverdueCheck();
      }, Math.min(delayMs, 60 * 60_000));
    };

    scheduleOverdueCheck();

    return () => {
      window.removeEventListener(PILL_UPDATE, refresh);
      window.removeEventListener("luna:update", refresh);
      window.clearTimeout(timeoutId);
    };
  }, []);

  return state;
}

export function notifyPillUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PILL_UPDATE));
  }
}
