import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Screen } from "@/components/Screen";
import { useLuna } from "@/hooks/useLuna";
import { useRegisterPWA } from "@/hooks/useRegisterPWA";
import { clearAll, exportAll, importAll, saveProfile } from "@/lib/cycle/storage";
import { Moon, Sun, Download, Upload, Trash2, Bell } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  useRegisterPWA();
  const navigate = useNavigate();
  const { profile } = useLuna();
  const [dark, setDark] = useState(false);
  const [reminderTime, setReminderTime] = useState("09:00");

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    const r = localStorage.getItem("luna.reminder");
    if (r) setReminderTime(r);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("luna.theme", next ? "dark" : "light");
  }

  function updateProfile<K extends keyof NonNullable<typeof profile>>(key: K, value: NonNullable<typeof profile>[K]) {
    if (!profile) return;
    saveProfile({ ...profile, [key]: value });
  }

  function download() {
    const data = exportAll();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `luna-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((t) => {
      try {
        importAll(t);
        alert("Backup restaurado.");
      } catch {
        alert("Arquivo inválido.");
      }
    });
  }

  function reset() {
    if (confirm("Apagar todos os dados locais? Esta ação não pode ser desfeita.")) {
      clearAll();
      navigate({ to: "/onboarding" });
    }
  }

  if (!profile) return null;

  return (
    <Screen subtitle="Ajustes" title="Configurações">
      <Group title="Perfil">
        <Field label="Nome">
          <input
            value={profile.name ?? ""}
            onChange={(e) => updateProfile("name", e.target.value)}
            className="w-full bg-transparent text-right text-foreground outline-none"
            placeholder="Adicionar"
          />
        </Field>
        <Field label="Duração média do ciclo">
          <NumberInput value={profile.avgCycleLength} onChange={(v) => updateProfile("avgCycleLength", v)} suffix="d" />
        </Field>
        <Field label="Duração média do período">
          <NumberInput value={profile.avgPeriodLength} onChange={(v) => updateProfile("avgPeriodLength", v)} suffix="d" />
        </Field>
        <Field label="Regularidade">
          <select
            value={profile.cycleRegularity}
            onChange={(e) => updateProfile("cycleRegularity", e.target.value as "regular" | "irregular")}
            className="bg-transparent text-right text-foreground outline-none"
          >
            <option value="regular">Regular</option>
            <option value="irregular">Irregular</option>
          </select>
        </Field>
      </Group>

      <Group title="Aparência">
        <Field label={dark ? "Tema escuro" : "Tema claro"} icon={dark ? <Moon size={18} /> : <Sun size={18} />}>
          <Toggle value={dark} onChange={toggleTheme} />
        </Field>
      </Group>

      <Group title="Lembretes">
        <Field label="Horário do lembrete diário" icon={<Bell size={18} />}>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => {
              setReminderTime(e.target.value);
              localStorage.setItem("luna.reminder", e.target.value);
            }}
            className="bg-transparent text-right text-foreground outline-none"
          />
        </Field>
      </Group>

      <Group title="Backup local">
        <button onClick={download} className="flex w-full items-center justify-between px-4 py-4 text-left">
          <span className="flex items-center gap-3 text-sm text-foreground"><Download size={18} /> Exportar dados</span>
        </button>
        <div className="h-px bg-border" />
        <label className="flex w-full cursor-pointer items-center justify-between px-4 py-4 text-left">
          <span className="flex items-center gap-3 text-sm text-foreground"><Upload size={18} /> Importar backup</span>
          <input type="file" accept="application/json" onChange={upload} className="hidden" />
        </label>
      </Group>

      <Group title="Zona sensível">
        <button
          onClick={reset}
          className="flex w-full items-center justify-between px-4 py-4 text-left text-destructive"
        >
          <span className="flex items-center gap-3 text-sm"><Trash2 size={18} /> Apagar todos os dados</span>
        </button>
      </Group>

      <p className="mt-8 px-2 text-center text-[11px] leading-relaxed text-muted-foreground">
        Luna armazena tudo apenas neste dispositivo. Nada é enviado para servidores.
      </p>
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</h2>
      <div className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-card">
        {children}
      </div>
    </section>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <span className="flex items-center gap-3 text-sm text-foreground">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {label}
      </span>
      <div className="min-w-0 text-right">{children}</div>
    </div>
  );
}

function NumberInput({ value, onChange, suffix }: { value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-14 bg-transparent text-right text-foreground outline-none"
      />
      {suffix && <span className="text-muted-foreground">{suffix}</span>}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative h-6 w-11 rounded-full transition-colors"
      style={{ backgroundColor: value ? "var(--color-primary)" : "var(--color-border)" }}
      aria-pressed={value}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
        style={{ transform: `translateX(${value ? 22 : 2}px)` }}
      />
    </button>
  );
}
