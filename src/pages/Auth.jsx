import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground";
import GlassCard from "../components/GlassCard";
import { signUp, logIn, friendlyAuthError } from "../services/auth";
import "./Auth.css";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, displayName);
      } else {
        await logIn(email, password);
      }
    } catch (err) {
      setError(friendlyAuthError(err));
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
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="auth-intro"
        >
          <p className="eyebrow">our little world</p>
          <h1 className="editorial-heading">
            a place that belongs <em>only to us</em>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlassCard className="auth-card" accent="shared">
            <div className="auth-tabs">
              <button className={mode === "login" ? "is-active" : ""} onClick={() => setMode("login")} type="button">
                Log in
              </button>
              <button className={mode === "signup" ? "is-active" : ""} onClick={() => setMode("signup")} type="button">
                Sign up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {mode === "signup" && (
                <input
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="auth-submit" disabled={busy}>
                {busy ? "Please wait…" : mode === "login" ? "Enter" : "Create account"}
              </button>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
