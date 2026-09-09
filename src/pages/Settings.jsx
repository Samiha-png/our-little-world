import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";
import { setUserSettings, signOutUser } from "../services/auth";
import { sendInvite } from "../services/space";
import "./Settings.css";

const DEFAULTS = {
  notifications: true,
  dailyReminder: true,
  reminderTime: "21:00",
  sounds: true
};

export default function Settings({ ctx }) {
  const { user, profile, space, partner } = ctx;
  const [settings, setSettings] = useState({ ...DEFAULTS, ...(profile?.settings || {}) });
  const [status, setStatus] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    setSettings({ ...DEFAULTS, ...(profile?.settings || {}) });
  }, [profile]);

  async function update(patch) {
    const next = { ...settings, ...patch };
    setSettings(next);
    setStatus("Saving…");
    try {
      await setUserSettings(user.uid, next);
      setStatus("Saved");
      setTimeout(() => setStatus(""), 1400);
    } catch (e) {
      setStatus(e.message || "Could not save");
    }
  }

  async function enableNotifications() {
    if (!("Notification" in window)) {
      setStatus("This browser does not support notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") update({ notifications: true });
    else update({ notifications: false });
  }

  async function handleInvite(e) {
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();

    if (!email) {
      setInviteStatus("Enter their email address first.");
      return;
    }

    if (email === user.email?.toLowerCase()) {
      setInviteStatus("You can't invite your own account.");
      return;
    }

    if (partner) {
      setInviteStatus("Your Space already has two members.");
      return;
    }

    if (!space?.id) {
      setInviteStatus("Your Space isn't ready yet. Please try again.");
      return;
    }

    setInviteBusy(true);
    setInviteStatus("Sending invite…");

    try {
      const inviteId = await sendInvite(
        space.id,
        space.name || "Our Space",
        user.uid,
        profile?.displayName || user.displayName || user.email?.split("@")[0] || "Your person",
        email
      );
      const link = `${window.location.origin}/join?invite=${encodeURIComponent(inviteId)}`;
      setInviteLink(link);
      setInviteEmail("");
      setInviteStatus("Invite created ♥ Copy the link or send it on WhatsApp.");
    } catch (e) {
      console.error(e);
      setInviteStatus(e.message || "Couldn't send the invite.");
    } finally {
      setInviteBusy(false);
    }
  }

  async function copyInviteLink() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus(""), 1600);
    } catch (e) {
      setCopyStatus("Copy failed — select the link manually.");
    }
  }

  function shareOnWhatsApp() {
    if (!inviteLink) return;
    const message = `Join my Our Little World Space ♥\\n\\n${inviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="page-container settings-page">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <p className="eyebrow">your preferences</p>
        <h1 className="editorial-heading">Settings & <em>comfort</em></h1>
        <p className="settings-sub">Choose how your little world behaves on this device.</p>
      </motion.div>

      <div className="settings-grid">
        <GlassCard accent="shared" className="settings-card space-share-card">
          <p className="eyebrow">our space</p>
          <h2>Share your little world</h2>
          <p>
            Invite Him to this Space. Once he accepts, you'll both see the shared parts of your world in real time.
          </p>

          {partner ? (
            <div className="space-connected-box">
              <span className="space-connected-dot" />
              <div>
                <strong>Connected</strong>
                <small>{partner.displayName || partner.email} is already in this Space.</small>
              </div>
            </div>
          ) : (
            <form onSubmit={handleInvite} className="invite-form">
              <label htmlFor="invite-email">Their email address</label>
              <input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  if (inviteStatus) setInviteStatus("");
                }}
                placeholder="him@example.com"
                autoComplete="email"
                disabled={inviteBusy}
              />
              <button type="submit" className="auth-submit invite-submit" disabled={inviteBusy}>
                {inviteBusy ? "Sending…" : "Send Invite ♥"}
              </button>
              {inviteStatus && <p className="invite-status">{inviteStatus}</p>}

              {inviteLink && (
                <div className="invite-link-box">
                  <label htmlFor="invite-link">Your private invite link</label>
                  <div className="invite-link-row">
                    <input id="invite-link" value={inviteLink} readOnly onFocus={(e) => e.target.select()} />
                    <button type="button" className="invite-copy-btn" onClick={copyInviteLink}>
                      {copyStatus || "Copy Link"}
                    </button>
                  </div>
                  <button type="button" className="whatsapp-btn" onClick={shareOnWhatsApp}>
                    Send via WhatsApp ↗
                  </button>
                  <small className="invite-link-hint">
                    Send this link to Him. He can open it, sign in with the invited email, then join your Space.
                  </small>
                </div>
              )}
            </form>
          )}

          <div className="invite-note">
            <span>🔗</span>
            <span>He needs to sign in with the <strong>same email</strong> you invite. The invitation will then appear automatically.</span>
          </div>
        </GlassCard>

        <GlassCard accent="shared" className="settings-card">
          <p className="eyebrow">notifications</p>
          <h2>Stay connected</h2>
          <div className="setting-row">
            <div>
              <strong>Browser notifications</strong>
              <small>Get an alert for new connection/support activity while notifications are allowed.</small>
            </div>
            <button className={`toggle ${settings.notifications ? "on" : ""}`} onClick={() => settings.notifications ? update({ notifications: false }) : enableNotifications()} aria-label="Toggle notifications"><span /></button>
          </div>
          <div className="setting-row">
            <div>
              <strong>Daily reminder</strong>
              <small>A gentle reminder at your chosen time when this app is open.</small>
            </div>
            <button className={`toggle ${settings.dailyReminder ? "on" : ""}`} onClick={() => update({ dailyReminder: !settings.dailyReminder })} aria-label="Toggle daily reminder"><span /></button>
          </div>
          <label className="time-setting">Reminder time<input type="time" value={settings.reminderTime} onChange={e => update({ reminderTime: e.target.value })} /></label>
          <div className="setting-row">
            <div>
              <strong>Soft sounds</strong>
              <small>Allow subtle notification sounds for supported interactions.</small>
            </div>
            <button className={`toggle ${settings.sounds ? "on" : ""}`} onClick={() => update({ sounds: !settings.sounds })} aria-label="Toggle sounds"><span /></button>
          </div>
          {status && <p className="settings-status">{status}</p>}
        </GlassCard>

        <GlassCard accent="samiha" className="settings-card">
          <p className="eyebrow">privacy</p>
          <h2>Your private data</h2>
          <p>Diary, period tracker, workout tracker and private moods are stored under your authenticated account. They are not part of the shared Space.</p>
          <div className="privacy-pills"><span>🔒 Private diary</span><span>🌸 Private cycle</span><span>🏋️ Private workouts</span></div>
        </GlassCard>

        <GlassCard accent="him" className="settings-card account-card">
          <p className="eyebrow">account</p>
          <h2>{profile?.displayName || user.email?.split("@")[0]}</h2>
          <p>{user.email}</p>
          <button className="signout-btn" onClick={signOutUser}>Log out</button>
        </GlassCard>
      </div>
    </div>
  );
}
