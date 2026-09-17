import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";
import {
  listenGoals,
  addGoal,
  updateGoalProgress,
  listenDailyQuestion,
  answerDailyQuestion,
  pickDailyQuestion,
  listenMemories,
  listenDailyConnection,
  listenNotes,
  addNote,
  deleteNote,
  listenDay,
  todayKey
} from "../services/data";
import "./OurWorld.css";

export default function OurWorld({ ctx }) {
  const { spaceId, user, profile, partner } = ctx;

  const dateStr = todayKey();
<<<<<<< HEAD

  const myName =
    profile?.displayName ||
    user?.email?.split("@")[0] ||
    "You";

  const partnerName =
    partner?.displayName ||
    "Your partner";
=======
  const myName = profile?.displayName || user?.email?.split("@")[0] || "You";
  const partnerName = partner?.displayName || "Your partner";
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c

  const [goals, setGoals] = useState([]);
  const [memories, setMemories] = useState([]);
  const [connections, setConnections] = useState([]);
  const [notes, setNotes] = useState([]);
  const [dayProgress, setDayProgress] = useState(null);
  const [question, setQuestion] = useState(null);

  const [answer, setAnswer] = useState("");
  const [goalTitle, setGoalTitle] = useState("");
  const [noteText, setNoteText] = useState("");

  const [savingGoal, setSavingGoal] = useState(false);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

<<<<<<< HEAD
  /* =====================================================
     REALTIME LISTENERS
  ===================================================== */

  useEffect(() => {
    if (!spaceId) return;

    const unsubGoals = listenGoals(
      spaceId,
      setGoals
    );

=======
  useEffect(() => {
    if (!spaceId) return;

    const unsubGoals = listenGoals(spaceId, setGoals);
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
    const unsubQuestion = listenDailyQuestion(
      spaceId,
      dateStr,
      setQuestion
    );
<<<<<<< HEAD

    const unsubMemories = listenMemories(
      spaceId,
      setMemories
    );

    const unsubConnections =
      listenDailyConnection(
        spaceId,
        dateStr,
        setConnections
      );

    const unsubNotes = listenNotes(
      spaceId,
      setNotes
    );

    const unsubDay = listenDay(
      spaceId,
      dateStr,
      setDayProgress
    );
=======
    const unsubMemories = listenMemories(spaceId, setMemories);
    const unsubConnections = listenDailyConnection(
      spaceId,
      dateStr,
      setConnections
    );
    const unsubNotes = listenNotes(spaceId, setNotes);
    const unsubDay = listenDay(spaceId, dateStr, setDayProgress);
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c

    return () => {
      unsubGoals?.();
      unsubQuestion?.();
      unsubMemories?.();
      unsubConnections?.();
      unsubNotes?.();
      unsubDay?.();
    };
  }, [spaceId, dateStr]);

<<<<<<< HEAD
  /* =====================================================
     DAILY QUESTION
  ===================================================== */

  const todaysQuestion =
    question?.question ||
    pickDailyQuestion(dateStr);

  const myAnswer =
    question?.answers?.[user.uid] || "";

=======
  /* -------------------------------------------------
     DAILY QUESTION
  ------------------------------------------------- */

  const todaysQuestion =
    question?.question || pickDailyQuestion(dateStr);

  const myAnswer = question?.answers?.[user.uid] || "";
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
  const partnerAnswer = partner?.uid
    ? question?.answers?.[partner.uid] || ""
    : "";

<<<<<<< HEAD
  const bothAnswered = Boolean(
    myAnswer && partnerAnswer
  );
=======
  const bothAnswered = Boolean(myAnswer && partnerAnswer);
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c

  async function handleAnswer(e) {
    e.preventDefault();

    if (!answer.trim() || savingAnswer) return;

    setSavingAnswer(true);

    try {
      await answerDailyQuestion(
        spaceId,
        dateStr,
        user.uid,
        todaysQuestion,
        answer.trim()
      );

      setAnswer("");
    } catch (error) {
<<<<<<< HEAD
      console.error(
        "Question answer failed:",
        error
      );
=======
      console.error("Question answer failed:", error);
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
    } finally {
      setSavingAnswer(false);
    }
  }

<<<<<<< HEAD
  /* =====================================================
     GOALS
  ===================================================== */
=======
  /* -------------------------------------------------
     GOALS
  ------------------------------------------------- */
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c

  async function handleAddGoal(e) {
    e.preventDefault();

    if (!goalTitle.trim() || savingGoal) return;

    setSavingGoal(true);

    try {
<<<<<<< HEAD
      await addGoal(
        spaceId,
        user.uid,
        myName,
        {
          title: goalTitle.trim()
        }
      );

      setGoalTitle("");
    } catch (error) {
      console.error(
        "Goal creation failed:",
        error
      );
=======
      await addGoal(spaceId, user.uid, myName, {
        title: goalTitle.trim()
      });

      setGoalTitle("");
    } catch (error) {
      console.error("Goal creation failed:", error);
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
    } finally {
      setSavingGoal(false);
    }
  }

<<<<<<< HEAD
  /* =====================================================
     NOTES
  ===================================================== */
=======
  /* -------------------------------------------------
     NOTES
  ------------------------------------------------- */
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c

  async function handleAddNote(e) {
    e.preventDefault();

    if (!noteText.trim() || savingNote) return;

    setSavingNote(true);

    try {
      await addNote(
        spaceId,
        user.uid,
        myName,
        noteText.trim()
      );

      setNoteText("");
    } catch (error) {
<<<<<<< HEAD
      console.error(
        "Note creation failed:",
        error
      );
=======
      console.error("Note creation failed:", error);
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
    } finally {
      setSavingNote(false);
    }
  }

  async function handleDeleteNote(noteId) {
    try {
<<<<<<< HEAD
      await deleteNote(
        spaceId,
        noteId
      );
    } catch (error) {
      console.error(
        "Note deletion failed:",
        error
      );
    }
  }

  /* =====================================================
     TODAY PROGRESS
  ===================================================== */

  const myProgress =
    dayProgress?.users?.[user.uid] || {};
=======
      await deleteNote(spaceId, noteId);
    } catch (error) {
      console.error("Note deletion failed:", error);
    }
  }

  /* -------------------------------------------------
     TODAY PROGRESS
  ------------------------------------------------- */

  const myProgress = dayProgress?.users?.[user.uid] || {};
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c

  const partnerProgress = partner?.uid
    ? dayProgress?.users?.[partner.uid] || {}
    : {};

  const myTaskCount = Object.keys(
    myProgress.taskCompletions || {}
  ).length;

  const partnerTaskCount = Object.keys(
    partnerProgress.taskCompletions || {}
  ).length;

  const myRoutineCount = Object.values(
    myProgress.routineCompletions || {}
  ).reduce(
<<<<<<< HEAD
    (total, routine) =>
      total +
      Object.keys(routine || {}).length,
    0
  );

  const partnerRoutineCount =
    Object.values(
      partnerProgress.routineCompletions || {}
    ).reduce(
      (total, routine) =>
        total +
        Object.keys(routine || {}).length,
      0
    );
=======
    (total, routine) => total + Object.keys(routine || {}).length,
    0
  );

  const partnerRoutineCount = Object.values(
    partnerProgress.routineCompletions || {}
  ).reduce(
    (total, routine) => total + Object.keys(routine || {}).length,
    0
  );
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c

  const myHabitCount = Object.values(
    myProgress.habitCompletions || {}
  ).filter(Boolean).length;

<<<<<<< HEAD
  const partnerHabitCount =
    Object.values(
      partnerProgress.habitCompletions || {}
    ).filter(Boolean).length;
=======
  const partnerHabitCount = Object.values(
    partnerProgress.habitCompletions || {}
  ).filter(Boolean).length;
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c

  const totalCompleted =
    myTaskCount +
    partnerTaskCount +
    myRoutineCount +
    partnerRoutineCount +
    myHabitCount +
    partnerHabitCount;

<<<<<<< HEAD
  const connectionCount =
    connections.length;

  const myConnection =
    connections.find(
      (entry) =>
        entry.uid === user.uid
    );

  const partnerConnection =
    partner?.uid
      ? connections.find(
          (entry) =>
            entry.uid === partner.uid
        )
      : null;

  /* =====================================================
     GOAL STATS
  ===================================================== */

  const completedGoals =
    goals.filter(
      (goal) =>
        Number(goal.progress || 0) >= 100
    ).length;

  const activeGoals =
    goals.filter(
      (goal) =>
        Number(goal.progress || 0) < 100
    );

  const averageGoalProgress =
    goals.length
      ? Math.round(
          goals.reduce(
            (sum, goal) =>
              sum +
              Number(
                goal.progress || 0
              ),
            0
          ) / goals.length
        )
      : 0;

  /* =====================================================
     RECENT MEMORIES
  ===================================================== */
=======
  const connectionCount = connections.length;

  const myConnection = connections.find(
    (entry) => entry.uid === user.uid
  );

  const partnerConnection = partner?.uid
    ? connections.find((entry) => entry.uid === partner.uid)
    : null;

  /* -------------------------------------------------
     GOAL STATS
  ------------------------------------------------- */

  const completedGoals = goals.filter(
    (goal) => Number(goal.progress || 0) >= 100
  ).length;

  const activeGoals = goals.filter(
    (goal) => Number(goal.progress || 0) < 100
  );

  const averageGoalProgress = goals.length
    ? Math.round(
        goals.reduce(
          (sum, goal) => sum + Number(goal.progress || 0),
          0
        ) / goals.length
      )
    : 0;

  /* -------------------------------------------------
     RECENT MEMORIES
  ------------------------------------------------- */
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c

  const recentMemories = useMemo(
    () => memories.slice(0, 3),
    [memories]
  );

<<<<<<< HEAD
  /* =====================================================
     NEXT LITTLE THING
  ===================================================== */
=======
  /* -------------------------------------------------
     NEXT LITTLE THING
  ------------------------------------------------- */
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c

  const nextGoal = [...activeGoals]
    .sort(
      (a, b) =>
        Number(a.progress || 0) -
        Number(b.progress || 0)
    )[0];

  return (
    <div className="page-container ourworld-page">

<<<<<<< HEAD
      {/* =================================================
          HEADER
      ================================================= */}

      <motion.div
        className="ourworld-header"
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 0.6
        }}
      >
        <div>
          <p className="eyebrow">
            our little world
          </p>
=======
      {/* HEADER */}
      <motion.div
        className="ourworld-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <p className="eyebrow">our little world</p>
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c

          <h1 className="editorial-heading">
            Our <em>life together</em>
          </h1>

          <p className="ourworld-intro">
<<<<<<< HEAD
            A quiet little place to see what
            we are building, remembering and
            doing together.
=======
            A quiet little place to see what we are building,
            remembering and doing together.
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
          </p>
        </div>

        <div className="ourworld-date">
          <span>today</span>
          <strong>{dateStr}</strong>
        </div>
      </motion.div>

<<<<<<< HEAD
      {/* =================================================
          TODAY TOGETHER
      ================================================= */}

      <motion.div
        className="today-together-section"
        initial={{
          opacity: 0,
          y: 24
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          delay: 0.08
        }}
=======
      {/* TODAY TOGETHER */}
      <motion.div
        className="today-together-section"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
      >
        <GlassCard
          accent="gold"
          className="today-together-card"
        >
          <div className="section-heading-row">
            <div>
<<<<<<< HEAD
              <p className="eyebrow">
                today together
              </p>

              <h2>
                Little things still{" "}
                <em>count.</em>
=======
              <p className="eyebrow">today together</p>

              <h2>
                Little things still <em>count.</em>
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
              </h2>
            </div>

            <div className="today-total">
<<<<<<< HEAD
              <strong>
                {totalCompleted}
              </strong>

              <span>
                completed
              </span>
=======
              <strong>{totalCompleted}</strong>
              <span>completed</span>
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
            </div>
          </div>

          <div className="today-people">

            <div className="person-progress">
              <div className="person-progress-top">
                <span>{myName}</span>
<<<<<<< HEAD

=======
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                <strong>
                  {myTaskCount} tasks
                </strong>
              </div>

              <div className="mini-progress">
                <span
                  style={{
                    width: `${Math.min(
                      myTaskCount * 12,
                      100
                    )}%`
                  }}
                />
              </div>

              <p>
                {myRoutineCount} routine items ·{" "}
                {myHabitCount} habits
              </p>
            </div>

            <div className="person-progress">
              <div className="person-progress-top">
<<<<<<< HEAD
                <span>
                  {partnerName}
                </span>

=======
                <span>{partnerName}</span>
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                <strong>
                  {partner
                    ? `${partnerTaskCount} tasks`
                    : "Not connected"}
                </strong>
              </div>

              <div className="mini-progress">
                <span
                  style={{
                    width: `${Math.min(
                      partnerTaskCount * 12,
                      100
                    )}%`
                  }}
                />
              </div>

              <p>
                {partner
                  ? `${partnerRoutineCount} routine items · ${partnerHabitCount} habits`
                  : "Invite your partner to share progress."}
              </p>
            </div>
<<<<<<< HEAD

=======
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
          </div>

          <div className="today-connection-line">
            <span className="status-dot" />

            {connectionCount === 0 ? (
              <span>
                No connection check-in yet today.
              </span>
            ) : connectionCount === 1 ? (
              <span>
                One of you has checked in today.
              </span>
            ) : (
              <span>
                You both checked in today. ♡
              </span>
            )}
          </div>
        </GlassCard>
      </motion.div>

<<<<<<< HEAD
      {/* =================================================
          MAIN DASHBOARD
      ================================================= */}

      <div className="ourworld-dashboard">

        {/* =================================================
            GOALS
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 24
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.14
          }}
=======
      {/* MAIN DASHBOARD */}
      <div className="ourworld-dashboard">

        {/* GOALS */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
        >
          <GlassCard
            accent="him"
            className="world-card goals-world-card"
          >
            <div className="world-card-header">
              <div>
<<<<<<< HEAD
                <p className="eyebrow">
                  shared goals
                </p>

                <h3>
                  Things we're{" "}
                  <em>building</em>
                </h3>
              </div>

              <div className="small-stat">
                {completedGoals}/
                {goals.length}

                <span>
                  done
                </span>
=======
                <p className="eyebrow">shared goals</p>
                <h3>Things we're <em>building</em></h3>
              </div>

              <div className="small-stat">
                {completedGoals}/{goals.length}
                <span>done</span>
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
              </div>
            </div>

            <form
              onSubmit={handleAddGoal}
              className="world-inline-form"
            >
              <input
                placeholder="Add something you want to achieve together…"
                value={goalTitle}
                onChange={(e) =>
<<<<<<< HEAD
                  setGoalTitle(
                    e.target.value
                  )
=======
                  setGoalTitle(e.target.value)
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                }
              />

              <button
                type="submit"
                disabled={savingGoal}
              >
<<<<<<< HEAD
                {savingGoal
                  ? "Adding…"
                  : "Add"}
=======
                {savingGoal ? "Adding…" : "Add"}
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
              </button>
            </form>

            <div className="goal-summary">
              <div>
<<<<<<< HEAD
                <span>
                  overall progress
                </span>

                <strong>
                  {averageGoalProgress}%
                </strong>
=======
                <span>overall progress</span>
                <strong>{averageGoalProgress}%</strong>
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
              </div>

              <div className="goal-summary-track">
                <span
                  style={{
                    width: `${averageGoalProgress}%`
                  }}
                />
              </div>
            </div>

            <div className="world-goals-list">
<<<<<<< HEAD
              {goals
                .slice(0, 4)
                .map((goal) => (
                  <div
                    key={goal.id}
                    className="world-goal"
                  >
                    <div className="world-goal-top">
                      <span className="world-goal-title">
                        {goal.title}
                      </span>

                      <span className="world-goal-percent">
                        {goal.progress ||
                          0}
                        %
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={
                        goal.progress || 0
                      }
                      onChange={(e) =>
                        updateGoalProgress(
                          spaceId,
                          goal.id,
                          Number(
                            e.target.value
                          )
                        )
                      }
                    />

                    <div className="world-goal-meta">
                      <span>
                        by{" "}
                        {goal.createdByName ||
                          "us"}
                      </span>

                      {goal.targetDate && (
                        <span>
                          target{" "}
                          {goal.targetDate}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
=======
              {goals.slice(0, 4).map((goal) => (
                <div
                  key={goal.id}
                  className="world-goal"
                >
                  <div className="world-goal-top">
                    <span className="world-goal-title">
                      {goal.title}
                    </span>

                    <span className="world-goal-percent">
                      {goal.progress || 0}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress || 0}
                    onChange={(e) =>
                      updateGoalProgress(
                        spaceId,
                        goal.id,
                        Number(e.target.value)
                      )
                    }
                  />

                  <div className="world-goal-meta">
                    <span>
                      by {goal.createdByName || "us"}
                    </span>

                    {goal.targetDate && (
                      <span>
                        target {goal.targetDate}
                      </span>
                    )}
                  </div>
                </div>
              ))}
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c

              {goals.length === 0 && (
                <div className="world-empty">
                  <span>○</span>
<<<<<<< HEAD

                  <p>
                    No shared goals yet.
                    <br />
                    Add your first little
                    plan above.
=======
                  <p>
                    No shared goals yet.
                    <br />
                    Add your first little plan above.
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

<<<<<<< HEAD
        {/* =================================================
            NEXT LITTLE THING
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 24
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.18
          }}
=======
        {/* NEXT LITTLE THING */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
        >
          <GlassCard
            accent="samiha"
            className="world-card next-thing-card"
          >
<<<<<<< HEAD
            <p className="eyebrow">
              next little thing
            </p>
=======
            <p className="eyebrow">next little thing</p>
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c

            <div className="next-thing-icon">
              ✦
            </div>

            {nextGoal ? (
              <>
<<<<<<< HEAD
                <h3>
                  {nextGoal.title}
                </h3>

                <p>
                  This one is currently
                  at{" "}
                  <strong>
                    {nextGoal.progress ||
                      0}
                    %
                  </strong>
                  . A tiny step today is
                  enough.
=======
                <h3>{nextGoal.title}</h3>

                <p>
                  This one is currently at{" "}
                  <strong>
                    {nextGoal.progress || 0}%
                  </strong>
                  . A tiny step today is enough.
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                </p>

                <div className="next-goal-progress">
                  <span
                    style={{
                      width: `${nextGoal.progress || 0}%`
                    }}
                  />
                </div>
              </>
            ) : (
              <>
<<<<<<< HEAD
                <h3>
                  Make a little plan
                </h3>

                <p>
                  Add a shared goal and it
                  will appear here as your
                  next little thing.
=======
                <h3>Make a little plan</h3>

                <p>
                  Add a shared goal and it will appear
                  here as your next little thing.
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                </p>
              </>
            )}
          </GlassCard>
        </motion.div>

<<<<<<< HEAD
        {/* =================================================
            CONNECTION
            IMPORTANT:
            ALL CLASSES ARE world-connection-*
            TO AVOID CONFLICT WITH CONNECTION PAGE
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 24
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.22
          }}
        >
          <GlassCard
            accent="gold"
            className="world-card world-connection-card"
          >
            <div className="world-card-header">
              <div>
                <p className="eyebrow">
                  connection
                </p>

                <h3>
                  How we're{" "}
                  <em>doing today</em>
                </h3>
              </div>

              <span className="world-connection-count">
=======
        {/* CONNECTION */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <GlassCard
            accent="gold"
            className="world-card connection-world-card"
          >
            <div className="world-card-header">
              <div>
                <p className="eyebrow">connection</p>
                <h3>How we're <em>doing today</em></h3>
              </div>

              <span className="connection-count">
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                {connectionCount}/2
              </span>
            </div>

<<<<<<< HEAD
            <div className="world-connection-entries">

              {myConnection ? (
                <div className="world-connection-entry">

                  <div className="world-connection-avatar">
                    {myName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="world-connection-content">
                    <strong>
                      {myName}
                    </strong>

                    <span>
                      {myConnection.type ||
                        "Check-in"}
                    </span>

                    {myConnection.text && (
                      <p>
                        {myConnection.text}
                      </p>
                    )}
                  </div>

                </div>
              ) : (
                <div className="world-connection-empty">
                  <span>♡</span>

                  <p>
                    You haven't checked in
                    today.
=======
            <div className="connection-entries">

              {myConnection ? (
                <div className="connection-entry">
                  <div className="connection-avatar">
                    {myName.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <strong>{myName}</strong>
                    <span>
                      {myConnection.type || "Check-in"}
                    </span>

                    {myConnection.text && (
                      <p>{myConnection.text}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="connection-empty">
                  <span>♡</span>
                  <p>
                    You haven't checked in today.
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                  </p>
                </div>
              )}

              {partner ? (
                partnerConnection ? (
<<<<<<< HEAD
                  <div className="world-connection-entry">

                    <div className="world-connection-avatar world-partner-avatar">
=======
                  <div className="connection-entry">
                    <div className="connection-avatar partner-avatar">
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                      {partnerName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

<<<<<<< HEAD
                    <div className="world-connection-content">
                      <strong>
                        {partnerName}
                      </strong>
=======
                    <div>
                      <strong>{partnerName}</strong>
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c

                      <span>
                        {partnerConnection.type ||
                          "Check-in"}
                      </span>

                      {partnerConnection.text && (
                        <p>
<<<<<<< HEAD
                          {
                            partnerConnection.text
                          }
                        </p>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="world-connection-empty">
                    <span>○</span>

                    <p>
                      Waiting for{" "}
                      {partnerName}'s
=======
                          {partnerConnection.text}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="connection-empty">
                    <span>○</span>
                    <p>
                      Waiting for {partnerName}'s
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                      check-in.
                    </p>
                  </div>
                )
              ) : (
<<<<<<< HEAD
                <div className="world-connection-empty">
                  <span>○</span>

                  <p>
                    Connect your partner to
                    see their check-in.
                  </p>
                </div>
              )}

=======
                <div className="connection-empty">
                  <span>○</span>
                  <p>
                    Connect your partner to see
                    their check-in.
                  </p>
                </div>
              )}
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
            </div>
          </GlassCard>
        </motion.div>

<<<<<<< HEAD
        {/* =================================================
            MEMORIES
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 24
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.26
          }}
=======
        {/* MEMORIES */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
        >
          <GlassCard
            accent="samiha"
            className="world-card recent-memories-card"
          >
            <div className="world-card-header">
              <div>
<<<<<<< HEAD
                <p className="eyebrow">
                  memory corner
                </p>

                <h3>
                  Little things we{" "}
                  <em>kept</em>
                </h3>
=======
                <p className="eyebrow">memory corner</p>
                <h3>Little things we <em>kept</em></h3>
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
              </div>

              <span className="small-stat">
                {memories.length}
<<<<<<< HEAD

                <span>
                  memories
                </span>
=======
                <span>memories</span>
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
              </span>
            </div>

            {recentMemories.length > 0 ? (
              <div className="recent-memory-grid">
<<<<<<< HEAD
                {recentMemories.map(
                  (memory) => (
                    <div
                      key={memory.id}
                      className="recent-memory"
                    >
                      {memory.imageUrl ? (
                        <img
                          src={
                            memory.imageUrl
                          }
                          alt={
                            memory.title
                          }
                        />
                      ) : (
                        <div className="memory-placeholder">
                          ♡
                        </div>
                      )}

                      <div>
                        <strong>
                          {memory.title ||
                            "Untitled memory"}
                        </strong>

                        <span>
                          {memory.date ||
                            ""}
                        </span>
                      </div>
                    </div>
                  )
                )}
=======
                {recentMemories.map((memory) => (
                  <div
                    key={memory.id}
                    className="recent-memory"
                  >
                    {memory.imageUrl ? (
                      <img
                        src={memory.imageUrl}
                        alt={memory.title}
                      />
                    ) : (
                      <div className="memory-placeholder">
                        ♡
                      </div>
                    )}

                    <div>
                      <strong>
                        {memory.title ||
                          "Untitled memory"}
                      </strong>

                      <span>
                        {memory.date || ""}
                      </span>
                    </div>
                  </div>
                ))}
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
              </div>
            ) : (
              <div className="world-empty">
                <span>♡</span>
<<<<<<< HEAD

                <p>
                  Your memory corner is
                  waiting for its first
                  moment.
=======
                <p>
                  Your memory corner is waiting
                  for its first moment.
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                </p>
              </div>
            )}
          </GlassCard>
        </motion.div>

<<<<<<< HEAD
        {/* =================================================
            DAILY QUESTION
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 24
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.3
          }}
=======
        {/* DAILY QUESTION */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
        >
          <GlassCard
            accent="samiha"
            className="world-card question-world-card"
          >
            <p className="eyebrow">
              question for us
            </p>

            <h3 className="world-question">
              {todaysQuestion}
            </h3>

            {myAnswer ? (
              <div className="answer-state">

                <div className="answer-bubble">
<<<<<<< HEAD
                  <span>
                    {myName}
                  </span>

                  <p>
                    {myAnswer}
                  </p>
=======
                  <span>{myName}</span>
                  <p>{myAnswer}</p>
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                </div>

                {partner ? (
                  partnerAnswer ? (
                    <div className="answer-bubble partner-answer">
<<<<<<< HEAD
                      <span>
                        {partnerName}
                      </span>

                      <p>
                        {partnerAnswer}
                      </p>
                    </div>
                  ) : (
                    <p className="waiting-text">
                      Your answer is saved.
                      Waiting for{" "}
                      {partnerName}.
=======
                      <span>{partnerName}</span>
                      <p>{partnerAnswer}</p>
                    </div>
                  ) : (
                    <p className="waiting-text">
                      Your answer is saved. Waiting
                      for {partnerName}.
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                    </p>
                  )
                ) : (
                  <p className="waiting-text">
<<<<<<< HEAD
                    Connect your partner to
                    share answers.
                  </p>
                )}

=======
                    Connect your partner to share
                    answers.
                  </p>
                )}
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
              </div>
            ) : (
              <form
                onSubmit={handleAnswer}
                className="question-world-form"
              >
                <input
                  placeholder="Write your answer…"
                  value={answer}
                  onChange={(e) =>
<<<<<<< HEAD
                    setAnswer(
                      e.target.value
                    )
=======
                    setAnswer(e.target.value)
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                  }
                />

                <button
                  type="submit"
                  disabled={savingAnswer}
                >
                  {savingAnswer
                    ? "Saving…"
                    : "Answer"}
                </button>
              </form>
            )}
          </GlassCard>
        </motion.div>

<<<<<<< HEAD
        {/* =================================================
            NOTES
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 24
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.34
          }}
=======
        {/* NOTES */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
        >
          <GlassCard
            accent="gold"
            className="world-card notes-world-card"
          >
            <div className="world-card-header">
              <div>
<<<<<<< HEAD
                <p className="eyebrow">
                  our notes
                </p>

                <h3>
                  Don't forget{" "}
                  <em>this</em>
                </h3>
=======
                <p className="eyebrow">our notes</p>
                <h3>Don't forget <em>this</em></h3>
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
              </div>

              <span className="small-stat">
                {notes.length}
<<<<<<< HEAD

                <span>
                  notes
                </span>
=======
                <span>notes</span>
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
              </span>
            </div>

            <form
              onSubmit={handleAddNote}
              className="note-form"
            >
              <textarea
                rows="2"
                placeholder="Leave a little note for us…"
                value={noteText}
                onChange={(e) =>
<<<<<<< HEAD
                  setNoteText(
                    e.target.value
                  )
=======
                  setNoteText(e.target.value)
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                }
              />

              <button
                type="submit"
                disabled={savingNote}
              >
                {savingNote
                  ? "Saving…"
                  : "Save note"}
              </button>
            </form>

            <div className="notes-list">
<<<<<<< HEAD
              {notes
                .slice(0, 4)
                .map((note) => (
                  <div
                    key={note.id}
                    className="world-note"
                  >
                    <div>
                      <p>
                        {note.text}
                      </p>

                      <span>
                        {note.authorName ||
                          "Us"}
                      </span>
                    </div>

                    {note.authorUid ===
                      user.uid && (
                      <button
                        type="button"
                        className="note-delete"
                        onClick={() =>
                          handleDeleteNote(
                            note.id
                          )
                        }
                        aria-label="Delete note"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
=======
              {notes.slice(0, 4).map((note) => (
                <div
                  key={note.id}
                  className="world-note"
                >
                  <div>
                    <p>{note.text}</p>

                    <span>
                      {note.authorName || "Us"}
                    </span>
                  </div>

                  {note.authorUid === user.uid && (
                    <button
                      type="button"
                      className="note-delete"
                      onClick={() =>
                        handleDeleteNote(note.id)
                      }
                      aria-label="Delete note"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c

              {notes.length === 0 && (
                <div className="world-empty">
                  <span>✎</span>
<<<<<<< HEAD

                  <p>
                    Add a note that you
                    both want to remember.
=======
                  <p>
                    Add a note that you both want
                    to remember.
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

      </div>

<<<<<<< HEAD
      {/* =================================================
          FOOTER STATS
      ================================================= */}

      <motion.div
        className="ourworld-footer-stats"
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          delay: 0.4
        }}
      >
        <div className="footer-stat">
          <strong>
            {goals.length}
          </strong>

          <span>
            shared goals
          </span>
        </div>

        <div className="footer-stat">
          <strong>
            {completedGoals}
          </strong>

          <span>
            goals completed
          </span>
        </div>

        <div className="footer-stat">
          <strong>
            {memories.length}
          </strong>

          <span>
            memories kept
          </span>
        </div>

        <div className="footer-stat">
          <strong>
            {notes.length}
          </strong>

          <span>
            little notes
          </span>
        </div>

        <div className="footer-stat">
          <strong>
            {connectionCount}
          </strong>

          <span>
            check-ins today
          </span>
=======
      {/* FOOTER STATS */}
      <motion.div
        className="ourworld-footer-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="footer-stat">
          <strong>{goals.length}</strong>
          <span>shared goals</span>
        </div>

        <div className="footer-stat">
          <strong>{completedGoals}</strong>
          <span>goals completed</span>
        </div>

        <div className="footer-stat">
          <strong>{memories.length}</strong>
          <span>memories kept</span>
        </div>

        <div className="footer-stat">
          <strong>{notes.length}</strong>
          <span>little notes</span>
        </div>

        <div className="footer-stat">
          <strong>{connectionCount}</strong>
          <span>check-ins today</span>
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
        </div>
      </motion.div>

    </div>
  );
}