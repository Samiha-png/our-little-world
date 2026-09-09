import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";

export default function ComingSoon({ title, note }) {
  return (
    <div className="page-container" style={{ paddingTop: 160, textAlign: "center" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="eyebrow">coming soon</p>
        <h1 className="editorial-heading" style={{ margin: "10px 0 var(--space-4)" }}>{title}</h1>
        <GlassCard accent="gold" style={{ maxWidth: 420, margin: "0 auto" }}>
          <p style={{ color: "var(--text-secondary)" }}>{note}</p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
