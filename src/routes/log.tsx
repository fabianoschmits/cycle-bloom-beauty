import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Screen } from "@/components/Screen";
import { getLog, saveLog } from "@/lib/cycle/storage";
import type { DailyLog, Flow, Mood, Symptom } from "@/lib/cycle/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check } from "lucide-react";

export const Route = createFileRoute("/log")({
  component: LogPage,
});

const flows: { value: Flow; label: string }[] = [
  { value: "spotting", label: "Escape" },
  { value: "light", label: "Leve" },
  { value: "medium", label: "Médio" },
  { value: "heavy", label: "Intenso" },
];

const moods: { value: Mood; emoji: string }[] = [
  { value: "calm", emoji: "😌" },
  { value: "happy", emoji: "🙂" },
  { value: "energetic", emoji: "⚡" },
  { value: "tired", emoji: "😴" },
  { value: "sad", emoji: "🥺" },
  { value: "anxious", emoji: "😟" },
  { value: "irritable", emoji: "😤" },
];

const symptoms: { value: Symptom; label: string }[] = [
  { value: "cramps", label: "Cólicas" },
  { value: "headache", label: "Dor de cabeça" },
  { value: "bloating", label: "Inchaço" },
  { value: "tender_breasts", label: "Seios sensíveis" },
  { value: "backache", label: "Dor nas costas" },
  { value: "acne", label: "Acne" },
  { value: "nausea", label: "Náusea" },
  { value: "fatigue", label: "Cansaço" },
  { value: "cravings", label: "Desejos" },
];

function LogPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [log, setLog] = useState<DailyLog>({ date });

  useEffect(() => {
    const existing = getLog(date);
    setLog(existing ?? { date });
  }, [date]);

  function toggleSymptom(s: Symptom) {
    const cur = new Set(log.symptoms ?? []);
    cur.has(s) ? cur.delete(s) : cur.add(s);
    setLog({ ...log, symptoms: Array.from(cur) });
  }

  function submit() {
    saveLog(log);
    navigate({ to: "/" });
  }

  return (
    <Screen
      subtitle={format(new Date(date), "EEEE, d 'de' MMMM", { locale: ptBR })}
      title="Registrar"
      right={
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={format(new Date(), "yyyy-MM-dd")}
          className="rounded-full border border-border bg-card px-3 py-2 text-xs text-foreground outline-none"
        />
      }
    >
      <Section title="Fluxo menstrual">
        <div className="flex gap-2">
          {flows.map((f) => {
            const active = log.flow === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setLog({ ...log, flow: active ? undefined : f.value })}
                className="flex-1 rounded-2xl border py-3 text-xs font-medium transition-all active:scale-95"
                style={{
                  borderColor: active ? "var(--phase-menstrual)" : "var(--color-border)",
                  backgroundColor: active ? "color-mix(in oklab, var(--phase-menstrual) 15%, var(--color-card))" : "var(--color-card)",
                  color: active ? "var(--phase-menstrual)" : "var(--color-foreground)",
                }}
              >
                <FlowDots level={f.value} active={active} />
                <div className="mt-1">{f.label}</div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Humor">
        <div className="flex flex-wrap gap-2">
          {moods.map((m) => {
            const active = log.mood === m.value;
            return (
              <button
                key={m.value}
                onClick={() => setLog({ ...log, mood: active ? undefined : m.value })}
                className="grid h-14 w-14 place-items-center rounded-2xl border text-2xl transition-all active:scale-90"
                style={{
                  borderColor: active ? "var(--color-primary)" : "var(--color-border)",
                  backgroundColor: active ? "color-mix(in oklab, var(--color-primary) 10%, var(--color-card))" : "var(--color-card)",
                }}
                aria-label={m.value}
              >
                {m.emoji}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Sintomas">
        <div className="flex flex-wrap gap-2">
          {symptoms.map((s) => {
            const active = log.symptoms?.includes(s.value);
            return (
              <button
                key={s.value}
                onClick={() => toggleSymptom(s.value)}
                className="rounded-full border px-4 py-2 text-xs font-medium transition-all active:scale-95"
                style={{
                  borderColor: active ? "var(--color-primary)" : "var(--color-border)",
                  backgroundColor: active ? "var(--color-primary)" : "var(--color-card)",
                  color: active ? "var(--color-primary-foreground)" : "var(--color-foreground)",
                }}
              >
                {active && <Check size={12} className="mr-1 inline" />}
                {s.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Cólicas">
        <IntensityBar value={log.crampsIntensity ?? 0} onChange={(v) => setLog({ ...log, crampsIntensity: v })} />
      </Section>

      <Section title="Sono e atividade">
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Sono (h)" value={log.sleepHours} onChange={(v) => setLog({ ...log, sleepHours: v })} step={0.5} />
          <NumberField label="Atividade (min)" value={log.activityMinutes} onChange={(v) => setLog({ ...log, activityMinutes: v })} step={5} />
          <NumberField label="Temp. basal (°C)" value={log.basalTemp} onChange={(v) => setLog({ ...log, basalTemp: v })} step={0.1} />
          <ToggleField
            label="Relação sexual"
            value={!!log.sex?.happened}
            onChange={(v) => setLog({ ...log, sex: { happened: v, protected: log.sex?.protected } })}
          />
        </div>
      </Section>

      <Section title="Medicações & anticoncepcional">
        <input
          value={log.medications?.join(", ") ?? ""}
          onChange={(e) =>
            setLog({ ...log, medications: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
          }
          placeholder="ex.: ibuprofeno, vitamina D"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          value={log.contraceptive ?? ""}
          onChange={(e) => setLog({ ...log, contraceptive: e.target.value })}
          placeholder="Anticoncepcional (nome / dose)"
          className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      </Section>

      <Section title="Observações">
        <textarea
          value={log.notes ?? ""}
          onChange={(e) => setLog({ ...log, notes: e.target.value })}
          placeholder="Como você está se sentindo hoje?"
          rows={4}
          className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      </Section>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={submit}
        className="mt-6 w-full rounded-full bg-primary py-4 font-medium text-primary-foreground shadow-lg shadow-primary/25"
      >
        Salvar registro
      </motion.button>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

function FlowDots({ level, active }: { level: Flow; active: boolean }) {
  const n = level === "spotting" ? 1 : level === "light" ? 2 : level === "medium" ? 3 : 4;
  return (
    <div className="flex items-end justify-center gap-0.5">
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-1 rounded-full"
          style={{
            height: 4 + i * 2,
            backgroundColor: i <= n ? (active ? "var(--phase-menstrual)" : "var(--color-muted-foreground)") : "var(--color-border)",
          }}
        />
      ))}
    </div>
  );
}

function IntensityBar({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className="h-10 flex-1 rounded-xl text-xs font-semibold transition-all active:scale-95"
          style={{
            backgroundColor: n <= value ? `color-mix(in oklab, var(--phase-menstrual) ${20 + n * 15}%, var(--color-card))` : "var(--color-card)",
            border: "1px solid var(--color-border)",
            color: n === value ? "var(--phase-menstrual)" : "var(--color-muted-foreground)",
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function NumberField({ label, value, onChange, step }: { label: string; value?: number; onChange: (v: number | undefined) => void; step: number }) {
  return (
    <label className="rounded-2xl border border-border bg-card p-3">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        className="mt-1 w-full bg-transparent font-display text-2xl text-foreground outline-none"
        placeholder="—"
      />
    </label>
  );
}

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 text-left"
    >
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span
        className="relative h-6 w-11 rounded-full transition-colors"
        style={{ backgroundColor: value ? "var(--color-primary)" : "var(--color-border)" }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: `translateX(${value ? 22 : 2}px)` }}
        />
      </span>
    </button>
  );
}
