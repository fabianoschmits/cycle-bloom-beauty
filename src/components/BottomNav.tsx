import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Home, Calendar, PlusCircle, LineChart, BookOpen } from "lucide-react";

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
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
      <div className="pointer-events-auto mx-auto flex max-w-md items-center justify-around gap-1 rounded-full border border-border/60 glass px-2 py-2 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.25)]">

        {items.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          if (item.primary) {
            return (
              <Link
                key={item.to}
                to={item.to as unknown as "/"}
                aria-label={item.label}
                className="relative -mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
              >
                <Icon size={26} strokeWidth={2.2} />
              </Link>
            );
          }
          return (
            <Link
              key={item.to}
              to={item.to as unknown as "/"}
              aria-label={item.label}
              className="relative flex flex-1 flex-col items-center gap-0.5 rounded-full px-3 py-2 text-[11px] font-medium text-muted-foreground transition-colors data-[active=true]:text-foreground"
              data-active={active}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-full bg-accent/60"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon size={20} strokeWidth={active ? 2.4 : 1.8} className="relative" />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
