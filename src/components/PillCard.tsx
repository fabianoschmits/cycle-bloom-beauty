import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Pill, Check, AlertTriangle, Clock, RotateCcw } from "lucide-react";
import { getPillRecords, getUsualTime, takePillNow, undoPillToday, type PillRecord } from "@/lib/cycle/pill";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function todayKey() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function minutesNow() {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

function timeToMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function PillCard() {
  const [tick, setTick] = useState(0);
  const [confirmUndo, setConfirmUndo] = useState(false);
  useEffect(() => {
    const load = () => setTick((t) => t + 1);
    window.addEventListener("luna:update", load);
    const id = window.setInterval(load, 60_000);
    return () => {
      window.removeEventListener("luna:update", load);
      window.clearInterval(id);
    };
  }, []);

  const records = getPillRecords();
  const today = todayKey();
  const takenToday: PillRecord | undefined = records[today];
  const usual = getUsualTime();
  const overdue =
    !takenToday && usual !== null && minutesNow() > timeToMin(usual) + 30;

  // Compact "taken" pill — small chip so it doesn't dominate the screen
  if (takenToday) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 flex items-center justify-between gap-3 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2.5"
      >
        <div className="flex min-w-0 items-center gap-2 text-sm text-emerald-800 dark:text-emerald-200">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.25, 1] }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-background"
          >
            <Check size={13} strokeWidth={3} />
          </motion.span>
          <span className="truncate">
            <span className="font-medium">Anticoncepcional</span>
            <span className="text-emerald-700/80 dark:text-emerald-300/80"> · tomado às {takenToday.time}</span>
          </span>
        </div>
        <button
          onClick={() => setConfirmUndo(true)}
          className="shrink-0 text-xs font-medium text-emerald-800/70 underline underline-offset-4 dark:text-emerald-200/70"
        >
          Desfazer
        </button>
        <UndoDialog
          open={confirmUndo}
          time={takenToday.time}
          onCancel={() => setConfirmUndo(false)}
          onConfirm={() => {
            undoPillToday();
            setConfirmUndo(false);
            if (navigator.vibrate) navigator.vibrate(8);
          }}
        />
      </motion.section>
    );
  }


  const bg = overdue ? "from-rose-500/30 to-rose-500/10" : "from-primary/25 to-primary/5";
  const ring = overdue ? "ring-rose-400/50" : "ring-primary/30";

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.5 }}
      className={`relative mt-6 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br ${bg} p-5 ring-1 ${ring}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <Pill size={14} /> Anticoncepcional
        </div>
        {usual && (
          <span className="flex items-center gap-1 rounded-full bg-background/60 px-2.5 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur">
            <Clock size={11} /> horário habitual {usual}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="pending"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mt-4"
        >
          <p className="font-display text-2xl leading-tight text-foreground">
            {overdue ? "Você ainda não tomou hoje" : "Toque para registrar hoje"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {overdue
              ? `Seu horário habitual é ${usual}. Tome assim que possível.`
              : usual
                ? `Mantenha sempre o mesmo horário (${usual}) para máxima eficácia.`
                : "O primeiro registro define seu horário de referência."}
          </p>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              takePillNow();
              if (navigator.vibrate) navigator.vibrate(12);
            }}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-4 font-display text-base font-semibold text-background shadow-lg shadow-foreground/10 transition active:shadow-none"
          >
            <Check size={18} />
            Tomei agora
          </motion.button>

          {overdue && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 flex items-start gap-2 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300"
            >
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>
                Atrasado em relação ao seu padrão. Atrasos frequentes podem
                reduzir a eficácia do método.
              </span>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}

function UndoDialog({
  open,
  time,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  time: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onCancel]);

  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Blurred backdrop */}
          <motion.button
            aria-label="Fechar"
            onClick={onCancel}
            className="absolute inset-0 bg-foreground/25 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Floating card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="undo-title"
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border/60 bg-background/85 p-6 shadow-2xl shadow-foreground/20 backdrop-blur-2xl"
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/12 text-rose-600 dark:text-rose-300">
              <RotateCcw size={22} />
            </div>
            <h3
              id="undo-title"
              className="mt-4 text-center font-display text-2xl leading-tight text-foreground"
            >
              Desfazer registro?
            </h3>
            <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
              Você marcou o anticoncepcional como tomado às{" "}
              <span className="font-medium text-foreground">{time}</span> em {today}.
              Ao desfazer, o registro será removido.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={onCancel}
                className="rounded-2xl border border-border bg-secondary py-3.5 font-medium text-secondary-foreground transition active:scale-[0.98]"
              >
                Manter
              </button>
              <button
                onClick={onConfirm}
                className="rounded-2xl bg-rose-500 py-3.5 font-medium text-white shadow-lg shadow-rose-500/25 transition active:scale-[0.98]"
              >
                Desfazer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


