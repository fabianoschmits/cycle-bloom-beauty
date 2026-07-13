import type { Transition, Variants } from "framer-motion";

/** iOS-like easing used across the app */
export const nativeEase = [0.22, 1, 0.36, 1] as const;

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 34,
  mass: 0.8,
};

export const springSoft: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.9,
};

export const fadeTransition: Transition = {
  duration: 0.28,
  ease: nativeEase,
};

export const ROUTE_ORDER: Record<string, number> = {
  "/": 0,
  "/calendar": 1,
  "/log": 2,
  "/stats": 3,
  "/learn": 4,
};

export function getPageDirection(from: string, to: string): number {
  if (to === "/onboarding" || from === "/onboarding") return 0;
  if (to === "/settings" || from === "/settings") return 2;
  const a = ROUTE_ORDER[from] ?? 0;
  const b = ROUTE_ORDER[to] ?? 0;
  if (a === b) return 0;
  return b > a ? 1 : -1;
}

export const pageVariants: Variants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir === 0 ? 0 : dir === 2 ? 0 : dir * 32,
    y: dir === 2 ? 28 : dir === 0 ? 8 : 0,
    scale: dir === 0 ? 0.985 : 1,
    filter: "blur(4px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir === 0 ? 0 : dir === 2 ? 0 : dir * -20,
    y: dir === 2 ? -16 : 0,
    scale: dir === 0 ? 0.985 : 0.99,
    filter: "blur(3px)",
  }),
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: nativeEase },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: fadeTransition },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: springSoft,
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.32, ease: nativeEase },
  },
};

export function hapticLight() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(8);
  }
}

export function hapticSuccess() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([10, 40, 12]);
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
