// server.js: SETS SAIL on your laptop.
// The only file that calls listen(). Run it with: npm run dev
//
// app.js builds the ship. This file just pushes it into the water.

import app from "./app.js";
import { config } from "./config/env.js";

app.listen(config.port, () => {
  console.log(`Galley open at http://localhost:${config.port}`);
});
