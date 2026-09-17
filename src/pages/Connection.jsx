import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../components/GlassCard";
<<<<<<< HEAD
import {
  listenDailyConnection,
  setMyDailyConnection,
  reactToDailyConnection,
  todayKey,
} from "../services/data";
=======
import { listenDailyConnection, setMyDailyConnection, reactToDailyConnection, todayKey } from "../services/data";
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
import "./Connection.css";

const TYPES = [
  { id: "love", label: "Love Note" },
  { id: "thought", label: "Thought" },
  { id: "appreciation", label: "Appreciation" },
  { id: "support", label: "Need Support" },
  { id: "random", label: "Random" },
<<<<<<< HEAD
  { id: "sleep", label: "Before Sleep" },
=======
  { id: "sleep", label: "Before Sleep" }
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
];

const REACTIONS = ["❤️", "🫂", "✨", "🥹", "😂"];

export default function Connection({ ctx }) {
  const { spaceId, user, profile, partner } = ctx;
<<<<<<< HEAD

  const [entries, setEntries] = useState([]);
  const [type, setType] = useState("love");
  const [text, setText] = useState("");
  const [phase, setPhase] = useState("idle");
=======
  const [entries, setEntries] = useState([]);
  const [type, setType] = useState("love");
  const [text, setText] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | envelope | trail | delivered
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
  const [busy, setBusy] = useState(false);

  const dateStr = todayKey();

  useEffect(() => {
    if (!spaceId) return;
<<<<<<< HEAD

    const unsub = listenDailyConnection(
      spaceId,
      dateStr,
      setEntries
    );

    return unsub;
  }, [spaceId, dateStr]);

  const myEntry = entries.find(
    (e) => e.uid === user.uid
  );

  const partnerEntry = partner
    ? entries.find((e) => e.uid === partner.uid)
    : null;

  const myName =
    profile?.displayName ||
    user.email.split("@")[0];

  async function handleSend(e) {
    e.preventDefault();

    if (!text.trim() || busy) return;

    setBusy(true);
    setPhase("envelope");

    try {
      await setMyDailyConnection(
        spaceId,
        dateStr,
        user.uid,
        myName,
        {
          type,
          text: text.trim(),
        }
      );

      setTimeout(() => {
        setPhase("trail");
      }, 500);

      setTimeout(() => {
        setPhase("delivered");
      }, 1400);

      setTimeout(() => {
        setPhase("idle");
        setText("");
      }, 2600);
=======
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
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
    } catch (err) {
      console.error(err);
      setPhase("idle");
    } finally {
      setBusy(false);
    }
  }

  return (
<<<<<<< HEAD
    <div className="page-container private-letter-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <motion.div
        className="private-letter-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="private-letter-eyebrow">
          OUR LITTLE WORLD
        </p>

        <h1 className="private-letter-title">
          Connection
        </h1>

        <p className="private-letter-subtitle">
          A little space for us.
        </p>
      </motion.div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="private-letter-layout">

        {/* ===================================================
            LEFT — COMPOSER
        =================================================== */}

        <motion.div
          className="private-letter-composer-wrap"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.15,
            duration: 0.6,
          }}
        >
          <GlassCard
            accent="samiha"
            className="private-letter-composer"
          >

            <div className="private-letter-composer-head">
              <div>
                <p className="private-letter-mini-label">
                  WRITE SOMETHING
                </p>

                <h2>
                  A note for us
                </h2>
              </div>

              <span className="private-letter-heart">
                ♡
              </span>
            </div>

            {/* TYPES */}

            <div className="private-letter-type-list">
=======
    <div className="page-container connection-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="eyebrow">OUR LITTLE WORLD</p><h1 className="editorial-heading">Connection</h1><p className="subtitle" style={{ marginTop: "12px", fontSize: "1.1rem", color: "var(--text-secondary)", fontStyle: "italic", fontFamily: "var(--font-editorial)", marginBottom: "32px" }}>A little space for us.</p>
      </motion.div>

      <div className="connection-grid">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
          <GlassCard accent="samiha" className="connection-compose">
            <div className="connection-types">
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
<<<<<<< HEAD
                  className={
                    "private-letter-type" +
                    (type === t.id
                      ? " private-letter-type-active"
                      : "")
                  }
=======
                  className={"connection-type-pill" + (type === t.id ? " is-active" : "")}
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                  onClick={() => setType(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
<<<<<<< HEAD

            {/* FORM */}

            <form
              onSubmit={handleSend}
              className="private-letter-form"
            >
              <div className="private-letter-textarea-wrap">

                <textarea
                  rows={6}
                  placeholder={`Write your ${
                    TYPES.find((t) => t.id === type)
                      ?.label
                      .toLowerCase()
                  }…`}
                  value={text}
                  onChange={(e) =>
                    setText(e.target.value)
                  }
                  disabled={phase !== "idle"}
                />

                <span className="private-letter-textarea-mark">
                  ✦
                </span>

              </div>

              <div className="private-letter-form-bottom">

                <span className="private-letter-hint">
                  Just say what you feel.
                </span>

                <button
                  type="submit"
                  className="private-letter-send"
                  disabled={
                    !text.trim() ||
                    phase !== "idle"
                  }
                >
                  <span>Send</span>
                  <span className="private-letter-send-icon">
                    →
                  </span>
                </button>

              </div>
            </form>

            {/* SEND ANIMATION */}

            <AnimatePresence>
              {phase !== "idle" && (
                <motion.div
                  className="private-letter-animation"
=======
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
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
<<<<<<< HEAD

                  {phase === "envelope" && (
                    <motion.div
                      className="private-letter-envelope"
                      initial={{
                        scale: 0.6,
                        opacity: 0,
                        rotate: -8,
                      }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        rotate: 0,
                      }}
=======
                  {phase === "envelope" && (
                    <motion.div
                      className="connection-envelope"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                    >
                      ✉
                    </motion.div>
                  )}
<<<<<<< HEAD

                  {phase === "trail" && (
                    <motion.div
                      className="private-letter-envelope private-letter-trail"
                      initial={{
                        x: 0,
                        opacity: 1,
                      }}
                      animate={{
                        x: 140,
                        opacity: 0.3,
                      }}
                      transition={{
                        duration: 0.9,
                        ease: [
                          0.16,
                          1,
                          0.3,
                          1,
                        ],
                      }}
=======
                  {phase === "trail" && (
                    <motion.div
                      className="connection-envelope connection-trail"
                      initial={{ x: 0, opacity: 1 }}
                      animate={{ x: 120, opacity: 0.3 }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                    >
                      ✨
                    </motion.div>
                  )}
<<<<<<< HEAD

                  {phase === "delivered" && (
                    <motion.div
                      className="private-letter-delivered"
                      initial={{
                        scale: 0.7,
                        opacity: 0,
                      }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                    >
                      <span>Delivered</span>
                      <span>❤️</span>
                    </motion.div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>

          </GlassCard>
        </motion.div>

        {/* ===================================================
            RIGHT — LETTERS
        =================================================== */}

        <div className="private-letter-list">

          <EntryCard
            label={myName}
            entry={myEntry}
            accent="samiha"
            spaceId={spaceId}
            dateStr={dateStr}
            myUid={user.uid}
          />

          <EntryCard
            label={
              partner?.displayName ||
              "Your partner"
            }
            entry={partnerEntry}
            accent="him"
            spaceId={spaceId}
            dateStr={dateStr}
            myUid={user.uid}
          />

        </div>

=======
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
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
      </div>
    </div>
  );
}

<<<<<<< HEAD
/* =========================================================
   ENTRY CARD
   ========================================================= */

function EntryCard({
  label,
  entry,
  accent,
  spaceId,
  dateStr,
  myUid,
}) {
  const myReaction =
    entry?.reactions?.[myUid];

  return (
    <GlassCard
      accent={accent}
      className="private-letter-card"
    >

      <div className="private-letter-card-top">

        <div className="private-letter-person">
          <span className="private-letter-person-dot" />

          <div>
            <p className="private-letter-person-name">
              {label}
            </p>

            <p className="private-letter-person-caption">
              {entry
                ? "Written today"
                : "Waiting for a little note"}
            </p>
          </div>
        </div>

        <span className="private-letter-card-symbol">
          ♡
        </span>

      </div>

      {entry ? (
        <>

          <div className="private-letter-entry-type">
            {TYPES.find(
              (t) => t.id === entry.type
            )?.label || entry.type}
          </div>

          <p className="private-letter-entry-text">
            {entry.text}
          </p>

          <div className="private-letter-reactions">

            <span className="private-letter-react-label">
              React
            </span>

            <div className="private-letter-reaction-list">
              {REACTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={
                    "private-letter-reaction" +
                    (myReaction === r
                      ? " private-letter-reaction-picked"
                      : "")
                  }
                  onClick={() =>
                    reactToDailyConnection(
                      spaceId,
                      dateStr,
                      entry.uid,
                      myUid,
                      r
                    )
                  }
                >
                  {r}
                </button>
              ))}
            </div>

          </div>

        </>
      ) : (
        <div className="private-letter-empty">
          <span className="private-letter-empty-icon">
            ♡
          </span>

          <p>
            Nothing written yet today.
          </p>
        </div>
      )}

    </GlassCard>
  );
}
=======
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
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
