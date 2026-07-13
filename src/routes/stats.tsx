import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Screen } from "@/components/Screen";
import { useLuna } from "@/hooks/useLuna";
import { detectPeriodStarts, avgCycleFromHistory } from "@/lib/cycle/calculations";
import type { DailyLog, Mood } from "@/lib/cycle/types";
import { addDays, differenceInDays, parseISO, subDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type MoodMeta = { label: string; emoji: string; color: string; ink: string };
const MOOD_META: Record<Mood, MoodMeta> = {
  calm: { label: "Calma", emoji: "😌", color: "var(--color-mood-calm)", ink: "var(--color-mood-calm-ink)" },
  happy: { label: "Feliz", emoji: "😊", color: "var(--color-mood-happy)", ink: "var(--color-mood-happy-ink)" },
  sad: { label: "Triste", emoji: "😢", color: "var(--color-mood-sad)", ink: "var(--color-mood-sad-ink)" },
  anxious: { label: "Ansiosa", emoji: "😰", color: "var(--color-mood-anxious)", ink: "var(--color-mood-anxious-ink)" },
  irritable: { label: "Irritada", emoji: "😤", color: "var(--color-mood-irritable)", ink: "var(--color-mood-irritable-ink)" },
  energetic: { label: "Enérgica", emoji: "⚡️", color: "var(--color-mood-energetic)", ink: "var(--color-mood-energetic-ink)" },
  tired: { label: "Cansada", emoji: "🥱", color: "var(--color-mood-tired)", ink: "var(--color-mood-tired-ink)" },
};
const MOOD_ORDER: Mood[] = ["calm", "happy", "energetic", "tired", "anxious", "irritable", "sad"];

type PhaseMark = "menstrual" | "fertile" | "ovulation" | null;
const PHASE_META: Record<Exclude<PhaseMark, null>, { label: string; color: string }> = {
  menstrual: { label: "Menstruação", color: "var(--color-phase-menstrual)" },
  fertile: { label: "Janela fértil", color: "var(--color-phase-ovulation)" },
  ovulation: { label: "Ovulação", color: "var(--color-phase-follicular)" },
};

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
    const cycleLen = Math.max(15, avgCycle);
    const periodLen = profile?.avgPeriodLength ?? 5;
    const sortedStarts = [...starts].sort();
    return Array.from({ length: 30 }, (_, i) => {
      const dateObj = subDays(new Date(), 29 - i);
      const date = format(dateObj, "yyyy-MM-dd");
      const log = logs[date] as DailyLog | undefined;

      // Anchor to most recent past period start (roll forward projected cycles
      // if the newest start is older than one cycle length).
      let anchor: string | null = null;
      for (let k = sortedStarts.length - 1; k >= 0; k--) {
        if (sortedStarts[k] <= date) { anchor = sortedStarts[k]; break; }
      }
      let phase: PhaseMark = null;
      if (anchor) {
        const rawDoc = differenceInDays(dateObj, parseISO(anchor)) + 1;
        // Project forward one or more full cycles when no newer start exists yet.
        const projectedCycles = rawDoc > cycleLen ? Math.floor((rawDoc - 1) / cycleLen) : 0;
        const dayOfCycle = rawDoc - projectedCycles * cycleLen;
        const ovulationDay = cycleLen - 14;
        const isProjected = projectedCycles > 0;

        if (dayOfCycle >= 1 && dayOfCycle <= periodLen) phase = "menstrual";
        else if (dayOfCycle === ovulationDay) phase = "ovulation";
        else if (dayOfCycle >= ovulationDay - 5 && dayOfCycle <= ovulationDay + 1) phase = "fertile";

        // Never predict menstruation from projection if the user already logged
        // an actual flow-free day — respect the record as ground truth.
        if (phase === "menstrual" && isProjected && log && !log.flow) phase = null;
      }
      // Actual logged flow always wins over any projection.
      if (log?.flow) phase = "menstrual";

      return { date, dateObj, log, phase };
    });
  }, [logs, starts, avgCycle, profile?.avgPeriodLength]);

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

  const moodCounts = useMemo(() => {
    const map = new Map<Mood, number>();
    Object.values(logs).forEach((l) => {
      if (l.mood) map.set(l.mood, (map.get(l.mood) ?? 0) + 1);
    });
    return MOOD_ORDER.map((m) => ({ mood: m, count: map.get(m) ?? 0 }));
  }, [logs]);
  const moodTotal = moodCounts.reduce((a, b) => a + b.count, 0);
  const moodMax = Math.max(1, ...moodCounts.map((m) => m.count));
  const dominantMood = moodTotal > 0 ? [...moodCounts].sort((a, b) => b.count - a.count)[0].mood : null;

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

      <section className="mt-4 rounded-3xl border border-border/60 bg-card p-5">
        <div className="flex items-baseline justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Humor
          </h3>
          {dominantMood && (
            <span className="text-[11px] text-muted-foreground">
              Predominante:{" "}
              <span className="text-foreground">
                {MOOD_META[dominantMood].emoji} {MOOD_META[dominantMood].label}
              </span>
            </span>
          )}
        </div>

        {moodTotal === 0 ? (
          <Empty text="Registre seu humor no diário para ver o gráfico." />
        ) : (
          <>
            {/* Emotion frequency — bars with high-contrast ink border/text */}
            <MoodBarsRow moodCounts={moodCounts} moodMax={moodMax} logs={logs} />

            {/* 30-day strip with phase ribbon + tap-to-detail */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[11px] font-medium uppercase tracking-wider text-foreground">
                  Últimos 30 dias
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Setas para navegar · Enter para detalhes
                </div>
              </div>
              <DayGrid days={last30} />
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                <span>{format(subDays(new Date(), 29), "d MMM", { locale: ptBR })}</span>
                <span>hoje</span>
              </div>
            </div>

            {/* Legends */}
            <div className="mt-5 space-y-3">
              <div>
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Humor
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {MOOD_ORDER.map((m) => (
                    <div key={m} className="flex items-center gap-1.5 text-[12px] text-foreground">
                      <span
                        className="h-3 w-3 rounded-full border-2"
                        style={{
                          backgroundColor: MOOD_META[m].color,
                          borderColor: MOOD_META[m].ink,
                        }}
                        aria-hidden="true"
                      />
                      <span aria-hidden="true">{MOOD_META[m].emoji}</span>
                      {MOOD_META[m].label}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Ciclo
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {(Object.keys(PHASE_META) as Array<Exclude<PhaseMark, null>>).map((p) => (
                    <div key={p} className="flex items-center gap-1.5 text-[12px] text-foreground">
                      <span
                        className="h-1.5 w-5 rounded-full"
                        style={{ backgroundColor: PHASE_META[p].color }}
                        aria-hidden="true"
                      />
                      {PHASE_META[p].label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </section>



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

const SYMPTOM_LABEL: Record<string, string> = {
  cramps: "Cólicas",
  headache: "Dor de cabeça",
  bloating: "Inchaço",
  tender_breasts: "Seios sensíveis",
  backache: "Dor nas costas",
  acne: "Acne",
  nausea: "Náusea",
  fatigue: "Fadiga",
  cravings: "Desejos",
};

type Day = {
  date: string;
  dateObj: Date;
  log: DailyLog | undefined;
  phase: PhaseMark;
};

function DayCell({ day }: { day: Day }) {
  const [open, setOpen] = useState(false);
  const meta = day.log?.mood ? MOOD_META[day.log.mood] : null;
  const phaseColor = day.phase ? PHASE_META[day.phase].color : null;
  const bg = meta ? meta.color : "var(--color-secondary)";
  const border = meta ? meta.ink : "var(--color-border)";
  const dayLabel = format(day.dateObj, "d 'de' MMMM", { locale: ptBR });

  const aria = [
    dayLabel,
    meta ? `humor ${meta.label}` : "sem humor registrado",
    day.phase ? PHASE_META[day.phase].label : null,
    day.log?.flow ? "menstruação registrada" : null,
  ].filter(Boolean).join(", ");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative flex aspect-square min-h-8 min-w-8 items-center justify-center overflow-hidden rounded-md border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card"
          style={{
            backgroundColor: bg,
            borderColor: border,
            opacity: meta ? 1 : 0.75,
          }}
          aria-label={aria}
        >
          {phaseColor && (
            <span
              className="absolute inset-x-0 top-0 h-1"
              style={{ backgroundColor: phaseColor }}
              aria-hidden="true"
            />
          )}
          {day.phase === "ovulation" && (
            <span
              className="relative h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "var(--color-phase-follicular)", boxShadow: "0 0 0 2px var(--color-card)" }}
              aria-hidden="true"
            />
          )}
          {day.log?.flow && !day.phase && (
            <span
              className="absolute inset-x-0 top-0 h-1"
              style={{ backgroundColor: "var(--color-phase-menstrual)" }}
              aria-hidden="true"
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="center" className="w-60 p-3 text-sm">
        <div className="font-display text-base capitalize text-foreground">{dayLabel}</div>
        <div className="mt-2 space-y-1.5 text-xs">
          {meta ? (
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full border-2"
                style={{ backgroundColor: meta.color, borderColor: meta.ink }}
                aria-hidden="true"
              />
              <span className="text-foreground">
                {meta.emoji} {meta.label}
              </span>
            </div>
          ) : (
            <div className="text-muted-foreground">Humor não registrado</div>
          )}
          {day.phase && (
            <div className="flex items-center gap-2 text-foreground">
              <span
                className="inline-block h-1.5 w-5 rounded-full"
                style={{ backgroundColor: PHASE_META[day.phase].color }}
                aria-hidden="true"
              />
              {PHASE_META[day.phase].label}
            </div>
          )}
          {day.log?.flow && (
            <div className="text-foreground">Fluxo: <span className="capitalize text-muted-foreground">{day.log.flow}</span></div>
          )}
          {day.log?.symptoms && day.log.symptoms.length > 0 && (
            <div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Sintomas</div>
              <ul className="mt-1 flex flex-wrap gap-1">
                {day.log.symptoms.map((s) => (
                  <li
                    key={s}
                    className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground"
                  >
                    {SYMPTOM_LABEL[s] ?? s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {typeof day.log?.sleepHours === "number" && (
            <div className="text-muted-foreground">Sono: {day.log.sleepHours}h</div>
          )}
          {day.log?.notes && (
            <div className="mt-1 border-t border-border/60 pt-1.5 text-muted-foreground">
              {day.log.notes}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MoodBarPopover({
  mood,
  meta,
  count,
  logs,
  children,
}: {
  mood: Mood;
  meta: MoodMeta;
  count: number;
  logs: Record<string, DailyLog>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const recent = useMemo(() => {
    return Object.values(logs)
      .filter((l) => l.mood === mood)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5);
  }, [logs, mood]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side="top" align="center" className="w-64 p-3 text-sm">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 rounded-full border-2"
            style={{ backgroundColor: meta.color, borderColor: meta.ink }}
            aria-hidden="true"
          />
          <span className="font-display text-base text-foreground">
            {meta.emoji} {meta.label}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">{count} dia{count === 1 ? "" : "s"}</span>
        </div>
        {recent.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">Sem registros ainda.</p>
        ) : (
          <ul className="mt-2 space-y-1.5 text-xs">
            {recent.map((l) => (
              <li key={l.date} className="border-t border-border/60 pt-1.5 first:border-0 first:pt-0">
                <div className="text-foreground">
                  {format(parseISO(l.date), "d 'de' MMM", { locale: ptBR })}
                </div>
                {l.symptoms && l.symptoms.length > 0 && (
                  <div className="mt-0.5 text-muted-foreground">
                    {l.symptoms.map((s) => SYMPTOM_LABEL[s] ?? s).join(" · ")}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

