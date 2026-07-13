import { motion, type HTMLMotionProps, type MouseEvent } from "framer-motion";
import { springSnappy, hapticLight } from "@/lib/motion";

type PressableProps = HTMLMotionProps<"button"> & {
  haptic?: boolean;
};

export function Pressable({ haptic = false, onClick, children, ...props }: PressableProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={springSnappy}
      onClick={(e) => {
        if (haptic) hapticLight();
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

type PressableDivProps = HTMLMotionProps<"div"> & {
  haptic?: boolean;
};

export function PressableDiv({ haptic = false, onClick, children, ...props }: PressableDivProps) {
  return (
    <motion.div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      whileTap={{ scale: 0.97 }}
      transition={springSnappy}
      onClick={(e) => {
        if (haptic) hapticLight();
        onClick?.(e);
      }}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(e as unknown as MouseEvent<HTMLDivElement>);
              }
            }
          : undefined
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}
