import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../components/GlassCard";
import { listenNotes, addNote, deleteNote, todayKey } from "../services/data";
import "./Diary.css";

const MOODS = ["💌", "🥰", "🥹", "😊", "✨", "😌", "💭", "🌙"];

export default function Diary({ ctx }) {
  const { user, profile, spaceId, partner } = ctx;
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [openCompose, setOpenCompose] = useState(false);
  const [mood, setMood] = useState("💌");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const myName = profile?.displayName || user?.email?.split("@")[0] || "Me";

  useEffect(() => {
    if (!spaceId) return;
    const unsub = listenNotes(spaceId, setNotes, (err) => {
      console.error("[Diary] Listener error:", err);
    });
    return unsub;
  }, [spaceId]);

  // Keep active note updated in sync with live notes collection
  useEffect(() => {
    if (activeNote) {
      const fresh = notes.find((n) => n.id === activeNote.id);
      if (fresh) setActiveNote(fresh);
    }
  }, [notes]);

  async function handleSaveNote(e) {
    e.preventDefault();
    if (!text.trim() && !title.trim()) {
      setError("Please write something for your note.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await addNote(spaceId, user.uid, myName, {
        title: title.trim(),
        text: text.trim(),
        mood,
        date: todayKey()
      });
      setTitle("");
      setText("");
      setMood("💌");
      setOpenCompose(false);
    } catch (err) {
      console.error("[Diary] Save note error:", err);
      setError(err.message || "Failed to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteNote(noteId) {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    setDeleting(true);
    try {
      await deleteNote(spaceId, noteId);
      setActiveNote(null);
    } catch (err) {
      console.error("[Diary] Delete note error:", err);
      alert("Failed to delete note. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="page-container diary-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="diary-header">
        <div>
          <p className="eyebrow">our shared diary & letters</p>
          <h1 className="editorial-heading">
            Notes <em>we wrote</em>
          </h1>
        </div>
        <button className="diary-add-btn" onClick={() => { setError(null); setOpenCompose(true); }}>
          + Write a note
        </button>
      </motion.div>

      {/* NOTES COLLECTION GRID */}
      <div className="diary-notes-grid">
        {notes.map((note, i) => {
          const isMine = note.authorUid === user.uid;
          return (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className="diary-note-item"
              onClick={() => setActiveNote(note)}
            >
              <GlassCard accent={isMine ? "samiha" : "his"} className="diary-note-card">
                <div className="diary-note-head">
                  <span className="diary-note-mood">{note.mood || "💌"}</span>
                  <span className="diary-note-date">{note.date}</span>
                </div>
                <h3 className="diary-note-title">{note.title || "Untitled Note"}</h3>
                {note.text && <p className="diary-note-snippet">{note.text}</p>}
                <div className="diary-note-author-tag">
                  Written by <strong>{note.authorName || (isMine ? myName : (partner?.displayName || "Partner"))}</strong>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {notes.length === 0 && (
        <div className="diary-empty-state">
          <p>No notes written yet. Leave the first letter for your favorite person! 💌</p>
        </div>
      )}

      {/* NOTE READER MODAL (Opens like Polaroid Modal) */}
      <AnimatePresence>
        {activeNote && (
          <motion.div
            className="diary-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveNote(null)}
          >
            <motion.div
              className="diary-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="diary-modal-top">
                <span className="diary-modal-mood">{activeNote.mood || "💌"}</span>
                <span className="diary-modal-date">{activeNote.date}</span>
              </div>

              <h2 className="diary-modal-title">{activeNote.title || "Note"}</h2>

              <p className="diary-modal-author">
                Written with love by <strong>{activeNote.authorName || "Partner"}</strong>
              </p>

              <div className="diary-modal-body">
                {activeNote.text}
              </div>

              <div className="diary-modal-footer">
                <button
                  className="diary-delete-btn"
                  onClick={() => handleDeleteNote(activeNote.id)}
                  disabled={deleting}
                  title="Delete note"
                >
                  {deleting ? "Deleting…" : "Delete note"}
                </button>
                <button className="diary-close-btn" onClick={() => setActiveNote(null)}>
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPOSE NOTE MODAL */}
      <AnimatePresence>
        {openCompose && (
          <motion.div
            className="diary-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenCompose(false)}
          >
            <motion.div
              className="diary-modal diary-compose-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="diary-modal-title">Write a Note 💌</h2>
              <p className="diary-modal-sub">Leave a letter, a memory, or a loving message.</p>

              <div className="diary-moods-row">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={"diary-mood-pill" + (mood === m ? " is-active" : "")}
                    onClick={() => setMood(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSaveNote} className="diary-compose-form">
                <input
                  type="text"
                  placeholder="Title / Topic (e.g. To my favorite person…)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="diary-input"
                />

                <textarea
                  rows={5}
                  placeholder="Write your note or letter here…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="diary-textarea"
                  required
                />

                {error && (
                  <div className="diary-error-box">
                    {error}
                  </div>
                )}

                <div className="diary-compose-actions">
                  <button type="button" className="diary-cancel-btn" onClick={() => setOpenCompose(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="diary-save-btn" disabled={saving}>
                    {saving ? "Saving note…" : "Leave note 💌"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
