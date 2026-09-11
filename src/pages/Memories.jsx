import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../components/GlassCard";
import { listenMemories, addMemory, deleteMemory, setMemoryReaction, todayKey } from "../services/data";
import "./Memories.css";

const REACTIONS = ["❤️", "🫂", "✨", "🥹", "😂"];

export default function Memories({ ctx }) {
  const { spaceId, user, profile } = ctx;
  const [memories, setMemories] = useState([]);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("grid"); // grid | timeline
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({ title: "", date: todayKey(), text: "", caption: "", file: null });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState(null);
  const [listError, setListError] = useState(null);

  useEffect(() => {
    if (!spaceId) return;
    const unsub = listenMemories(
      spaceId,
      (docs) => {
        setMemories(docs);
        setListError(null);
      },
      (err) => {
        console.error("[Memories] Realtime listener error:", err);
        setListError(err.message || "Failed to load memories");
      }
    );
    return unsub;
  }, [spaceId]);

  // Keep active polaroid in sync with live memories (e.g. when reactions change)
  useEffect(() => {
    if (active) {
      const fresh = memories.find((m) => m.id === active.id);
      if (fresh) setActive(fresh);
    }
  }, [memories]);

  const myName = profile?.displayName || user.email.split("@")[0];

  function handleFileChange(e) {
    const file = e.target.files?.[0] || null;
    setError(null);
    if (file) {
      if (!file.type || !file.type.startsWith("image/")) {
        setError("Please choose a valid image file (JPEG, PNG, WebP, etc.).");
        e.target.value = "";
        setForm((prev) => ({ ...prev, file: null }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size exceeds the 10MB limit. Please choose a smaller photo.");
        e.target.value = "";
        setForm((prev) => ({ ...prev, file: null }));
        return;
      }
    }
    setForm((prev) => ({ ...prev, file }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setUploadStatus(form.file ? "Uploading photo…" : "Saving memory…");

    try {
      await addMemory(spaceId, user.uid, myName, form);
      setForm({ title: "", date: todayKey(), text: "", caption: "", file: null });
      setOpen(false);
    } catch (err) {
      console.error("[Memories] Error creating memory:", err);
      setError(err.message || "Failed to save memory. Please check your connection.");
    } finally {
      setSaving(false);
      setUploadStatus("");
    }
  }

  async function handleReaction(emoji) {
    if (!active || !spaceId || !user?.uid) return;
    try {
      await setMemoryReaction(spaceId, active.id, user.uid, emoji);
    } catch (err) {
      console.error("[Memories] Failed to update reaction:", err);
    }
  }

  async function handleDelete(memoryId) {
    if (!window.confirm("Are you sure you want to delete this memory?")) return;
    setDeleting(true);
    try {
      await deleteMemory(spaceId, memoryId);
      setActive(null);
    } catch (err) {
      console.error("[Memories] Delete failed:", err);
      alert("Failed to delete memory. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="page-container memories-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="memories-header">
        <div>
          <p className="eyebrow">our memories</p>
          <h1 className="editorial-heading">Moments <em>we kept</em></h1>
        </div>
        <div className="memories-actions">
          <div className="memories-view-toggle">
            <button className={view === "grid" ? "is-active" : ""} onClick={() => setView("grid")}>Polaroids</button>
            <button className={view === "timeline" ? "is-active" : ""} onClick={() => setView("timeline")}>Our Story</button>
          </div>
          <button className="memories-add" onClick={() => { setError(null); setOpen(true); }}>+ Add memory</button>
        </div>
      </motion.div>

      {listError && (
        <div style={{ color: "var(--rose-400)", marginBottom: "var(--space-3)", fontSize: "13px" }}>
          Notice: {listError}
        </div>
      )}

      {view === "grid" ? (
        <div className="memories-masonry">
          {memories.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className="memory-polaroid"
              onClick={() => setActive(m)}
            >
              {m.imageUrl ? <img src={m.imageUrl} alt={m.title} /> : <div className="memory-polaroid-blank">{m.title?.charAt(0) || "♡"}</div>}
              <p className="memory-polaroid-title">{m.title}</p>
              <p className="memory-polaroid-date">{m.date}</p>
            </motion.div>
          ))}
          {memories.length === 0 && <p className="memories-empty">No memories yet — add the first one.</p>}
        </div>
      ) : (
        <div className="memories-timeline">
          {[...memories].sort((a, b) => (a.date > b.date ? 1 : -1)).map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-content" onClick={() => setActive(m)}>
                <p className="timeline-date">{m.date}</p>
                <p className="timeline-title">{m.title}</p>
                {m.caption && <p className="timeline-caption">{m.caption}</p>}
              </div>
            </motion.div>
          ))}
          {memories.length === 0 && <p className="memories-empty">The story starts with your first memory.</p>}
        </div>
      )}

      <AnimatePresence>
        {active && (
          <motion.div className="memory-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}>
            <motion.div
              className="memory-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {active.imageUrl && <img src={active.imageUrl} alt={active.title} />}
              <h2>{active.title}</h2>
              <p className="memory-modal-date">{active.date} · {active.authorName}</p>
              {active.text && <p className="memory-modal-text">{active.text}</p>}
              <div className="memory-modal-footer">
                <div className="memory-modal-reactions">
                  {REACTIONS.map((r) => (
                    <span
                      key={r}
                      className={active.reactions?.[user.uid] === r ? "is-picked" : ""}
                      onClick={() => handleReaction(r)}
                    >
                      {r}
                    </span>
                  ))}
                </div>
                <button
                  className="memory-delete-btn"
                  onClick={() => handleDelete(active.id)}
                  disabled={deleting}
                  title="Delete memory"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div className="memory-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.div className="memory-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <form onSubmit={handleAdd} className="memory-form">
                <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                <textarea placeholder="Tell the story…" rows={3} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
                <input placeholder="Caption" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
                <input type="file" accept="image/*" onChange={handleFileChange} />

                {error && (
                  <div style={{ color: "var(--rose-400)", fontSize: "13px", background: "rgba(224, 76, 102, 0.1)", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(224, 76, 102, 0.2)" }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={saving}>
                  {saving ? (uploadStatus || "Saving…") : "Add memory"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
