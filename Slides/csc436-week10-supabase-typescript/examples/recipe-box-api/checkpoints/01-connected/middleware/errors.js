// The last two stations on the assembly line.

// 404: nothing above matched this method + path.
export function notFound(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
}

// Error handler: Express spots it by the FOUR parameters.
// Anything thrown in a route (sync or async, in Express 5) lands here.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Bad JSON in a request body: express.json() throws with status 400.
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body is not valid JSON" });
  }
  console.error("Error:", err.message);
  res.status(err.status ?? 500).json({ error: "Something went wrong in the kitchen" });
}
