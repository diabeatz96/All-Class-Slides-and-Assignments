// RECIPE BOX API, WEEK 11, CHECKPOINT 15 (THURSDAY): set sail
//
// What changed for Vercel? Almost nothing, on purpose.
// Vercel looks for app.js (or index.js / server.js) that imports express and
// does `export default app`. It found this file. It never runs server.js.
// The only new code is a health check you can open after every deploy.
//
//   app.js               <- you are here: BUILDS the app and exports it. Never listens.
//   server.js            <- starts the app on your laptop. The only file that listens.
//   config/env.js        <- the only file that reads process.env
//   routes/recipes.js    <- the navigator: reads req, picks status codes
//   services/recipes.js  <- the cook: the only file that talks to Supabase
//   middleware/          <- the lookouts: logger, validation, 404, errors
//   data/supabase.js     <- the pantry door
//
// Tuesday's question, answered: what could use an app that does NOT listen?
// Vercel. It imports this file and calls the app for each request.

import express from "express";
import cors from "cors";
import { logger } from "./middleware/logger.js";
import { notFound, errorHandler } from "./middleware/errors.js";
import recipesRouter from "./routes/recipes.js";
import { config } from "./config/env.js";

const app = express();

// 1. The lookout at the top of the mast: log EVERY request, first.
//    First on purpose: cors() answers preflight OPTIONS requests by itself,
//    so a logger placed after it would never see them.
app.use(logger);

// 2. CORS: which OTHER websites may read our responses in a browser.
//    The list lives in the CORS_ORIGINS env var, so it can change per machine
//    (your laptop today, the internet on Thursday) without touching code.
//    It must come BEFORE the routes, or the routes answer without the header.
app.use(cors({ origin: config.corsOrigins }));

// 3. Turn JSON bodies into req.body.
app.use(express.json());

// 4. Routes.
app.get("/", (req, res) => {
  res.json({ name: "Recipe Box API", endpoints: ["/api/health", "/api/recipes", "/api/recipes/:id"] });
});

// NEW: a health check. Open it first after every deploy.
// It proves the function starts, the config loaded, and which machine answered.
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    runningOn: config.runningOnVercel ? "vercel" : "your laptop",
    time: new Date().toISOString(),
  });
});
app.use("/api/recipes", recipesRouter);

// 5. Nothing matched.
app.use(notFound);

// 6. Something threw (including database errors).
app.use(errorHandler);

// Hand the finished ship to whoever imports this file.
export default app;
