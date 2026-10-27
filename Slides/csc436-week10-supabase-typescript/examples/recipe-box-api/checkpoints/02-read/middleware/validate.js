// Route-level middleware. Each one runs only on the routes you attach it to.

// NEW THIS WEEK. The database stores ids as whole numbers, and it refuses
// to even compare "two" with a number: that becomes a 500 error.
// So we turn away anything that is not a positive whole number first.
export function checkId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(404).json({ error: `No recipe with id ${req.params.id}` });
  }
  next();
}

// Same as last week. Collects every problem so the client can fix them all at once.
export function validateRecipe(req, res, next) {
  const { name, cuisine, minutes, tags } = req.body ?? {};
  const problems = [];

  if (typeof name !== "string" || !name.trim()) problems.push("name is required and must be text");
  if (typeof cuisine !== "string" || !cuisine.trim()) problems.push("cuisine is required and must be text");
  if (typeof minutes !== "number" || !Number.isFinite(minutes) || minutes <= 0) problems.push("minutes must be a positive number");
  if (tags !== undefined && (!Array.isArray(tags) || !tags.every((t) => typeof t === "string"))) problems.push("tags must be an array of text");

  if (problems.length > 0) {
    return res.status(400).json({ error: "Invalid recipe", problems });
  }
  next();
}

// Lighter check for PATCH: every field is optional, but the ones sent must be valid.
export function validateRecipePatch(req, res, next) {
  const body = req.body ?? {};
  const allowed = ["name", "cuisine", "minutes", "tags"];
  const problems = [];

  const sent = Object.keys(body).filter((k) => allowed.includes(k));
  if (sent.length === 0) problems.push(`send at least one of: ${allowed.join(", ")}`);
  if ("name" in body && (typeof body.name !== "string" || !body.name.trim())) problems.push("name must be text");
  if ("cuisine" in body && (typeof body.cuisine !== "string" || !body.cuisine.trim())) problems.push("cuisine must be text");
  if ("minutes" in body && (typeof body.minutes !== "number" || body.minutes <= 0)) problems.push("minutes must be a positive number");
  if ("tags" in body && !Array.isArray(body.tags)) problems.push("tags must be an array");

  if (problems.length > 0) {
    return res.status(400).json({ error: "Invalid update", problems });
  }
  next();
}
