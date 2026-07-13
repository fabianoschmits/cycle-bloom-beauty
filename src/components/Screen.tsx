import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Screen({
  title,
  subtitle,
  right,
  children,
  hidePad,
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  hidePad?: boolean;
}) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto min-h-dvh w-full max-w-md pb-32 pt-[max(1.25rem,env(safe-area-inset-top))]"
    >
      {(title || right) && (
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 px-6 pb-4">
          <div className="min-w-0">
            {subtitle && (
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {subtitle}
              </p>
            )}
            {title && (
              <h1 className="mt-1 truncate text-[34px] font-semibold leading-tight text-foreground">
                {title}
              </h1>
            )}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </header>
      )}
      <div className={hidePad ? "" : "px-5"}>{children}</div>
    </motion.main>
  );
}
