import { AnimatePresence, motion } from "framer-motion";
import { CircleHelp } from "lucide-react";
import { useEffect, useState } from "react";
import { fieldHelp, type FieldHelpId } from "@/lib/cycle/field-help";
import { hapticLight, springSoft } from "@/lib/motion";

export function InfoTip({ id, className }: { id: FieldHelpId; className?: string }) {
  const [open, setOpen] = useState(false);
  const help = fieldHelp[id];

  return (
    <>
      <motion.button
        type="button"
        aria-label={`Saiba mais sobre ${help.title}`}
        whileTap={{ scale: 0.9 }}
        transition={springSoft}
        onClick={(e) => {
          e.stopPropagation();
          hapticLight();
          setOpen(true);
        }}
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground ${className ?? ""}`}
      >
        <CircleHelp size={16} strokeWidth={2} />
      </motion.button>

      <HelpSheet open={open} title={help.title} body={help.body} onClose={() => setOpen(false)} />
    </>
  );
}

export function HelpSheet({
  open,
  title,
  body,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            aria-label="Fechar explicação"
            onClick={onClose}
            className="absolute inset-0 bg-foreground/25 backdrop-blur-xl"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-sheet-title"
            initial={{ y: 48, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="relative max-h-[min(80dvh,520px)] w-full max-w-sm overflow-y-auto rounded-3xl border border-border/60 bg-background/95 p-6 shadow-2xl backdrop-blur-2xl"
          >
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <CircleHelp size={22} />
            </div>
            <h3 id="help-sheet-title" className="mt-4 text-center font-display text-xl text-foreground">
              {title}
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{body}</p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="mt-6 w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground"
            >
              Entendi
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
