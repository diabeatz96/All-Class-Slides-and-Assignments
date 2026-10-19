// STAGE 1: HELLO SERVER (run with: npm run stage1)
//
// The smallest Express server that does anything.
// Five ideas, one per block. Read top to bottom.

// 1. Import Express. ESM syntax, because package.json says "type": "module".
import express from "express";

// 2. Make an app. "app" is your server. Everything hangs off it.
const app = express();

// 3. Pick a port. A port is a numbered door on your computer.
//    Vite used 5173. Our API will live at 3000.
const PORT = 3000;

// 4. Add a ROUTE. A route is a rule:
//    "when a GET request arrives for the path /, run this function."
//    req = the request (what the browser asked for)
//    res = the response (what we send back)
app.get("/", (req, res) => {
  res.send("Welcome to the Recipe Box kitchen.");
});

// A second route, so you can see the server choose between them.
app.get("/about", (req, res) => {
  res.send("This kitchen is run by CSC 436.");
});

// 5. Start listening. Until this line runs, nothing can reach the server.
//    The program does NOT end after this. It waits for requests forever.
//    Ctrl + C in the terminal stops it.
app.listen(PORT, () => {
  console.log(`Kitchen open at http://localhost:${PORT}`);
});

// TRY IT
//   Open http://localhost:3000        -> welcome text
//   Open http://localhost:3000/about  -> about text
//   Open http://localhost:3000/menu   -> "Cannot GET /menu" (no route matched, Express sends a 404)
//   Edit the welcome text and save. node --watch restarts the server for you.
