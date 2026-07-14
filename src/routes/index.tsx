import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Screen, ScreenSection } from "@/components/Screen";
import { LoadingScreen } from "@/components/LoadingScreen";
import { TodayRoutine } from "@/components/TodayRoutine";
import { useLuna } from "@/hooks/useLuna";
import { useRegisterPWA } from "@/hooks/useRegisterPWA";
import { phaseInfo } from "@/lib/cycle/calculations";
import { getPillRecords } from "@/lib/cycle/pill";
import { nativeEase, springSoft } from "@/lib/motion";
import { addDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Settings, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Today,
});

function Today() {
  useRegisterPWA();
  const navigate = useNavigate();
  const { profile, insight, logs, ready } = useLuna();

  useEffect(() => {
    if (ready && (!profile || !profile.onboarded)) {
      navigate({ to: "/onboarding" });
    }
  }, [ready, profile, navigate]);

  if (!ready || !profile) return <LoadingScreen />;

  const today = new Date();
  const todayKey = format(today, "yyyy-MM-dd");
  const todayLog = logs[todayKey];
  const phase = insight?.currentPhase ?? "follicular";
  const p = phaseInfo[phase];
  const pillRecords = getPillRecords();
  const pillTaken = Boolean(pillRecords[todayKey]);

  const daysUntil = insight?.daysUntilPeriod ?? null;
  const cycleDay = insight?.dayOfCycle ?? 1;
  const cycleLen = profile.avgCycleLength;
  const progress = Math.min(1, cycleDay / cycleLen);
  const lastPeriodStart = profile.lastPeriodStart ?? todayKey;

  return (
    <Screen
      subtitle={format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
      title={profile.name ? `Olá, ${profile.name}` : "Bom dia"}
      right={
        <motion.div whileTap={{ scale: 0.92 }} transition={springSoft}>
          <Link
            to="/settings"
            aria-label="Configurações"
            className="grid h-10 w-10 place-items-center rounded-full border border-border/60 bg-card text-muted-foreground"
          >
            <Settings size={17} />
          </Link>
        </motion.div>
      }
    >
      <ScreenSection className="relative mx-auto flex aspect-square w-full max-w-[260px] items-center justify-center">
        <CycleRing
          progress={progress}
          color={p.color}
          pillTaken={pillTaken}
          pillRecords={pillRecords}
          cycleDay={cycleDay}
          cycleLen={cycleLen}
          lastPeriodStart={lastPeriodStart}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <motion.span
            key={cycleDay}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: nativeEase }}
            className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground"
          >
            Dia {cycleDay} de {cycleLen}
          </motion.span>
          <motion.span
            key={`count-${daysUntil}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springSoft}
            className="mt-1 font-display text-5xl leading-none text-foreground"
          >
            {daysUntil !== null && daysUntil >= 0 ? daysUntil : "—"}
          </motion.span>
          <p className="mt-1 max-w-[200px] text-xs leading-snug text-muted-foreground">
            {daysUntil === 0
              ? "menstruação prevista hoje"
              : daysUntil && daysUntil > 0
                ? "dias até a próxima menstruação"
                : "atualize seu último período"}
          </p>
          <motion.span
            layout
            className="mt-3 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: `color-mix(in oklab, ${p.color} 22%, transparent)`, color: p.color }}
            transition={springSoft}
          >
            Fase {p.label}
          </motion.span>
        </div>
      </ScreenSection>

      <ScreenSection>
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: nativeEase }}
          className="mx-auto mt-3 max-w-sm text-center text-sm leading-relaxed text-muted-foreground"
        >
          <span className="font-medium text-foreground">{p.hint}</span>
          {" — "}
          {p.energy}
        </motion.p>
      </ScreenSection>

      <ScreenSection>
        <TodayRoutine todayLog={todayLog} />
      </ScreenSection>

      {insight && (
        <ScreenSection>
          <UpcomingStrip insight={insight} />
        </ScreenSection>
      )}

      <ScreenSection>
        <p className="mt-2 px-2 text-center text-[11px] leading-relaxed text-muted-foreground">
          As previsões são estimativas baseadas nos seus registros e não substituem avaliação médica.
        </p>
      </ScreenSection>
    </Screen>
  );
}

function CycleRing({
  progress,
  color,
  pillRecords,
  cycleDay,
  cycleLen,
  lastPeriodStart,
}: {
  progress: number;
  color: string;
  pillTaken?: boolean;
  pillRecords: Record<string, { date: string }>;
  cycleDay: number;
  cycleLen: number;
  lastPeriodStart: string;
}) {
  const size = 260;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  // Generate dot positions for each day of the cycle (1 … cycleLen)
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const startDate = parseISO(lastPeriodStart);

  const dots = Array.from({ length: cycleLen }, (_, i) => {
    const dayNum = i + 1; // 1-based
    const angle = (2 * Math.PI * i) / cycleLen - Math.PI / 2; // start at top
    const dotX = cx + r * Math.cos(angle);
    const dotY = cy + r * Math.sin(angle);
    const dateStr = format(addDays(startDate, i), "yyyy-MM-dd");
    const isPast = dateStr < todayStr;
    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;
    const taken = Boolean(pillRecords[dateStr]);
    const inCycle = dayNum <= cycleDay; // days up to today in this cycle

    return { dayNum, dotX, dotY, taken, isPast, isToday, isFuture, inCycle, dateStr };
  });

  const progressAngle = 2 * Math.PI * progress;
  const progressDotX = cx + r * Math.cos(progressAngle);
  const progressDotY = cy + r * Math.sin(progressAngle);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full">
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Background track */}
      <circle
        cx={cx} cy={cy} r={r}
        stroke="var(--color-border)" strokeWidth={stroke} fill="none"
        transform={`rotate(-90 ${cx} ${cy})`}
      />

      {/* Progress arc */}
      <motion.circle
        cx={cx} cy={cy} r={r}
        stroke="url(#ringGrad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - progress) }}
        transition={{ duration: 1.1, ease: nativeEase }}
        transform={`rotate(-90 ${cx} ${cy})`}
      />

      {/* Per-day pill history dots */}
      {dots.map(({ dayNum, dotX, dotY, taken, isPast, isToday, isFuture, inCycle }) => {
        if (isFuture) return null; // no dot for future days
        const missed = !taken && (isPast || isToday) && inCycle;
        const green = taken && inCycle;

        if (!green && !missed) return null;

        return (
          <g key={dayNum}>
            {/* Glow ring */}
            {green && (
              <motion.circle
                cx={dotX} cy={dotY} r={6}
                fill="rgb(16 185 129)"
                fillOpacity={0.18}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: dayNum * 0.015, duration: 0.3, ease: nativeEase }}
                style={{ transformOrigin: `${dotX}px ${dotY}px` }}
              />
            )}
            {/* Core dot */}
            <motion.circle
              cx={dotX} cy={dotY}
              r={3.5}
              fill={green ? "rgb(16 185 129)" : "rgb(239 68 68)"}
              stroke="var(--color-background)"
              strokeWidth={1.5}
              initial={{ scale: 0 }}
              animate={missed ? { scale: [1, 1.3, 1], opacity: [1, 0.4, 1] } : { scale: 1 }}
              transition={
                missed
                  ? { repeat: Infinity, duration: 1.8, ease: "easeInOut", delay: dayNum * 0.01 }
                  : { delay: dayNum * 0.015, ...springSoft }
              }
              style={{ transformOrigin: `${dotX}px ${dotY}px` }}
            />
          </g>
        );
      })}

      {/* Current day progress dot (white) */}
      <motion.circle
        cx={progressDotX} cy={progressDotY} r={5}
        fill="white"
        stroke={color}
        strokeWidth={2}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, ...springSoft }}
        style={{ transformOrigin: `${progressDotX}px ${progressDotY}px` }}
      />
    </svg>
  );
}

function UpcomingStrip({ insight }: { insight: NonNullable<ReturnType<typeof useLuna>["insight"]> }) {
  const events = [
    { label: "Próxima menstruação", date: insight.nextPeriodDate, color: "var(--phase-menstrual)" },
    { label: "Ovulação", date: insight.ovulationDate, color: "var(--phase-ovulation)" },
  ];

  return (
    <div className="mt-5 rounded-3xl border border-border/60 bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Próximos marcos</h2>
        <motion.div whileTap={{ scale: 0.95 }} transition={springSoft}>
          <Link to="/calendar" className="flex items-center gap-0.5 text-xs font-medium text-primary">
            Calendário
            <ChevronRight size={14} />
          </Link>
        </motion.div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {events.map((e, i) => (
          <motion.div
            key={e.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.06, duration: 0.32, ease: nativeEase }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-2xl bg-muted/40 p-3"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: e.color }} />
              <span className="text-[11px] font-medium text-muted-foreground">{e.label}</span>
            </div>
            <p className="mt-1.5 font-display text-base text-foreground">{formatDatePretty(e.date)}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function formatDatePretty(d: string) {
  try {
    return format(parseISO(d), "EEE, d MMM", { locale: ptBR });
  } catch {
    return d;
  }
}
