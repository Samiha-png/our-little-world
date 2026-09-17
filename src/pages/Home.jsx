<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
=======
import { useEffect, useState } from "react";
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import {
<<<<<<< HEAD
  listenTasks,
  listenDay,
  todayKey,
  listenSharedMoodsToday,
  listenRecentDailyConnections,
  listenMemories,
} from "../services/data";
import "./Home.css";

const DAYS_TO_TRACK = 30;

function getDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getPreviousDateKey(offset) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - offset);
  return getDateKey(date);
}

function getLastSevenDates() {
  return Array.from({ length: 7 }, (_, index) =>
    getPreviousDateKey(index)
  ).reverse();
}

function getCompletedTasks(dayData, uid) {
  return Object.keys(
    dayData?.users?.[uid]?.taskCompletions || {}
  ).filter(
    (taskId) => dayData?.users?.[uid]?.taskCompletions?.[taskId]
  ).length;
}

function getMemoryDate(memory) {
  return memory?.date || memory?.createdAt || memory?.timestamp || "";
}

function normalizeDate(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  if (value?.toDate) {
    return getDateKey(value.toDate());
  }

  if (value instanceof Date) {
    return getDateKey(value);
  }

  if (typeof value === "number") {
    return getDateKey(new Date(value));
  }

  return "";
}

export default function Home({ ctx }) {
  const { spaceId, user, profile, partner } = ctx;
  const navigate = useNavigate();

=======
  listenTasks, listenDay, todayKey, listenSharedMoodsToday, listenRecentDailyConnections
} from "../services/data";
import "./Home.css";

export default function Home({ ctx }) {
  const { spaceId, user, profile, partner } = ctx;
  const navigate = useNavigate();
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
  const [tasks, setTasks] = useState([]);
  const [day, setDay] = useState({ users: {} });
  const [moods, setMoods] = useState([]);
  const [connections, setConnections] = useState([]);

<<<<<<< HEAD
  const [memories, setMemories] = useState([]);
  const [weeklyDays, setWeeklyDays] = useState({});

  const [loadingMemories, setLoadingMemories] = useState(true);

  const dateStr = todayKey();

  useEffect(() => {
    if (!spaceId) return;

    const u1 = listenTasks(spaceId, setTasks);

    const u2 = listenDay(
      spaceId,
      dateStr,
      setDay
    );

    const u3 = listenSharedMoodsToday(
      spaceId,
      dateStr,
      setMoods
    );

    const u4 = listenRecentDailyConnections(
      spaceId,
      1,
      setConnections
    );

    const u5 = listenMemories(
      spaceId,
      (items) => {
        setMemories(items || []);
        setLoadingMemories(false);
      }
    );

    return () => {
      u1?.();
      u2?.();
      u3?.();
      u4?.();
      u5?.();
    };
  }, [spaceId, dateStr]);

  /*
   * Listen to the last 7 days for the weekly mini-progress.
   * Also listens to 30 days for the streak.
   */
  useEffect(() => {
    if (!spaceId) return;

    const unsubscribers = [];
    const trackedDays = {};

    for (let i = 0; i < DAYS_TO_TRACK; i++) {
      const key = getPreviousDateKey(i);

      const unsub = listenDay(
        spaceId,
        key,
        (data) => {
          trackedDays[key] = data || {
            users: {},
          };

          setWeeklyDays((previous) => ({
            ...previous,
            [key]: data || { users: {} },
          }));
        }
      );

      unsubscribers.push(unsub);
    }

    return () => {
      unsubscribers.forEach((unsubscribe) => {
        unsubscribe?.();
      });
    };
  }, [spaceId]);

  const myName =
    profile?.displayName ||
    user.email.split("@")[0];

  const myTasks = tasks.filter(
    (task) => task.ownerUid === user.uid
  );

  const myProgress =
    day.users?.[user.uid] || {};

  const myDone = Object.keys(
    myProgress.taskCompletions || {}
  ).filter(
    (taskId) =>
      myProgress.taskCompletions?.[taskId]
  ).length;

  const myMood = moods.find(
    (mood) => mood.uid === user.uid
  );

  const partnerTasks = partner
    ? tasks.filter(
        (task) => task.ownerUid === partner.uid
      )
    : [];

  const partnerProgress = partner
    ? day.users?.[partner.uid] || {}
    : {};

  const partnerDone = Object.keys(
    partnerProgress.taskCompletions || {}
  ).filter(
    (taskId) =>
      partnerProgress.taskCompletions?.[taskId]
  ).length;

  const partnerMood = partner
    ? moods.find(
        (mood) => mood.uid === partner.uid
      )
    : null;

  const latestNote = connections[0];

  /*
   * ---------------------------------------------------------
   * WEEKLY PROGRESS
   * ---------------------------------------------------------
   */

  const weeklyStats = useMemo(() => {
    const dates = getLastSevenDates();

    let myCompleted = 0;
    let myAvailable = 0;

    let partnerCompleted = 0;
    let partnerAvailable = 0;

    dates.forEach((key) => {
      const currentDay = weeklyDays[key];

      const mine =
        currentDay?.users?.[user.uid] || {};

      const theirs = partner
        ? currentDay?.users?.[partner.uid] || {}
        : {};

      const mineCompletions =
        mine.taskCompletions || {};

      const theirCompletions =
        theirs.taskCompletions || {};

      const mineDone = Object.values(
        mineCompletions
      ).filter(Boolean).length;

      const theirDone = Object.values(
        theirCompletions
      ).filter(Boolean).length;

      myCompleted += mineDone;
      partnerCompleted += theirDone;

      /*
       * We only count actual saved task completion
       * records here, so the percentage is based on
       * the Firebase progress snapshots we already have.
       */
      myAvailable += Object.keys(
        mineCompletions
      ).length;

      partnerAvailable += Object.keys(
        theirCompletions
      ).length;
    });

    const myPercent =
      myAvailable > 0
        ? Math.round(
            (myCompleted / myAvailable) * 100
          )
        : 0;

    const partnerPercent =
      partnerAvailable > 0
        ? Math.round(
            (partnerCompleted /
              partnerAvailable) *
              100
          )
        : 0;

    return {
      myPercent,
      partnerPercent,
      myCompleted,
      partnerCompleted,
    };
  }, [
    weeklyDays,
    user.uid,
    partner?.uid,
  ]);

  /*
   * ---------------------------------------------------------
   * STREAK
   *
   * A day counts as active when either person has
   * saved task completion progress for that day.
   * ---------------------------------------------------------
   */

  const streak = useMemo(() => {
    let count = 0;

    for (let i = 0; i < DAYS_TO_TRACK; i++) {
      const key = getPreviousDateKey(i);
      const currentDay = weeklyDays[key];

      const users =
        currentDay?.users || {};

      const userIds = Object.keys(users);

      const hasActivity = userIds.some(
        (uid) => {
          const completions =
            users[uid]?.taskCompletions || {};

          return Object.values(
            completions
          ).some(Boolean);
        }
      );

      if (hasActivity) {
        count++;
      } else {
        break;
      }
    }

    return count;
  }, [weeklyDays]);

  /*
   * ---------------------------------------------------------
   * MEMORY OF THE DAY
   *
   * First preference:
   * today's memory.
   *
   * Otherwise:
   * most recent memory.
   * ---------------------------------------------------------
   */

  const memoryOfTheDay = useMemo(() => {
    if (!memories.length) return null;

    const todayMemory = memories.find(
      (memory) =>
        normalizeDate(
          getMemoryDate(memory)
        ) === dateStr
    );

    if (todayMemory) {
      return todayMemory;
    }

    const sorted = [...memories].sort(
      (a, b) => {
        const dateA = normalizeDate(
          getMemoryDate(a)
        );

        const dateB = normalizeDate(
          getMemoryDate(b)
        );

        return dateB.localeCompare(dateA);
      }
    );

    return sorted[0] || null;
  }, [memories, dateStr]);

  /*
   * ---------------------------------------------------------
   * MOOD TOGETHER
   * ---------------------------------------------------------
   */

  const moodTogetherText = useMemo(() => {
    if (myMood && partnerMood) {
      return "Both feeling something today";
    }

    if (myMood && !partnerMood) {
      return "Your mood is here";
    }

    if (!myMood && partnerMood) {
      return "Their mood is here";
    }

    return "No moods shared yet";
  }, [myMood, partnerMood]);

  return (
    <div className="page-container home-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <motion.div
        className="home-hero"
        initial={{
          opacity: 0,
          y: 22,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.75,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <p className="home-eyebrow">
          OUR LITTLE WORLD
        </p>

        <h1 className="home-title">
          Today, <em>we…</em>
        </h1>

        <p className="home-subtitle">
          A quiet little overview of our day.
        </p>
      </motion.div>


      {/* =====================================================
          MAIN DAY CARDS
      ===================================================== */}

      <div className="home-dashboard">

        {/* YOUR DAY */}
        <motion.div
          className="home-card-wrap"
          initial={{
            opacity: 0,
            y: 28,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.12,
            duration: 0.65,
          }}
        >
          <GlassCard
            interactive
            accent="samiha"
            className="home-dashboard-card home-your-day"
            onClick={() => navigate("/today")}
          >
            <div className="home-card-glow" />

            <div className="home-card-top">
              <p className="home-card-label">
                YOUR DAY
              </p>

              <span className="home-card-arrow">
                ↗
              </span>
            </div>

            <div className="home-card-main">
              <h3 className="home-person-name">
                {myName}
              </h3>

              <div className="home-mood-row">
                <span className="home-mood-dot" />

                <span>
                  {myMood?.mood ||
                    "Mood not set"}
                </span>
              </div>
            </div>

            <div className="home-card-footer">
              <div className="home-progress-info">
                <span>
                  Today's progress
                </span>

                <strong>
                  {myDone}/{myTasks.length}
                </strong>
              </div>

              <div className="home-progress-track">
                <motion.div
                  className="home-progress-fill"
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: myTasks.length
                      ? `${Math.min(
                          (myDone /
                            myTasks.length) *
                            100,
                          100
                        )}%`
                      : "0%",
                  }}
                  transition={{
                    delay: 0.45,
                    duration: 0.8,
                  }}
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>


        {/* PARTNER DAY */}
        <motion.div
          className="home-card-wrap"
          initial={{
            opacity: 0,
            y: 28,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
            duration: 0.65,
          }}
        >
          <GlassCard
            interactive
            accent="him"
            className="home-dashboard-card home-partner-day"
            onClick={() => navigate("/today")}
          >
            <div className="home-card-glow" />

            <div className="home-card-top">
              <p className="home-card-label">
                {partner
                  ? `${partner.displayName}'S DAY`
                  : "THEIR DAY"}
              </p>

              <span className="home-card-arrow">
                ↗
              </span>
            </div>

            <div className="home-card-main">
              <h3 className="home-person-name">
                {partner?.displayName ||
                  "Waiting for partner"}
              </h3>

              <div className="home-mood-row">
                <span className="home-mood-dot partner-dot" />

                <span>
                  {partnerMood?.mood ||
                    "Mood not shared"}
                </span>
              </div>
            </div>

            <div className="home-card-footer">
              <div className="home-progress-info">
                <span>
                  Today's progress
                </span>

                <strong>
                  {partnerDone}/
                  {partnerTasks.length}
                </strong>
              </div>

              <div className="home-progress-track">
                <motion.div
                  className="home-progress-fill partner-progress"
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: partnerTasks.length
                      ? `${Math.min(
                          (partnerDone /
                            partnerTasks.length) *
                            100,
                          100
                        )}%`
                      : "0%",
                  }}
                  transition={{
                    delay: 0.55,
                    duration: 0.8,
                  }}
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>


        {/* BETWEEN US */}
        <motion.div
          className="home-card-wrap home-card-connection"
          initial={{
            opacity: 0,
            y: 28,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.28,
            duration: 0.65,
          }}
        >
          <GlassCard
            interactive
            accent="gold"
            className="home-dashboard-card home-between-us"
            onClick={() => navigate("/connection")}
          >
            <div className="home-card-glow" />

            <div className="home-card-top">
              <p className="home-card-label">
                BETWEEN US
              </p>

              <span className="home-card-arrow">
                ↗
              </span>
            </div>

            <div className="home-note-content">
              <span className="home-note-mark">
                “
              </span>

              <p className="home-note-text">
                {latestNote
                  ? `${(
                      latestNote.text || ""
                    ).slice(0, 100)}${
                      latestNote.text?.length >
                      100
                        ? "…"
                        : ""
                    }`
                  : "No note written yet today."}
              </p>

              {latestNote && (
                <span className="home-note-closing">
                  ”
                </span>
              )}
            </div>

            <div className="home-note-footer">
              <span>
                {latestNote
                  ? "A little message from today"
                  : "Leave something here"}
              </span>

              <span className="home-note-icon">
                ✦
              </span>
            </div>
          </GlassCard>
        </motion.div>


        {/* =================================================
            MOOD TOGETHER
        ================================================= */}

        <motion.div
          className="home-card-wrap home-mood-together-wrap"
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.36,
            duration: 0.6,
          }}
        >
          <GlassCard
            interactive
            accent="samiha"
            className="home-mini-card home-mood-together"
            onClick={() => navigate("/today")}
          >
            <div className="home-mini-top">
              <p className="home-card-label">
                MOOD TOGETHER
              </p>

              <span className="home-mini-icon">
                ♡
              </span>
            </div>

            <div className="home-moods">
              <div className="home-mood-person">
                <span className="home-big-mood">
                  {myMood?.mood || "—"}
                </span>

                <span>
                  {myName}
                </span>
              </div>

              <div className="home-mood-divider">
                <span>+</span>
              </div>

              <div className="home-mood-person">
                <span className="home-big-mood">
                  {partnerMood?.mood || "—"}
                </span>

                <span>
                  {partner?.displayName ||
                    "Partner"}
                </span>
              </div>
            </div>

            <p className="home-mini-caption">
              {moodTogetherText}
            </p>
          </GlassCard>
        </motion.div>


        {/* =================================================
            WEEKLY PROGRESS
        ================================================= */}

        <motion.div
          className="home-card-wrap home-weekly-wrap"
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.42,
            duration: 0.6,
          }}
        >
          <GlassCard
            interactive
            accent="him"
            className="home-mini-card home-weekly-card"
            onClick={() => navigate("/our-world")}
          >
            <div className="home-mini-top">
              <p className="home-card-label">
                THIS WEEK
              </p>

              <span className="home-mini-icon">
                ↗
              </span>
            </div>

            <div className="home-weekly-person">
              <div className="home-weekly-label">
                <span>{myName}</span>
                <strong>
                  {weeklyStats.myPercent}%
                </strong>
              </div>

              <div className="home-weekly-track">
                <motion.div
                  className="home-weekly-fill home-weekly-mine"
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${weeklyStats.myPercent}%`,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.55,
                  }}
                />
              </div>
            </div>

            <div className="home-weekly-person">
              <div className="home-weekly-label">
                <span>
                  {partner?.displayName ||
                    "Partner"}
                </span>

                <strong>
                  {weeklyStats.partnerPercent}%
                </strong>
              </div>

              <div className="home-weekly-track">
                <motion.div
                  className="home-weekly-fill home-weekly-partner"
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${weeklyStats.partnerPercent}%`,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.65,
                  }}
                />
              </div>
            </div>

            <p className="home-mini-caption">
              {weeklyStats.myCompleted +
                weeklyStats.partnerCompleted}{" "}
              completed tasks this week
            </p>
          </GlassCard>
        </motion.div>


        {/* =================================================
            STREAK
        ================================================= */}

        <motion.div
          className="home-card-wrap home-streak-wrap"
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.48,
            duration: 0.6,
          }}
        >
          <GlassCard
            interactive
            accent="gold"
            className="home-streak-card"
            onClick={() => navigate("/our-world")}
          >
            <div className="home-streak-glow" />

            <p className="home-card-label">
              OUR STREAK
            </p>

            <div className="home-streak-number">
              {streak}
            </div>

            <div className="home-streak-label">
              {streak === 1
                ? "day together"
                : "days together"}
            </div>

            <div className="home-streak-footer">
              <span>Keep showing up</span>
              <span>♡</span>
            </div>
          </GlassCard>
        </motion.div>


        {/* =================================================
            MEMORY OF THE DAY
        ================================================= */}

        <motion.div
          className="home-card-wrap home-memory-wrap"
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.54,
            duration: 0.6,
          }}
        >
          <GlassCard
            interactive
            accent="samiha"
            className="home-memory-card"
            onClick={() => navigate("/memories")}
          >
            <div className="home-memory-image-wrap">
              {loadingMemories ? (
                <div className="home-memory-placeholder">
                  <span>✦</span>
                </div>
              ) : memoryOfTheDay?.imageUrl ? (
                <img
                  src={memoryOfTheDay.imageUrl}
                  alt={
                    memoryOfTheDay.title ||
                    "Memory"
                  }
                  className="home-memory-image"
                />
              ) : (
                <div className="home-memory-placeholder">
                  <span>♡</span>
                </div>
              )}

              <div className="home-memory-overlay" />

              <div className="home-memory-label">
                MEMORY VAULT
              </div>
            </div>

            <div className="home-memory-content">
              <p className="home-card-label">
                MEMORY OF THE DAY
              </p>

              <h3 className="home-memory-title">
                {memoryOfTheDay?.title ||
                  "A moment worth keeping"}
              </h3>

              <p className="home-memory-caption">
                {memoryOfTheDay?.caption ||
                  memoryOfTheDay?.text ||
                  "Some memories deserve a little more space."}
              </p>

              <div className="home-memory-link">
                <span>
                  View memory vault
                </span>

                <span>→</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

      </div>


      {/* =====================================================
          BOTTOM
      ===================================================== */}

      <motion.div
        className="home-bottom-note"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 0.8,
          duration: 0.8,
        }}
      >
        <span className="home-bottom-line" />
        <span>made for two</span>
        <span className="home-bottom-line" />
      </motion.div>

    </div>
  );
}
=======
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
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
