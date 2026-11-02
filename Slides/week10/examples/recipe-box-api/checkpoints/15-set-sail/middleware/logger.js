// Logs one line per request after the response is sent.
// GET /api/recipes?cuisine=thai -> 200 (2ms)

export function logger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
}
