import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base for FiveM nui://resource/...
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
});
