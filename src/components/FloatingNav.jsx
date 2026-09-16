import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import "./FloatingNav.css";

const LINKS = [
  { to: "/home", label: "Home", icon: "✧" },
  { to: "/today", label: "Today", icon: "☾" },
  { to: "/diary", label: "Diary", icon: "✎" },
  { to: "/connection", label: "Between Us", icon: "❦" },
  { to: "/memories", label: "Memories", icon: "❈" },
  { to: "/our-world", label: "Our World", icon: "✦" },
  { to: "/my-space", label: "My Space", icon: "♡" },
  { to: "/settings", label: "Settings", icon: "⚙" }
];

const MOBILE_LINKS = [LINKS[0], LINKS[1], LINKS[3], LINKS[4], LINKS[6]];

export default function FloatingNav({ avatarLabel }) {
  return (
    <>
      <motion.nav
        className="floating-nav floating-nav-desktop"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <NavLink to="/home" className="floating-nav-mark" aria-label="Home">
          ✦
        </NavLink>

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

        <NavLink
          className="floating-nav-avatar"
          to="/settings"
          aria-label="Open settings"
        >
          {avatarLabel || "•"}
        </NavLink>
      </motion.nav>

      <motion.nav
        className="floating-nav floating-nav-mobile"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {MOBILE_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `floating-nav-mobile-link${isActive ? " is-active" : ""}`
            }
          >
            <span className="floating-nav-mobile-icon">{link.icon}</span>
            <span className="floating-nav-mobile-label">{link.label}</span>
          </NavLink>
        ))}
      </motion.nav>
    </>
  );
}
