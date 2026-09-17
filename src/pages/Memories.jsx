import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../components/GlassCard";
import {
  listenMemories,
  addMemory,
  setMemoryReaction,
  todayKey,
} from "../services/data";
import "./Memories.css";

const REACTIONS = ["❤️", "🫂", "✨", "🥹", "😂"];

export default function Memories({ ctx }) {
  const { spaceId, user, profile } = ctx;

  const [memories, setMemories] = useState([]);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("grid");
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({
    title: "",
    date: todayKey(),
    text: "",
    caption: "",
    file: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!spaceId) return;

    const unsub = listenMemories(spaceId, setMemories);

    return unsub;
  }, [spaceId]);

  const myName =
    profile?.displayName ||
    user.email.split("@")[0];

  async function handleAdd(e) {
    e.preventDefault();

    setSaving(true);

    try {
      await addMemory(
        spaceId,
        user.uid,
        myName,
        form
      );

      setForm({
        title: "",
        date: todayKey(),
        text: "",
        caption: "",
        file: null,
      });

      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-container memory-vault-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <motion.header
        className="memory-vault-header"
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
      >
        <div className="memory-vault-heading">

          <p className="memory-vault-eyebrow">
            OUR MEMORIES
          </p>

          <h1 className="memory-vault-title">
            Moments{" "}
            <em>we kept</em>
          </h1>

          <p className="memory-vault-subtitle">
            Little pieces of our story, kept here.
          </p>

        </div>

        <div className="memory-vault-actions">

          <div className="memory-vault-view-toggle">

            <button
              type="button"
              className={
                view === "grid"
                  ? "memory-vault-toggle-active"
                  : ""
              }
              onClick={() => setView("grid")}
            >
              <span>✦</span>
              Polaroids
            </button>

            <button
              type="button"
              className={
                view === "timeline"
                  ? "memory-vault-toggle-active"
                  : ""
              }
              onClick={() =>
                setView("timeline")
              }
            >
              <span>⌁</span>
              Our Story
            </button>

          </div>

          <button
            type="button"
            className="memory-vault-add"
            onClick={() => setOpen(true)}
          >
            <span>+</span>
            Add memory
          </button>

        </div>
      </motion.header>

      {/* =====================================================
          MEMORY COUNT
      ===================================================== */}

      <motion.div
        className="memory-vault-meta"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 0.2,
        }}
      >
        <span className="memory-vault-meta-line" />

        <span>
          {memories.length}{" "}
          {memories.length === 1
            ? "memory"
            : "memories"}
        </span>

        <span className="memory-vault-meta-heart">
          ♡
        </span>

        <span className="memory-vault-meta-line" />
      </motion.div>

      {/* =====================================================
          POLAROID GRID
      ===================================================== */}

      {view === "grid" ? (
        <div className="memory-vault-grid">

          {memories.map((m, i) => (
            <motion.article
              key={m.id}
              className="memory-vault-polaroid"
              initial={{
                opacity: 0,
                y: 25,
                rotate: i % 2 === 0 ? -1.2 : 1.2,
              }}
              animate={{
                opacity: 1,
                y: 0,
                rotate: i % 2 === 0 ? -1.2 : 1.2,
              }}
              transition={{
                delay: Math.min(
                  i * 0.06,
                  0.5
                ),
                duration: 0.45,
              }}
              whileHover={{
                y: -8,
                rotate: 0,
              }}
              onClick={() => setActive(m)}
            >

              <div className="memory-vault-photo">

                {m.imageUrl ? (
                  <img
                    src={m.imageUrl}
                    alt={m.title}
                  />
                ) : (
                  <div className="memory-vault-photo-empty">
                    <span>
                      {m.title?.charAt(0) || "♡"}
                    </span>
                    <small>
                      A little memory
                    </small>
                  </div>
                )}

                <div className="memory-vault-photo-shine" />

              </div>

              <div className="memory-vault-polaroid-info">

                <p className="memory-vault-polaroid-title">
                  {m.title}
                </p>

                {m.caption && (
                  <p className="memory-vault-polaroid-caption">
                    {m.caption}
                  </p>
                )}

                <div className="memory-vault-polaroid-bottom">
                  <span>
                    {m.date}
                  </span>

                  <span>
                    ♡
                  </span>
                </div>

              </div>

            </motion.article>
          ))}

          {memories.length === 0 && (
            <div className="memory-vault-empty">
              <div className="memory-vault-empty-icon">
                ♡
              </div>

              <h3>
                Your story starts here
              </h3>

              <p>
                Add your first little memory
                and keep it forever.
              </p>

              <button
                type="button"
                onClick={() => setOpen(true)}
              >
                + Add first memory
              </button>
            </div>
          )}

        </div>
      ) : (

        /* ===================================================
           TIMELINE
        =================================================== */

        <div className="memory-vault-timeline">

          {[...memories]
            .sort((a, b) =>
              a.date > b.date ? 1 : -1
            )
            .map((m, i) => (
              <motion.article
                key={m.id}
                className="memory-vault-timeline-item"
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: i * 0.05,
                }}
              >

                <div className="memory-vault-timeline-marker">
                  <span />
                </div>

                <div
                  className="memory-vault-timeline-card"
                  onClick={() =>
                    setActive(m)
                  }
                >

                  <div className="memory-vault-timeline-date">
                    {m.date}
                  </div>

                  <div className="memory-vault-timeline-main">

                    {m.imageUrl && (
                      <img
                        src={m.imageUrl}
                        alt={m.title}
                      />
                    )}

                    <div>
                      <h3>
                        {m.title}
                      </h3>

                      {m.caption && (
                        <p>
                          {m.caption}
                        </p>
                      )}

                      {m.text && (
                        <span>
                          {m.text}
                        </span>
                      )}
                    </div>

                  </div>

                </div>

              </motion.article>
            ))}

          {memories.length === 0 && (
            <div className="memory-vault-empty">
              <div className="memory-vault-empty-icon">
                ♡
              </div>

              <h3>
                The story hasn't started yet
              </h3>

              <p>
                Your first memory will appear here.
              </p>

              <button
                type="button"
                onClick={() => setOpen(true)}
              >
                + Add memory
              </button>
            </div>
          )}

        </div>
      )}

      {/* =====================================================
          MEMORY VIEW MODAL
      ===================================================== */}

      <AnimatePresence>
        {active && (
          <motion.div
            className="memory-vault-modal-backdrop"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() => setActive(null)}
          >

            <motion.div
              className="memory-vault-modal"
              initial={{
                scale: 0.92,
                opacity: 0,
                y: 20,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
              }}
              exit={{
                scale: 0.92,
                opacity: 0,
                y: 20,
              }}
              transition={{
                duration: 0.3,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <button
                type="button"
                className="memory-vault-modal-close"
                onClick={() =>
                  setActive(null)
                }
              >
                ×
              </button>

              {active.imageUrl && (
                <div className="memory-vault-modal-image">
                  <img
                    src={active.imageUrl}
                    alt={active.title}
                  />
                </div>
              )}

              <div className="memory-vault-modal-content">

                <p className="memory-vault-modal-eyebrow">
                  MEMORY
                </p>

                <h2>
                  {active.title}
                </h2>

                <p className="memory-vault-modal-date">
                  {active.date}
                  {" · "}
                  {active.authorName}
                </p>

                {active.caption && (
                  <p className="memory-vault-modal-caption">
                    {active.caption}
                  </p>
                )}

                {active.text && (
                  <p className="memory-vault-modal-text">
                    {active.text}
                  </p>
                )}

                <div className="memory-vault-modal-reactions">

                  <span>
                    Leave a little love
                  </span>

                  <div>
                    {REACTIONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={
                          active.reactions?.[
                            user.uid
                          ] === r
                            ? "memory-vault-reaction-picked"
                            : ""
                        }
                        onClick={() =>
                          setMemoryReaction(
                            spaceId,
                            active.id,
                            user.uid,
                            r
                          )
                        }
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                </div>

              </div>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          ADD MEMORY MODAL
      ===================================================== */}

      <AnimatePresence>
        {open && (
          <motion.div
            className="memory-vault-modal-backdrop"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() => setOpen(false)}
          >

            <motion.div
              className="memory-vault-add-modal"
              initial={{
                scale: 0.92,
                opacity: 0,
                y: 20,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
              }}
              exit={{
                scale: 0.92,
                opacity: 0,
                y: 20,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="memory-vault-add-header">

                <div>
                  <p>
                    KEEP THIS MOMENT
                  </p>

                  <h2>
                    Add a memory
                  </h2>

                  <span>
                    Save a little piece of today.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setOpen(false)
                  }
                >
                  ×
                </button>

              </div>

              <form
                onSubmit={handleAdd}
                className="memory-vault-form"
              >

                <label>
                  <span>Title</span>

                  <input
                    placeholder="The day we..."
                    value={form.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label>
                  <span>Date</span>

                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        date: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  <span>Your story</span>

                  <textarea
                    placeholder="Tell the story…"
                    rows={4}
                    value={form.text}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        text: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  <span>Caption</span>

                  <input
                    placeholder="A little note..."
                    value={form.caption}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        caption: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="memory-vault-file-field">
                  <span>Photo</span>

                  <div className="memory-vault-file-box">
                    <span>
                      {form.file
                        ? form.file.name
                        : "Choose a photo"}
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          file:
                            e.target.files?.[0] ||
                            null,
                        })
                      }
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  className="memory-vault-save"
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : "Keep this memory"}
                </button>

              </form>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
