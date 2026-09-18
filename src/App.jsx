import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

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
import PlayTogether from "./pages/PlayTogether";

/* =========================================================================
   LOADING SCREEN
========================================================================= */

function LoadingScreen() {
  return (
    <div className="app-shell theme-shared">
      <AnimatedBackground variant="shared" />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontFamily: "var(--font-editorial)",
          fontSize: "1.3rem",
          letterSpacing: "0.02em",
          textAlign: "center",
          padding: "24px",
        }}
      >
        a little place that belongs to us…
      </div>
    </div>
  );
}

/* =========================================================================
   APP
========================================================================= */

export default function App() {
  const {
    user,
    profile,
    loading: authLoading,
  } = useAuth();

  const {
    spaceId,
    space,
    partner,
    loading: spaceLoading,
  } = useSpace(user ? user.uid : null);

  const location = useLocation();

  /* =========================================================================
     LIGHTWEIGHT BROWSER NOTIFICATIONS
  ========================================================================== */

  React.useEffect(() => {
    if (
      !user?.uid ||
      !profile?.settings?.notifications ||
      !("Notification" in window)
    ) {
      return;
    }

    if (
      Notification.permission !== "granted"
    ) {
      return;
    }

    if (
      !profile?.settings?.dailyReminder ||
      !profile?.settings?.reminderTime
    ) {
      return;
    }

    const today = new Date()
      .toISOString()
      .slice(0, 10);

    const key = `olw-reminder-${today}`;

    const tick = () => {
      const now = new Date();

      const hhmm = now
        .toTimeString()
        .slice(0, 5);

      if (
        hhmm ===
          profile.settings.reminderTime &&
        sessionStorage.getItem(key) !== "1"
      ) {
        new Notification(
          "Our Little World ♥",
          {
            body:
              "A tiny reminder to check in with each other.",
          }
        );

        sessionStorage.setItem(
          key,
          "1"
        );
      }
    };

    tick();

    const intervalId =
      window.setInterval(
        tick,
        30000
      );

    return () =>
      window.clearInterval(
        intervalId
      );
  }, [
    user?.uid,
    profile?.settings,
  ]);

  /* =========================================================================
     AUTH LOADING
  ========================================================================== */

  if (authLoading) {
    return <LoadingScreen />;
  }

  /* =========================================================================
     NOT LOGGED IN
  ========================================================================== */

  if (!user) {
    return <Auth />;
  }

  /* =========================================================================
     INVITE ROUTE
     -------------------------------------------------------------------------
     /join must remain accessible even when user already has a Space.
  ========================================================================== */

  if (
    location.pathname === "/join"
  ) {
    return (
      <JoinInvite
        user={user}
        profile={profile}
        currentSpace={space}
      />
    );
  }

  /* =========================================================================
     SPACE LOADING
  ========================================================================== */

  if (spaceLoading) {
    return <LoadingScreen />;
  }

  /* =========================================================================
     NO SPACE YET
  ========================================================================== */

  if (!spaceId) {
    return (
      <SpaceGate
        user={user}
        profile={profile}
      />
    );
  }

  /* =========================================================================
     SHARED CONTEXT
  ========================================================================== */

  const ctx = {
    user,
    profile,
    spaceId,
    space,
    partner,
  };

  /* =========================================================================
     AVATAR
  ========================================================================== */

  const avatarLabel = (
    profile?.displayName ||
    user.email ||
    "•"
  )
    .charAt(0)
    .toUpperCase();

  /* =========================================================================
     THEME
  ========================================================================== */

  const themeClass =
    profile?.trackerMode ===
    "workout"
      ? "theme-him"
      : profile?.trackerMode ===
        "period"
      ? "theme-samiha"
      : "theme-shared";

  /* =========================================================================
     APP SHELL
  ========================================================================== */

  return (
    <div
      className={`app-shell ${themeClass}`}
    >
      <AnimatedBackground variant="shared" />

      <FloatingNav
        avatarLabel={avatarLabel}
      />

      <AnimatePresence mode="wait">
        <Routes
          location={location}
          key={location.pathname}
        >
          {/* ---------------------------------------------------------------
              ROOT
          --------------------------------------------------------------- */}

          <Route
            path="/"
            element={
              <Navigate
                to="/landing"
                replace
              />
            }
          />

          {/* ---------------------------------------------------------------
              LANDING
          --------------------------------------------------------------- */}

          <Route
            path="/landing"
            element={
              <PageTransition>
                <Landing ctx={ctx} />
              </PageTransition>
            }
          />

          {/* ---------------------------------------------------------------
              HOME
          --------------------------------------------------------------- */}

          <Route
            path="/home"
            element={
              <PageTransition>
                <Home ctx={ctx} />
              </PageTransition>
            }
          />

          {/* ---------------------------------------------------------------
              CONNECTION
          --------------------------------------------------------------- */}

          <Route
            path="/connection"
            element={
              <PageTransition>
                <Connection ctx={ctx} />
              </PageTransition>
            }
          />

          {/* ---------------------------------------------------------------
              TODAY
          --------------------------------------------------------------- */}

          <Route
            path="/today"
            element={
              <PageTransition>
                <Today ctx={ctx} />
              </PageTransition>
            }
          />

          {/* ---------------------------------------------------------------
              DIARY
          --------------------------------------------------------------- */}

          <Route
            path="/diary"
            element={
              <PageTransition>
                <Diary ctx={ctx} />
              </PageTransition>
            }
          />

          {/* ---------------------------------------------------------------
              MEMORIES
          --------------------------------------------------------------- */}

          <Route
            path="/memories"
            element={
              <PageTransition>
                <Memories ctx={ctx} />
              </PageTransition>
            }
          />

          {/* ---------------------------------------------------------------
              OUR WORLD
          --------------------------------------------------------------- */}

          <Route
            path="/our-world"
            element={
              <PageTransition>
                <OurWorld ctx={ctx} />
              </PageTransition>
            }
          />

          {/* ---------------------------------------------------------------
              MY SPACE
          --------------------------------------------------------------- */}

          <Route
            path="/my-space"
            element={
              <PageTransition>
                <MySpace ctx={ctx} />
              </PageTransition>
            }
          />

          {/* ---------------------------------------------------------------
              WISH JAR / PLAY TOGETHER
              IMPORTANT: ctx is now passed.
          --------------------------------------------------------------- */}

          <Route
            path="/play-together"
            element={
              <PageTransition>
                <PlayTogether ctx={ctx} />
              </PageTransition>
            }
          />

          {/* ---------------------------------------------------------------
              SETTINGS
          --------------------------------------------------------------- */}

          <Route
            path="/settings"
            element={
              <PageTransition>
                <Settings ctx={ctx} />
              </PageTransition>
            }
          />

          {/* ---------------------------------------------------------------
              FALLBACK
          --------------------------------------------------------------- */}

          <Route
            path="*"
            element={
              <Navigate
                to="/home"
                replace
              />
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}