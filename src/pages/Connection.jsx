import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../components/GlassCard";
import {
  listenDailyConnection,
  setMyDailyConnection,
  reactToDailyConnection,
  todayKey,
} from "../services/data";
import "./Connection.css";

const TYPES = [
  { id: "love", label: "Love Note" },
  { id: "thought", label: "Thought" },
  { id: "appreciation", label: "Appreciation" },
  { id: "support", label: "Need Support" },
  { id: "random", label: "Random" },
  { id: "sleep", label: "Before Sleep" },
];

const REACTIONS = ["❤️", "🫂", "✨", "🥹", "😂"];

export default function Connection({ ctx }) {
  const { spaceId, user, profile, partner } = ctx;

  const [entries, setEntries] = useState([]);
  const [type, setType] = useState("love");
  const [text, setText] = useState("");
  const [phase, setPhase] = useState("idle");
  const [busy, setBusy] = useState(false);

  const dateStr = todayKey();

  useEffect(() => {
    if (!spaceId) return;

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
    } catch (err) {
      console.error(err);
      setPhase("idle");
    } finally {
      setBusy(false);
    }
  }

  return (
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
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={
                    "private-letter-type" +
                    (type === t.id
                      ? " private-letter-type-active"
                      : "")
                  }
                  onClick={() => setType(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >

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
                    >
                      ✉
                    </motion.div>
                  )}

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
                    >
                      ✨
                    </motion.div>
                  )}

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

      </div>
    </div>
  );
}

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
