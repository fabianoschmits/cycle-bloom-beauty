import { AnimatePresence, motion } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function PageTransitionOverlay() {
  const isLoading = useRouterState({ select: (s) => s.status === "pending" });
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    import("ldrs").then((m) => {
      m.hourglass.register();
      setRegistered(true);
    });
  }, []);

  return (
    <AnimatePresence>
      {isLoading && registered && (
        <motion.div
          key="page-transition-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center"
          aria-hidden="true"
        >
          {/* Blurred backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          />
          {/* Spinner */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="relative grid h-16 w-16 place-items-center rounded-2xl border border-border/50 bg-card/80 shadow-xl shadow-black/10 backdrop-blur"
          >
            <span className="text-primary">
              <l-hourglass
                size="32"
                bg-opacity="0.1"
                speed="1.75"
                color="currentColor"
              />
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
