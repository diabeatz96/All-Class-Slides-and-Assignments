// STAGE 0: THE TRAP (run with: npm run oops)
//
// This file is broken ON PURPOSE. Run it and read the error out loud.
//
// package.json says "type": "module". That one line tells Node:
// "every .js file in this project is an ES module."
// ES modules use import / export. The old CommonJS style
// (require / module.exports) does not exist here.
//
// You will see:
//   ReferenceError: require is not defined in ES module scope
//
// Every tutorial from before about 2022, and a lot of AI answers, still
// paste require(). When you see this error, the fix is always the same:
//
//   const express = require("express");   // CommonJS, does not work here
//   import express from "express";        // ESM, this is what we use
//
// Fix this file yourself: swap the require line for the import line,
// and swap module.exports for export default.

const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("If you can read this, you fixed the import.");
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

module.exports = app;
