import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Screen } from "@/components/Screen";
import { useLuna } from "@/hooks/useLuna";
import { useRegisterPWA } from "@/hooks/useRegisterPWA";
import {
  addDays, addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, isSameMonth,
  parseISO, startOfMonth, startOfWeek, endOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { removePeriodDay, saveLog } from "@/lib/cycle/storage";
import { computeInsight, phaseInfo } from "@/lib/cycle/calculations";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  const { profile, periodDays, logs } = useLuna();
  const [cursor, setCursor] = useState(startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date>(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const insight = profile ? computeInsight(profile, periodDays) : null;
  const fertile = insight
    ? { s: parseISO(insight.fertileWindow.start), e: parseISO(insight.fertileWindow.end) }
    : null;
  const ovulation = insight ? parseISO(insight.ovulationDate) : null;
  const nextPeriod = insight ? parseISO(insight.nextPeriodDate) : null;

  const periodSet = new Set(periodDays);
  const selectedKey = format(selected, "yyyy-MM-dd");
  const selectedLog = logs[selectedKey];
  const isPeriod = periodSet.has(selectedKey);

  function togglePeriod() {
    if (isPeriod) {
      removePeriodDay(selectedKey);
    } else {
      saveLog({ date: selectedKey, flow: "medium" });
    }
  }

  return (
    <Screen
      subtitle="Ciclo"
      title={format(cursor, "MMMM yyyy", { locale: ptBR })}
      right={
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor(addMonths(cursor, -1))}
            className="grid h-10 w-10 place-items-center rounded-full bg-secondary"
            aria-label="Mês anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCursor(addMonths(cursor, 1))}
            className="grid h-10 w-10 place-items-center rounded-full bg-secondary"
            aria-label="Próximo mês"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-7 gap-1 px-1 pb-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const inMonth = isSameMonth(d, cursor);
          const isSel = isSameDay(d, selected);
          const period = periodSet.has(key);
          const inFertile = fertile && d >= fertile.s && d <= fertile.e;
          const isOv = ovulation && isSameDay(d, ovulation);
          const isNext = nextPeriod && isSameDay(d, nextPeriod);

          let bg = "transparent";
          let color = "var(--color-foreground)";
          let ring = "";
          if (period) {
            bg = "var(--phase-menstrual)";
            color = "white";
          } else if (isOv) {
            bg = "var(--phase-ovulation)";
            color = "white";
          } else if (inFertile) {
            bg = "color-mix(in oklab, var(--phase-follicular) 30%, transparent)";
          }
          if (isNext) ring = "2px dashed var(--phase-menstrual)";

          return (
            <button
              key={key}
              onClick={() => setSelected(d)}
              className="relative flex aspect-square items-center justify-center rounded-2xl text-sm transition-all active:scale-90"
              style={{
                backgroundColor: bg,
                color: inMonth ? color : "color-mix(in oklab, var(--color-muted-foreground) 60%, transparent)",
                outline: isSel ? "2px solid var(--color-primary)" : ring || undefined,
                outlineOffset: isSel ? 2 : 0,
                fontWeight: isSameDay(d, new Date()) ? 700 : 500,
              }}
            >
              {format(d, "d")}
              {logs[key] && !period && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap gap-3 rounded-2xl border border-border/60 bg-card p-4 text-xs text-muted-foreground">
        <Legend color="var(--phase-menstrual)" label="Menstruação" />
        <Legend color="var(--phase-follicular)" label="Fértil" faded />
        <Legend color="var(--phase-ovulation)" label="Ovulação" />
        <Legend color="transparent" label="Próxima prevista" outline />
      </div>

      {/* Day detail */}
      <motion.div
        key={selectedKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-5 rounded-3xl border border-border/60 bg-card p-5"
      >
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {format(selected, "EEEE", { locale: ptBR })}
            </p>
            <h3 className="font-display text-2xl text-foreground">
              {format(selected, "d 'de' MMMM", { locale: ptBR })}
            </h3>
          </div>
          <button
            onClick={togglePeriod}
            className="rounded-full px-4 py-2 text-xs font-semibold"
            style={{
              backgroundColor: isPeriod ? "var(--phase-menstrual)" : "var(--color-secondary)",
              color: isPeriod ? "white" : "var(--color-foreground)",
            }}
          >
            {isPeriod ? "Menstruando" : "Marcar menstruação"}
          </button>
        </div>
        {selectedLog ? (
          <ul className="mt-4 space-y-1.5 text-sm text-foreground">
            {selectedLog.flow && <li>Fluxo: <span className="text-muted-foreground capitalize">{selectedLog.flow}</span></li>}
            {selectedLog.mood && <li>Humor: <span className="text-muted-foreground capitalize">{selectedLog.mood}</span></li>}
            {selectedLog.symptoms && selectedLog.symptoms.length > 0 && (
              <li>Sintomas: <span className="text-muted-foreground">{selectedLog.symptoms.join(", ")}</span></li>
            )}
            {selectedLog.sleepHours != null && <li>Sono: <span className="text-muted-foreground">{selectedLog.sleepHours}h</span></li>}
            {selectedLog.notes && <li className="pt-1 text-muted-foreground italic">"{selectedLog.notes}"</li>}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Sem registros neste dia.</p>
        )}
      </motion.div>
    </Screen>
  );
}

function Legend({ color, label, faded, outline }: { color: string; label: string; faded?: boolean; outline?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className="h-3 w-3 rounded-full"
        style={{
          backgroundColor: faded ? `color-mix(in oklab, ${color} 35%, transparent)` : color,
          border: outline ? "2px dashed var(--phase-menstrual)" : undefined,
        }}
      />
      {label}
    </span>
  );
}
