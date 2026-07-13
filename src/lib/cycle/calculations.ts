import { addDays, differenceInDays, format, parseISO } from "date-fns";
import type { CycleInsight, CyclePhase, UserProfile } from "./types";

export function fmt(d: Date) {
  return format(d, "yyyy-MM-dd");
}

/**
 * Detect distinct period start dates from a sorted list of flow days.
 * A new period starts when there is a gap of >= 2 days from previous flow day.
 */
export function detectPeriodStarts(periodDays: string[]): string[] {
  if (periodDays.length === 0) return [];
  const sorted = [...periodDays].sort();
  const starts: string[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const prev = parseISO(sorted[i - 1]);
    const curr = parseISO(sorted[i]);
    if (differenceInDays(curr, prev) >= 2) starts.push(sorted[i]);
  }
  return starts;
}

export function avgCycleFromHistory(starts: string[], fallback: number): number {
  if (starts.length < 2) return fallback;
  const gaps: number[] = [];
  for (let i = 1; i < starts.length; i++) {
    gaps.push(differenceInDays(parseISO(starts[i]), parseISO(starts[i - 1])));
  }
  const valid = gaps.filter((g) => g > 15 && g < 60);
  if (valid.length === 0) return fallback;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}

export function computeInsight(
  profile: UserProfile,
  periodDays: string[],
  today = new Date(),
): CycleInsight | null {
  const starts = detectPeriodStarts(periodDays);
  const lastStartStr = starts[starts.length - 1] ?? profile.lastPeriodStart;
  if (!lastStartStr) return null;

  const lastStart = parseISO(lastStartStr);
  const cycleLen = avgCycleFromHistory(starts, profile.avgCycleLength);
  const periodLen = profile.avgPeriodLength;

  const dayOfCycle = differenceInDays(today, lastStart) + 1;
  const currentCycleStart =
    dayOfCycle > cycleLen ? addDays(lastStart, cycleLen * Math.floor((dayOfCycle - 1) / cycleLen)) : lastStart;
  const currentDay = differenceInDays(today, currentCycleStart) + 1;

  const nextPeriod = addDays(currentCycleStart, cycleLen);
  const ovulation = addDays(currentCycleStart, cycleLen - 14);
  const fertileStart = addDays(ovulation, -5);
  const fertileEnd = addDays(ovulation, 1);
  const pmsStart = addDays(nextPeriod, -5);
  const pmsEnd = addDays(nextPeriod, -1);

  let phase: CyclePhase;
  if (currentDay <= periodLen) phase = "menstrual";
  else if (today >= fertileStart && today <= fertileEnd) phase = "ovulation";
  else if (currentDay < cycleLen - 14) phase = "follicular";
  else phase = "luteal";

  return {
    currentPhase: phase,
    dayOfCycle: currentDay,
    nextPeriodDate: fmt(nextPeriod),
    daysUntilPeriod: differenceInDays(nextPeriod, today),
    fertileWindow: { start: fmt(fertileStart), end: fmt(fertileEnd) },
    ovulationDate: fmt(ovulation),
    pmsWindow: { start: fmt(pmsStart), end: fmt(pmsEnd) },
  };
}

export const phaseInfo: Record<CyclePhase, { label: string; hint: string; energy: string; color: string }> = {
  menstrual: {
    label: "Menstrual",
    hint: "Descanso e escuta interna",
    energy: "Priorize sono, alimentos quentes e movimentos leves como caminhada ou alongamento.",
    color: "var(--phase-menstrual)",
  },
  follicular: {
    label: "Folicular",
    hint: "Energia crescente",
    energy: "Ideal para começar projetos, treinos intensos e socializar. Aproveite o foco.",
    color: "var(--phase-follicular)",
  },
  ovulation: {
    label: "Ovulação",
    hint: "Pico de vitalidade",
    energy: "Comunicação e criatividade em alta. Bom momento para apresentações e conexões.",
    color: "var(--phase-ovulation)",
  },
  luteal: {
    label: "Lútea",
    hint: "Introspecção e organização",
    energy: "Reduza estímulos, finalize tarefas e cuide da alimentação. TPM pode aparecer.",
    color: "var(--phase-luteal)",
  },
};
