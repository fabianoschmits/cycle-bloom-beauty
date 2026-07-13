import { AnimatePresence, motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineBanner() {
  const online = useOnlineStatus();

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-[max(0.5rem,env(safe-area-inset-top))]"
        >
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/95 px-4 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur-sm">
            <WifiOff size={14} className="text-muted-foreground" />
            Modo offline — seus dados continuam disponíveis neste dispositivo
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
