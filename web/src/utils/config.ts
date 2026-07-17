export type DeathTranslations = {
  titleLine1: string;
  titleLine2: string;
  timerLabel: string;
  buttons: {
    press: string;
    locked: string;
    freecam: string;
    dispatch: string;
    respawn: string;
    minigame: string;
  };
};

export type DeathSettings = {
  defaultTimer: number;
  enableMinigame: boolean;
  enableFreecam: boolean;
  enableRespawn: boolean;
  dispatchEnabled: boolean;
};

export type DeathConfig = {
  translations: DeathTranslations;
  settings: DeathSettings;
};

/** Fallback when Lua does not override translations/settings. */
export const DEFAULT_CONFIG: DeathConfig = {
  translations: {
    titleLine1: "PLAYER NAME",
    titleLine2: "UNCONSCIOUS",
    timerLabel: "Time remaining until respawn:",
    buttons: {
      press: "Press",
      locked: "Locked",
      freecam: "Free Camera",
      dispatch: "Send Signal",
      respawn: "Give Up",
      minigame: "Minigame",
    },
  },
  settings: {
    defaultTimer: 300,
    enableMinigame: true,
    enableFreecam: true,
    enableRespawn: true,
    dispatchEnabled: true,
  },
};

export type OpenDeathData = {
  timer?: number;
  playerName?: string;
  translations?: DeathTranslations;
  settings?: Partial<DeathSettings>;
};
