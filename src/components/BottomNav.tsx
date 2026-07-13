import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Home, Calendar, PlusCircle, LineChart, BookOpen } from "lucide-react";
import { hapticLight, springSnappy } from "@/lib/motion";

type NavItem = { to: string; label: string; icon: typeof Home; primary?: boolean };
const items: NavItem[] = [
  { to: "/", label: "Hoje", icon: Home },
  { to: "/calendar", label: "Calendário", icon: Calendar },
  { to: "/log", label: "Registrar", icon: PlusCircle, primary: true },
  { to: "/stats", label: "Padrões", icon: LineChart },
  { to: "/learn", label: "Aprender", icon: BookOpen },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/onboarding") || pathname.startsWith("/lock")) return null;

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 32, delay: 0.15 }}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
    >
      <div className="pointer-events-auto mx-auto flex max-w-md items-center justify-around gap-1 rounded-full border border-border/60 glass px-2 py-2 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.25)]">
        {items.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          if (item.primary) {
            return (
              <motion.div key={item.to} whileTap={{ scale: 0.9 }} transition={springSnappy}>
                <Link
                  to={item.to as unknown as "/"}
                  aria-label={item.label}
                  onClick={() => hapticLight()}
                  className="relative -mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                >
                  <motion.span
                    animate={active ? { rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] } : { rotate: 0, scale: 1 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Icon size={26} strokeWidth={2.2} />
                  </motion.span>
                </Link>
              </motion.div>
            );
          }
          return (
            <motion.div key={item.to} className="relative flex flex-1" whileTap={{ scale: 0.92 }} transition={springSnappy}>
              <Link
                to={item.to as unknown as "/"}
                aria-label={item.label}
                onClick={() => hapticLight()}
                className="relative flex w-full flex-col items-center gap-0.5 rounded-full px-3 py-2 text-[11px] font-medium text-muted-foreground transition-colors data-[active=true]:text-foreground"
                data-active={active}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-accent/60"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <motion.span
                  className="relative"
                  animate={active ? { y: -1, scale: 1.05 } : { y: 0, scale: 1 }}
                  transition={springSnappy}
                >
                  <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                </motion.span>
                <motion.span className="relative" animate={active ? { opacity: 1 } : { opacity: 0.85 }}>
                  {item.label}
                </motion.span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.nav>
  );
}
