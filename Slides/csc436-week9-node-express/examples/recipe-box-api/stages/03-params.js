// STAGE 3: ONE RECIPE BY ID (run with: npm run stage3)
//
// /api/recipes/3 should return ONE recipe, the one with id 3.
// We cannot write a route for every id. Instead we write a PATTERN:
//
//   /api/recipes/:id
//
// The colon means "this part is a variable." Express puts whatever was in
// that spot into req.params.id.
//
// THE TRAP: req.params.id is ALWAYS A STRING. "3", not 3.
// Our ids are numbers. "3" === 3 is false. So find() finds nothing.
// Same string-vs-number bug from Week 2. It is back.

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
  res.json(recipes);
});

app.get("/api/recipes/:id", (req, res) => {
  // BROKEN VERSION (try it first, then fix it):
  // const recipe = recipes.find((r) => r.id === req.params.id);

  // FIXED: turn the string into a number before comparing.
  const id = Number(req.params.id);
  const recipe = recipes.find((r) => r.id === id);

  // Not found is not an error in our code, it is a normal answer.
  // We say so with status 404 and a JSON message the frontend can show.
  if (!recipe) {
    return res.status(404).json({ error: `No recipe with id ${req.params.id}` });
  }

  res.json(recipe);
});

app.listen(PORT, () => {
  console.log(`Kitchen open at http://localhost:${PORT}`);
});

// TRY IT
//   /api/recipes/3     -> Pad Thai
//   /api/recipes/99    -> 404 { "error": "No recipe with id 99" }
//   /api/recipes/pizza -> 404 too. Number("pizza") is NaN, and NaN matches nothing.
//
// WHY "return res.status(404)..."?
//   Without return, the function keeps going and hits res.json(recipe) as well.
//   Sending twice crashes with: "Cannot set headers after they are sent to the client"
