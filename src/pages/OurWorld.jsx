import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";
import {
  listenGoals, addGoal, updateGoalProgress,
  listenDailyQuestion, answerDailyQuestion, pickDailyQuestion, todayKey
} from "../services/data";
import "./OurWorld.css";

const STAGES = [
  { key: "seed", icon: "🌱", label: "Seed", min: 0 },
  { key: "plant", icon: "🌿", label: "Plant", min: 5 },
  { key: "tree", icon: "🌳", label: "Tree", min: 15 },
  { key: "house", icon: "🏡", label: "Little House", min: 30 },
  { key: "world", icon: "🌎", label: "Tiny World", min: 50 },
  { key: "glow", icon: "✨", label: "Glowing World", min: 80 }
];

export default function OurWorld({ ctx }) {
  const { spaceId, user, profile, partner } = ctx;
  const dateStr = todayKey();
  const myName = profile?.displayName || user.email.split("@")[0];

  const [goals, setGoals] = useState([]);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [goalTitle, setGoalTitle] = useState("");

  useEffect(() => {
    if (!spaceId) return;
    const u1 = listenGoals(spaceId, setGoals);
    const u2 = listenDailyQuestion(spaceId, dateStr, setQuestion);
    return () => { u1(); u2(); };
  }, [spaceId, dateStr]);

  const todaysQuestion = question?.question || pickDailyQuestion(dateStr);
  const myAnswer = question?.answers?.[user.uid];
  const partnerAnswer = partner ? question?.answers?.[partner.uid] : null;
  const bothAnswered = !!myAnswer && !!partnerAnswer;

  async function handleAnswer(e) {
    e.preventDefault();
    if (!answer.trim()) return;
    await answerDailyQuestion(spaceId, dateStr, user.uid, todaysQuestion, answer.trim());
    setAnswer("");
  }

  async function handleAddGoal(e) {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    await addGoal(spaceId, user.uid, myName, { title: goalTitle.trim() });
    setGoalTitle("");
  }

  // Garden progress: a simple, honest proxy from real shared activity —
  // completed goals + goals in progress + today's question answered.
  const gardenScore =
    goals.filter((g) => g.progress >= 100).length * 8 +
    goals.length * 2 +
    (bothAnswered ? 5 : 0);
  const stage = [...STAGES].reverse().find((s) => gardenScore >= s.min) || STAGES[0];

  return (
    <div className="page-container ourworld-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="eyebrow">our little world</p>
        <h1 className="editorial-heading">Our <em>little plans</em></h1>
      </motion.div>

      <div className="ourworld-grid">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard accent="gold" className="garden-card">
            <p className="eyebrow">our little garden</p>
            <div className="garden-stage">{stage.icon}</div>
            <p className="garden-stage-label">{stage.label}</p>
            <div className="garden-track">
              {STAGES.map((s) => (
                <span key={s.key} className={gardenScore >= s.min ? "is-reached" : ""} title={s.label} />
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <GlassCard accent="samiha" className="question-card">
            <p className="eyebrow">question for us</p>
            <h3 className="question-text">{todaysQuestion}</h3>
            {myAnswer ? (
              bothAnswered ? (
                <div className="question-answers">
                  <p><strong>{myName}:</strong> {myAnswer}</p>
                  <p><strong>{partner?.displayName}:</strong> {partnerAnswer}</p>
                </div>
              ) : (
                <p className="question-waiting">Your answer is in — waiting on {partner?.displayName || "your partner"}.</p>
              )
            ) : (
              <form onSubmit={handleAnswer} className="question-form">
                <input placeholder="Your answer…" value={answer} onChange={(e) => setAnswer(e.target.value)} />
                <button type="submit">Answer</button>
              </form>
            )}
          </GlassCard>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
        <GlassCard accent="him" className="goals-card">
          <p className="eyebrow">shared goals</p>
          <form onSubmit={handleAddGoal} className="goals-form">
            <input placeholder="Add a shared goal…" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} />
            <button type="submit">Add</button>
          </form>
          <div className="goals-list">
            {goals.map((g) => (
              <div key={g.id} className="goal-item">
                <div className="goal-item-head">
                  <span>{g.title}</span>
                  <span className="goal-item-pct">{g.progress}%</span>
                </div>
                <input
                  type="range" min="0" max="100" value={g.progress}
                  onChange={(e) => updateGoalProgress(spaceId, g.id, Number(e.target.value))}
                />
                <span className="goal-item-by">by {g.createdByName}</span>
              </div>
            ))}
            {goals.length === 0 && <p className="memories-empty">No shared goals yet.</p>}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
