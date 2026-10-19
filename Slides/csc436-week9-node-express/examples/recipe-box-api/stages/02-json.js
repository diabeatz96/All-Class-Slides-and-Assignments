// STAGE 2: SEND DATA, NOT SENTENCES (run with: npm run stage2)
//
// A web page wants HTML. A React app wants DATA.
// res.json() turns a JavaScript value into JSON text and tells the
// browser "this is JSON" with a Content-Type header.
//
// This is the exact shape your Recipe Finder fetched from dummyjson.
// Today, YOU are dummyjson.

import express from "express";

const app = express();
const PORT = 3000;

// Our "database" for now: an array in memory.
// It resets every time the server restarts. Supabase fixes that next week.
const recipes = [
  { id: 1, name: "Margherita Pizza", cuisine: "Italian", minutes: 25, tags: ["vegetarian", "oven"] },
  { id: 2, name: "Chicken Tikka Masala", cuisine: "Indian", minutes: 50, tags: ["spicy", "dinner"] },
  { id: 3, name: "Pad Thai", cuisine: "Thai", minutes: 30, tags: ["noodles", "dinner"] },
  { id: 4, name: "Avocado Toast", cuisine: "American", minutes: 10, tags: ["vegetarian", "breakfast"] },
  { id: 5, name: "Beef Tacos", cuisine: "Mexican", minutes: 20, tags: ["quick", "dinner"] },
  { id: 6, name: "Shakshuka", cuisine: "Middle Eastern", minutes: 35, tags: ["vegetarian", "breakfast"] },
];

app.get("/", (req, res) => {
  res.send("Recipe Box API. Try /api/recipes");
});

// Convention: data routes start with /api so they never collide with pages.
app.get("/api/recipes", (req, res) => {
  res.json(recipes);
});

// res.json works with any value: objects, arrays, numbers, booleans.
app.get("/api/stats", (req, res) => {
  res.json({ count: recipes.length, fastest: Math.min(...recipes.map((r) => r.minutes)) });
});

app.listen(PORT, () => {
  console.log(`Kitchen open at http://localhost:${PORT}`);
});

// TRY IT
//   http://localhost:3000/api/recipes  -> the whole array
//   http://localhost:3000/api/stats    -> { "count": 6, "fastest": 10 }
//   Open DevTools > Network, reload, click the request, look at
//   Response Headers. Find Content-Type: application/json.
