// RECIPE BOX API, FINAL VERSION (run with: npm run dev)
//
// Same server as stage 7, organized the way real projects are:
//
//   final/
//     server.js            <- you are here: wiring only, top to bottom
//     routes/recipes.js    <- every /api/recipes route
//     middleware/          <- logger, validation, 404, errors
//     data/recipes.js      <- the in-memory data (Supabase replaces this next week)
//
// Read this file as the assembly line. Order is the whole point.

import express from "express";
import cors from "cors";
import { logger } from "./middleware/logger.js";
import { notFound, errorHandler } from "./middleware/errors.js";
import recipesRouter from "./routes/recipes.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

// 1. Who is allowed to call us from a browser. Your Vite app runs on
//    port 5173, a different "origin" than 3000, so the browser blocks it
//    unless the server says yes. Full CORS story on Nov 5.
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

// 6. Something threw.
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Kitchen open at http://localhost:${PORT}`);
});
