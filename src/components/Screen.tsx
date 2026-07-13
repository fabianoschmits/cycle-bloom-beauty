import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function Screen({
  title,
  subtitle,
  right,
  children,
  hidePad,
  stagger = true,
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  hidePad?: boolean;
  stagger?: boolean;
}) {
  const content = stagger ? (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className={hidePad ? "" : "px-5"}
    >
      {children}
    </motion.div>
  ) : (
    <div className={hidePad ? "" : "px-5"}>{children}</div>
  );

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md pb-32 pt-[max(1.25rem,env(safe-area-inset-top))]">
      {(title || right) && (
        <motion.header
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 px-6 pb-4"
        >
          <div className="min-w-0">
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.3 }}
                className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
              >
                {subtitle}
              </motion.p>
            )}
            {title && (
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.35 }}
                className="mt-1 truncate text-[34px] font-semibold leading-tight text-foreground"
              >
                {title}
              </motion.h1>
            )}
          </div>
          {right && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 28 }}
              className="shrink-0"
            >
              {right}
            </motion.div>
          )}
        </motion.header>
      )}
      {content}
    </main>
  );
}

/** Wrap a section inside Screen for staggered entrance */
export function ScreenSection({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.section variants={fadeUp} className={className}>
      {children}
    </motion.section>
  );
}
