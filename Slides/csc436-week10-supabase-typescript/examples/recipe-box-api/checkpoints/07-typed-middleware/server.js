// RECIPE BOX API, WEEK 10 (run with: npm run dev)
//
//   server.js            <- you are here: wiring only, top to bottom
//   routes/recipes.js    <- every /api/recipes route, now talking to Supabase
//   middleware/          <- logger, validation, 404, errors
//   data/supabase.js     <- the connection to the database (replaces data/recipes.js)
//
// This file did not change from last week. The assembly line is the same.
// Only the pantry moved: from an array in memory to a real database.

import express from "express";
import cors from "cors";
import { logger } from "./middleware/logger.ts";
import { notFound, errorHandler } from "./middleware/errors.ts";
import recipesRouter from "./routes/recipes.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

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

app.listen(PORT, () => {
  console.log(`Kitchen open at http://localhost:${PORT}`);
});
