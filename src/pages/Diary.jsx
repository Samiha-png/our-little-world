import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";

import {
  listenDiaryEntries,
  saveDiaryEntry,
  savePrivateMood,
  setSharedMoodStatus,
  todayKey,
  listenNotes,
  addNote,
  deleteNote,
} from "../services/data";

import "./Diary.css";

const MOODS = [
  "😊",
  "😌",
  "😔",
  "😤",
  "🥹",
  "😴",
  "🤔",
  "🥰",
];

export default function Diary({ ctx }) {
  const { user, spaceId, profile } = ctx;

  const [entries, setEntries] = useState([]);
  const [notes, setNotes] = useState([]);

  const [mood, setMood] = useState(null);
  const [whatHappened, setWhatHappened] = useState("");
  const [thinking, setThinking] = useState("");
  const [remember, setRemember] = useState("");

  const [noteText, setNoteText] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  const dateStr = todayKey();

  const myName =
    profile?.displayName ||
    user.email?.split("@")[0] ||
    "You";

  /* =========================
     DIARY LISTENER
  ========================= */

  useEffect(() => {
    if (!user?.uid) return undefined;

    const unsub = listenDiaryEntries(
      user.uid,
      setEntries
    );

    return unsub;
  }, [user?.uid]);

  /* =========================
     NOTES LISTENER
  ========================= */

  useEffect(() => {
    if (!spaceId) return undefined;

    const unsub = listenNotes(
      spaceId,
      setNotes
    );

    return unsub;
  }, [spaceId]);

  /* =========================
     LOAD TODAY'S ENTRY
  ========================= */

  useEffect(() => {
    const today = entries.find(
      (entry) => entry.id === dateStr
    );

    if (!today) return;

    setMood(today.mood || null);
    setWhatHappened(
      today.whatHappened || ""
    );
    setThinking(
      today.thinking || ""
    );
    setRemember(
      today.remember || ""
    );
  }, [entries, dateStr]);

  /* =========================
     SAVE DIARY
  ========================= */

  async function handleSave(e) {
    e.preventDefault();

    if (saving) return;

    setSaving(true);

    try {
      if (mood) {
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
          ),
        ]);
      }

      await saveDiaryEntry(
        user.uid,
        dateStr,
        {
          mood,
          whatHappened:
            whatHappened.trim(),
          thinking:
            thinking.trim(),
          remember:
            remember.trim(),
        }
      );

      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2200);
    } catch (error) {
      console.error(
        "[Diary] save failed",
        error
      );

      window.alert(
        error?.message ||
          "Couldn't save your diary entry."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================
     NOTES
  ========================= */

  async function handleAddNote(e) {
    e.preventDefault();

    const text = noteText.trim();

    if (
      !text ||
      addingNote ||
      !spaceId
    ) {
      return;
    }

    setAddingNote(true);

    try {
      await addNote(
        spaceId,
        user.uid,
        myName,
        text
      );

      setNoteText("");
    } catch (error) {
      console.error(
        "[Diary] add note failed",
        error
      );

      window.alert(
        error?.message ||
          "Couldn't save this note."
      );
    } finally {
      setAddingNote(false);
    }
  }

  async function handleDeleteNote(note) {
    if (deletingNoteId) return;

    const confirmed = window.confirm(
      "Delete this note?"
    );

    if (!confirmed) return;

    setDeletingNoteId(note.id);

    try {
      await deleteNote(
        spaceId,
        note.id
      );
    } catch (error) {
      console.error(
        "[Diary] delete note failed",
        error
      );

      window.alert(
        error?.message ||
          "Couldn't delete this note."
      );
    } finally {
      setDeletingNoteId(null);
    }
  }

  const pastEntries = entries.filter(
    (entry) => entry.id !== dateStr
  );

  return (
    <div className="page-container diary-page">

      {/* =========================
          HEADER
      ========================= */}

      <motion.header
        className="diary-header"
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.55,
        }}
      >
        <div>
          <p className="eyebrow">
            OUR LITTLE WORLD
          </p>

          <h1 className="editorial-heading">
            Your <em>Diary</em>
          </h1>

          <p className="diary-subtitle">
            A quiet place for the things
            you want to remember.
          </p>
        </div>

        <div className="diary-date-badge">
          <span>today</span>
          <strong>{dateStr}</strong>
        </div>
      </motion.header>

      {/* =========================
          MAIN DIARY
      ========================= */}

      <motion.section
        initial={{
          opacity: 0,
          y: 22,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.1,
          duration: 0.55,
        }}
      >
        <GlassCard
          accent="samiha"
          className="diary-compose"
        >
          <div className="diary-compose-head">
            <div>
              <p className="eyebrow">
                today&apos;s reflection
              </p>

              <h2>
                How was your{" "}
                <em>day?</em>
              </h2>
            </div>

            {saved && (
              <span className="diary-saved-badge">
                Saved ✓
              </span>
            )}
          </div>

          {/* MOODS */}

          <div className="diary-mood-section">
            <span className="diary-field-title">
              How are you feeling?
            </span>

            <div className="diary-moods">
              {MOODS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    "diary-mood" +
                    (mood === item
                      ? " is-active"
                      : "")
                  }
                  onClick={() =>
                    setMood(item)
                  }
                  aria-label={`Mood ${item}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* FORM */}

          <form
            onSubmit={handleSave}
            className="diary-form"
          >
            <label className="diary-field">
              <span>
                What happened today?
              </span>

              <textarea
                rows={4}
                value={whatHappened}
                onChange={(e) =>
                  setWhatHappened(
                    e.target.value
                  )
                }
                placeholder="Write about your day..."
                disabled={saving}
              />
            </label>

            <label className="diary-field">
              <span>
                What am I thinking about?
              </span>

              <textarea
                rows={4}
                value={thinking}
                onChange={(e) =>
                  setThinking(
                    e.target.value
                  )
                }
                placeholder="Anything on your mind..."
                disabled={saving}
              />
            </label>

            <label className="diary-field">
              <span>
                What do I want to remember?
              </span>

              <textarea
                rows={3}
                value={remember}
                onChange={(e) =>
                  setRemember(
                    e.target.value
                  )
                }
                placeholder="A little moment worth keeping..."
                disabled={saving}
              />
            </label>

            <div className="diary-form-footer">
              <span>
                Your diary is private.
              </span>

              <button
                type="submit"
                className="diary-save"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : saved
                  ? "Saved ✓"
                  : "Save entry"}
              </button>
            </div>
          </form>
        </GlassCard>
      </motion.section>

      {/* =========================
          SHARED NOTES
      ========================= */}

      <motion.section
        className="diary-notes-section"
        initial={{
          opacity: 0,
          y: 22,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.18,
          duration: 0.55,
        }}
      >
        <div className="diary-section-heading">
          <div>
            <p className="eyebrow">
              little things
            </p>

            <h2>
              Our <em>Notes</em>
            </h2>

            <p>
              Small thoughts, reminders and
              things worth leaving for each
              other.
            </p>
          </div>

          <span className="notes-count">
            {notes.length}{" "}
            {notes.length === 1
              ? "note"
              : "notes"}
          </span>
        </div>

        <GlassCard
          accent="gold"
          className="notes-compose-card"
        >
          <form
            className="notes-form"
            onSubmit={handleAddNote}
          >
            <div className="notes-input-wrap">
              <span className="notes-input-icon">
                ✦
              </span>

              <input
                value={noteText}
                onChange={(e) =>
                  setNoteText(
                    e.target.value
                  )
                }
                placeholder="Leave a little note..."
                disabled={addingNote}
                maxLength={500}
              />
            </div>

            <button
              type="submit"
              disabled={
                addingNote ||
                !noteText.trim()
              }
            >
              {addingNote
                ? "Saving..."
                : "Add note"}
            </button>
          </form>
        </GlassCard>

        <div className="notes-list">
          {notes.map(
            (note, index) => {
              const mine =
                note.authorUid ===
                user.uid;

              return (
                <motion.div
                  key={note.id}
                  initial={{
                    opacity: 0,
                    y: 14,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.04,
                  }}
                >
                  <GlassCard
                    accent={
                      mine
                        ? "samiha"
                        : "him"
                    }
                    className="note-card"
                  >
                    <div className="note-card-top">
                      <div className="note-author">
                        <span className="note-dot" />

                        <strong>
                          {note.authorName ||
                            "Someone"}
                        </strong>
                      </div>

                      {mine && (
                        <button
                          type="button"
                          className="note-delete"
                          onClick={() =>
                            handleDeleteNote(
                              note
                            )
                          }
                          disabled={
                            deletingNoteId ===
                            note.id
                          }
                          aria-label="Delete note"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <p className="note-text">
                      {note.text}
                    </p>

                    <span className="note-date">
                      {formatNoteDate(
                        note.createdAt
                      )}
                    </span>
                  </GlassCard>
                </motion.div>
              );
            }
          )}

          {notes.length === 0 && (
            <div className="notes-empty">
              <span>✦</span>

              <h3>
                No little notes yet
              </h3>

              <p>
                Leave the first one here.
                It will be shared with
                your space.
              </p>
            </div>
          )}
        </div>
      </motion.section>

      {/* =========================
          HISTORY
      ========================= */}

      {pastEntries.length > 0 && (
        <section className="diary-history">
          <div className="diary-section-heading">
            <div>
              <p className="eyebrow">
                your memories
              </p>

              <h2>
                Previous{" "}
                <em>entries</em>
              </h2>
            </div>

            <span className="notes-count">
              {pastEntries.length}
            </span>
          </div>

          <div className="diary-history-grid">
            {pastEntries.map(
              (entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{
                    opacity: 0,
                    y: 16,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.04,
                  }}
                >
                  <GlassCard
                    accent="samiha"
                    className="diary-entry-card"
                  >
                    <div className="diary-entry-head">
                      <span className="diary-history-mood">
                        {entry.mood ||
                          "♡"}
                      </span>

                      <span className="diary-entry-date">
                        {entry.date ||
                          entry.id}
                      </span>
                    </div>

                    {entry.whatHappened && (
                      <p className="diary-entry-text">
                        {
                          entry.whatHappened
                        }
                      </p>
                    )}

                    {entry.thinking && (
                      <div className="history-mini-block">
                        <span>
                          thinking
                        </span>

                        <p>
                          {entry.thinking}
                        </p>
                      </div>
                    )}

                    {entry.remember && (
                      <div className="history-mini-block">
                        <span>
                          remember
                        </span>

                        <p>
                          {entry.remember}
                        </p>
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* =========================
   NOTE DATE
