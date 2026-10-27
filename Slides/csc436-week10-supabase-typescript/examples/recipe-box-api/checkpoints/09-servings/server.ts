// RECIPE BOX API, WEEK 10, TYPESCRIPT (run with: npm run dev)
// Node 22.18+ runs this .ts file directly by erasing the types.
// Node does NOT check the types. `npm run typecheck` does that.

import express from "express";
import cors from "cors";
import { logger } from "./middleware/logger.ts";
import { notFound, errorHandler } from "./middleware/errors.ts";
import recipesRouter from "./routes/recipes.ts";

const app = express();
const PORT = Number(process.env.PORT ?? 3000); // env values are text; listen wants a number

app.use(cors({ origin: "http://localhost:5173" }));
app.use(logger);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ name: "Recipe Box API", endpoints: ["/api/recipes", "/api/recipes/:id"] });
});
app.use("/api/recipes", recipesRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Kitchen open at http://localhost:${PORT}`);
});
