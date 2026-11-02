// RECIPE BOX API, WEEK 11, CHECKPOINT 12: only the cook enters the galley
//
//   server.js            <- you are here: wiring only, top to bottom
//   config/env.js        <- the only file that reads process.env
//   routes/recipes.js    <- the navigator: reads req, picks status codes
//   services/recipes.js  <- NEW: the cook, the only file that talks to Supabase
//   middleware/          <- logger, validation, 404, errors
//   data/supabase.js     <- the connection to the database

import express from "express";
import cors from "cors";
import { logger } from "./middleware/logger.js";
import { notFound, errorHandler } from "./middleware/errors.js";
import recipesRouter from "./routes/recipes.js";
import { config } from "./config/env.js";

const app = express();

// 1. Who is allowed to call us from a browser (your Vite app on 5173).
app.use(cors({ origin: "http://localhost:5173" }));

// 2. Log every request.
app.use(logger);

// 3. Turn JSON bodies into req.body.
app.use(express.json());

// 4. Routes.
app.get("/", (req, res) => {
  res.json({ name: "Recipe Box API", endpoints: ["/api/recipes", "/api/recipes/:id"] });
});
app.use("/api/recipes", recipesRouter);

// 5. Nothing matched.
app.use(notFound);

// 6. Something threw (including database errors).
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Galley open at http://localhost:${config.port}`);
});
