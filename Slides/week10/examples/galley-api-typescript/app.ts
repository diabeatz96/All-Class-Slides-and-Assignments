// app.ts: BUILDS the app and exports it. Never listens.
// Vercel finds this file (it imports express and default-exports the app)
// and turns it into one Vercel Function. server.ts never runs on Vercel.

import express from "express";
import cors from "cors";
import { config } from "./config/env.ts";
import { logger } from "./middleware/logger.ts";
import { notFound, errorHandler } from "./middleware/errors.ts";
import recipesRouter from "./routes/recipes.ts";

const app = express();

app.use(logger); // first, so it even sees the preflight OPTIONS requests
app.use(cors({ origin: config.corsOrigins })); // BEFORE the routes
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ name: "Recipe Box API", endpoints: ["/api/health", "/api/recipes", "/api/recipes/:id"] });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    runningOn: config.runningOnVercel ? "vercel" : "your laptop",
    time: new Date().toISOString(),
  });
});

app.use("/api/recipes", recipesRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
