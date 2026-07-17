import { useEffect } from "react";

/**
 * Scales the death UI from a 1080p design baseline.
 * Uses JS because FiveM CEF often mishandles CSS min()/clamp() with vw/vh on 2K/4K.
 */
export function useUiScale(): void {
  useEffect(() => {
    const apply = () => {
      const w = window.innerWidth || 1920;
      const h = window.innerHeight || 1080;
      // Fit to viewport; never shrink below 1080p design size
      const scale = Math.max(w / 1920, h / 1080);
      const clamped = Math.min(Math.max(scale, 1), 2.75);
      document.documentElement.style.setProperty("--ui-scale", clamped.toFixed(4));
      document.documentElement.style.setProperty("--vh", `${h * 0.01}px`);
    };

    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);
}
