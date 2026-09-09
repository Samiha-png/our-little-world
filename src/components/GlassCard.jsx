import { motion } from "framer-motion";
import "./GlassCard.css";

/**
 * The core surface used everywhere: memories, tasks, connection cards,
 * entrances. `interactive` adds hover depth/glow/scale; `accent` tints the
 * glow rose (Samiha), burgundy (Him), or gold (shared/celebratory).
 */
export default function GlassCard({
  children,
  interactive = false,
  accent = "shared",
  as: Component = motion.div,
  className = "",
  ...rest
}) {
  return (
    <Component
      className={`glass-card accent-${accent} ${interactive ? "glass-card-interactive" : ""} ${className}`}
      whileHover={interactive ? { y: -4, scale: 1.012 } : undefined}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </Component>
  );
}
