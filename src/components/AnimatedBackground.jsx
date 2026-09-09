import { useMemo } from "react";
import "./AnimatedBackground.css";

/**
 * Cinematic dark backdrop: layered gradients + soft glow blobs + a field of
 * twinkling stars + slow-drifting particles. Pure CSS/SVG, no canvas, so it
 * stays cheap on mobile. `variant` lets a page lean into Samiha's or His
 * accent glow while remaining the same shared backdrop.
 */
export default function AnimatedBackground({ variant = "shared" }) {
  const stars = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 0.6,
      delay: Math.random() * 6,
      duration: 3 + Math.random() * 4
    }));
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 10 + Math.random() * 10
    }));
  }, []);

  return (
    <div className={`bg-root bg-${variant}`} aria-hidden="true">
      <div className="bg-gradient" />
      <div className="bg-glow bg-glow-a" />
      <div className="bg-glow bg-glow-b" />
      <svg className="bg-stars" preserveAspectRatio="none">
        {stars.map((s) => (
          <circle
            key={s.id}
            cx={`${s.left}%`}
            cy={`${s.top}%`}
            r={s.size}
            className="bg-star"
            style={{ animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }}
          />
        ))}
      </svg>
      <div className="bg-particles">
        {particles.map((p) => (
          <span
            key={p.id}
            className="bg-particle"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}
      </div>
      <div className="bg-vignette" />
    </div>
  );
}
