import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./FloatingNav.css";

const LINKS = [
  { to: "/home", label: "Home", icon: "✧" },
  { to: "/today", label: "Today", icon: "☾" },
  { to: "/diary", label: "Diary", icon: "✎" },
  { to: "/connection", label: "Between Us", icon: "❦" },
  { to: "/memories", label: "Memories", icon: "❈" },
  { to: "/our-world", label: "Our World", icon: "✦" },
  { to: "/my-space", label: "My Space", icon: "♡" },
  { to: "/play-together", label: "Play Together", icon: "🎮" },
  { to: "/settings", label: "Settings", icon: "⚙" },
];

/*
 * =====================================================
 * MOBILE DIRECT LINKS
 * =====================================================
 *
 * Keep the bottom nav clean.
 * Play Together lives inside More.
 */

const MOBILE_LINKS = [
  LINKS[0], // Home
  LINKS[1], // Today
  LINKS[3], // Between Us
  LINKS[4], // Memories
];

/*
 * =====================================================
 * MORE MENU
 * =====================================================
 *
 * Play Together added here.
 */

const MORE_LINKS = [
  LINKS[2], // Diary
  LINKS[5], // Our World
  LINKS[6], // My Space
  LINKS[7], // Play Together
  LINKS[8], // Settings
];

export default function FloatingNav({ avatarLabel }) {
  const [moreOpen, setMoreOpen] = useState(false);

  const closeMore = () => {
    setMoreOpen(false);
  };

  return (
    <>
      {/* =====================================================
          DESKTOP NAVIGATION
      ===================================================== */}

      <motion.nav
        className="floating-nav floating-nav-desktop"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {/* Logo */}
        <NavLink
          to="/home"
          className="floating-nav-mark"
          aria-label="Home"
        >
          ✦
        </NavLink>

        {/* Desktop Links */}
        <div className="floating-nav-links">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `floating-nav-link${isActive ? " is-active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Avatar / Settings */}
        <NavLink
          to="/settings"
          className="floating-nav-avatar"
          aria-label="Open settings"
        >
          {avatarLabel || "•"}
        </NavLink>
      </motion.nav>

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      <motion.nav
        className="floating-nav floating-nav-mobile"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {MOBILE_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `floating-nav-mobile-link${
                isActive ? " is-active" : ""
              }`
            }
          >
            <span className="floating-nav-mobile-icon">
              {link.icon}
            </span>

            <span className="floating-nav-mobile-label">
              {link.label}
            </span>
          </NavLink>
        ))}

        {/* MORE BUTTON */}
        <button
          type="button"
          className={`floating-nav-mobile-link floating-nav-more-button${
            moreOpen ? " is-active" : ""
          }`}
          onClick={() => setMoreOpen((value) => !value)}
          aria-expanded={moreOpen}
          aria-label="Open more navigation"
        >
          <span className="floating-nav-mobile-icon">
            {moreOpen ? "×" : "•••"}
          </span>

          <span className="floating-nav-mobile-label">
            More
          </span>
        </button>
      </motion.nav>

      {/* =====================================================
          MORE MENU
      ===================================================== */}

      <AnimatePresence>
        {moreOpen && (
          <>
            {/* Backdrop */}
            <motion.button
              type="button"
              className="floating-nav-more-backdrop"
              onClick={closeMore}
              aria-label="Close navigation menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Menu */}
            <motion.div
              className="floating-nav-more-menu"
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 15,
                scale: 0.98,
              }}
              transition={{
                duration: 0.22,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Header */}
              <div className="floating-nav-more-header">
                <div>
                  <span className="floating-nav-more-eyebrow">
                    OUR LITTLE WORLD
                  </span>

                  <h3>More</h3>
                </div>

                <button
                  type="button"
                  className="floating-nav-more-close"
                  onClick={closeMore}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* More Grid */}
              <div className="floating-nav-more-grid">
                {MORE_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={closeMore}
                    className={({ isActive }) =>
                      `floating-nav-more-item${
                        isActive ? " is-active" : ""
                      }`
                    }
                  >
                    <span className="floating-nav-more-icon">
                      {link.icon}
                    </span>

                    <span className="floating-nav-more-text">
                      {link.label}
                    </span>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
