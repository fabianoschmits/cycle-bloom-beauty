import type { Flow, Mood } from "./types";

export const flowLabels: Record<Flow, string> = {
  spotting: "Escape",
  light: "Leve",
  medium: "Médio",
  heavy: "Intenso",
};

export const moodLabels: Record<Mood, { label: string; emoji: string }> = {
  calm: { label: "Calma", emoji: "😌" },
  happy: { label: "Feliz", emoji: "🙂" },
  energetic: { label: "Enérgica", emoji: "⚡" },
  tired: { label: "Cansada", emoji: "😴" },
  sad: { label: "Triste", emoji: "🥺" },
  anxious: { label: "Ansiosa", emoji: "😟" },
  irritable: { label: "Irritada", emoji: "😤" },
};
