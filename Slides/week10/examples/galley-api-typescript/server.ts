// server.ts: SETS SAIL on your laptop. The only file that calls listen().

import app from "./app.ts";
import { config } from "./config/env.ts";

app.listen(config.port, () => {
  console.log(`Galley open at http://localhost:${config.port}`);
});
