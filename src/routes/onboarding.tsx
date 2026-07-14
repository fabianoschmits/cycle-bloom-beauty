import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Pressable } from "@/components/Pressable";
import { useRegisterPWA } from "@/hooks/useRegisterPWA";
import { saveProfile } from "@/lib/cycle/storage";
import { formatName } from "@/lib/format-name";
import type { UserProfile } from "@/lib/cycle/types";
import { hapticLight, hapticSuccess, nativeEase, springSnappy } from "@/lib/motion";
import { InfoTip } from "@/components/InfoTip";
import type { FieldHelpId } from "@/lib/cycle/field-help";
import { format } from "date-fns";
import { ChevronRight, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const steps = ["welcome", "name", "cycle", "lastPeriod", "regularity", "done"] as const;
type Step = (typeof steps)[number];

function Onboarding() {
  useRegisterPWA();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const [cycleLen, setCycleLen] = useState(28);
  const [periodLen, setPeriodLen] = useState(5);
  const [lastPeriod, setLastPeriod] = useState(format(new Date(), "yyyy-MM-dd"));
  const [regular, setRegular] = useState<"regular" | "irregular">("regular");

  const idx = steps.indexOf(step);
  const [dir, setDir] = useState(1);
  const next = () => { setDir(1); setStep(steps[Math.min(idx + 1, steps.length - 1)]); };
  const back = () => { setDir(-1); setStep(steps[Math.max(idx - 1, 0)]); };

  function finish() {
    const profile: UserProfile = {
      name: formatName(name.trim()) || undefined,
      avgCycleLength: cycleLen,
      avgPeriodLength: periodLen,
      lastPeriodStart: lastPeriod,
      cycleRegularity: regular,
      createdAt: new Date().toISOString(),
      onboarded: true,
    };
    saveProfile(profile);
    try {
      const raw = localStorage.getItem("luna.periods.v1");
      const days: string[] = raw ? JSON.parse(raw) : [];
      const set = new Set(days);
      for (let i = 0; i < periodLen; i++) {
        const d = new Date(lastPeriod);
        d.setDate(d.getDate() + i);
        set.add(format(d, "yyyy-MM-dd"));
      }
      localStorage.setItem("luna.periods.v1", JSON.stringify(Array.from(set).sort()));
    } catch {}
    hapticSuccess();
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-10 pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="mb-8 flex items-center justify-center gap-1.5">
        {steps.slice(0, -1).map((s, i) => (
          <motion.span
            key={s}
            layout
            className="h-1.5 rounded-full"
            animate={{
              width: i === idx ? 24 : 6,
              backgroundColor: i <= idx ? "var(--color-primary)" : "var(--color-border)",
            }}
            transition={springSnappy}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={step}
          custom={dir}
          initial={{ opacity: 0, x: dir * 28, filter: "blur(6px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: dir * -20, filter: "blur(4px)" }}
          transition={{ duration: 0.32, ease: nativeEase }}
          className="flex-1"
        >
        {step === "welcome" && (
          <div className="mt-16 text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-primary/10">
              <span className="font-display text-4xl text-primary">L</span>
            </div>
            <h1 className="mt-8 font-display text-4xl leading-tight text-foreground">
              Bem-vinda ao Luna
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Um espaço tranquilo para acompanhar seu ciclo, entender seu corpo
              e cuidar do seu bem-estar. Tudo salvo apenas no seu dispositivo.
            </p>
          </div>
        )}
        {step === "name" && (
          <div className="mt-10">
            <Label step={2} title="Como podemos te chamar?" hint="Você pode deixar em branco." />
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(formatName(e.target.value))}
              placeholder="Seu nome"
              autoCapitalize="words"
              className="mt-6 w-full rounded-2xl border border-border bg-card px-5 py-4 font-display text-2xl text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}
        {step === "cycle" && (
          <div className="mt-10">
            <Label step={3} title="Sobre seu ciclo" hint="Você poderá ajustar depois." />
            <Stepper label="Duração média do ciclo" helpId="cycleLength" unit="dias" value={cycleLen} setValue={setCycleLen} min={20} max={45} />
            <Stepper label="Duração média do período" helpId="periodLength" unit="dias" value={periodLen} setValue={setPeriodLen} min={2} max={10} />
          </div>
        )}
        {step === "lastPeriod" && (
          <div className="mt-10">
            <Label step={4} title="Quando começou sua última menstruação?" helpId="lastPeriod" />
            <input
              type="date"
              value={lastPeriod}
              onChange={(e) => setLastPeriod(e.target.value)}
              max={format(new Date(), "yyyy-MM-dd")}
              className="mt-6 w-full rounded-2xl border border-border bg-card px-5 py-4 font-display text-2xl text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}
        {step === "regularity" && (
          <div className="mt-10">
            <Label step={5} title="Seu ciclo costuma ser?" helpId="regularity" />
            <div className="mt-6 space-y-3">
              {(["regular", "irregular"] as const).map((v) => (
                <motion.button
                  key={v}
                  whileTap={{ scale: 0.98 }}
                  transition={springSnappy}
                  onClick={() => {
                    hapticLight();
                    setRegular(v);
                  }}
                  className="w-full rounded-2xl border p-5 text-left"
                  style={{
                    borderColor: regular === v ? "var(--color-primary)" : "var(--color-border)",
                    backgroundColor: regular === v ? "color-mix(in oklab, var(--color-primary) 8%, var(--color-card))" : "var(--color-card)",
                  }}
                >
                  <div className="font-display text-lg text-foreground capitalize">{v === "regular" ? "Regular" : "Irregular"}</div>
                  <div className="text-sm text-muted-foreground">
                    {v === "regular" ? "Variações pequenas entre ciclos" : "Variações grandes ou imprevisíveis"}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
        {step === "done" && (
          <div className="mt-16 text-center">
            <h2 className="font-display text-3xl text-foreground">Tudo pronto</h2>
            <p className="mt-3 text-muted-foreground">
              As previsões aparecerão na tela inicial. Lembre-se: são estimativas e
              não substituem avaliação médica.
            </p>
          </div>
        )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Pressable
          haptic
          onClick={back}
          disabled={idx === 0}
          className="grid h-12 w-12 place-items-center rounded-full border border-border text-muted-foreground disabled:opacity-30"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} />
        </Pressable>
        {step === "done" ? (
          <Pressable
            haptic
            onClick={finish}
            className="flex-1 rounded-full bg-primary py-4 font-medium text-primary-foreground"
          >
            Começar
          </Pressable>
        ) : (
          <Pressable
            haptic
            onClick={() => {
              hapticLight();
              next();
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-4 font-medium text-primary-foreground"
          >
            Continuar <ChevronRight size={18} />
          </Pressable>
        )}
      </div>
    </div>
  );
}

function Label({ step, title, hint, helpId }: { step: number; title: string; hint?: string; helpId?: FieldHelpId }) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Passo {step}
      </p>
      <div className="mt-2 flex items-start gap-2">
        <h2 className="font-display text-3xl leading-tight text-foreground">{title}</h2>
        {helpId && <InfoTip id={helpId} className="mt-1" />}
      </div>
      {hint && <p className="mt-2 text-sm text-muted-foreground">{hint}</p>}
    </>
  );
}

function Stepper({
  label, helpId, unit, value, setValue, min, max,
}: { label: string; helpId?: FieldHelpId; unit: string; value: number; setValue: (n: number) => void; min: number; max: number }) {
  return (
    <div className="mt-5 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>{label}</span>
        {helpId && <InfoTip id={helpId} />}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Pressable haptic onClick={() => setValue(Math.max(min, value - 1))} className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-xl">−</Pressable>
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={springSnappy}
          className="text-center"
        >
          <div className="font-display text-4xl text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">{unit}</div>
        </motion.div>
        <Pressable haptic onClick={() => setValue(Math.min(max, value + 1))} className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-xl">+</Pressable>
      </div>
    </div>
  );
}
