import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";
import { listenDiaryEntries, saveDiaryEntry, todayKey } from "../services/data";
import "./Diary.css";

const MOODS = ["😊", "😌", "😔", "😤", "🥹", "😴", "🤔", "🥰"];

export default function Diary({ ctx }) {
  const { user } = ctx;
  const [entries, setEntries] = useState([]);
  const [mood, setMood] = useState(null);
  const [whatHappened, setWhatHappened] = useState("");
  const [thinking, setThinking] = useState("");
  const [remember, setRemember] = useState("");
  const [saved, setSaved] = useState(false);
  const dateStr = todayKey();

  useEffect(() => {
    const unsub = listenDiaryEntries(user.uid, setEntries);
    return unsub;
  }, [user.uid]);

  useEffect(() => {
    const today = entries.find((e) => e.id === dateStr);
    if (today) {
      setMood(today.mood || null);
      setWhatHappened(today.whatHappened || "");
      setThinking(today.thinking || "");
      setRemember(today.remember || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]);

  async function handleSave(e) {
    e.preventDefault();
    await saveDiaryEntry(user.uid, dateStr, { mood, whatHappened, thinking, remember });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const pastEntries = entries.filter((e) => e.id !== dateStr);

  return (
    <div className="page-container diary-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="eyebrow">private · only you can see this</p>
        <h1 className="editorial-heading">
          Dear <em>today…</em>
        </h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.6 }}>
        <GlassCard accent="samiha" className="diary-compose">
          <div className="diary-moods">
            {MOODS.map((m) => (
              <button
                key={m}
                type="button"
                className={"diary-mood" + (mood === m ? " is-active" : "")}
                onClick={() => setMood(m)}
              >
                {m}
              </button>
            ))}
          </div>
          <form onSubmit={handleSave} className="diary-form">
            <label className="diary-label">What happened today?</label>
            <textarea rows={3} value={whatHappened} onChange={(e) => setWhatHappened(e.target.value)} />
            <label className="diary-label">What am I thinking about?</label>
            <textarea rows={3} value={thinking} onChange={(e) => setThinking(e.target.value)} />
            <label className="diary-label">What do I want to remember?</label>
            <textarea rows={2} value={remember} onChange={(e) => setRemember(e.target.value)} />
            <button type="submit" className="diary-save">{saved ? "Saved ✓" : "Save entry"}</button>
          </form>
        </GlassCard>
      </motion.div>

      {pastEntries.length > 0 && (
        <div className="diary-history">
          <p className="eyebrow" style={{ margin: "var(--space-5) 0 var(--space-3)" }}>previous entries</p>
          <div className="diary-history-grid">
            {pastEntries.map((entry, i) => (
              <motion.div key={entry.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GlassCard accent="samiha" className="diary-entry-card">
                  <div className="diary-entry-head">
                    <span>{entry.mood}</span>
                    <span className="diary-entry-date">{entry.date}</span>
                  </div>
                  {entry.whatHappened && <p className="diary-entry-text">{entry.whatHappened}</p>}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
