// STAGE 4: FILTER WITH A QUERY STRING (run with: npm run stage4)
//
// Two ways to put information in a URL:
//
//   PARAMS  /api/recipes/3                  which ONE thing?     req.params.id
//   QUERY   /api/recipes?cuisine=Thai       how to FILTER a list  req.query.cuisine
//
// Everything after the ? is the query string: key=value pairs joined by &.
//   /api/recipes?cuisine=Italian&maxMinutes=30
//   req.query -> { cuisine: "Italian", maxMinutes: "30" }
//
// Same trap as params: every query value is a STRING. "30", not 30.

import express from "express";

const app = express();
const PORT = 3000;

const recipes = [
  { id: 1, name: "Margherita Pizza", cuisine: "Italian", minutes: 25, tags: ["vegetarian", "oven"] },
  { id: 2, name: "Chicken Tikka Masala", cuisine: "Indian", minutes: 50, tags: ["spicy", "dinner"] },
  { id: 3, name: "Pad Thai", cuisine: "Thai", minutes: 30, tags: ["noodles", "dinner"] },
  { id: 4, name: "Avocado Toast", cuisine: "American", minutes: 10, tags: ["vegetarian", "breakfast"] },
  { id: 5, name: "Beef Tacos", cuisine: "Mexican", minutes: 20, tags: ["quick", "dinner"] },
  { id: 6, name: "Shakshuka", cuisine: "Middle Eastern", minutes: 35, tags: ["vegetarian", "breakfast"] },
];

app.get("/api/recipes", (req, res) => {
  const { cuisine, maxMinutes, tag, q } = req.query;

  // Start with everything, then narrow down one filter at a time.
  // Each filter only applies if that key was actually in the URL.
  let results = recipes;

  if (cuisine) {
    results = results.filter((r) => r.cuisine.toLowerCase() === cuisine.toLowerCase());
  }
  if (maxMinutes) {
    results = results.filter((r) => r.minutes <= Number(maxMinutes));
  }
  if (tag) {
    results = results.filter((r) => r.tags.includes(tag));
  }
  if (q) {
    results = results.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));
  }

  // An empty array is a valid answer. "No matches" is still a 200.
  res.json(results);
});

app.get("/api/recipes/:id", (req, res) => {
  const recipe = recipes.find((r) => r.id === Number(req.params.id));
  if (!recipe) return res.status(404).json({ error: `No recipe with id ${req.params.id}` });
  res.json(recipe);
});

app.listen(PORT, () => {
  console.log(`Kitchen open at http://localhost:${PORT}`);
});

// TRY IT
//   /api/recipes?cuisine=thai
//   /api/recipes?maxMinutes=25
//   /api/recipes?tag=vegetarian&maxMinutes=30
//   /api/recipes?q=taco
//   /api/recipes?cuisine=klingon   -> [] with status 200
//
// THIS IS THE END OF TUESDAY. Everything so far only READS data.
// Thursday: creating, updating, and deleting, plus middleware.
