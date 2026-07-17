import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Bird, Grid2x2, X } from "lucide-react";
import { memo, useEffect, useRef, useState, type CSSProperties } from "react";

type GameId = "2048" | "clumsy";

type MinigameProps = {
  onClose: () => void;
};

const GAMES = [
  {
    id: "2048" as const,
    title: "2048",
    description: "Merge tiles and reach 2048.",
    hint: "Arrow keys",
    src: "./2048/index.html",
    icon: Grid2x2,
    accent: "#c4334a",
  },
  {
    id: "clumsy" as const,
    title: "Clumsy Bird",
    description: "Fly between the pipes for as long as you can.",
    hint: "Space / Click",
    src: "./clumsy-bird/index.html",
    icon: Bird,
    accent: "#a82d3f",
  },
];

function Minigame({ onClose }: MinigameProps) {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const selected = GAMES.find((g) => g.id === activeGame) ?? null;

  // Forward Escape / Space / arrows into the embedded iframe
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (activeGame) {
          setActiveGame(null);
          return;
        }
        onClose();
        return;
      }

      const win = iframeRef.current?.contentWindow;
      if (!activeGame || !win) return;

      if (activeGame === "clumsy" && (event.code === "Space" || event.key === " ")) {
        event.preventDefault();
        if (event.repeat) return;
        win.postMessage({ type: "clumsy-key", code: event.code, key: event.key }, "*");
        return;
      }

      if (activeGame === "2048") {
        const arrows = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
        const wasd = ["w", "a", "s", "d", "W", "A", "S", "D"];
        if (!arrows.includes(event.key) && !wasd.includes(event.key)) return;
        event.preventDefault();
        win.postMessage(
          { type: "2048-key", key: event.key, which: event.which || event.keyCode },
          "*",
        );
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeGame, onClose]);

  useEffect(() => {
    if (!activeGame) return;
    const id = window.setTimeout(() => iframeRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [activeGame]);

  return (
    <motion.div
      className="minigame-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div
            key="picker"
            className="minigame-picker"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="minigame-picker__header">
              <div>
                <p className="minigame-picker__eyebrow">Play while you wait</p>
                <h2 className="minigame-picker__title">Choose a Game</h2>
              </div>
              <button type="button" onClick={onClose} className="minigame-close-btn" aria-label="Close">
                <X size={16} />
                <span>ESC</span>
              </button>
            </div>

            <div className="minigame-picker__grid">
              {GAMES.map((game, index) => {
                const Icon = game.icon;
                return (
                  <motion.button
                    key={game.id}
                    type="button"
                    className="minigame-card"
                    style={{ "--card-accent": game.accent } as CSSProperties}
                    onClick={() => setActiveGame(game.id)}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.08 + index * 0.06,
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.985 }}
                  >
                    <div className="minigame-card__glow" aria-hidden="true" />
                    <div className="minigame-card__icon">
                      <Icon size={28} strokeWidth={1.6} />
                    </div>
                    <div className="minigame-card__body">
                      <h3 className="minigame-card__title">{game.title}</h3>
                      <p className="minigame-card__desc">{game.description}</p>
                      <span className="minigame-card__hint">{game.hint}</span>
                    </div>
                    <span className="minigame-card__cta">Play</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="stage"
            className="minigame-stage"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="minigame-stage__bar">
              <button type="button" onClick={() => setActiveGame(null)} className="minigame-back-btn">
                <ArrowLeft size={15} />
                <span>Games</span>
              </button>
              <div className="minigame-stage__title">
                <span className="minigame-stage__dot" aria-hidden="true" />
                {selected.title}
              </div>
              <button type="button" onClick={onClose} className="minigame-close-btn" aria-label="Close">
                <X size={16} />
                <span>ESC</span>
              </button>
            </div>

            <div className="minigame-stage__frame">
              <iframe
                ref={iframeRef}
                key={selected.id}
                src={selected.src}
                className="minigame-stage__iframe"
                title={selected.title}
                allow="autoplay"
                tabIndex={0}
                onLoad={() => iframeRef.current?.focus()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default memo(Minigame);
