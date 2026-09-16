import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import {
  listenTasks, listenDay, todayKey, listenSharedMoodsToday, listenRecentDailyConnections
} from "../services/data";
import "./Home.css";

export default function Home({ ctx }) {
  const { spaceId, user, profile, partner } = ctx;
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [day, setDay] = useState({ users: {} });
  const [moods, setMoods] = useState([]);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    if (!spaceId) return;
    const dateStr = todayKey();
    const u1 = listenTasks(spaceId, setTasks);
    const u2 = listenDay(spaceId, dateStr, setDay);
    const u3 = listenSharedMoodsToday(spaceId, dateStr, setMoods);
    const u4 = listenRecentDailyConnections(spaceId, 1, setConnections);
    return () => { u1(); u2(); u3(); u4(); };
  }, [spaceId]);

  const myName = profile?.displayName || user.email.split("@")[0];
  const myTasks = tasks.filter((t) => t.ownerUid === user.uid);
  const myProgress = day.users?.[user.uid] || {};
  const myDone = Object.keys(myProgress.taskCompletions || {}).length;
  const myMood = moods.find((m) => m.uid === user.uid);

  const partnerTasks = partner ? tasks.filter((t) => t.ownerUid === partner.uid) : [];
  const partnerProgress = partner ? day.users?.[partner.uid] || {} : {};
  const partnerDone = Object.keys(partnerProgress.taskCompletions || {}).length;
  const partnerMood = partner ? moods.find((m) => m.uid === partner.uid) : null;

  const latestNote = connections[0];

  return (
    <div className="page-container home-page">
      <motion.h1
        className="editorial-heading home-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        Today, <em>we…</em>
      </motion.h1>

      <div className="home-grid">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}>
          <GlassCard interactive accent="samiha" className="home-section" onClick={() => navigate("/today")}>
            <p className="eyebrow">your day</p>
            <h3 className="home-section-title">{myName}</h3>
            <p className="home-section-meta">Mood: {myMood?.mood || "not set"}</p>
            <p className="home-section-meta">{myDone} of {myTasks.length} tasks done</p>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
          <GlassCard interactive accent="him" className="home-section home-section-tall" onClick={() => navigate("/today")}>
            <p className="eyebrow">{partner ? `${partner.displayName}'s day` : "their day"}</p>
            <h3 className="home-section-title">{partner?.displayName || "Waiting for partner"}</h3>
            <p className="home-section-meta">Mood: {partnerMood?.mood || "not shared"}</p>
            <p className="home-section-meta">{partnerDone} of {partnerTasks.length} tasks done</p>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
          <GlassCard interactive accent="gold" className="home-section" onClick={() => navigate("/connection")}>
            <p className="eyebrow">our day</p>
            <h3 className="home-section-title">Between Us</h3>
            <p className="home-section-meta">
              {latestNote ? `“${(latestNote.text || "").slice(0, 60)}${latestNote.text?.length > 60 ? "…" : ""}”` : "No note yet today"}
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
