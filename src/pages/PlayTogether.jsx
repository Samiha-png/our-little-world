
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./PlayTogether.css";

/* =========================================================
   GAME DATA
========================================================= */

const GAMES = [
  {
    id: "mood",
    icon: "☾",
    title: "Guess the Mood",
    description: "Read the tiny clues and guess the feeling.",
    tag: "Guess",
  },
  {
    id: "note",
    icon: "✎",
    title: "Complete the Note",
    description: "Finish the little sentence with your own answer.",
    tag: "Creative",
  },
  {
    id: "boxes",
    icon: "◇",
    title: "Pick a Box",
    description: "Choose a mystery box and see what's inside.",
    tag: "Surprise",
  },
  {
    id: "tap",
    icon: "✦",
    title: "Fast Tap",
    description: "How many stars can you catch before time runs out?",
    tag: "10 Sec",
  },
];

const MOOD_ROUNDS = [
  {
    clue: "A quiet evening, soft music and absolutely no plans.",
    options: ["Peaceful", "Excited", "Annoyed", "Energetic"],
    answer: "Peaceful",
  },
  {
    clue: "You finally finished something you've been working on all day.",
    options: ["Relieved", "Sleepy", "Confused", "Bored"],
    answer: "Relieved",
  },
  {
    clue: "Someone remembers a tiny detail you mentioned weeks ago.",
    options: ["Touched", "Angry", "Sleepy", "Nervous"],
    answer: "Touched",
  },
  {
    clue: "A completely unexpected good thing happens.",
    options: ["Surprised", "Tired", "Bored", "Calm"],
    answer: "Surprised",
  },
];

const NOTE_PROMPTS = [
  "Today I would really like to...",
  "One tiny thing that made me smile was...",
  "If today had a soundtrack, it would be...",
  "A place I'd love to visit someday is...",
  "Something I appreciate today is...",
  "Right now I could really use...",
];

const BOX_CONTENT = [
  {
    icon: "🌙",
    title: "Quiet Moment",
    text: "Take a tiny break. You deserve a peaceful minute.",
  },
  {
    icon: "✦",
    title: "Little Star",
    text: "You made it through another day. That's something.",
  },
  {
    icon: "☁",
    title: "Soft Reminder",
    text: "Not every day needs to be productive to be meaningful.",
  },
  {
    icon: "🌷",
    title: "Tiny Win",
    text: "Remember one small thing you did well today.",
  },
  {
    icon: "♡",
    title: "Good Thought",
    text: "Think of one memory that instantly makes you smile.",
  },
  {
    icon: "🎀",
    title: "Your Turn",
    text: "Send a tiny kind message to someone you care about.",
  },
];

/* =========================================================
   MAIN PAGE
========================================================= */

export default function PlayTogether() {
  const [activeGame, setActiveGame] = useState(null);

  return (
    <main className="play-together-page">
      <div className="play-together-bg-glow play-together-bg-glow-one" />
      <div className="play-together-bg-glow play-together-bg-glow-two" />

      <section className="play-together-shell">

        {/* HEADER */}
        <header className="play-together-header">
          <div>
            <span className="play-together-eyebrow">
              ✦ LITTLE PLAYGROUND
            </span>

            <h1 className="play-together-title">
              Play <span>Together</span>
            </h1>

            <p className="play-together-subtitle">
              A tiny corner for games, little challenges and
              unexpected moments.
            </p>
          </div>

          <div className="play-together-header-orbit">
            <span>♡</span>
            <span>✦</span>
            <span>☾</span>
          </div>
        </header>

        {/* INTRO */}
        <section className="play-together-intro">
          <div className="play-together-intro-icon">
            ✦
          </div>

          <div>
            <p className="play-together-intro-label">
              YOUR LITTLE GAME CORNER
            </p>

            <h2>
              Pick something fun.
            </h2>

            <p>
              No scores to worry about. Just a few minutes of fun.
            </p>
          </div>
        </section>

        {/* GAME GRID */}
        <section className="play-together-games">
          {GAMES.map((game, index) => (
            <motion.button
              key={game.id}
              type="button"
              className="play-together-game-card"
              onClick={() => setActiveGame(game.id)}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.08,
                duration: 0.45,
              }}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.985 }}
            >
              <div className="play-together-game-top">
                <div className="play-together-game-icon">
                  {game.icon}
                </div>

                <span className="play-together-game-tag">
                  {game.tag}
                </span>
              </div>

              <div className="play-together-game-content">
                <h3>{game.title}</h3>

                <p>{game.description}</p>
              </div>

              <div className="play-together-game-footer">
                <span>Open game</span>

                <span className="play-together-arrow">
                  →
                </span>
              </div>
            </motion.button>
          ))}
        </section>

        {/* FOOTER */}
        <section className="play-together-footer-note">
          <span>✦</span>

          <p>
            Little games.
            <strong> Little moments.</strong>
          </p>

          <span>✦</span>
        </section>
      </section>

      {/* GAME MODALS */}

      <AnimatePresence>
        {activeGame === "mood" && (
          <GuessMood
            onClose={() => setActiveGame(null)}
          />
        )}

        {activeGame === "note" && (
          <CompleteNote
            onClose={() => setActiveGame(null)}
          />
        )}

        {activeGame === "boxes" && (
          <PickBox
            onClose={() => setActiveGame(null)}
          />
        )}

        {activeGame === "tap" && (
          <FastTap
            onClose={() => setActiveGame(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

/* =========================================================
   GAME 1 — GUESS THE MOOD
========================================================= */

function GuessMood({ onClose }) {
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = MOOD_ROUNDS[round];

  function selectMood(option) {
    if (selected) return;

    setSelected(option);

    if (option === current.answer) {
      setScore((value) => value + 1);
    }
  }

  function nextRound() {
    if (round === MOOD_ROUNDS.length - 1) {
      setFinished(true);
      return;
    }

    setRound((value) => value + 1);
    setSelected(null);
  }

  function restart() {
    setRound(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  return (
    <GameModal
      title="Guess the Mood"
      subtitle="Read the clue and choose the feeling."
      onClose={onClose}
    >
      {finished ? (
        <div className="play-together-result">
          <div className="play-together-result-icon">
            ✦
          </div>

          <span>Your little score</span>

          <strong>
            {score} / {MOOD_ROUNDS.length}
          </strong>

          <p>
            {score === MOOD_ROUNDS.length
              ? "You read the mood perfectly."
              : score >= 2
              ? "Pretty good mood reading."
              : "Maybe another little round?"}
          </p>

          <button
            className="play-together-primary-button"
            onClick={restart}
          >
            Play Again
          </button>
        </div>
      ) : (
        <div className="play-together-mood-game">
          <div className="play-together-game-progress">
            <span>
              Round {round + 1}
            </span>

            <span>
              Score {score}
            </span>
          </div>

          <div className="play-together-clue">
            <span>THE CLUE</span>

            <p>
              “{current.clue}”
            </p>
          </div>

          <div className="play-together-mood-options">
            {current.options.map((option) => {
              let className =
                "play-together-mood-option";

              if (selected) {
                if (option === current.answer) {
                  className += " is-correct";
                } else if (option === selected) {
                  className += " is-wrong";
                }
              }

              return (
                <button
                  key={option}
                  className={className}
                  onClick={() => selectMood(option)}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {selected && (
            <motion.div
              className="play-together-answer-message"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {selected === current.answer
                ? "That's right ✦"
                : `The answer was ${current.answer}.`}
            </motion.div>
          )}

          {selected && (
            <button
              className="play-together-primary-button"
              onClick={nextRound}
            >
              {round === MOOD_ROUNDS.length - 1
                ? "See Result"
                : "Next Clue →"}
            </button>
          )}
        </div>
      )}
    </GameModal>
  );
}

/* =========================================================
   GAME 2 — COMPLETE THE NOTE
========================================================= */

function CompleteNote({ onClose }) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState(false);

  const prompt = NOTE_PROMPTS[promptIndex];

  function saveAnswer() {
    if (!answer.trim()) return;
    setSaved(true);
  }

  function nextPrompt() {
    setPromptIndex(
      (value) => (value + 1) % NOTE_PROMPTS.length
    );

    setAnswer("");
    setSaved(false);
  }

  return (
    <GameModal
      title="Complete the Note"
      subtitle="There is no right answer. Make it yours."
      onClose={onClose}
    >
      <div className="play-together-note-game">
        <div className="play-together-note-number">
          PROMPT {promptIndex + 1}
        </div>

        <div className="play-together-note-paper">
          <span>✎</span>

          <p>{prompt}</p>

          <textarea
            value={answer}
            onChange={(event) =>
              setAnswer(event.target.value)
            }
            placeholder="Write something..."
            rows={4}
          />
        </div>

        {saved && (
          <motion.div
            className="play-together-answer-message"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Little note complete ✦
          </motion.div>
        )}

        {!saved ? (
          <button
            className="play-together-primary-button"
            onClick={saveAnswer}
          >
            Complete Note
          </button>
        ) : (
          <button
            className="play-together-primary-button"
            onClick={nextPrompt}
          >
            Another Prompt →
          </button>
        )}
      </div>
    </GameModal>
  );
}

/* =========================================================
   GAME 3 — PICK A BOX
========================================================= */

function PickBox({ onClose }) {
  const [opened, setOpened] = useState(null);
  const [usedBoxes, setUsedBoxes] = useState([]);

  function openBox(index) {
    if (usedBoxes.includes(index)) return;

    setOpened(index);
    setUsedBoxes((current) => [...current, index]);
  }

  function chooseAgain() {
    setOpened(null);
  }

  return (
    <GameModal
      title="Pick a Box"
      subtitle="Choose one. You won't know what's inside."
      onClose={onClose}
    >
      {opened === null ? (
        <div className="play-together-box-game">
          <div className="play-together-box-grid">
            {BOX_CONTENT.map((_, index) => (
              <motion.button
                key={index}
                className={`play-together-mystery-box ${
                  usedBoxes.includes(index)
                    ? "is-used"
                    : ""
                }`}
                onClick={() => openBox(index)}
                whileHover={
                  usedBoxes.includes(index)
                    ? {}
                    : { y: -5, rotate: 1 }
                }
                whileTap={{ scale: 0.95 }}
              >
                <span>◇</span>

                <small>
                  {String(index + 1).padStart(2, "0")}
                </small>
              </motion.button>
            ))}
          </div>

          <p className="play-together-box-hint">
            Pick a box that feels right.
          </p>
        </div>
      ) : (
        <motion.div
          className="play-together-box-result"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="play-together-box-result-icon">
            {BOX_CONTENT[opened].icon}
          </div>

          <span>
            YOU FOUND
          </span>

          <h3>
            {BOX_CONTENT[opened].title}
          </h3>

          <p>
            {BOX_CONTENT[opened].text}
          </p>

          <button
            className="play-together-primary-button"
            onClick={chooseAgain}
          >
            Pick Another
          </button>
        </motion.div>
      )}
    </GameModal>
  );
}

/* =========================================================
   GAME 4 — FAST TAP
========================================================= */

function FastTap({ onClose }) {
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(10);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!playing) return;

    if (time <= 0) {
      setPlaying(false);
      setFinished(true);
      return;
    }

    const timer = setTimeout(() => {
      setTime((value) => value - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [playing, time]);

  function startGame() {
    setScore(0);
    setTime(10);
    setFinished(false);
    setPlaying(true);
  }

  function tap() {
    if (!playing) return;

    setScore((value) => value + 1);
  }

  return (
    <GameModal
      title="Fast Tap"
      subtitle="Catch as many stars as you can."
      onClose={onClose}
    >
      <div className="play-together-tap-game">

        {!playing && !finished && (
          <>
            <div className="play-together-tap-intro">
              <div>✦</div>

              <h3>
                Ready?
              </h3>

              <p>
                You have 10 seconds.
                Tap the star as fast as you can.
              </p>
            </div>

            <button
              className="play-together-primary-button"
              onClick={startGame}
            >
              Start
            </button>
          </>
        )}

        {playing && (
          <>
            <div className="play-together-tap-stats">
              <div>
                <span>TIME</span>
                <strong>{time}s</strong>
              </div>

              <div>
                <span>SCORE</span>
                <strong>{score}</strong>
              </div>
            </div>

            <motion.button
              className="play-together-tap-target"
              onClick={tap}
              whileTap={{
                scale: 0.8,
                rotate: 10,
              }}
              animate={{
                y: [0, -7, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              ✦
            </motion.button>

            <p className="play-together-tap-hint">
              Tap the star!
            </p>
          </>
        )}

        {finished && (
          <div className="play-together-result">
            <div className="play-together-result-icon">
              ✦
            </div>

            <span>
              YOUR SCORE
            </span>

            <strong>
              {score}
            </strong>

            <p>
              stars in 10 seconds.
            </p>

            <button
              className="play-together-primary-button"
              onClick={startGame}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </GameModal>
  );
}

/* =========================================================
   SHARED MODAL
========================================================= */

function GameModal({
  title,
  subtitle,
  onClose,
  children,
}) {
  return (
    <motion.div
      className="play-together-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="play-together-modal"
        initial={{
          opacity: 0,
          y: 25,
          scale: 0.97,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: 20,
          scale: 0.97,
        }}
        transition={{ duration: 0.25 }}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="play-together-modal-header">
          <div>
            <span className="play-together-modal-eyebrow">
              ✦ PLAY TIME
            </span>

            <h2>{title}</h2>

            <p>{subtitle}</p>
          </div>

          <button
            type="button"
            className="play-together-modal-close"
            onClick={onClose}
            aria-label="Close game"
          >
            ×
          </button>
        </div>

        <div className="play-together-modal-body">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
