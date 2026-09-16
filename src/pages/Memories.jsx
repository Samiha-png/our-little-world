import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../components/GlassCard";
import { listenMemories, addMemory, setMemoryReaction, todayKey } from "../services/data";
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

  useEffect(() => {
    if (!spaceId) return;
    const unsub = listenMemories(spaceId, setMemories);
    return unsub;
  }, [spaceId]);

  const myName = profile?.displayName || user.email.split("@")[0];

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await addMemory(spaceId, user.uid, myName, form);
      setForm({ title: "", date: todayKey(), text: "", caption: "", file: null });
      setOpen(false);
    } finally {
      setSaving(false);
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
          <button className="memories-add" onClick={() => setOpen(true)}>+ Add memory</button>
        </div>
      </motion.div>

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
              <div className="memory-modal-reactions">
                {REACTIONS.map((r) => (
                  <span
                    key={r}
                    className={active.reactions?.[user.uid] === r ? "is-picked" : ""}
                    onClick={() => setMemoryReaction(spaceId, active.id, user.uid, r)}
                  >
                    {r}
                  </span>
                ))}
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
                <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} />
                <button type="submit" disabled={saving}>{saving ? "Saving…" : "Add memory"}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
