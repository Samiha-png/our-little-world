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
  const myName = profile?.displayName || user?.email?.split("@")[0] || "You";
  const partnerName = partner?.displayName || "Your partner";

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

  useEffect(() => {
    if (!spaceId) return;

    const unsubGoals = listenGoals(spaceId, setGoals);
    const unsubQuestion = listenDailyQuestion(
      spaceId,
      dateStr,
      setQuestion
    );
    const unsubMemories = listenMemories(spaceId, setMemories);
    const unsubConnections = listenDailyConnection(
      spaceId,
      dateStr,
      setConnections
    );
    const unsubNotes = listenNotes(spaceId, setNotes);
    const unsubDay = listenDay(spaceId, dateStr, setDayProgress);

    return () => {
      unsubGoals?.();
      unsubQuestion?.();
      unsubMemories?.();
      unsubConnections?.();
      unsubNotes?.();
      unsubDay?.();
    };
  }, [spaceId, dateStr]);

  /* -------------------------------------------------
     DAILY QUESTION
  ------------------------------------------------- */

  const todaysQuestion =
    question?.question || pickDailyQuestion(dateStr);

  const myAnswer = question?.answers?.[user.uid] || "";
  const partnerAnswer = partner?.uid
    ? question?.answers?.[partner.uid] || ""
    : "";

  const bothAnswered = Boolean(myAnswer && partnerAnswer);

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
      console.error("Question answer failed:", error);
    } finally {
      setSavingAnswer(false);
    }
  }

  /* -------------------------------------------------
     GOALS
  ------------------------------------------------- */

  async function handleAddGoal(e) {
    e.preventDefault();

    if (!goalTitle.trim() || savingGoal) return;

    setSavingGoal(true);

    try {
      await addGoal(spaceId, user.uid, myName, {
        title: goalTitle.trim()
      });

      setGoalTitle("");
    } catch (error) {
      console.error("Goal creation failed:", error);
    } finally {
      setSavingGoal(false);
    }
  }

  /* -------------------------------------------------
     NOTES
  ------------------------------------------------- */

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
      console.error("Note creation failed:", error);
    } finally {
      setSavingNote(false);
    }
  }

  async function handleDeleteNote(noteId) {
    try {
      await deleteNote(spaceId, noteId);
    } catch (error) {
      console.error("Note deletion failed:", error);
    }
  }

  /* -------------------------------------------------
     TODAY PROGRESS
  ------------------------------------------------- */

  const myProgress = dayProgress?.users?.[user.uid] || {};

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
    (total, routine) => total + Object.keys(routine || {}).length,
    0
  );

  const partnerRoutineCount = Object.values(
    partnerProgress.routineCompletions || {}
  ).reduce(
    (total, routine) => total + Object.keys(routine || {}).length,
    0
  );

  const myHabitCount = Object.values(
    myProgress.habitCompletions || {}
  ).filter(Boolean).length;

  const partnerHabitCount = Object.values(
    partnerProgress.habitCompletions || {}
  ).filter(Boolean).length;

  const totalCompleted =
    myTaskCount +
    partnerTaskCount +
    myRoutineCount +
    partnerRoutineCount +
    myHabitCount +
    partnerHabitCount;

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

  const recentMemories = useMemo(
    () => memories.slice(0, 3),
    [memories]
  );

  /* -------------------------------------------------
     NEXT LITTLE THING
  ------------------------------------------------- */

  const nextGoal = [...activeGoals]
    .sort(
      (a, b) =>
        Number(a.progress || 0) -
        Number(b.progress || 0)
    )[0];

  return (
    <div className="page-container ourworld-page">

      {/* HEADER */}
      <motion.div
        className="ourworld-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <p className="eyebrow">our little world</p>

          <h1 className="editorial-heading">
            Our <em>life together</em>
          </h1>

          <p className="ourworld-intro">
            A quiet little place to see what we are building,
            remembering and doing together.
          </p>
        </div>

        <div className="ourworld-date">
          <span>today</span>
          <strong>{dateStr}</strong>
        </div>
      </motion.div>

      {/* TODAY TOGETHER */}
      <motion.div
        className="today-together-section"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <GlassCard
          accent="gold"
          className="today-together-card"
        >
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">today together</p>

              <h2>
                Little things still <em>count.</em>
              </h2>
            </div>

            <div className="today-total">
              <strong>{totalCompleted}</strong>
              <span>completed</span>
            </div>
          </div>

          <div className="today-people">

            <div className="person-progress">
              <div className="person-progress-top">
                <span>{myName}</span>
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
                <span>{partnerName}</span>
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

      {/* MAIN DASHBOARD */}
      <div className="ourworld-dashboard">

        {/* GOALS */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
        >
          <GlassCard
            accent="him"
            className="world-card goals-world-card"
          >
            <div className="world-card-header">
              <div>
                <p className="eyebrow">shared goals</p>
                <h3>Things we're <em>building</em></h3>
              </div>

              <div className="small-stat">
                {completedGoals}/{goals.length}
                <span>done</span>
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
                  setGoalTitle(e.target.value)
                }
              />

              <button
                type="submit"
                disabled={savingGoal}
              >
                {savingGoal ? "Adding…" : "Add"}
              </button>
            </form>

            <div className="goal-summary">
              <div>
                <span>overall progress</span>
                <strong>{averageGoalProgress}%</strong>
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

              {goals.length === 0 && (
                <div className="world-empty">
                  <span>○</span>
                  <p>
                    No shared goals yet.
                    <br />
                    Add your first little plan above.
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* NEXT LITTLE THING */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <GlassCard
            accent="samiha"
            className="world-card next-thing-card"
          >
            <p className="eyebrow">next little thing</p>

            <div className="next-thing-icon">
              ✦
            </div>

            {nextGoal ? (
              <>
                <h3>{nextGoal.title}</h3>

                <p>
                  This one is currently at{" "}
                  <strong>
                    {nextGoal.progress || 0}%
                  </strong>
                  . A tiny step today is enough.
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
                <h3>Make a little plan</h3>

                <p>
                  Add a shared goal and it will appear
                  here as your next little thing.
                </p>
              </>
            )}
          </GlassCard>
        </motion.div>

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
                {connectionCount}/2
              </span>
            </div>

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
                  </p>
                </div>
              )}

              {partner ? (
                partnerConnection ? (
                  <div className="connection-entry">
                    <div className="connection-avatar partner-avatar">
                      {partnerName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>{partnerName}</strong>

                      <span>
                        {partnerConnection.type ||
                          "Check-in"}
                      </span>

                      {partnerConnection.text && (
                        <p>
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
                      check-in.
                    </p>
                  </div>
                )
              ) : (
                <div className="connection-empty">
                  <span>○</span>
                  <p>
                    Connect your partner to see
                    their check-in.
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* MEMORIES */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
        >
          <GlassCard
            accent="samiha"
            className="world-card recent-memories-card"
          >
            <div className="world-card-header">
              <div>
                <p className="eyebrow">memory corner</p>
                <h3>Little things we <em>kept</em></h3>
              </div>

              <span className="small-stat">
                {memories.length}
                <span>memories</span>
              </span>
            </div>

            {recentMemories.length > 0 ? (
              <div className="recent-memory-grid">
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
              </div>
            ) : (
              <div className="world-empty">
                <span>♡</span>
                <p>
                  Your memory corner is waiting
                  for its first moment.
                </p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* DAILY QUESTION */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
                  <span>{myName}</span>
                  <p>{myAnswer}</p>
                </div>

                {partner ? (
                  partnerAnswer ? (
                    <div className="answer-bubble partner-answer">
                      <span>{partnerName}</span>
                      <p>{partnerAnswer}</p>
                    </div>
                  ) : (
                    <p className="waiting-text">
                      Your answer is saved. Waiting
                      for {partnerName}.
                    </p>
                  )
                ) : (
                  <p className="waiting-text">
                    Connect your partner to share
                    answers.
                  </p>
                )}
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
                    setAnswer(e.target.value)
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

        {/* NOTES */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
        >
          <GlassCard
            accent="gold"
            className="world-card notes-world-card"
          >
            <div className="world-card-header">
              <div>
                <p className="eyebrow">our notes</p>
                <h3>Don't forget <em>this</em></h3>
              </div>

              <span className="small-stat">
                {notes.length}
                <span>notes</span>
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
                  setNoteText(e.target.value)
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

              {notes.length === 0 && (
                <div className="world-empty">
                  <span>✎</span>
                  <p>
                    Add a note that you both want
                    to remember.
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

      </div>

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
        </div>
      </motion.div>

    </div>
  );
}