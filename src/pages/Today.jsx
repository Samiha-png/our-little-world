import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../components/GlassCard";

import {
  listenTasks,
  addTask,
  renameTask,
  deleteTask,
  setTaskCompletion,

  listenDay,
  todayKey,

  listenHabits,
  addHabit,
  deleteHabit,
  setHabitCompletion,

  savePrivateMood,
  listenMood,
  setSharedMoodStatus,

  listenSupportRequests,
  sendSupportRequest,
  respondToSupportRequest
} from "../services/data";

import "./Today.css";

const CATEGORIES = [
  "Work",
  "Learning",
  "Exercise",
  "Skincare",
  "Personal",
  "Gym",
  "Office",
  "Reminders"
];

const FEELINGS = [
  "Happy",
  "Sad",
  "Overwhelmed",
  "Angry",
  "Lonely",
  "Tired",
  "Anxious",
  "Need affection",
  "Need space",
  "Need someone to listen"
];

const NEEDS = [
  "Comfort me",
  "Talk to me",
  "Send me something sweet",
  "Distract me",
  "Give me some space",
  "Just stay with me"
];

const HABIT_ICONS = [
  "💧",
  "🧘",
  "📚",
  "💻",
  "🏃",
  "🏋️",
  "🧴",
  "🪥",
  "😴",
  "🥗",
  "☀️",
  "🌙",
  "❤️",
  "✨",
  "🙏",
  "🎯"
];

export default function Today({ ctx }) {
  const { spaceId, user, profile, partner } = ctx;

  const dateStr = todayKey();
  const myName =
    profile?.displayName ||
    user.email?.split("@")[0] ||
    "You";

  const [tasks, setTasks] = useState([]);
  const [day, setDay] = useState({ users: {} });

  const [habits, setHabits] = useState([]);

  const [newTask, setNewTask] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);

  const [myMood, setMyMood] = useState(null);

  const [supportRequests, setSupportRequests] = useState([]);
  const [imHereOpen, setImHereOpen] = useState(false);
  const [feeling, setFeeling] = useState(null);
  const [need, setNeed] = useState(null);

  /* TASK STATE */
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [busyTaskId, setBusyTaskId] = useState(null);
  const [addingTask, setAddingTask] = useState(false);
  const [taskError, setTaskError] = useState("");

  /* SUPPORT STATE */
  const [supportBusy, setSupportBusy] = useState(false);

  /* HABIT STATE */
  const [habitOpen, setHabitOpen] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [habitIcon, setHabitIcon] = useState("💧");
  const [addingHabit, setAddingHabit] = useState(false);
  const [habitBusyId, setHabitBusyId] = useState(null);
  const [habitError, setHabitError] = useState("");

  useEffect(() => {
    if (!spaceId || !user?.uid) return undefined;

    const unsubs = [
      listenTasks(spaceId, setTasks),

      listenDay(
        spaceId,
        dateStr,
        setDay
      ),

      listenHabits(
        spaceId,
        setHabits
      ),

      listenMood(
        user.uid,
        dateStr,
        (m) => setMyMood(m?.mood || null)
      ),

      listenSupportRequests(
        spaceId,
        setSupportRequests
      )
    ];

    return () =>
      unsubs.forEach(
        (unsubscribe) =>
          unsubscribe?.()
      );
  }, [spaceId, user?.uid, dateStr]);

  /* =====================================================
     TASKS
  ===================================================== */

  const myTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.ownerUid === user.uid
      ),
    [tasks, user.uid]
  );

  const myCompletions =
    day.users?.[user.uid]
      ?.taskCompletions || {};

  const completedTasks = myTasks.filter(
    (task) => !!myCompletions[task.id]
  ).length;

  const taskPercent = myTasks.length
    ? Math.round(
        (completedTasks /
          myTasks.length) *
          100
      )
    : 0;

  async function handleAddTask(e) {
    e.preventDefault();

    const title = newTask.trim();

    if (
      !title ||
      addingTask ||
      !spaceId
    ) {
      return;
    }

    setAddingTask(true);
    setTaskError("");

    try {
      await addTask(
        spaceId,
        user.uid,
        {
          title,
          category,
          visibility: "shared"
        }
      );

      setNewTask("");
    } catch (err) {
      console.error(
        "[Today] add task failed",
        err
      );

      setTaskError(
        err.message ||
          "Couldn't add that task."
      );
    } finally {
      setAddingTask(false);
    }
  }

  function startEditingTask(task) {
    setTaskError("");
    setEditingTaskId(task.id);
    setEditingTitle(
      task.title || ""
    );
  }

  function cancelEditingTask() {
    if (busyTaskId) return;

    setEditingTaskId(null);
    setEditingTitle("");
  }

  async function handleRenameTask(
    taskId
  ) {
    const title =
      editingTitle.trim();

    if (!title || busyTaskId)
      return;

    setBusyTaskId(taskId);
    setTaskError("");

    try {
      await renameTask(
        spaceId,
        taskId,
        title
      );

      setEditingTaskId(null);
      setEditingTitle("");
    } catch (err) {
      console.error(
        "[Today] rename task failed",
        err
      );

      setTaskError(
        err.message ||
          "Couldn't update that task."
      );
    } finally {
      setBusyTaskId(null);
    }
  }

  async function handleDeleteTask(
    task
  ) {
    if (busyTaskId) return;

    const confirmed =
      window.confirm(
        `Delete “${task.title}”?`
      );

    if (!confirmed) return;

    setBusyTaskId(task.id);
    setTaskError("");

    try {
      await deleteTask(
        spaceId,
        task.id
      );

      if (
        editingTaskId === task.id
      ) {
        setEditingTaskId(null);
        setEditingTitle("");
      }
    } catch (err) {
      console.error(
        "[Today] delete task failed",
        err
      );

      setTaskError(
        err.message ||
          "Couldn't delete that task."
      );
    } finally {
      setBusyTaskId(null);
    }
  }

  async function handleToggleTask(
    taskId,
    done
  ) {
    if (busyTaskId) return;

    setBusyTaskId(taskId);
    setTaskError("");

    try {
      await setTaskCompletion(
        spaceId,
        dateStr,
        user.uid,
        taskId,
        !done
      );
    } catch (err) {
      console.error(
        "[Today] task completion failed",
        err
      );

      setTaskError(
        err.message ||
          "Couldn't update the task."
      );
    } finally {
      setBusyTaskId(null);
    }
  }

  /* =====================================================
     HABITS
  ===================================================== */

  const myHabits = useMemo(
    () =>
      habits.filter(
        (habit) =>
          habit.ownerUid === user.uid
      ),
    [habits, user.uid]
  );

  const completedHabits =
    myHabits.filter(
      (habit) =>
        !!habit.completions?.[dateStr]
    ).length;

  const habitPercent =
    myHabits.length
      ? Math.round(
          (completedHabits /
            myHabits.length) *
            100
        )
      : 0;

  function getLastSevenDays() {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();

      d.setDate(
        d.getDate() - i
      );

      days.push({
        date: todayKey(d),
        label: d.toLocaleDateString(
          undefined,
          {
            weekday: "narrow"
          }
        ),
        isToday:
          todayKey(d) === dateStr
      });
    }

    return days;
  }

  const weekDays =
    useMemo(
      () => getLastSevenDays(),
      [dateStr]
    );

  function calculateCurrentStreak(
    habit
  ) {
    const completions =
      habit.completions || {};

    let streak = 0;
    const check = new Date();

    if (
      !completions[
        todayKey(check)
      ]
    ) {
      check.setDate(
        check.getDate() - 1
      );
    }

    while (
      completions[
        todayKey(check)
      ]
    ) {
      streak++;

      check.setDate(
        check.getDate() - 1
      );
    }

    return streak;
  }

  async function handleAddHabit(e) {
    e.preventDefault();

    const name =
      habitName.trim();

    if (
      !name ||
      addingHabit ||
      !spaceId
    ) {
      return;
    }

    setAddingHabit(true);
    setHabitError("");

    try {
      await addHabit(
        spaceId,
        user.uid,
        {
          name,
          icon:
            habitIcon.trim() ||
            "💧"
        }
      );

      setHabitName("");
      setHabitIcon("💧");
      setHabitOpen(false);
    } catch (err) {
      console.error(
        "[Today] add habit failed",
        err
      );

      setHabitError(
        err.message ||
          "Couldn't create that habit."
      );
    } finally {
      setAddingHabit(false);
    }
  }

  async function handleToggleHabit(
    habit
  ) {
    if (habitBusyId) return;

    const completions =
      habit.completions || {};

    const done =
      !!completions[dateStr];

    const nextDone = !done;

    const temporary = {
      ...completions
    };

    if (nextDone) {
      temporary[dateStr] = true;
    } else {
      delete temporary[dateStr];
    }

    let bestStreak =
      Number(
        habit.bestStreak || 0
      );

    let streak = 0;

    const check =
      new Date();

    if (
      !temporary[
        todayKey(check)
      ]
    ) {
      check.setDate(
        check.getDate() - 1
      );
    }

    while (
      temporary[
        todayKey(check)
      ]
    ) {
      streak++;

      check.setDate(
        check.getDate() - 1
      );
    }

    if (streak > bestStreak) {
      bestStreak = streak;
    }

    setHabitBusyId(habit.id);
    setHabitError("");

    try {
      await setHabitCompletion(
        spaceId,
        habit.id,
        dateStr,
        nextDone,
        bestStreak
      );
    } catch (err) {
      console.error(
        "[Today] habit completion failed",
        err
      );

      setHabitError(
        err.message ||
          "Couldn't update habit."
      );
    } finally {
      setHabitBusyId(null);
    }
  }

  async function handleDeleteHabit(
    habit
  ) {
    if (habitBusyId) return;

    const confirmed =
      window.confirm(
        `Delete “${habit.name}”?`
      );

    if (!confirmed) return;

    setHabitBusyId(habit.id);
    setHabitError("");

    try {
      await deleteHabit(
        spaceId,
        habit.id
      );
    } catch (err) {
      console.error(
        "[Today] delete habit failed",
        err
      );

      setHabitError(
        err.message ||
          "Couldn't delete that habit."
      );
    } finally {
      setHabitBusyId(null);
    }
  }

  /* =====================================================
     MOOD
  ===================================================== */

  async function handleMoodChange(
    mood
  ) {
    setMyMood(mood);

    try {
      await Promise.all([
        savePrivateMood(
          user.uid,
          dateStr,
          { mood }
        ),

        setSharedMoodStatus(
          spaceId,
          dateStr,
          user.uid,
          myName,
          { mood }
        )
      ]);
    } catch (err) {
      console.error(
        "[Today] mood save failed",
        err
      );
    }
  }

  /* =====================================================
     SUPPORT
  ===================================================== */

  async function handleSendSupport(
    e
  ) {
    e.preventDefault();

    if (
      !feeling ||
      supportBusy
    ) {
      return;
    }

    setSupportBusy(true);

    try {
      await sendSupportRequest(
        spaceId,
        user.uid,
        myName,
        {
          feeling,
          need
        }
      );

      setImHereOpen(false);
      setFeeling(null);
      setNeed(null);
    } catch (err) {
      console.error(
        "[Today] support request failed",
        err
      );

      setTaskError(
        err.message ||
          "Couldn't send that support request."
      );
    } finally {
      setSupportBusy(false);
    }
  }

  const openRequestsForMe =
    supportRequests.filter(
      (request) =>
        request.uid !== user.uid &&
        request.status === "open"
    );

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="page-container today-page">

      {/* HEADER */}
      <motion.div
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
        className="today-header"
      >
        <div>
          <p className="eyebrow">
            today
          </p>

          <h1 className="editorial-heading">
            Your <em>day</em>
          </h1>

          <p className="today-subtitle">
            Small progress counts. Keep
            your day simple and consistent.
          </p>
        </div>

        <div className="today-progress-ring">
          <strong>
            {Math.round(
              (taskPercent +
                habitPercent) /
                2
            )}%
          </strong>

          <span>
            today
          </span>
        </div>
      </motion.div>

      {/* SUPPORT ALERTS */}
      {openRequestsForMe.length >
        0 && (
        <motion.div
          initial={{
            opacity: 0,
            y: 16
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          style={{
            marginTop:
              "var(--space-4)"
          }}
        >
          {openRequestsForMe.map(
            (request) => (
              <GlassCard
                key={request.id}
                accent="gold"
                className="support-alert"
              >
                <p>
                  Someone you love could
                  use a little support —
                  feeling{" "}
                  <strong>
                    {request.feeling}
                  </strong>
                  {request.need
                    ? `, hoping you'll ${request.need.toLowerCase()}`
                    : ""}
                  .
                </p>

                <SupportResponder
                  spaceId={spaceId}
                  request={request}
                />
              </GlassCard>
            )
          )}
        </motion.div>
      )}

      {/* MOOD + I'M HERE */}
      <div className="today-grid">

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
            delay: 0.1
          }}
        >
          <GlassCard
            accent="samiha"
            className="today-mood"
          >
            <p className="eyebrow">
              mood zone
            </p>

            <h3 className="today-section-title">
              How are you feeling?
            </h3>

            <div className="today-mood-row">
              {[
                "😊",
                "😌",
                "😔",
                "😤",
                "🥹",
                "😴",
                "🤔",
                "🥰"
              ].map((mood) => (
                <button
                  key={mood}
                  type="button"
                  className={`today-mood-btn${
                    myMood === mood
                      ? " is-active"
                      : ""
                  }`}
                  onClick={() =>
                    handleMoodChange(
                      mood
                    )
                  }
                  aria-label={`Set mood ${mood}`}
                >
                  {mood}
                </button>
              ))}
            </div>

            {myMood && (
              <p className="mood-selected-text">
                You're feeling{" "}
                <strong>
                  {myMood}
                </strong>{" "}
                today.
              </p>
            )}
          </GlassCard>
        </motion.div>

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
            delay: 0.16
          }}
        >
          <GlassCard
            accent="gold"
            className="today-imhere"
            interactive
            onClick={() =>
              setImHereOpen(true)
            }
          >
            <p className="eyebrow">
              need support?
            </p>

            <div className="imhere-icon">
              ♡
            </div>

            <h3>
              I'm Here
            </h3>

            <p>
              Tell{" "}
              {partner?.displayName ||
                "your partner"}{" "}
              how you're feeling.
            </p>
          </GlassCard>
        </motion.div>
      </div>

      {/* HABITS */}
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
          delay: 0.2
        }}
      >
        <GlassCard
          accent="samiha"
          className="today-habits"
        >
          <div className="today-habits-heading">

            <div>
              <p className="eyebrow">
                daily habits
              </p>

              <h2>
                Build your{" "}
                <em>little rituals</em>
              </h2>

              <small>
                {completedHabits} of{" "}
                {myHabits.length} completed
                today
              </small>
            </div>

            <button
              type="button"
              className="habit-add-button"
              onClick={() => {
                setHabitError("");
                setHabitOpen(true);
              }}
            >
              + Add habit
            </button>
          </div>

          {myHabits.length > 0 && (
            <div className="habit-progress-summary">
              <div className="habit-progress-track">
                <span
                  style={{
                    width: `${habitPercent}%`
                  }}
                />
              </div>

              <span>
                {habitPercent}%
              </span>
            </div>
          )}

          {habitError && (
            <p
              className="today-task-error"
              role="alert"
            >
              {habitError}
            </p>
          )}

          <div className="habits-list">

            {myHabits.map((habit) => {
              const done =
                !!habit
                  .completions?.[
                  dateStr
                ];

              const currentStreak =
                calculateCurrentStreak(
                  habit
                );

              const bestStreak =
                Math.max(
                  Number(
                    habit.bestStreak ||
                      0
                  ),
                  currentStreak
                );

              const busy =
                habitBusyId ===
                habit.id;

              return (
                <div
                  key={habit.id}
                  className={`habit-card${
                    done
                      ? " is-done"
                      : ""
                  }`}
                >

                  <div className="habit-card-main">

                    <button
                      type="button"
                      className={`habit-check${
                        done
                          ? " is-checked"
                          : ""
                      }`}
                      onClick={() =>
                        handleToggleHabit(
                          habit
                        )
                      }
                      disabled={busy}
                      aria-label={
                        done
                          ? `Mark ${habit.name} incomplete`
                          : `Mark ${habit.name} complete`
                      }
                    >
                      {done
                        ? "✓"
                        : ""}
                    </button>

                    <div className="habit-info">
                      <div className="habit-title-row">
                        <span className="habit-icon">
                          {habit.icon ||
                            "✨"}
                        </span>

                        <strong>
                          {habit.name}
                        </strong>
                      </div>

                      <div className="habit-stats">
                        <span>
                          🔥{" "}
                          {currentStreak}{" "}
                          day streak
                        </span>

                        <span>
                          Best{" "}
                          {bestStreak}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="habit-delete"
                      onClick={() =>
                        handleDeleteHabit(
                          habit
                        )
                      }
                      disabled={busy}
                      aria-label={`Delete ${habit.name}`}
                    >
                      ×
                    </button>
                  </div>

                  <div className="habit-week">

                    {weekDays.map(
                      (dayItem) => {
                        const dayDone =
                          !!habit
                            .completions?.[
                            dayItem.date
                          ];

                        return (
                          <div
                            key={
                              dayItem.date
                            }
                            className={`habit-day${
                              dayItem.isToday
                                ? " is-today"
                                : ""
                            }`}
                          >
                            <span>
                              {
                                dayItem.label
                              }
                            </span>

                            <span
                              className={`habit-day-dot${
                                dayDone
                                  ? " is-done"
                                  : ""
                              }`}
                            >
                              {dayDone
                                ? "✓"
                                : ""}
                            </span>
                          </div>
                        );
                      }
                    )}

                  </div>
                </div>
              );
            })}

            {myHabits.length ===
              0 && (
              <div className="habits-empty">
                <div>
                  ✦
                </div>

                <h3>
                  No habits yet
                </h3>

                <p>
                  Create a small daily
                  ritual — hydration,
                  reading, exercise,
                  skincare, prayer,
                  anything that matters
                  to you.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setHabitOpen(true)
                  }
                >
                  Create first habit
                </button>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* TASKS */}
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
      >
        <GlassCard
          accent="him"
          className="today-tasks"
        >
          <div className="today-tasks-heading">
            <div>
              <p className="eyebrow">
                daily tasks
              </p>

              <small>
                {completedTasks}/
                {myTasks.length}{" "}
                completed
              </small>
            </div>

            <strong className="task-percent">
              {taskPercent}%
            </strong>
          </div>

          <div className="task-progress-track">
            <span
              style={{
                width: `${taskPercent}%`
              }}
            />
          </div>

          <form
            onSubmit={handleAddTask}
            className="today-task-form"
          >
            <input
              placeholder="Add a task…"
              value={newTask}
              onChange={(e) =>
                setNewTask(
                  e.target.value
                )
              }
              aria-label="New task"
              disabled={addingTask}
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              aria-label="Task category"
              disabled={addingTask}
            >
              {CATEGORIES.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

            <button
              type="submit"
              disabled={
                addingTask ||
                !newTask.trim()
              }
            >
              {addingTask
                ? "Adding…"
                : "Add"}
            </button>
          </form>

          {taskError && (
            <p
              className="today-task-error"
              role="alert"
            >
              {taskError}
            </p>
          )}

          <ul className="today-task-list">

            {myTasks.map((task) => {
              const done =
                !!myCompletions[
                  task.id
                ];

              const busy =
                busyTaskId ===
                task.id;

              const editing =
                editingTaskId ===
                task.id;

              return (
                <li
                  key={task.id}
                  className={
                    done
                      ? "is-done"
                      : ""
                  }
                >
                  <button
                    type="button"
                    className={`today-task-check${
                      done
                        ? " is-checked"
                        : ""
                    }`}
                    onClick={() =>
                      handleToggleTask(
                        task.id,
                        done
                      )
                    }
                    disabled={
                      busy ||
                      !!editingTaskId
                    }
                    aria-label={
                      done
                        ? `Mark ${task.title} incomplete`
                        : `Mark ${task.title} complete`
                    }
                    aria-pressed={done}
                  >
                    {done ? "✓" : ""}
                  </button>

                  {editing ? (
                    <div className="today-task-edit-row">
                      <input
                        value={
                          editingTitle
                        }
                        onChange={(e) =>
                          setEditingTitle(
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => {
                          if (
                            e.key ===
                            "Enter"
                          ) {
                            e.preventDefault();

                            handleRenameTask(
                              task.id
                            );
                          }

                          if (
                            e.key ===
                            "Escape"
                          ) {
                            cancelEditingTask();
                          }
                        }}
                        autoFocus
                        disabled={busy}
                        aria-label="Edit task title"
                      />

                      <button
                        type="button"
                        className="today-task-save"
                        onClick={() =>
                          handleRenameTask(
                            task.id
                          )
                        }
                        disabled={
                          busy ||
                          !editingTitle.trim()
                        }
                      >
                        {busy
                          ? "Saving…"
                          : "Save"}
                      </button>

                      <button
                        type="button"
                        className="today-task-cancel"
                        onClick={
                          cancelEditingTask
                        }
                        disabled={busy}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span>
                      {task.title}
                    </span>
                  )}

                  {!editing && (
                    <>
                      <span className="today-task-cat">
                        {task.category}
                      </span>

                      <div className="today-task-actions">

                        <button
                          type="button"
                          className="today-task-edit"
                          onClick={() =>
                            startEditingTask(
                              task
                            )
                          }
                          disabled={
                            busy ||
                            !!editingTaskId
                          }
                          aria-label={`Edit ${task.title}`}
                          title="Edit task"
                        >
                          ✎
                        </button>

                        <button
                          type="button"
                          className="today-task-delete"
                          onClick={() =>
                            handleDeleteTask(
                              task
                            )
                          }
                          disabled={
                            busy ||
                            !!editingTaskId
                          }
                          aria-label={`Delete ${task.title}`}
                          title="Delete task"
                        >
                          ×
                        </button>

                      </div>
                    </>
                  )}
                </li>
              );
            })}

            {myTasks.length ===
              0 && (
              <li className="today-empty">
                No tasks yet. Add your
                first little win.
              </li>
            )}

          </ul>
        </GlassCard>
      </motion.div>

      {/* HABIT MODAL */}
      <AnimatePresence>
        {habitOpen && (
          <motion.div
            className="habit-modal-backdrop"
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            onClick={() =>
              !addingHabit &&
              setHabitOpen(false)
            }
          >
            <motion.div
              className="habit-modal"
              initial={{
                scale: 0.92,
                opacity: 0,
                y: 12
              }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0
              }}
              exit={{
                scale: 0.92,
                opacity: 0,
                y: 12
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="habit-modal-top">
                <div>
                  <p className="eyebrow">
                    habit setup
                  </p>

                  <h2>
                    Create a{" "}
                    <em>little ritual</em>
                  </h2>

                  <p>
                    Something small you want
                    to keep doing every day.
                  </p>
                </div>

                <button
                  type="button"
                  className="habit-modal-close"
                  onClick={() =>
                    setHabitOpen(false)
                  }
                  disabled={addingHabit}
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={handleAddHabit}
                className="habit-form"
              >
                <label>
                  Habit name
                  <input
                    autoFocus
                    value={habitName}
                    onChange={(e) =>
                      setHabitName(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Drink enough water"
                    disabled={
                      addingHabit
                    }
                  />
                </label>

                <label>
                  Choose icon
                  <div className="habit-icon-picker">
                    {HABIT_ICONS.map(
                      (icon) => (
                        <button
                          key={icon}
                          type="button"
                          className={
                            habitIcon ===
                            icon
                              ? "is-selected"
                              : ""
                          }
                          onClick={() =>
                            setHabitIcon(
                              icon
                            )
                          }
                          disabled={
                            addingHabit
                          }
                        >
                          {icon}
                        </button>
                      )
                    )}
                  </div>
                </label>

                <label>
                  Or type your own
                  <input
                    value={habitIcon}
                    onChange={(e) =>
                      setHabitIcon(
                        e.target.value
                      )
                    }
                    maxLength={4}
                    disabled={
                      addingHabit
                    }
                  />
                </label>

                {habitError && (
                  <p className="today-task-error">
                    {habitError}
                  </p>
                )}

                <button
                  type="submit"
                  className="habit-create-button"
                  disabled={
                    addingHabit ||
                    !habitName.trim()
                  }
                >
                  {addingHabit
                    ? "Creating…"
                    : "Create habit"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* I'M HERE MODAL */}
      <AnimatePresence>
        {imHereOpen && (
          <motion.div
            className="memory-modal-backdrop"
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            onClick={() =>
              !supportBusy &&
              setImHereOpen(false)
            }
          >
            <motion.div
              className="memory-modal"
              initial={{
                scale: 0.9,
                opacity: 0
              }}
              animate={{
                scale: 1,
                opacity: 1
              }}
              exit={{
                scale: 0.9,
                opacity: 0
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <h2>
                How are you feeling
                right now?
              </h2>

              <div className="imhere-pills">
                {FEELINGS.map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      className={
                        feeling === item
                          ? "is-active"
                          : ""
                      }
                      onClick={() =>
                        setFeeling(
                          item
                        )
                      }
                      disabled={
                        supportBusy
                      }
                    >
                      {item}
                    </button>
                  )
                )}
              </div>

              <h2
                style={{
                  marginTop: 18
                }}
              >
                What would help
                right now?
              </h2>

              <div className="imhere-pills">
                {NEEDS.map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      className={
                        need === item
                          ? "is-active"
                          : ""
                      }
                      onClick={() =>
                        setNeed(item)
                      }
                      disabled={
                        supportBusy
                      }
                    >
                      {item}
                    </button>
                  )
                )}
              </div>

              <button
                className="diary-save"
                style={{
                  marginTop: 18
                }}
                disabled={
                  !feeling ||
                  supportBusy
                }
                onClick={
                  handleSendSupport
                }
              >
                {supportBusy
                  ? "Sending…"
                  : `Send to ${
                      partner?.displayName ||
                      "your partner"
                    }`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

/* =========================================================
   SUPPORT RESPONDER
========================================================= */

function SupportResponder({
  spaceId,
  request
}) {
  const [text, setText] =
    useState("");

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  if (request.response) {
    return (
      <p className="support-response">
        You replied: “
        {request.response}”
      </p>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const response =
      text.trim();

    if (
      !response ||
      busy
    ) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await respondToSupportRequest(
        spaceId,
        request.id,
        response
      );

      setText("");
    } catch (err) {
      console.error(
        "[Today] support response failed",
        err
      );

      setError(
        err.message ||
          "Couldn't send that reply."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form
        className="support-response-form"
        onSubmit={handleSubmit}
      >
        <input
          placeholder="Send a gentle reply…"
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
          disabled={busy}
        />

        <button
          type="submit"
          disabled={
            busy ||
            !text.trim()
          }
        >
          {busy
            ? "Sending…"
            : "Send"}
        </button>
      </form>

      {error && (
        <p
          className="today-task-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </>
  );
}