import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Port 4100 keeps 3000 (API) and 5173 (React site) free for the live demo.
export default defineConfig({
  plugins: [react()],
  server: { port: 4100, strictPort: true },
  preview: { port: 4100, strictPort: true },
});
