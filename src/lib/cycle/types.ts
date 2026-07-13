export type Flow = "spotting" | "light" | "medium" | "heavy";
export type Mood = "calm" | "happy" | "sad" | "anxious" | "irritable" | "energetic" | "tired";
export type Symptom =
  | "cramps"
  | "headache"
  | "bloating"
  | "tender_breasts"
  | "backache"
  | "acne"
  | "nausea"
  | "fatigue"
  | "cravings";

export interface DailyLog {
  date: string; // YYYY-MM-DD
  flow?: Flow;
  symptoms?: Symptom[];
  mood?: Mood;
  crampsIntensity?: number; // 0-5
  sleepHours?: number;
  activityMinutes?: number;
  sex?: { happened: boolean; protected?: boolean };
  basalTemp?: number; // °C
  medications?: string[];
  contraceptive?: string;
  notes?: string;
}

export interface UserProfile {
  name?: string;
  birthYear?: number;
  avgCycleLength: number; // default 28
  avgPeriodLength: number; // default 5
  lastPeriodStart?: string;
  cycleRegularity: "regular" | "irregular";
  pin?: string;
  createdAt: string;
  onboarded: boolean;
}

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

export interface CycleInsight {
  currentPhase: CyclePhase;
  dayOfCycle: number;
  nextPeriodDate: string;
  daysUntilPeriod: number;
  fertileWindow: { start: string; end: string };
  ovulationDate: string;
  pmsWindow: { start: string; end: string };
}
