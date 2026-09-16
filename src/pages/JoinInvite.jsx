import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import AnimatedBackground from "../components/AnimatedBackground";
import GlassCard from "../components/GlassCard";
import { acceptInvite, getInvite } from "../services/space";
import "./Auth.css";

export default function JoinInvite({ user, profile, currentSpace }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteId = searchParams.get("invite") || "";

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const displayName = profile?.displayName || user.displayName || user.email?.split("@")[0] || "You";

  useEffect(() => {
    let cancelled = false;

    async function loadInvite() {
      if (!inviteId) {
        setError("This invite link is missing its invite code.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const data = await getInvite(inviteId);
        if (!data) throw new Error("This invite no longer exists.");
        if (data.status !== "pending") throw new Error("This invite has already been used.");
        if ((data.invitedEmail || "").toLowerCase() !== (user.email || "").toLowerCase()) {
          throw new Error("This invite was sent to a different email address. Sign in with the invited email to join.");
        }
        if (!cancelled) setInvite({ id: inviteId, ...data });
      } catch (err) {
        if (!cancelled) setError(err.message || "Couldn't load this invite.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInvite();
    return () => { cancelled = true; };
  }, [inviteId, user.email]);

  async function handleJoin() {
    if (!invite || busy) return;

    setBusy(true);
    setError("");
    try {
      await acceptInvite(invite.id, user.uid, user.email, displayName);
      setDone(true);
      window.setTimeout(() => navigate("/home", { replace: true }), 250);
    } catch (err) {
      console.error("[JoinInvite] accept failed", err);
      setError(err.message || "Couldn't join that Space.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <AnimatedBackground variant="shared" />
      <div className="auth-screen">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="auth-intro"
        >
          <p className="eyebrow">our little world</p>
          <h1 className="editorial-heading">come into <em>our space</em></h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <GlassCard className="auth-card" accent="gold">
            {loading ? (
              <p>Checking your invitation…</p>
            ) : done ? (
              <div>
                <h3>You're connected ♥</h3>
                <p style={{ marginTop: 8 }}>Opening your shared world…</p>
              </div>
            ) : invite ? (
              <div>
                <p className="eyebrow">invitation</p>
                <h3 style={{ marginTop: 8 }}>{invite.invitedByName || "Someone"} invited you</h3>
                <p style={{ marginTop: 8 }}>
                  Join <strong>“{invite.spaceName || "Our Space"}”</strong> with {invite.invitedByName || "them"}.
                </p>

                {currentSpace && currentSpace.id !== invite.spaceId && (
                  <div className="auth-error" style={{ marginTop: 16 }}>
                    Joining this invitation will make this Space your active Space.
                  </div>
                )}

                <button
                  type="button"
                  className="auth-submit"
                  style={{ marginTop: 18 }}
                  onClick={handleJoin}
                  disabled={busy}
                >
                  {busy ? "Joining…" : "Join Our Space ♥"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/home", { replace: true })}
                  style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}
                >
                  Not now
                </button>
              </div>
            ) : (
              <div>
                <h3>Invite unavailable</h3>
                <p style={{ marginTop: 8 }}>{error || "This invitation could not be loaded."}</p>
                <button
                  type="button"
                  className="auth-submit"
                  style={{ marginTop: 18 }}
                  onClick={() => navigate("/home", { replace: true })}
                >
                  Go to my Space
                </button>
              </div>
            )}

            {error && invite && <p className="auth-error" style={{ marginTop: 12 }}>{error}</p>}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
