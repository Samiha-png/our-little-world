import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import { listenSharedMoodsToday, listenRecentDailyConnections } from "../services/data";
import { todayKey } from "../services/data";
import "./Landing.css";

export default function Landing({ ctx }) {
  const { spaceId, space, partner, profile, user } = ctx;
  const navigate = useNavigate();
  const [moods, setMoods] = useState([]);
  const [connectedToday, setConnectedToday] = useState(false);

  useEffect(() => {
    if (!spaceId) return;
    const unsubMood = listenSharedMoodsToday(spaceId, todayKey(), setMoods);
    const unsubConn = listenRecentDailyConnections(spaceId, 1, (entries) => {
      setConnectedToday((entries || []).length > 0);
    });
    return () => { unsubMood(); unsubConn(); };
  }, [spaceId]);

  const myName = profile?.displayName || user.email.split("@")[0];
  const daysTogether = space?.createdAt?.toDate
    ? Math.max(1, Math.floor((Date.now() - space.createdAt.toDate().getTime()) / 86400000))
    : null;

  const myMood = moods.find((m) => m.uid === user.uid);
  const partnerMood = partner ? moods.find((m) => m.uid === partner.uid) : null;

  return (
    <div className="page-container landing-page">
      <motion.div
        className="landing-hero"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="eyebrow">welcome back, {myName}</p>
        <h1 className="editorial-heading landing-title">
          OUR <em>LITTLE WORLD</em>
        </h1>
        <p className="landing-subtitle">a little place that belongs to us</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <GlassCard accent="gold" className="landing-today">
          <p className="eyebrow" style={{ marginBottom: 10 }}>today</p>
          <div className="landing-today-grid">
            <div>
              <p className="landing-stat-value">{daysTogether ?? "—"}</p>
              <p className="landing-stat-label">days together</p>
            </div>
            <div>
              <p className="landing-stat-value">{connectedToday ? "connected" : "waiting"}</p>
              <p className="landing-stat-label">connection status</p>
            </div>
            <div>
              <p className="landing-stat-value">{myMood?.mood || "—"}</p>
              <p className="landing-stat-label">your mood</p>
            </div>
            <div>
              <p className="landing-stat-value">{partnerMood?.mood || "—"}</p>
              <p className="landing-stat-label">{partner?.displayName || "their"} mood</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="landing-entrances">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlassCard interactive accent="samiha" className="entrance-card" onClick={() => navigate("/home")}>
            <p className="eyebrow">step inside</p>
            <h2 className="entrance-title">Enter My Space</h2>
            <p className="entrance-copy">Your tasks, your mood, your world.</p>
          </GlassCard>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlassCard interactive accent="shared" className="entrance-card" onClick={() => navigate("/connection")}>
            <p className="eyebrow">together</p>
            <h2 className="entrance-title">Enter Our World</h2>
            <p className="entrance-copy">Between us, our memories, our story.</p>
          </GlassCard>
        </motion.div>
      </div>

      <motion.button
        className="landing-memory-link"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={() => navigate("/memories")}
      >
        Open today's memory →
      </motion.button>
    </div>
  );
}
