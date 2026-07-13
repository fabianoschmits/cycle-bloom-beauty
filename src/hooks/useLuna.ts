import { useEffect, useMemo, useState } from "react";
import { getLogs, getPeriodDays, getProfile } from "@/lib/cycle/storage";
import type { DailyLog, UserProfile } from "@/lib/cycle/types";
import { computeInsight } from "@/lib/cycle/calculations";

export function useLuna() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [periodDays, setPeriodDays] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = () => {
      setProfile(getProfile());
      setLogs(getLogs());
      setPeriodDays(getPeriodDays());
      setReady(true);
    };
    load();
    window.addEventListener("luna:update", load);
    return () => window.removeEventListener("luna:update", load);
  }, []);

  const insight = useMemo(
    () => (profile ? computeInsight(profile, periodDays) : null),
    [profile, periodDays],
  );

  return { profile, logs, periodDays, insight, ready };
}
