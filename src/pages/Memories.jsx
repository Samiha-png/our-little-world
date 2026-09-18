import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  listenMemories,
  addMemory,
  deleteMemory,
  setMemoryReaction,
  todayKey,
} from "../services/data";
import "./Memories.css";

const REACTIONS = ["❤️", "🫂", "✨", "🥹", "😂"];

const EMPTY_FORM = () => ({
  title: "",
  date: todayKey(),
  text: "",
  caption: "",
  file: null,
});

export default function Memories({ ctx }) {
  const { spaceId, user, profile } = ctx;

  const [memories, setMemories] = useState([]);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("grid");
  const [active, setActive] = useState(null);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [reacting, setReacting] =
    useState(null);

  const [error, setError] =
    useState("");

  const [deleteError, setDeleteError] =
    useState("");


  /* =========================================================
     LOAD MEMORIES
  ========================================================= */

  useEffect(() => {
    if (!spaceId) return;

    const unsub =
      listenMemories(
        spaceId,
        setMemories
      );

    return () => {
      if (typeof unsub === "function") {
        unsub();
      }
    };
  }, [spaceId]);


  /* =========================================================
     KEEP ACTIVE MEMORY IN SYNC WITH FIRESTORE
  ========================================================= */

  useEffect(() => {
    if (!active) return;

    const freshMemory =
      memories.find(
        (memory) =>
          memory.id === active.id
      );

    if (!freshMemory) {
      setActive(null);
      return;
    }

    setActive(freshMemory);
  }, [memories]);


  /* =========================================================
     DISPLAY NAME
  ========================================================= */

  const myName =
    profile?.displayName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "You";


  /* =========================================================
     OPEN ADD MEMORY
  ========================================================= */

  function openAddMemory() {
    setError("");
    setForm(EMPTY_FORM());
    setOpen(true);
  }


  /* =========================================================
     CLOSE ADD MEMORY
  ========================================================= */

  function closeAddMemory() {
    if (saving) return;

    setOpen(false);
    setError("");
    setForm(EMPTY_FORM());
  }


  /* =========================================================
     FILE SELECT
  ========================================================= */

  function handleFileChange(e) {
    const file =
      e.target.files?.[0] ||
      null;

    setError("");

    setForm((prev) => ({
      ...prev,
      file,
    }));
  }


  /* =========================================================
     ADD MEMORY
  ========================================================= */

  async function handleAdd(e) {
    e.preventDefault();

    if (!spaceId || !user?.uid) {
      setError(
        "Your space is not ready yet. Please refresh and try again."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      await addMemory(
        spaceId,
        user.uid,
        myName,
        form
      );

      setForm(EMPTY_FORM());
      setOpen(false);
    } catch (error) {
      console.error(
        "Memory upload failed:",
        error
      );

      setError(
        error?.message ||
          "Could not save this memory. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }


  /* =========================================================
     REACTION
  ========================================================= */

  async function handleReaction(
    memoryId,
    reaction
  ) {
    if (
      !spaceId ||
      !user?.uid ||
      reacting
    ) {
      return;
    }

    setReacting(reaction);
    setDeleteError("");

    try {
      await setMemoryReaction(
        spaceId,
        memoryId,
        user.uid,
        reaction
      );
    } catch (error) {
      console.error(
        "Memory reaction failed:",
        error
      );

      setDeleteError(
        error?.message ||
          "Could not save reaction."
      );
    } finally {
      setReacting(null);
    }
  }


  /* =========================================================
     DELETE MEMORY
  ========================================================= */

  async function handleDeleteMemory() {
    if (
      !active ||
      !user?.uid ||
      deleting
    ) {
      return;
    }

    if (
      active.authorUid &&
      active.authorUid !== user.uid
    ) {
      setDeleteError(
        "You can only delete your own memories."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this memory? This will remove it from your shared memories."
      );

    if (!confirmed) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await deleteMemory(
        spaceId,
        active,
        user.uid
      );

      setActive(null);
    } catch (error) {
      console.error(
        "Delete memory failed:",
        error
      );

      setDeleteError(
        error?.message ||
          "Could not delete this memory."
      );
    } finally {
      setDeleting(false);
    }
  }


  /* =========================================================
     DATE FORMATTER
  ========================================================= */

  function formatDate(dateString) {
    if (!dateString) return "";

    const date =
      new Date(
        `${dateString}T00:00:00`
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return dateString;
    }

    return date.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }


  return (
    <div className="page-container memories-page">

      {/* =====================================================
          AMBIENT BACKGROUND
      ===================================================== */}

      <div className="memories-orb memories-orb-one" />
      <div className="memories-orb memories-orb-two" />


      {/* =====================================================
          HEADER
      ===================================================== */}

      <motion.header
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
        className="memories-header"
      >
        <div className="memories-heading-wrap">
          <p className="eyebrow">
            our memories
          </p>

          <h1 className="editorial-heading">
            Moments{" "}
            <em>we kept</em>
          </h1>

          <p className="memories-intro">
            Little pieces of us,
            saved here so they never
            have to disappear.
          </p>
        </div>


        <div className="memories-actions">

          <div
            className="memories-view-toggle"
            role="tablist"
          >
            <button
              type="button"
              className={
                view === "grid"
                  ? "is-active"
                  : ""
              }
              onClick={() =>
                setView("grid")
              }
            >
              <span>▦</span>
              Polaroids
            </button>

            <button
              type="button"
              className={
                view === "timeline"
                  ? "is-active"
                  : ""
              }
              onClick={() =>
                setView("timeline")
              }
            >
              <span>☷</span>
              Our Story
            </button>
          </div>


          <button
            type="button"
            className="memories-add"
            onClick={openAddMemory}
          >
            <span className="memories-add-icon">
              +
            </span>

            <span>
              Add memory
            </span>
          </button>

        </div>
      </motion.header>


      {/* =====================================================
          MEMORY COUNT
      ===================================================== */}

      {memories.length > 0 && (
        <motion.div
          className="memories-count"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
        >
          <span>
            {memories.length}
          </span>

          {memories.length === 1
            ? " moment saved"
            : " moments saved"}
        </motion.div>
      )}


      {/* =====================================================
          GRID VIEW
      ===================================================== */}

      {view === "grid" ? (
        <div className="memories-masonry">

          {memories.map(
            (memory, index) => (
              <motion.article
                key={memory.id}
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: Math.min(
                    index * 0.045,
                    0.35
                  ),
                }}
                className="memory-polaroid"
                onClick={() =>
                  setActive(memory)
                }
              >

                <div className="memory-photo">

                  {memory.imageUrl ? (
                    <img
                      src={memory.imageUrl}
                      alt={
                        memory.title ||
                        "Memory"
                      }
                      loading="lazy"
                    />
                  ) : (
                    <div className="memory-polaroid-blank">
                      <span>
                        {memory.title?.charAt(
                          0
                        ) || "♡"}
                      </span>
                    </div>
                  )}

                  <div className="memory-photo-overlay">
                    <span>
                      Open memory
                    </span>
                  </div>

                </div>


                <div className="memory-polaroid-info">

                  <p className="memory-polaroid-title">
                    {memory.title}
                  </p>

                  <div className="memory-polaroid-meta">

                    <span>
                      {formatDate(
                        memory.date
                      )}
                    </span>

                    {memory.authorName && (
                      <>
                        <span className="memory-meta-dot">
                          ·
                        </span>

                        <span>
                          {memory.authorName}
                        </span>
                      </>
                    )}

                  </div>

                </div>

              </motion.article>
            )
          )}


          {memories.length === 0 && (
            <motion.div
              className="memories-empty"
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              <div className="memories-empty-icon">
                ♡
              </div>

              <h3>
                Nothing saved yet
              </h3>

              <p>
                Your first little
                memory can start
                the collection.
              </p>

              <button
                type="button"
                onClick={
                  openAddMemory
                }
              >
                Add your first memory
              </button>
            </motion.div>
          )}

        </div>
      ) : (

        /* =====================================================
           TIMELINE VIEW
        ===================================================== */

        <div className="memories-timeline">

          {[
            ...memories,
          ]
            .sort((a, b) =>
              a.date > b.date
                ? 1
                : -1
            )
            .map(
              (memory, index) => (
                <motion.article
                  key={memory.id}
                  initial={{
                    opacity: 0,
                    x: -18,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.045,
                  }}
                  className="timeline-item"
                >

                  <div className="timeline-marker">
                    <div className="timeline-dot" />
                  </div>

                  <div
                    className="timeline-content"
                    onClick={() =>
                      setActive(memory)
                    }
                  >

                    <div className="timeline-content-top">

                      <p className="timeline-date">
                        {formatDate(
                          memory.date
                        )}
                      </p>

                      <span className="timeline-open">
                        View →
                      </span>

                    </div>

                    <p className="timeline-title">
                      {memory.title}
                    </p>

                    {memory.caption && (
                      <p className="timeline-caption">
                        {memory.caption}
                      </p>
                    )}

                    <div className="timeline-author">
                      <span className="timeline-author-dot" />

                      {memory.authorName ||
                        "You"}
                    </div>

                  </div>

                </motion.article>
              )
            )}


          {memories.length === 0 && (
            <div className="memories-empty">
              <div className="memories-empty-icon">
                ♡
              </div>

              <h3>
                The story starts here
              </h3>

              <p>
                Add a memory and
                watch your story grow.
              </p>

              <button
                type="button"
                onClick={
                  openAddMemory
                }
              >
                Add memory
              </button>
            </div>
          )}

        </div>
      )}


      {/* =====================================================
          VIEW MEMORY MODAL
      ===================================================== */}

      <AnimatePresence>
        {active && (
          <motion.div
            className="memory-modal-backdrop"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() =>
              setActive(null)
            }
          >

            <motion.div
              className="memory-modal memory-view-modal"
              initial={{
                scale: 0.94,
                y: 18,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                y: 0,
                opacity: 1,
              }}
              exit={{
                scale: 0.94,
                y: 18,
                opacity: 0,
              }}
              transition={{
                duration: 0.25,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* Modal top */}

              <div className="memory-modal-topbar">

                <div className="memory-modal-label">
                  a moment we kept
                </div>

                <button
                  type="button"
                  className="memory-modal-close"
                  onClick={() =>
                    setActive(null)
                  }
                  aria-label="Close"
                >
                  ×
                </button>

              </div>


              {/* Image */}

              {active.imageUrl ? (
                <div className="memory-modal-image-wrap">
                  <img
                    src={active.imageUrl}
                    alt={
                      active.title ||
                      "Memory"
                    }
                  />
                </div>
              ) : (
                <div className="memory-modal-image-placeholder">
                  <span>
                    {active.title?.charAt(
                      0
                    ) || "♡"}
                  </span>
                </div>
              )}


              {/* Content */}

              <div className="memory-modal-content">

                <div className="memory-modal-heading">

                  <div>
                    <h2>
                      {active.title}
                    </h2>

                    <p className="memory-modal-date">
                      {formatDate(
                        active.date
                      )}
                      <span> · </span>
                      {active.authorName ||
                        "You"}
                    </p>
                  </div>

                </div>


                {active.caption && (
                  <p className="memory-modal-caption">
                    {active.caption}
                  </p>
                )}


                {active.text && (
                  <div className="memory-modal-story">
                    <span className="memory-story-mark">
                      “
                    </span>

                    <p>
                      {active.text}
                    </p>
                  </div>
                )}


                {/* Reactions */}

                <div className="memory-reaction-section">

                  <span className="memory-reaction-label">
                    leave a little feeling
                  </span>

                  <div className="memory-modal-reactions">

                    {REACTIONS.map(
                      (reaction) => {
                        const picked =
                          active.reactions?.[
                            user?.uid
                          ] === reaction;

                        return (
                          <button
                            key={reaction}
                            type="button"
                            className={
                              picked
                                ? "is-picked"
                                : ""
                            }
                            disabled={
                              !!reacting
                            }
                            onClick={() =>
                              handleReaction(
                                active.id,
                                reaction
                              )
                            }
                          >
                            <span>
                              {reaction}
                            </span>
                          </button>
                        );
                      }
                    )}

                  </div>

                </div>


                {/* Bottom actions */}

                <div className="memory-modal-footer">

                  <div className="memory-footer-note">
                    <span>♡</span>
                    kept between us
                  </div>


                  {active.authorUid ===
                    user?.uid && (
                    <button
                      type="button"
                      className="memory-delete-btn"
                      onClick={
                        handleDeleteMemory
                      }
                      disabled={
                        deleting
                      }
                    >
                      {deleting
                        ? "Deleting…"
                        : "Delete memory"}
                    </button>
                  )}

                </div>


                {deleteError && (
                  <p className="memory-delete-error">
                    {deleteError}
                  </p>
                )}

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
            className="memory-modal-backdrop"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={closeAddMemory}
          >

            <motion.div
              className="memory-modal memory-add-modal"
              initial={{
                scale: 0.94,
                y: 18,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                y: 0,
                opacity: 1,
              }}
              exit={{
                scale: 0.94,
                y: 18,
                opacity: 0,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* Header */}

              <div className="memory-form-header">

                <div>
                  <p className="memory-form-eyebrow">
                    save a moment
                  </p>

                  <h2>
                    Add to our story
                  </h2>

                  <p>
                    Give this little
                    moment a place to
                    stay.
                  </p>
                </div>

                <button
                  type="button"
                  className="memory-modal-close"
                  onClick={
                    closeAddMemory
                  }
                  disabled={saving}
                  aria-label="Close"
                >
                  ×
                </button>

              </div>


              {/* Form */}

              <form
                onSubmit={handleAdd}
                className="memory-form"
              >

                <div className="memory-form-grid">

                  {/* Title */}

                  <label className="memory-field memory-field-full">

                    <span>
                      Title
                    </span>

                    <input
                      type="text"
                      placeholder="The day we..."
                      value={
                        form.title
                      }
                      onChange={(e) =>
                        setForm(
                          (prev) => ({
                            ...prev,
                            title:
                              e.target
                                .value,
                          })
                        )
                      }
                      required
                    />

                  </label>


                  {/* Date */}

                  <label className="memory-field">

                    <span>
                      Date
                    </span>

                    <input
                      type="date"
                      value={
                        form.date
                      }
                      onChange={(e) =>
                        setForm(
                          (prev) => ({
                            ...prev,
                            date:
                              e.target
                                .value,
                          })
                        )
                      }
                    />

                  </label>


                  {/* Caption */}

                  <label className="memory-field">

                    <span>
                      Caption
                    </span>

                    <input
                      type="text"
                      placeholder="A tiny reminder..."
                      value={
                        form.caption
                      }
                      onChange={(e) =>
                        setForm(
                          (prev) => ({
                            ...prev,
                            caption:
                              e.target
                                .value,
                          })
                        )
                      }
                    />

                  </label>


                  {/* Story */}

                  <label className="memory-field memory-field-full">

                    <span>
                      The story
                    </span>

                    <textarea
                      placeholder="Tell us what made this moment special..."
                      rows={5}
                      value={
                        form.text
                      }
                      onChange={(e) =>
                        setForm(
                          (prev) => ({
                            ...prev,
                            text:
                              e.target
                                .value,
                          })
                        )
                      }
                    />

                  </label>


                  {/* Upload */}

                  <label className="memory-upload-field memory-field-full">

                    <span className="memory-upload-label">
                      Photo
                    </span>

                    <div className="memory-upload-box">

                      <input
                        type="file"
                        accept="image/*"
                        onChange={
                          handleFileChange
                        }
                        disabled={
                          saving
                        }
                      />

                      <div className="memory-upload-icon">
                        ↑
                      </div>

                      <strong>
                        {form.file
                          ? "Photo selected"
                          : "Choose a photo"}
                      </strong>

                      <small>
                        {form.file
                          ? form.file
                              .name
                          : "JPG, PNG, WEBP · up to 10 MB"}
                      </small>

                    </div>

                  </label>

                </div>


                {error && (
                  <div className="memory-form-error">
                    <span>!</span>
                    {error}
                  </div>
                )}


                <div className="memory-form-footer">

                  <button
                    type="button"
                    className="memory-cancel-btn"
                    onClick={
                      closeAddMemory
                    }
                    disabled={
                      saving
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="memory-submit-btn"
                    disabled={
                      saving
                    }
                  >
                    {saving ? (
                      <>
                        <span className="memory-spinner" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Save memory
                        <span>
                          →
                        </span>
                      </>
                    )}
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