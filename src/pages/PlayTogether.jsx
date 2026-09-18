import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  listenWishes,
  addWish,
  toggleWishCompleted,
  deleteWish,
  updateWish,
} from "../services/data";
import "./PlayTogether.css";

const CATEGORIES = [
  { id: "date", label: "Date", icon: "♡" },
  { id: "place", label: "Place", icon: "⌂" },
  { id: "food", label: "Food", icon: "♨" },
  { id: "fun", label: "Fun", icon: "✦" },
  { id: "memory", label: "Memory", icon: "◌" },
  { id: "random", label: "Random", icon: "✧" },
];

function getCategory(category) {
  return (
    CATEGORIES.find((item) => item.id === category) ||
    CATEGORIES.find((item) => item.id === "random")
  );
}

function formatDate(timestamp) {
  if (!timestamp) return "";

  try {
    const date = timestamp?.toDate
      ? timestamp.toDate()
      : new Date(timestamp);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function PlayTogether({ ctx }) {
  const { spaceId, user, profile } = ctx || {};

  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingWish, setEditingWish] = useState(null);

  const [selectedWish, setSelectedWish] = useState(null);
  const [pickedWish, setPickedWish] = useState(null);

  const [wishText, setWishText] = useState("");
  const [category, setCategory] = useState("random");

  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!spaceId) {
      setWishes([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = listenWishes(spaceId, (items) => {
      setWishes(items || []);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [spaceId]);

  const activeWishes = useMemo(
    () => wishes.filter((wish) => !wish.completed),
    [wishes]
  );

  const completedWishes = useMemo(
    () => wishes.filter((wish) => wish.completed),
    [wishes]
  );

  const progress = wishes.length
    ? Math.round((completedWishes.length / wishes.length) * 100)
    : 0;

  const openAdd = () => {
    setEditingWish(null);
    setWishText("");
    setCategory("random");
    setError("");
    setShowModal(true);
  };

  const openEdit = (wish) => {
    setEditingWish(wish);
    setWishText(wish.text || "");
    setCategory(wish.category || "random");
    setError("");
    setSelectedWish(null);
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingWish(null);
    setWishText("");
    setCategory("random");
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const cleanText = wishText.trim();

    if (!cleanText) {
      setError("Write your wish first.");
      return;
    }

    if (!spaceId || !user?.uid) {
      setError("Your shared space is not ready yet.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const displayName =
        profile?.displayName ||
        user?.displayName ||
        "You";

      if (editingWish) {
        await updateWish(spaceId, editingWish.id, {
          text: cleanText,
          category,
        });
      } else {
        await addWish(
          spaceId,
          user.uid,
          displayName,
          {
            text: cleanText,
            category,
          }
        );
      }

      closeModal();
    } catch (err) {
      console.error("Wish save error:", err);
      setError(
        err?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (wish) => {
    if (!spaceId) return;

    setActionId(wish.id);

    try {
      await toggleWishCompleted(
        spaceId,
        wish.id,
        !wish.completed
      );

      if (selectedWish?.id === wish.id) {
        setSelectedWish(null);
      }
    } catch (err) {
      console.error("Wish completion error:", err);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (wish) => {
    if (!spaceId) return;

    const confirmed = window.confirm(
      "Delete this wish?"
    );

    if (!confirmed) return;

    setActionId(wish.id);

    try {
      await deleteWish(spaceId, wish.id);

      if (selectedWish?.id === wish.id) {
        setSelectedWish(null);
      }

      if (pickedWish?.id === wish.id) {
        setPickedWish(null);
      }
    } catch (err) {
      console.error("Wish delete error:", err);
    } finally {
      setActionId(null);
    }
  };

  const pickRandomWish = () => {
    if (!activeWishes.length) {
      setPickedWish(null);
      return;
    }

    const randomIndex = Math.floor(
      Math.random() * activeWishes.length
    );

    setPickedWish(activeWishes[randomIndex]);
  };

  return (
    <main className="wish-page">
      <div className="wish-background">
        <span className="wish-orb wish-orb-one" />
        <span className="wish-orb wish-orb-two" />
        <span className="wish-orb wish-orb-three" />
      </div>

      <section className="wish-container">
        {/* HEADER */}
        <motion.header
          className="wish-header"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <span className="wish-eyebrow">
              SOMETHING FOR US
            </span>

            <h1>
              Our <span>Wish Jar</span>
            </h1>

            <p>
              Little dreams, random plans and things
              we want to experience together.
            </p>
          </div>

          <motion.button
            className="wish-add-button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openAdd}
          >
            <span>＋</span>
            Add Wish
          </motion.button>
        </motion.header>

        {/* STATS */}
        <motion.section
          className="wish-stats"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="wish-stat">
            <strong>{activeWishes.length}</strong>
            <span>Dreams waiting</span>
          </div>

          <div className="wish-stat">
            <strong>{completedWishes.length}</strong>
            <span>Dreams lived</span>
          </div>

          <div className="wish-progress">
            <div className="wish-progress-top">
              <span>Our little progress</span>
              <strong>{progress}%</strong>
            </div>

            <div className="wish-progress-track">
              <motion.div
                className="wish-progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{
                  duration: 0.7,
                  ease: "easeOut",
                }}
              />
            </div>
          </div>
        </motion.section>

        {/* JAR */}
        <motion.section
          className="wish-jar-section"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div className="wish-jar-copy">
            <span className="wish-small-label">
              THE LITTLE JAR
            </span>

            <h2>
              Fill it with
              <br />
              <em>things worth doing.</em>
            </h2>

            <p>
              Whenever an idea pops into your head,
              put it here. One day, we'll pick one
              and make it happen.
            </p>

            <button
              className="wish-pick-button"
              onClick={pickRandomWish}
              disabled={!activeWishes.length}
            >
              <span>✦</span>
              Pick a wish
            </button>
          </div>

          <div className="wish-jar-visual">
            <motion.div
              className="jar-glow"
              animate={{
                scale: [1, 1.04, 1],
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <div className="jar-lid">
              <span />
              <span />
            </div>

            <div className="jar-neck" />

            <div className="jar-body">
              <div className="jar-glass-shine" />

              {activeWishes.length === 0 ? (
                <div className="jar-empty">
                  <div className="jar-empty-icon">♡</div>
                  <span>Your jar is waiting</span>
                  <small>Add your first wish</small>
                </div>
              ) : (
                <div className="jar-notes">
                  {activeWishes
                    .slice(0, 8)
                    .map((wish, index) => {
                      const rotations = [
                        -9,
                        7,
                        -5,
                        11,
                        -7,
                        5,
                        -12,
                        8,
                      ];

                      const positions = [
                        [12, 18],
                        [48, 10],
                        [68, 24],
                        [24, 42],
                        [52, 37],
                        [75, 46],
                        [9, 58],
                        [40, 61],
                      ];

                      const [left, top] =
                        positions[index];

                      return (
                        <motion.div
                          key={wish.id}
                          className="jar-note"
                          style={{
                            left: `${left}%`,
                            top: `${top}%`,
                            rotate: rotations[index],
                          }}
                          animate={{
                            y: [0, -4, 0],
                          }}
                          transition={{
                            duration:
                              2.5 + index * 0.15,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.1,
                          }}
                        >
                          <span>♡</span>
                        </motion.div>
                      );
                    })}
                </div>
              )}

              <div className="jar-base" />
            </div>
          </div>
        </motion.section>

        {/* ACTIVE WISHES */}
        <section className="wish-list-section">
          <div className="section-heading">
            <div>
              <span className="wish-small-label">
                OUR DREAMS
              </span>

              <h2>Waiting in the jar</h2>
            </div>

            <span className="wish-count">
              {activeWishes.length}{" "}
              {activeWishes.length === 1
                ? "wish"
                : "wishes"}
            </span>
          </div>

          {loading ? (
            <div className="wish-loading">
              <div className="wish-spinner" />
              <span>Opening our jar...</span>
            </div>
          ) : activeWishes.length === 0 ? (
            <div className="wish-empty-card">
              <div className="wish-empty-heart">♡</div>

              <h3>
                Nothing here yet.
              </h3>

              <p>
                Add a tiny dream, a crazy plan,
                or something simple you'd love
                to do together.
              </p>

              <button
                className="wish-secondary-button"
                onClick={openAdd}
              >
                Add the first wish
              </button>
            </div>
          ) : (
            <div className="wish-grid">
              <AnimatePresence>
                {activeWishes.map((wish, index) => {
                  const cat = getCategory(
                    wish.category
                  );

                  return (
                    <motion.article
                      key={wish.id}
                      className="wish-card"
                      layout
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.95,
                      }}
                      transition={{
                        delay: index * 0.04,
                      }}
                      whileHover={{
                        y: -4,
                      }}
                    >
                      <div className="wish-card-top">
                        <span className="wish-category">
                          <span>{cat.icon}</span>
                          {cat.label}
                        </span>

                        <button
                          className="wish-more"
                          onClick={() =>
                            setSelectedWish(wish)
                          }
                          aria-label="View wish"
                        >
                          •••
                        </button>
                      </div>

                      <button
                        className="wish-card-content"
                        onClick={() =>
                          setSelectedWish(wish)
                        }
                      >
                        <div className="wish-card-heart">
                          ♡
                        </div>

                        <p>{wish.text}</p>
                      </button>

                      <div className="wish-card-bottom">
                        <span>
                          by{" "}
                          {wish.authorName ||
                            "You"}
                        </span>

                        <button
                          className="wish-complete-button"
                          disabled={
                            actionId === wish.id
                          }
                          onClick={() =>
                            handleComplete(wish)
                          }
                        >
                          {actionId === wish.id
                            ? "..."
                            : "We did it ♡"}
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* COMPLETED */}
        {completedWishes.length > 0 && (
          <section className="completed-section">
            <div className="section-heading">
              <div>
                <span className="wish-small-label">
                  MEMORIES MADE
                </span>

                <h2>We've done these ♡</h2>
              </div>

              <span className="wish-count">
                {completedWishes.length}
              </span>
            </div>

            <div className="completed-list">
              {completedWishes.map((wish) => {
                const cat = getCategory(
                  wish.category
                );

                return (
                  <motion.div
                    key={wish.id}
                    className="completed-item"
                    layout
                  >
                    <div className="completed-check">
                      ✓
                    </div>

                    <div className="completed-content">
                      <span>
                        {cat.icon} {cat.label}
                      </span>

                      <p>{wish.text}</p>

                      <small>
                        Added by{" "}
                        {wish.authorName ||
                          "You"}
                        {wish.createdAt
                          ? ` · ${formatDate(
                              wish.createdAt
                            )}`
                          : ""}
                      </small>
                    </div>

                    <div className="completed-actions">
                      <button
                        onClick={() =>
                          handleComplete(wish)
                        }
                        disabled={
                          actionId === wish.id
                        }
                      >
                        Undo
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(wish)
                        }
                        disabled={
                          actionId === wish.id
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
      </section>

      {/* PICKED WISH MODAL */}
      <AnimatePresence>
        {pickedWish && (
          <motion.div
            className="wish-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPickedWish(null)}
          >
            <motion.div
              className="picked-modal"
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
                y: 20,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <button
                className="modal-close"
                onClick={() => setPickedWish(null)}
              >
                ×
              </button>

              <div className="picked-sparkle">
                ✦
              </div>

              <span className="picked-label">
                TODAY'S LITTLE MISSION
              </span>

              <h2>What about this one?</h2>

              <div className="picked-wish">
                <div>♡</div>
                <p>{pickedWish.text}</p>
              </div>

              <div className="picked-actions">
                <button
                  className="wish-secondary-button"
                  onClick={pickRandomWish}
                >
                  Pick another
                </button>

                <button
                  className="wish-primary-button"
                  onClick={() => {
                    handleComplete(pickedWish);
                    setPickedWish(null);
                  }}
                >
                  We did it ♡
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW WISH MODAL */}
      <AnimatePresence>
        {selectedWish && (
          <motion.div
            className="wish-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedWish(null)}
          >
            <motion.div
              className="wish-detail-modal"
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.96,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <button
                className="modal-close"
                onClick={() =>
                  setSelectedWish(null)
                }
              >
                ×
              </button>

              <div className="detail-heart">
                ♡
              </div>

              <span className="wish-category detail-category">
                <span>
                  {
                    getCategory(
                      selectedWish.category
                    ).icon
                  }
                </span>

                {
                  getCategory(
                    selectedWish.category
                  ).label
                }
              </span>

              <h2>{selectedWish.text}</h2>

              <p className="detail-author">
                Added by{" "}
                {selectedWish.authorName ||
                  "You"}
              </p>

              {selectedWish.createdAt && (
                <p className="detail-date">
                  {formatDate(
                    selectedWish.createdAt
                  )}
                </p>
              )}

              <div className="detail-actions">
                <button
                  className="wish-edit-button"
                  onClick={() =>
                    openEdit(selectedWish)
                  }
                >
                  Edit
                </button>

                <button
                  className="wish-danger-button"
                  onClick={() =>
                    handleDelete(selectedWish)
                  }
                >
                  Delete
                </button>

                <button
                  className="wish-primary-button"
                  onClick={() =>
                    handleComplete(selectedWish)
                  }
                >
                  We did it ♡
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="wish-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="wish-form-modal"
              initial={{
                opacity: 0,
                y: 25,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 25,
                scale: 0.97,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <button
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>

              <span className="wish-small-label">
                {editingWish
                  ? "EDIT YOUR WISH"
                  : "ADD TO OUR JAR"}
              </span>

              <h2>
                {editingWish
                  ? "Change the dream."
                  : "What's on your mind?"}
              </h2>

              <form onSubmit={handleSave}>
                <label className="wish-field">
                  <span>Your wish</span>

                  <textarea
                    value={wishText}
                    onChange={(event) =>
                      setWishText(
                        event.target.value
                      )
                    }
                    placeholder="e.g. Watch the sunset somewhere beautiful..."
                    maxLength={300}
                    autoFocus
                  />

                  <small>
                    {wishText.length}/300
                  </small>
                </label>

                <div className="wish-field">
                  <span>What kind of wish?</span>

                  <div className="category-grid">
                    {CATEGORIES.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        className={`category-option ${
                          category === item.id
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          setCategory(item.id)
                        }
                      >
                        <span>
                          {item.icon}
                        </span>

                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="wish-form-error">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="wish-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingWish
                    ? "Save changes"
                    : "Put it in the jar ♡"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}