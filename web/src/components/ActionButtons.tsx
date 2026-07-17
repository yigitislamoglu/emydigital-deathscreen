import { Gamepad2, Lock } from "lucide-react";
import { memo, type ReactNode } from "react";
import type { DeathSettings, DeathTranslations } from "../utils/config";
import { fetchNui } from "../utils/nui";

type ActionButtonsProps = {
  translations: DeathTranslations;
  settings: DeathSettings;
  canRespawn: boolean;
  onOpenMinigames: () => void;
};

type ActionButton = {
  id: string;
  key?: string;
  label: string;
  pressLabel: string;
  variant: "primary" | "danger";
  disabled?: boolean;
  locked?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
};

function ActionButtons({
  translations,
  settings,
  canRespawn,
  onOpenMinigames,
}: ActionButtonsProps) {
  const buttons: ActionButton[] = [
    ...(settings.enableMinigame
      ? [
          {
            id: "minigame",
            label: translations.buttons.minigame,
            pressLabel: translations.buttons.press,
            variant: "primary" as const,
            onClick: onOpenMinigames,
            icon: <Gamepad2 size={16} aria-hidden="true" />,
          },
        ]
      : []),
    ...(settings.enableFreecam
      ? [
          {
            id: "freecam",
            key: "F",
            label: translations.buttons.freecam,
            pressLabel: translations.buttons.press,
            variant: "primary" as const,
            onClick: () => fetchNui("freecam"),
          },
        ]
      : []),
    {
      id: "dispatch",
      key: "G",
      label: translations.buttons.dispatch,
      pressLabel: translations.buttons.press,
      variant: "primary",
      disabled: !settings.dispatchEnabled,
      onClick: () => fetchNui("dispatch"),
    },
    ...(settings.enableRespawn
      ? [
          {
            id: "respawn",
            key: "E",
            label: translations.buttons.respawn,
            pressLabel: canRespawn
              ? translations.buttons.press
              : translations.buttons.locked,
            variant: "danger" as const,
            disabled: !canRespawn,
            locked: !canRespawn,
            onClick: () => {
              if (!canRespawn) return;
              fetchNui("respawn");
            },
            icon: !canRespawn ? <Lock size={15} aria-hidden="true" /> : undefined,
          },
        ]
      : []),
  ];

  return (
    <div className="action-buttons-wrap">
      <div className="action-buttons-panel">
        <div className="action-buttons-row">
          {buttons.map(
            ({ id, key, label, pressLabel, variant, disabled, locked, onClick, icon }) => (
              <button
                key={id}
                type="button"
                disabled={disabled}
                onClick={onClick}
                className={[
                  "action-btn",
                  `action-btn--${variant}`,
                  locked ? "action-btn--locked" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="action-btn__key">{icon ?? key}</span>
                <span className="action-btn__content">
                  <span className="action-btn__press">{pressLabel}</span>
                  <span className="action-btn__label">{label}</span>
                </span>
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ActionButtons);
