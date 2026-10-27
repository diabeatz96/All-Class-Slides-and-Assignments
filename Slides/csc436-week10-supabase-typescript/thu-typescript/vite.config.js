import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The live TypeScript checker (slides 4 to 9 and 13) loads the TypeScript
// compiler on demand as its own chunk, so it is large on purpose.
export default defineConfig({
  plugins: [react()],
  build: { chunkSizeWarningLimit: 5000 },
});
