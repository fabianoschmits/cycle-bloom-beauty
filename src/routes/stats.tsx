import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Screen } from "@/components/Screen";
import { useLuna } from "@/hooks/useLuna";
import { detectPeriodStarts, avgCycleFromHistory } from "@/lib/cycle/calculations";
import type { Mood } from "@/lib/cycle/types";
import { differenceInDays, parseISO, subDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo } from "react";

const MOOD_META: Record<Mood, { label: string; emoji: string; color: string }> = {
  calm: { label: "Calma", emoji: "😌", color: "var(--color-mood-calm)" },
  happy: { label: "Feliz", emoji: "😊", color: "var(--color-mood-happy)" },
  sad: { label: "Triste", emoji: "😢", color: "var(--color-mood-sad)" },
  anxious: { label: "Ansiosa", emoji: "😰", color: "var(--color-mood-anxious)" },
  irritable: { label: "Irritada", emoji: "😤", color: "var(--color-mood-irritable)" },
  energetic: { label: "Enérgica", emoji: "⚡️", color: "var(--color-mood-energetic)" },
  tired: { label: "Cansada", emoji: "🥱", color: "var(--color-mood-tired)" },
};
const MOOD_ORDER: Mood[] = ["calm", "happy", "energetic", "tired", "anxious", "irritable", "sad"];

export const Route = createFileRoute("/stats")({
  component: StatsPage,
});

function StatsPage() {
  const { profile, periodDays, logs } = useLuna();
  const starts = detectPeriodStarts(periodDays);
  const avgCycle = profile ? avgCycleFromHistory(starts, profile.avgCycleLength) : 28;

  const cycleGaps = useMemo(() => {
    const gaps: number[] = [];
    for (let i = 1; i < starts.length; i++) {
      gaps.push(differenceInDays(parseISO(starts[i]), parseISO(starts[i - 1])));
    }
    return gaps.slice(-6);
  }, [starts]);

  const last30 = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => format(subDays(new Date(), 29 - i), "yyyy-MM-dd"));
    return days.map((d) => logs[d]);
  }, [logs]);

  // Symptom frequency
  const symptomCounts = useMemo(() => {
    const map = new Map<string, number>();
    Object.values(logs).forEach((l) => l.symptoms?.forEach((s) => map.set(s, (map.get(s) ?? 0) + 1)));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [logs]);

  const avgSleep = useMemo(() => {
    const vals = Object.values(logs).map((l) => l.sleepHours).filter((v): v is number => typeof v === "number");
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [logs]);

  const totalLogs = Object.keys(logs).length;

  return (
    <Screen subtitle="Padrões" title="Suas estatísticas">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Ciclo médio" value={`${avgCycle}d`} />
        <Stat label="Registros" value={String(totalLogs)} />
        <Stat label="Sono médio" value={avgSleep ? `${avgSleep.toFixed(1)}h` : "—"} />
      </div>

      <Card title="Últimos ciclos">
        {cycleGaps.length === 0 ? (
          <Empty text="Registre mais menstruações para ver seus padrões." />
        ) : (
          <div className="mt-2 flex items-end gap-2">
            {cycleGaps.map((g, i) => {
              const max = Math.max(...cycleGaps, avgCycle);
              const h = (g / max) * 100;
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex-1 rounded-t-lg bg-primary/70"
                  style={{ minHeight: 20 }}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-foreground">
                    {g}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
        <div className="mt-2 text-center text-[11px] text-muted-foreground">Dias entre menstruações</div>
      </Card>

      <Card title="Sintomas mais frequentes">
        {symptomCounts.length === 0 ? (
          <Empty text="Nenhum sintoma registrado ainda." />
        ) : (
          <div className="mt-2 space-y-2">
            {symptomCounts.map(([s, count], i) => {
              const max = symptomCounts[0][1];
              return (
                <div key={s}>
                  <div className="flex justify-between text-xs">
                    <span className="capitalize text-foreground">{s.replace("_", " ")}</span>
                    <span className="text-muted-foreground">{count}×</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / max) * 100}%` }}
                      transition={{ delay: i * 0.08, duration: 0.6 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card title="Últimos 30 dias">
        <div className="mt-2 grid grid-cols-15 gap-1" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
          {last30.map((l, i) => {
            const has = !!l;
            const isPeriod = l?.flow;
            return (
              <div
                key={i}
                className="aspect-square rounded-md"
                style={{
                  backgroundColor: isPeriod
                    ? "var(--phase-menstrual)"
                    : has
                      ? "color-mix(in oklab, var(--color-primary) 30%, transparent)"
                      : "var(--color-secondary)",
                }}
                title={l?.date}
              />
            );
          })}
        </div>
        <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
          <span>{format(subDays(new Date(), 29), "d MMM", { locale: ptBR })}</span>
          <span>hoje</span>
        </div>
      </Card>

      <p className="mt-6 px-2 text-center text-[11px] leading-relaxed text-muted-foreground">
        As correlações são observacionais. Consulte profissionais de saúde para diagnósticos.
      </p>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl text-foreground">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4 rounded-3xl border border-border/60 bg-card p-5">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</h3>
      <div className="mt-1 h-32">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="mt-6 text-center text-xs text-muted-foreground">{text}</p>;
}
