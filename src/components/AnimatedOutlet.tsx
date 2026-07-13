import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { useRef } from "react";
import { fadeTransition, getPageDirection, nativeEase, pageVariants } from "@/lib/motion";

export function AnimatedOutlet() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const reduceMotion = useReducedMotion();
  const prevPath = useRef(pathname);
  const direction = useRef(0);

  if (prevPath.current !== pathname) {
    direction.current = getPageDirection(prevPath.current, pathname);
    prevPath.current = pathname;
  }

  if (reduceMotion) {
    return <Outlet />;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        custom={direction.current}
        variants={pageVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: nativeEase }}
        className="min-h-dvh will-change-transform"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
