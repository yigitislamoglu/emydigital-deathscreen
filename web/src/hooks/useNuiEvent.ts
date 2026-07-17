import { useEffect, useRef } from "react";

type NuiHandler<T> = (data: T) => void;

/** Listens for Lua SendNUIMessage({ action, data }). */
export function useNuiEvent<T = unknown>(
  action: string,
  handler: NuiHandler<T>,
): void {
  const saved = useRef(handler);
  saved.current = handler;

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const payload = event.data;
      if (!payload || payload.action !== action) return;
      saved.current(payload.data as T);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [action]);
}
