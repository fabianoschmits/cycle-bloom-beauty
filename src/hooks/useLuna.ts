import { useEffect, useMemo, useState } from "react";
import { getLogs, getPeriodDays, getProfile } from "@/lib/cycle/storage";
import type { DailyLog, UserProfile } from "@/lib/cycle/types";
import { computeInsight } from "@/lib/cycle/calculations";

const isBrowser = typeof window !== "undefined";

export function useLuna() {
  // Lazy initializers read synchronously from localStorage on first render —
  // no useEffect needed for the initial data, eliminating the "blank flash"
  // and the double-tap issue when navigating between pages.
  const [profile, setProfile] = useState<UserProfile | null>(() =>
    isBrowser ? getProfile() : null,
  );
  const [logs, setLogs] = useState<Record<string, DailyLog>>(() =>
    isBrowser ? getLogs() : {},
  );
  const [periodDays, setPeriodDays] = useState<string[]>(() =>
    isBrowser ? getPeriodDays() : [],
  );
  const [ready, setReady] = useState(isBrowser);

  useEffect(() => {
    const load = () => {
      setProfile(getProfile());
      setLogs(getLogs());
      setPeriodDays(getPeriodDays());
      setReady(true);
    };
    // luna:update covers profile/logs/periods changes
    // luna:pill-update covers pill record changes (forces re-render for CycleRing)
    window.addEventListener("luna:update", load);
    window.addEventListener("luna:pill-update", load);
    return () => {
      window.removeEventListener("luna:update", load);
      window.removeEventListener("luna:pill-update", load);
    };
  }, []);

  const insight = useMemo(
    () => (profile ? computeInsight(profile, periodDays) : null),
    [profile, periodDays],
  );

  return { profile, logs, periodDays, insight, ready };
}
