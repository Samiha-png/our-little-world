import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../components/GlassCard";
import { listenDailyConnection, setMyDailyConnection, reactToDailyConnection, todayKey } from "../services/data";
import "./Connection.css";

const TYPES = [
  { id: "love", label: "Love Note" },
  { id: "thought", label: "Thought" },
  { id: "appreciation", label: "Appreciation" },
  { id: "support", label: "Need Support" },
  { id: "random", label: "Random" },
  { id: "sleep", label: "Before Sleep" }
];

const REACTIONS = ["❤️", "🫂", "✨", "🥹", "😂"];

export default function Connection({ ctx }) {
  const { spaceId, user, profile, partner } = ctx;
  const [entries, setEntries] = useState([]);
  const [type, setType] = useState("love");
  const [text, setText] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | envelope | trail | delivered
  const [busy, setBusy] = useState(false);

  const dateStr = todayKey();

  useEffect(() => {
    if (!spaceId) return;
    const unsub = listenDailyConnection(spaceId, dateStr, setEntries);
    return unsub;
  }, [spaceId, dateStr]);

  const myEntry = entries.find((e) => e.uid === user.uid);
  const partnerEntry = partner ? entries.find((e) => e.uid === partner.uid) : null;
  const myName = profile?.displayName || user.email.split("@")[0];

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    setPhase("envelope");
    try {
      await setMyDailyConnection(spaceId, dateStr, user.uid, myName, { type, text: text.trim() });
      setTimeout(() => setPhase("trail"), 500);
      setTimeout(() => setPhase("delivered"), 1400);
      setTimeout(() => { setPhase("idle"); setText(""); }, 2600);
    } catch (err) {
      console.error(err);
      setPhase("idle");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-container connection-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="eyebrow">a core feature of our world</p>
        <h1 className="editorial-heading">
          Between <em>Us</em>
        </h1>
        <p className="connection-subtitle">things we want each other to know</p>
      </motion.div>

      <div className="connection-grid">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
          <GlassCard accent="samiha" className="connection-compose">
            <div className="connection-types">
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={"connection-type-pill" + (type === t.id ? " is-active" : "")}
                  onClick={() => setType(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleSend} className="connection-form">
              <textarea
                rows={4}
                placeholder={`Write your ${TYPES.find((t) => t.id === type)?.label.toLowerCase()}…`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={phase !== "idle"}
              />
              <button type="submit" className="connection-send" disabled={!text.trim() || phase !== "idle"}>
                Send
              </button>
            </form>

            <AnimatePresence>
              {phase !== "idle" && (
                <motion.div
                  className="connection-anim-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {phase === "envelope" && (
                    <motion.div
                      className="connection-envelope"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      ✉
                    </motion.div>
                  )}
                  {phase === "trail" && (
                    <motion.div
                      className="connection-envelope connection-trail"
                      initial={{ x: 0, opacity: 1 }}
                      animate={{ x: 120, opacity: 0.3 }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    >
                      ✨
                    </motion.div>
                  )}
                  {phase === "delivered" && (
                    <motion.div
                      className="connection-delivered"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      Delivered ❤️
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>

        <div className="connection-entries">
          <EntryCard label={myName} entry={myEntry} accent="samiha" spaceId={spaceId} dateStr={dateStr} myUid={user.uid} />
          <EntryCard label={partner?.displayName || "Your partner"} entry={partnerEntry} accent="him" spaceId={spaceId} dateStr={dateStr} myUid={user.uid} />
        </div>
      </div>
    </div>
  );
}

function EntryCard({ label, entry, accent, spaceId, dateStr, myUid }) {
  const myReaction = entry?.reactions?.[myUid];
  return (
    <GlassCard accent={accent} className="connection-entry">
      <p className="eyebrow">{label}</p>
      {entry ? (
        <>
          <p className="connection-entry-type">{TYPES.find((t) => t.id === entry.type)?.label || entry.type}</p>
          <p className="connection-entry-text">{entry.text}</p>
          <div className="connection-reactions">
            {REACTIONS.map((r) => (
              <span
                key={r}
                className={"connection-reaction" + (myReaction === r ? " is-picked" : "")}
                onClick={() => reactToDailyConnection(spaceId, dateStr, entry.uid, myUid, r)}
              >
                {r}
              </span>
            ))}
          </div>
        </>
      ) : (
        <p className="connection-entry-empty">Nothing written yet today.</p>
      )}
    </GlassCard>
  );
}
