import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useEffect, useState } from "react";
import { Pressable } from "@/components/Pressable";
import {
  Pill,
  Check,
  AlertTriangle,
  Clock,
  RotateCcw,
  ChevronRight,
  Sparkles,
  CalendarHeart,
} from "lucide-react";
import { getPillRecords, getUsualTime, takePillNow, undoPillToday, type PillRecord } from "@/lib/cycle/pill";
import { hasDailyLog, dailyLogSummary } from "@/lib/cycle/daily-log";
import { flowLabels, moodLabels } from "@/lib/cycle/labels";
import type { DailyLog } from "@/lib/cycle/types";
import { hapticSuccess, springSnappy, springSoft } from "@/lib/motion";
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

export function TodayRoutine({ todayLog }: { todayLog?: DailyLog }) {
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const [confirmUndo, setConfirmUndo] = useState(false);
  const [showDailyPrompt, setShowDailyPrompt] = useState(false);
  const [pillTime, setPillTime] = useState("");

  useEffect(() => {
    const load = () => setTick((t) => t + 1);
    window.addEventListener("luna:update", load);
    const id = window.setInterval(load, 60_000);
    return () => {
      window.removeEventListener("luna:update", load);
      window.clearInterval(id);
    };
  }, []);

  void tick;

  const records = getPillRecords();
  const today = todayKey();
  const takenToday: PillRecord | undefined = records[today];
  const usual = getUsualTime();
  const overdue = !takenToday && usual !== null && minutesNow() > timeToMin(usual) + 30;
  const logged = hasDailyLog(todayLog);
  const summary = dailyLogSummary(todayLog);

  function goToLog() {
    setShowDailyPrompt(false);
    navigate({ to: "/log" });
  }

  function handleTakePill() {
    const record = takePillNow();
    setPillTime(record.time);
    hapticSuccess();
    if (!logged) setShowDailyPrompt(true);
  }

  return (
    <>
      <section className="mt-5 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/50 px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles size={14} />
            Rotina de hoje
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Marque a pílula e registre como foi seu dia no calendário.
          </p>
        </div>

        <LayoutGroup>
        <div className="divide-y divide-border/50">
          {/* Step 1 — Pill */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <motion.span
                  layout
                  transition={springSoft}
                  className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${
                    takenToday
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                      : overdue
                        ? "bg-rose-500/12 text-rose-600 dark:text-rose-300"
                        : "bg-primary/10 text-primary"
                  }`}
                >
                  {takenToday ? <Check size={18} strokeWidth={2.5} /> : <Pill size={18} />}
                </motion.span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Anticoncepcional</p>
                  {takenToday ? (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Tomado às <span className="font-medium text-foreground">{takenToday.time}</span>
                    </p>
                  ) : (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {overdue
                        ? `Atrasado — horário habitual ${usual}`
                        : usual
                          ? `Horário habitual: ${usual}`
                          : "Registre quando tomar"}
                    </p>
                  )}
                </div>
              </div>
              {usual && !takenToday && (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                  <Clock size={11} />
                  {usual}
                </span>
              )}
            </div>

            <AnimatePresence mode="wait">
            {!takenToday ? (
              <motion.div
                key="pill-pending"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-4 overflow-hidden"
              >
                <Pressable
                  haptic
                  onClick={handleTakePill}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold ${
                    overdue
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                      : "bg-foreground text-background shadow-md shadow-foreground/10"
                  }`}
                >
                  <Check size={17} />
                  Tomei agora
                </Pressable>
                {overdue && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-rose-700 dark:text-rose-300"
                  >
                    <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                    Atrasos frequentes podem reduzir a eficácia do método.
                  </motion.p>
                )}
              </motion.div>
            ) : (
              <motion.button
                key="pill-undo"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmUndo(true)}
                className="mt-3 text-xs font-medium text-muted-foreground underline underline-offset-4"
              >
                Desfazer registro da pílula
              </motion.button>
            )}
            </AnimatePresence>
          </div>

          {/* Step 2 — Daily log */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <motion.span
                  layout
                  transition={springSoft}
                  className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${
                    logged ? "bg-primary/12 text-primary" : "bg-muted/80 text-muted-foreground"
                  }`}
                >
                  <CalendarHeart size={18} />
                </motion.span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Como foi seu dia?</p>
                  {logged ? (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Registrado: {formatLogPreview(todayLog)}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Humor, fluxo, sintomas e mais — aparece no calendário.
                    </p>
                  )}
                </div>
              </div>
              {logged && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={springSnappy}
                  className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary"
                >
                  Salvo
                </motion.span>
              )}
            </div>

            {summary.length > 0 && (
              <motion.div layout className="mt-3 flex flex-wrap gap-1.5">
                {summary.map((item) => (
                  <motion.span
                    key={item}
                    layout
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="rounded-full bg-muted/70 px-2.5 py-1 text-[10px] font-medium capitalize text-muted-foreground"
                  >
                    {item}
                  </motion.span>
                ))}
              </motion.div>
            )}

            <motion.div whileTap={{ scale: 0.98 }} transition={springSnappy}>
            <Link
              to="/log"
              className={`mt-4 flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-semibold ${
                logged
                  ? "border-border/60 bg-muted/30 text-foreground"
                  : "border-primary/25 bg-primary/8 text-primary"
              }`}
            >
              <span>{logged ? "Editar registro do dia" : "Iniciar registro do dia"}</span>
              <ChevronRight size={18} className="opacity-70" />
            </Link>
            </motion.div>
          </div>
        </div>
        </LayoutGroup>
      </section>

      <DailyLogPrompt
        open={showDailyPrompt}
        time={pillTime}
        onLater={() => setShowDailyPrompt(false)}
        onStart={goToLog}
      />

      <UndoDialog
        open={confirmUndo}
        time={takenToday?.time ?? ""}
        onCancel={() => setConfirmUndo(false)}
        onConfirm={() => {
          undoPillToday();
          setConfirmUndo(false);
          if (navigator.vibrate) navigator.vibrate(8);
        }}
      />
    </>
  );
}

function formatLogPreview(log?: DailyLog) {
  if (!log) return "";
  const parts: string[] = [];
  if (log.mood) parts.push(`${moodLabels[log.mood].emoji} ${moodLabels[log.mood].label}`);
  if (log.flow) parts.push(flowLabels[log.flow]);
  if ((log.symptoms?.length ?? 0) > 0) {
    parts.push(`${log.symptoms!.length} sintoma${log.symptoms!.length > 1 ? "s" : ""}`);
  }
  return parts.length > 0 ? parts.join(" · ") : "dados salvos";
}

function DailyLogPrompt({
  open,
  time,
  onLater,
  onStart,
}: {
  open: boolean;
  time: string;
  onLater: () => void;
  onStart: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onLater();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onLater]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-[max(1rem,env(safe-area-inset-bottom))]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            aria-label="Fechar"
            onClick={onLater}
            className="absolute inset-0 bg-foreground/25 backdrop-blur-xl"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="daily-prompt-title"
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border/60 bg-background/90 p-6 shadow-2xl backdrop-blur-2xl"
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-300">
              <Check size={24} strokeWidth={2.5} />
            </div>
            <h3 id="daily-prompt-title" className="mt-4 text-center font-display text-2xl text-foreground">
              Pílula registrada!
            </h3>
            <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
              Marcado às <span className="font-medium text-foreground">{time}</span>. Quer registrar como foi seu dia
              para aparecer no calendário?
            </p>
            <div className="mt-6 grid gap-3">
              <Pressable haptic onClick={onStart} className="rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                Registrar como foi meu dia
              </Pressable>
              <Pressable onClick={onLater} className="rounded-2xl border border-border bg-secondary py-3.5 text-sm font-medium text-secondary-foreground">
                Fazer depois
              </Pressable>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
          className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-[max(1rem,env(safe-area-inset-bottom))]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button aria-label="Fechar" onClick={onCancel} className="absolute inset-0 bg-foreground/25 backdrop-blur-xl" />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-sm rounded-3xl border border-border/60 bg-background/85 p-6 shadow-2xl backdrop-blur-2xl"
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/12 text-rose-600">
              <RotateCcw size={22} />
            </div>
            <h3 className="mt-4 text-center font-display text-2xl text-foreground">Desfazer registro?</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Você marcou às <span className="font-medium text-foreground">{time}</span> em {today}.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={onCancel} className="rounded-2xl border border-border bg-secondary py-3.5 font-medium">
                Manter
              </button>
              <button onClick={onConfirm} className="rounded-2xl bg-rose-500 py-3.5 font-medium text-white">
                Desfazer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
