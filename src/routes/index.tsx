import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Screen } from "@/components/Screen";
import { useLuna } from "@/hooks/useLuna";
import { phaseInfo } from "@/lib/cycle/calculations";
import { format, parseISO, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Settings, Sparkles, Droplet, HeartPulse, Moon, Activity } from "lucide-react";
import { PillCard } from "@/components/PillCard";
import { getPillRecords } from "@/lib/cycle/pill";

export const Route = createFileRoute("/")({
  component: Today,
});

function todayKeyStr() {
  const n = new Date();
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
}

function usePillTakenToday() {
  const [taken, setTaken] = useState(false);
  useEffect(() => {
    const compute = () => setTaken(Boolean(getPillRecords()[todayKeyStr()]));
    compute();
    window.addEventListener("luna:update", compute);
    return () => window.removeEventListener("luna:update", compute);
  }, []);
  return taken;
}

function Today() {
  const navigate = useNavigate();
  const { profile, insight, logs, ready } = useLuna();
  const pillTaken = usePillTakenToday();

  useEffect(() => {
    if (ready && (!profile || !profile.onboarded)) {
      navigate({ to: "/onboarding" });
    }
  }, [ready, profile, navigate]);

  if (!ready || !profile) return null;

  const today = new Date();
  const todayKey = format(today, "yyyy-MM-dd");
  const todayLog = logs[todayKey];
  const phase = insight?.currentPhase ?? "follicular";
  const p = phaseInfo[phase];

  const daysUntil = insight?.daysUntilPeriod ?? null;
  const cycleDay = insight?.dayOfCycle ?? 1;
  const cycleLen = profile.avgCycleLength;
  const progress = Math.min(1, cycleDay / cycleLen);

  return (
    <Screen
      subtitle={format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
      title={profile.name ? `Olá, ${profile.name}` : "Bom dia"}
    >
      {/* Floating settings — out of the header flow so it never crops the name */}
      <Link
        to="/settings"
        aria-label="Configurações"
        className="fixed right-4 top-[max(1rem,env(safe-area-inset-top))] z-40 grid h-10 w-10 place-items-center rounded-full border border-border/60 bg-background/70 text-muted-foreground backdrop-blur-md shadow-sm transition active:scale-95"
      >
        <Settings size={17} />
      </Link>

      {/* Cycle ring */}
      <motion.section
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto mt-2 flex aspect-square w-full max-w-[320px] items-center justify-center"
      >
        <CycleRing progress={progress} color={p.color} pillTaken={pillTaken} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Dia {cycleDay}
          </span>
          <span className="mt-1 font-display text-5xl leading-none text-foreground">
            {daysUntil !== null && daysUntil >= 0 ? daysUntil : "—"}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">
            {daysUntil === 0
              ? "menstruação prevista hoje"
              : daysUntil && daysUntil > 0
                ? "dias até a próxima menstruação"
                : "atualize seu último período"}
          </span>
          <span
            className="mt-3 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: `color-mix(in oklab, ${p.color} 22%, transparent)`, color: p.color }}
          >
            Fase {p.label}
          </span>
        </div>
      </motion.section>

      {/* Daily pill — highlighted */}
      <PillCard />

      {/* Energy map */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mt-6 rounded-3xl border border-border/60 bg-card p-5"
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <Sparkles size={14} /> Mapa de energia
        </div>
        <p className="mt-2 font-display text-xl leading-snug text-foreground">{p.hint}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.energy}</p>
      </motion.section>

      {/* Quick log chips */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Registro rápido</h2>
          <Link to="/log" className="text-xs font-medium text-primary">Ver tudo</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <QuickCard icon={<Droplet size={18} />} label="Fluxo" value={todayLog?.flow ?? "—"} to="/log" />
          <QuickCard icon={<HeartPulse size={18} />} label="Humor" value={todayLog?.mood ?? "—"} to="/log" />
          <QuickCard icon={<Moon size={18} />} label="Sono" value={todayLog?.sleepHours ? `${todayLog.sleepHours}h` : "—"} to="/log" />
          <QuickCard icon={<Activity size={18} />} label="Atividade" value={todayLog?.activityMinutes ? `${todayLog.activityMinutes} min` : "—"} to="/log" />
        </div>
      </section>

      {/* Next cycle capsule */}
      {insight && <NextCapsule insight={insight} />}

      <p className="mt-6 px-2 text-center text-[11px] leading-relaxed text-muted-foreground">
        As previsões são estimativas baseadas nos seus registros e não substituem
        avaliação médica.
      </p>
    </Screen>
  );
}

function CycleRing({ progress, color, pillTaken }: { progress: number; color: string; pillTaken?: boolean }) {
  const size = 300;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;
  // Position of the "pill taken" dot on the ring (following current progress)
  const angle = 2 * Math.PI * progress; // 0 = 3 o'clock (SVG is -rotate-90, so visually 12 o'clock)
  const dotX = cx + r * Math.cos(angle);
  const dotY = cy + r * Math.sin(angle);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} stroke="var(--color-border)" strokeWidth={stroke} fill="none" />
      <motion.circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="url(#ringGrad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - progress) }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      {pillTaken && (
        <g>
          <motion.circle
            cx={dotX}
            cy={dotY}
            r={10}
            fill="rgb(16 185 129)"
            fillOpacity={0.18}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.6, 1], opacity: [0, 0.6, 1] }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: `${dotX}px ${dotY}px` }}
          />
          <motion.circle
            cx={dotX}
            cy={dotY}
            r={5}
            fill="rgb(16 185 129)"
            stroke="var(--color-background)"
            strokeWidth={2}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: `${dotX}px ${dotY}px` }}
          />
        </g>
      )}
    </svg>
  );
}


function QuickCard({ icon, label, value, to }: { icon: React.ReactNode; label: string; value: string; to: string }) {
  return (
    <Link
      to={to as "/log"}
      className="group flex flex-col gap-1 rounded-2xl border border-border/60 bg-card p-4 transition-transform active:scale-[0.98]"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <span className="font-display text-lg capitalize text-foreground">{value}</span>
    </Link>
  );
}

function NextCapsule({ insight }: { insight: NonNullable<ReturnType<typeof useLuna>["insight"]> }) {
  const events = [
    {
      label: "Menstruação",
      date: insight.nextPeriodDate,
      color: "var(--phase-menstrual)",
      tip: "Prepare produtos favoritos e sono extra.",
    },
    {
      label: "Ovulação",
      date: insight.ovulationDate,
      color: "var(--phase-ovulation)",
      tip: "Pico de energia — bom para socializar.",
    },
    {
      label: "Janela fértil",
      date: `${insight.fertileWindow.start} → ${insight.fertileWindow.end}`,
      color: "var(--phase-follicular)",
      tip: "Se evitar gravidez, redobre atenção.",
    },
    {
      label: "Possível TPM",
      date: `${insight.pmsWindow.start} → ${insight.pmsWindow.end}`,
      color: "var(--phase-luteal)",
      tip: "Reduza cafeína e priorize descanso.",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="mt-6 overflow-hidden rounded-3xl border border-border/60 bg-card"
    >
      <div className="border-b border-border/60 p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Cápsula do próximo ciclo
        </div>
        <p className="mt-1 font-display text-xl text-foreground">Os próximos 28 dias</p>
      </div>
      <ul className="divide-y divide-border/60">
        {events.map((e, i) => (
          <motion.li
            key={e.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.08 }}
            className="flex items-start gap-3 px-5 py-4"
          >
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: e.color }} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-foreground">{e.label}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDatePretty(e.date)}</span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{e.tip}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}

function formatDatePretty(d: string) {
  if (d.includes("→")) {
    const [a, b] = d.split(" → ");
    return `${format(parseISO(a), "d MMM", { locale: ptBR })} – ${format(parseISO(b), "d MMM", { locale: ptBR })}`;
  }
  try {
    return format(parseISO(d), "EEE, d MMM", { locale: ptBR });
  } catch {
    return d;
  }
}

// keep addDays reference to avoid tree-shake issues in dev during quick edits
void addDays;
