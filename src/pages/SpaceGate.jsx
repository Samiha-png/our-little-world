import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground";
import GlassCard from "../components/GlassCard";
import { createSpace, listenToMyInvites, acceptInvite } from "../services/space";
import { signOutUser } from "../services/auth";
import "./Auth.css";

export default function SpaceGate({ user, profile }) {
  const [spaceName, setSpaceName] = useState("Our Space");
  const [invites, setInvites] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.email) return;
    const unsub = listenToMyInvites(user.email, setInvites);
    return unsub;
  }, [user?.email]);

  const displayName = profile?.displayName || user.displayName || user.email.split("@")[0];

  async function handleCreate(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await createSpace(user.uid, user.email, displayName, spaceName);
    } catch (err) {
      setError(err.message || "Couldn't create your Space.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAccept(invite) {
    setBusy(true);
    setError("");
    try {
      await acceptInvite(invite.id, user.uid, user.email, displayName);
    } catch (err) {
      setError(err.message || "Couldn't accept that invite.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <AnimatedBackground variant="shared" />
      <div className="auth-screen">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="auth-intro">
          <p className="eyebrow">one last step</p>
          <h1 className="editorial-heading">
            let's build <em>your world</em>
          </h1>
        </motion.div>

        {invites.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard className="auth-card" accent="gold">
              <h3 style={{ marginBottom: 10 }}>You've been invited</h3>
              {invites.map((inv) => (
                <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                    {inv.invitedByName} invited you to "{inv.spaceName}"
                  </span>
                  <button className="auth-submit" style={{ marginTop: 0, padding: "8px 16px" }} disabled={busy} onClick={() => handleAccept(inv)}>
                    Join
                  </button>
                </div>
              ))}
            </GlassCard>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="auth-card" accent="shared">
            <h3 style={{ marginBottom: 14 }}>Create a new Space</h3>
            <form onSubmit={handleCreate} className="auth-form">
              <input type="text" value={spaceName} onChange={(e) => setSpaceName(e.target.value)} placeholder="Space name" />
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="auth-submit" disabled={busy}>
                {busy ? "Creating…" : "Create Our Space"}
              </button>
            </form>
            <button
              type="button"
              onClick={() => signOutUser()}
              style={{ marginTop: 14, fontSize: 12, color: "var(--text-muted)" }}
            >
              Sign out
            </button>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
