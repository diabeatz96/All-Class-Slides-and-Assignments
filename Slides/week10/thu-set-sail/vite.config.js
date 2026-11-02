import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Both decks use port 4100 on purpose:
//  - 5173 stays free for the harbor-client (the CORS demo page).
//  - The Crew Bounty Board is saved in the browser per origin, so running
//    both decks on the same port keeps Tuesday's bounties for Thursday.
export default defineConfig({
  plugins: [react()],
  server: { port: 4100, strictPort: true },
  preview: { port: 4173 },
});
