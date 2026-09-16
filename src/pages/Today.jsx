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
  savePrivateMood,
  listenMood,
  setSharedMoodStatus,
  listenSupportRequests,
  sendSupportRequest,
  respondToSupportRequest
} from "../services/data";
import "./Today.css";

const CATEGORIES = ["Work", "Learning", "Exercise", "Skincare", "Personal", "Gym", "Office", "Reminders"];
const FEELINGS = ["Happy", "Sad", "Overwhelmed", "Angry", "Lonely", "Tired", "Anxious", "Need affection", "Need space", "Need someone to listen"];
const NEEDS = ["Comfort me", "Talk to me", "Send me something sweet", "Distract me", "Give me some space", "Just stay with me"];

export default function Today({ ctx }) {
  const { spaceId, user, profile, partner } = ctx;
  const dateStr = todayKey();
  const myName = profile?.displayName || user.email?.split("@")[0] || "You";

  const [tasks, setTasks] = useState([]);
  const [day, setDay] = useState({ users: {} });
  const [newTask, setNewTask] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [myMood, setMyMood] = useState(null);
  const [supportRequests, setSupportRequests] = useState([]);
  const [imHereOpen, setImHereOpen] = useState(false);
  const [feeling, setFeeling] = useState(null);
  const [need, setNeed] = useState(null);

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [busyTaskId, setBusyTaskId] = useState(null);
  const [addingTask, setAddingTask] = useState(false);
  const [taskError, setTaskError] = useState("");
  const [supportBusy, setSupportBusy] = useState(false);

  useEffect(() => {
    if (!spaceId || !user?.uid) return undefined;

    const unsubs = [
      listenTasks(spaceId, setTasks),
      listenDay(spaceId, dateStr, setDay),
      listenMood(user.uid, dateStr, (m) => setMyMood(m?.mood || null)),
      listenSupportRequests(spaceId, setSupportRequests)
    ];

    return () => unsubs.forEach((unsubscribe) => unsubscribe?.());
  }, [spaceId, user?.uid, dateStr]);

  const myTasks = useMemo(
    () => tasks.filter((task) => task.ownerUid === user.uid),
    [tasks, user.uid]
  );

  const myCompletions = day.users?.[user.uid]?.taskCompletions || {};

  async function handleAddTask(e) {
    e.preventDefault();
    const title = newTask.trim();
    if (!title || addingTask || !spaceId) return;

    setAddingTask(true);
    setTaskError("");
    try {
      await addTask(spaceId, user.uid, {
        title,
        category,
        visibility: "shared"
      });
      setNewTask("");
    } catch (err) {
      console.error("[Today] add task failed", err);
      setTaskError(err.message || "Couldn't add that task.");
    } finally {
      setAddingTask(false);
    }
  }

  function startEditingTask(task) {
    setTaskError("");
    setEditingTaskId(task.id);
    setEditingTitle(task.title || "");
  }

  function cancelEditingTask() {
    if (busyTaskId) return;
    setEditingTaskId(null);
    setEditingTitle("");
  }

  async function handleRenameTask(taskId) {
    const title = editingTitle.trim();
    if (!title || busyTaskId) return;

    setBusyTaskId(taskId);
    setTaskError("");
    try {
      await renameTask(spaceId, taskId, title);
      setEditingTaskId(null);
      setEditingTitle("");
    } catch (err) {
      console.error("[Today] rename task failed", err);
      setTaskError(err.message || "Couldn't update that task.");
    } finally {
      setBusyTaskId(null);
    }
  }

  async function handleDeleteTask(task) {
    if (busyTaskId) return;

    const confirmed = window.confirm(`Delete “${task.title}”?`);
    if (!confirmed) return;

    setBusyTaskId(task.id);
    setTaskError("");
    try {
      await deleteTask(spaceId, task.id);
      if (editingTaskId === task.id) {
        setEditingTaskId(null);
        setEditingTitle("");
      }
    } catch (err) {
      console.error("[Today] delete task failed", err);
      setTaskError(err.message || "Couldn't delete that task.");
    } finally {
      setBusyTaskId(null);
    }
  }

  async function handleToggleTask(taskId, done) {
    if (busyTaskId) return;

    setBusyTaskId(taskId);
    setTaskError("");
    try {
      await setTaskCompletion(spaceId, dateStr, user.uid, taskId, !done);
    } catch (err) {
      console.error("[Today] task completion failed", err);
      setTaskError(err.message || "Couldn't update the task.");
    } finally {
      setBusyTaskId(null);
    }
  }

  async function handleMoodChange(mood) {
    setMyMood(mood);
    try {
      await Promise.all([
        savePrivateMood(user.uid, dateStr, { mood }),
        setSharedMoodStatus(spaceId, dateStr, user.uid, myName, { mood })
      ]);
    } catch (err) {
      console.error("[Today] mood save failed", err);
    }
  }

  async function handleSendSupport(e) {
    e.preventDefault();
    if (!feeling || supportBusy) return;

    setSupportBusy(true);
    try {
      await sendSupportRequest(spaceId, user.uid, myName, { feeling, need });
      setImHereOpen(false);
      setFeeling(null);
      setNeed(null);
    } catch (err) {
      console.error("[Today] support request failed", err);
      setTaskError(err.message || "Couldn't send that support request.");
    } finally {
      setSupportBusy(false);
    }
  }

  const openRequestsForMe = supportRequests.filter(
    (request) => request.uid !== user.uid && request.status === "open"
  );

  return (
    <div className="page-container today-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="eyebrow">today</p>
        <h1 className="editorial-heading">Your <em>day</em></h1>
      </motion.div>

      {openRequestsForMe.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: "var(--space-4)" }}
        >
          {openRequestsForMe.map((request) => (
            <GlassCard key={request.id} accent="gold" className="support-alert">
              <p>
                Someone you love could use a little support — feeling <strong>{request.feeling}</strong>
                {request.need ? `, hoping you'll ${request.need.toLowerCase()}` : ""}.
              </p>
              <SupportResponder spaceId={spaceId} request={request} />
            </GlassCard>
          ))}
        </motion.div>
      )}

      <div className="today-grid">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard accent="samiha" className="today-mood">
            <p className="eyebrow">mood zone</p>
            <div className="today-mood-row">
              {["😊", "😌", "😔", "😤", "🥹", "😴", "🤔", "🥰"].map((mood) => (
                <button
                  key={mood}
                  type="button"
                  className={`today-mood-btn${myMood === mood ? " is-active" : ""}`}
                  onClick={() => handleMoodChange(mood)}
                  aria-label={`Set mood ${mood}`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <GlassCard
            accent="gold"
            className="today-imhere"
            interactive
            onClick={() => setImHereOpen(true)}
          >
            <p className="eyebrow">need support?</p>
            <h3 style={{ margin: "8px 0" }}>I'm Here</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
              Tell {partner?.displayName || "your partner"} how you're feeling.
            </p>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
      >
        <GlassCard accent="him" className="today-tasks">
          <div className="today-tasks-heading">
            <div>
              <p className="eyebrow">daily tasks</p>
              <small>{myTasks.length} {myTasks.length === 1 ? "task" : "tasks"}</small>
            </div>
          </div>

          <form onSubmit={handleAddTask} className="today-task-form">
            <input
              placeholder="Add a task…"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              aria-label="New task"
              disabled={addingTask}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Task category"
              disabled={addingTask}
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <button type="submit" disabled={addingTask || !newTask.trim()}>
              {addingTask ? "Adding…" : "Add"}
            </button>
          </form>

          {taskError && <p className="today-task-error" role="alert">{taskError}</p>}

          <ul className="today-task-list">
            {myTasks.map((task) => {
              const done = !!myCompletions[task.id];
              const busy = busyTaskId === task.id;
              const editing = editingTaskId === task.id;

              return (
                <li key={task.id} className={done ? "is-done" : ""}>
                  <button
                    type="button"
                    className={`today-task-check${done ? " is-checked" : ""}`}
                    onClick={() => handleToggleTask(task.id, done)}
                    disabled={busy || !!editingTaskId}
                    aria-label={done ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
                    aria-pressed={done}
                  >
                    {done ? "✓" : ""}
                  </button>

                  {editing ? (
                    <div className="today-task-edit-row">
                      <input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleRenameTask(task.id);
                          }
                          if (e.key === "Escape") cancelEditingTask();
                        }}
                        autoFocus
                        disabled={busy}
                        aria-label="Edit task title"
                      />
                      <button
                        type="button"
                        className="today-task-save"
                        onClick={() => handleRenameTask(task.id)}
                        disabled={busy || !editingTitle.trim()}
                      >
                        {busy ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        className="today-task-cancel"
                        onClick={cancelEditingTask}
                        disabled={busy}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span>{task.title}</span>
                  )}

                  {!editing && (
                    <>
                      <span className="today-task-cat">{task.category}</span>
                      <div className="today-task-actions">
                        <button
                          type="button"
                          className="today-task-edit"
                          onClick={() => startEditingTask(task)}
                          disabled={busy || !!editingTaskId}
                          aria-label={`Edit ${task.title}`}
                          title="Edit task"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="today-task-delete"
                          onClick={() => handleDeleteTask(task)}
                          disabled={busy || !!editingTaskId}
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

            {myTasks.length === 0 && (
              <li className="today-empty">No tasks yet. Add your first little win.</li>
            )}
          </ul>
        </GlassCard>
      </motion.div>

      <AnimatePresence>
        {imHereOpen && (
          <motion.div
            className="memory-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !supportBusy && setImHereOpen(false)}
          >
            <motion.div
              className="memory-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>How are you feeling right now?</h2>
              <div className="imhere-pills">
                {FEELINGS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={feeling === item ? "is-active" : ""}
                    onClick={() => setFeeling(item)}
                    disabled={supportBusy}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <h2 style={{ marginTop: 18 }}>What would help right now?</h2>
              <div className="imhere-pills">
                {NEEDS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={need === item ? "is-active" : ""}
                    onClick={() => setNeed(item)}
                    disabled={supportBusy}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <button
                className="diary-save"
                style={{ marginTop: 18 }}
                disabled={!feeling || supportBusy}
                onClick={handleSendSupport}
              >
                {supportBusy ? "Sending…" : `Send to ${partner?.displayName || "your partner"}`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SupportResponder({ spaceId, request }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (request.response) {
    return <p className="support-response">You replied: “{request.response}”</p>;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const response = text.trim();
    if (!response || busy) return;

    setBusy(true);
    setError("");
    try {
      await respondToSupportRequest(spaceId, request.id, response);
      setText("");
    } catch (err) {
      console.error("[Today] support response failed", err);
      setError(err.message || "Couldn't send that reply.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form className="support-response-form" onSubmit={handleSubmit}>
        <input
          placeholder="Send a gentle reply…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy}
        />
        <button type="submit" disabled={busy || !text.trim()}>
          {busy ? "Sending…" : "Send"}
        </button>
      </form>
      {error && <p className="today-task-error" role="alert">{error}</p>}
    </>
  );
}
