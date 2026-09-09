import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "./hooks/useAuth";
import { useSpace } from "./hooks/useSpace";
import AnimatedBackground from "./components/AnimatedBackground";
import FloatingNav from "./components/FloatingNav";
import PageTransition from "./components/PageTransition";

import Auth from "./pages/Auth";
import SpaceGate from "./pages/SpaceGate";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import ComingSoon from "./pages/ComingSoon";
import Connection from "./pages/Connection";
import Diary from "./pages/Diary";
import Memories from "./pages/Memories";
import Today from "./pages/Today";
import OurWorld from "./pages/OurWorld";
import MySpace from "./pages/MySpace";
import Settings from "./pages/Settings";
import JoinInvite from "./pages/JoinInvite";

function LoadingScreen() {
  return (
    <div className="app-shell theme-shared">
      <AnimatedBackground variant="shared" />
      <div style={{
        position: "relative", zIndex: 2, minHeight: "100dvh",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--text-muted)", fontFamily: "var(--font-editorial)", fontSize: "1.3rem", letterSpacing: "0.02em"
      }}>
        a little place that belongs to us…
      </div>
    </div>
  );
}

export default function App() {
  const { user, profile, loading: authLoading } = useAuth();
  const { spaceId, space, partner, loading: spaceLoading } = useSpace(user ? user.uid : null);
  const location = useLocation();

  // Lightweight browser notifications while the app is open. Full background
  // push can be added later with Firebase Cloud Messaging/VAPID credentials.
  React.useEffect(() => {
    if (!user?.uid || !profile?.settings?.notifications || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    const key = `olw-reminder-${new Date().toISOString().slice(0,10)}`;
    if (profile.settings.dailyReminder && profile.settings.reminderTime) {
      const tick = () => {
        const now = new Date();
        const hhmm = now.toTimeString().slice(0,5);
        if (hhmm === profile.settings.reminderTime && sessionStorage.getItem(key) !== "1") {
          new Notification("Our Little World ♥", { body: "A tiny reminder to check in with each other." });
          sessionStorage.setItem(key, "1");
        }
      };
      tick();
      const id = setInterval(tick, 30000);
      return () => clearInterval(id);
    }
  }, [user?.uid, profile?.settings]);

  if (authLoading) return <LoadingScreen />;
  if (!user) return <Auth />;

  // Invite links must remain reachable even when the signed-in user already
  // has a Space. The previous implementation redirected /join before the
  // invite could be read, which made copy/WhatsApp invite links ineffective.
  if (location.pathname === "/join") {
    return <JoinInvite user={user} profile={profile} currentSpace={space} />;
  }

  if (spaceLoading) return <LoadingScreen />;
  if (!spaceId) {
    return <SpaceGate user={user} profile={profile} />;
  }

  const ctx = { user, profile, spaceId, space, partner };
  const avatarLabel = (profile?.displayName || user.email || "•").charAt(0).toUpperCase();

  const themeClass = profile?.trackerMode === "workout" ? "theme-him" : profile?.trackerMode === "period" ? "theme-samiha" : "theme-shared";

  return (
    <div className={`app-shell ${themeClass}`}>
      <AnimatedBackground variant="shared" />
      <FloatingNav avatarLabel={avatarLabel} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/landing" replace />} />
          <Route path="/landing" element={<PageTransition><Landing ctx={ctx} /></PageTransition>} />
          <Route path="/home" element={<PageTransition><Home ctx={ctx} /></PageTransition>} />
          <Route path="/connection" element={<PageTransition><Connection ctx={ctx} /></PageTransition>} />
          <Route path="/today" element={<PageTransition><Today ctx={ctx} /></PageTransition>} />
          <Route path="/diary" element={<PageTransition><Diary ctx={ctx} /></PageTransition>} />
          <Route path="/memories" element={<PageTransition><Memories ctx={ctx} /></PageTransition>} />
          <Route path="/our-world" element={<PageTransition><OurWorld ctx={ctx} /></PageTransition>} />
          <Route path="/my-space" element={<PageTransition><MySpace ctx={ctx} /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><Settings ctx={ctx} /></PageTransition>} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
