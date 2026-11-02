// RECIPE BOX API, WEEK 11, CHECKPOINT 13: the ship and the voyage are different things
//
//   app.js               <- you are here: BUILDS the app and exports it. Never listens.
//   server.js            <- NEW: starts the app on your laptop. The only file that listens.
//   config/env.js        <- the only file that reads process.env
//   routes/recipes.js    <- the navigator: reads req, picks status codes
//   services/recipes.js  <- the cook: the only file that talks to Supabase
//   middleware/          <- the lookouts: logger, validation, 404, errors
//   data/supabase.js     <- the pantry door
//
// Question for later: what could use an app that does NOT listen on a port?
// (Hold that thought until Thursday.)

import express from "express";
import cors from "cors";
import { logger } from "./middleware/logger.js";
import { notFound, errorHandler } from "./middleware/errors.js";
import recipesRouter from "./routes/recipes.js";

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

// Hand the finished ship to whoever imports this file.
export default app;
