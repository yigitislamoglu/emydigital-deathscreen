import { useCallback, useEffect, useState } from "react";
import ActionButtons from "./components/ActionButtons";
import Background from "./components/Background";
import Header from "./components/Header";
import Minigame from "./components/Minigame";
import { useNuiEvent } from "./hooks/useNuiEvent";
import { useUiScale } from "./hooks/useUiScale";
import {
  DEFAULT_CONFIG,
  type DeathConfig,
  type OpenDeathData,
} from "./utils/config";
import { fetchNui, isEnvBrowser } from "./utils/nui";

function mergeOpenPayload(data: OpenDeathData): DeathConfig {
  return {
    translations: data.translations ?? {
      ...DEFAULT_CONFIG.translations,
      titleLine1: data.playerName ?? DEFAULT_CONFIG.translations.titleLine1,
    },
    settings: {
      ...DEFAULT_CONFIG.settings,
      ...data.settings,
      defaultTimer:
        data.timer ??
        data.settings?.defaultTimer ??
        DEFAULT_CONFIG.settings.defaultTimer,
    },
  };
}

function App() {
  useUiScale();

  const [visible, setVisible] = useState(isEnvBrowser());
  const [config, setConfig] = useState<DeathConfig>(DEFAULT_CONFIG);
  const [timer, setTimer] = useState(DEFAULT_CONFIG.settings.defaultTimer);
  const [gameOpen, setGameOpen] = useState(false);
  const [freecamActive, setFreecamActive] = useState(false);

  useNuiEvent<OpenDeathData>("open", (data) => {
    const next = mergeOpenPayload(data ?? {});
    setConfig(next);
    setTimer(next.settings.defaultTimer);
    setGameOpen(false);
    setFreecamActive(false);
    setVisible(true);
  });

  useNuiEvent("close", () => {
    setVisible(false);
    setGameOpen(false);
    setFreecamActive(false);
  });

  useNuiEvent<{ active?: boolean }>("setFreecam", (data) => {
    setFreecamActive(!!data?.active);
  });

  useNuiEvent<{ timer: number }>("updateTimer", (data) => {
    if (typeof data?.timer === "number") setTimer(data.timer);
  });

  useEffect(() => {
    fetchNui("nuiReady");
  }, []);

  const onTimerExpired = useCallback(() => {
    fetchNui("timerExpired");
  }, []);

  // F / G / E hotkeys while the deathscreen has NUI focus
  useEffect(() => {
    if (!visible || gameOpen || freecamActive) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;

      const key = event.key.toLowerCase();
      if (key === "f" && config.settings.enableFreecam) {
        event.preventDefault();
        fetchNui("freecam");
        return;
      }
      if (key === "g" && config.settings.dispatchEnabled) {
        event.preventDefault();
        fetchNui("dispatch");
        return;
      }
      if (key === "e" && config.settings.enableRespawn && timer <= 0) {
        event.preventDefault();
        fetchNui("respawn");
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, gameOpen, freecamActive, config.settings, timer]);

  if (!visible) return null;

  if (freecamActive) {
    return (
      <div className="deathscreen-root deathscreen-root--freecam">
        <div className="freecam-hint">
          <span className="freecam-hint__key">F</span>
          <span>Exit free camera · WASD move · Mouse look · Shift faster · Space/Ctrl up/down</span>
        </div>
      </div>
    );
  }

  return (
    <div className="deathscreen-root">
      <Background active={visible && !gameOpen} />

      <div className="deathscreen-content">
        <Header
          translations={config.translations}
          secondsLeft={timer}
          onTick={setTimer}
          onExpired={onTimerExpired}
        />
        <ActionButtons
          translations={config.translations}
          settings={config.settings}
          canRespawn={timer <= 0}
          onOpenMinigames={() => setGameOpen(true)}
        />
      </div>

      {gameOpen && <Minigame onClose={() => setGameOpen(false)} />}
    </div>
  );
}

export default App;
