import { Clock, Skull } from "lucide-react";
import { memo, useEffect, useRef } from "react";
import type { DeathTranslations } from "../utils/config";

type HeaderProps = {
  translations: DeathTranslations;
  secondsLeft: number;
  onTick: (next: number) => void;
  onExpired: () => void;
};

function formatTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function Header({ translations, secondsLeft, onTick, onExpired }: HeaderProps) {
  const chars = formatTime(secondsLeft).split("");
  const expiredOnce = useRef(false);

  useEffect(() => {
    if (secondsLeft > 0) {
      expiredOnce.current = false;
      const id = window.setTimeout(() => onTick(secondsLeft - 1), 1000);
      return () => window.clearTimeout(id);
    }

    if (!expiredOnce.current) {
      expiredOnce.current = true;
      onExpired();
    }
  }, [secondsLeft, onTick, onExpired]);

  return (
    <header className="deathscreen-header">
      <div className="deathscreen-header__icon-wrap">
        <Skull className="deathscreen-header__skull" strokeWidth={1.5} />
      </div>

      <div className="deathscreen-header__titles">
        <span className="deathscreen-header__name">{translations.titleLine1}</span>
        <div className="deathscreen-header__title-backdrop">
          <span className="deathscreen-header__title text-glow-accent">
            {translations.titleLine2}
          </span>
        </div>
      </div>

      <div className="deathscreen-header__timer-label">
        <Clock size={14} aria-hidden="true" />
        <span>{translations.timerLabel}</span>
      </div>

      <div
        className="deathscreen-header__digits"
        role="timer"
        aria-live="polite"
        aria-label={`Time remaining: ${formatTime(secondsLeft)}`}
      >
        {chars.map((char, i) =>
          char === ":" ? (
            <span key={`c-${i}`} className="deathscreen-header__colon" aria-hidden="true">
              :
            </span>
          ) : (
            <div key={`d-${i}`} className="digit-glass">
              {char}
            </div>
          ),
        )}
      </div>
    </header>
  );
}

export default memo(Header);
