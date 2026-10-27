// Route-level middleware, typed. Request, Response and NextFunction are
// types that come with Express (@types/express). `import type` because
// they only exist for TypeScript and disappear when Node runs the file.

import type { Request, Response, NextFunction } from "express";

export function checkId(req: Request, res: Response, next: NextFunction) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(404).json({ error: `No recipe with id ${req.params.id}` });
  }
  next();
}

export function validateRecipe(req: Request, res: Response, next: NextFunction) {
  const { name, cuisine, minutes, tags } = req.body ?? {};
  const problems: string[] = [];

  if (typeof name !== "string" || !name.trim()) problems.push("name is required and must be text");
  if (typeof cuisine !== "string" || !cuisine.trim()) problems.push("cuisine is required and must be text");
  if (typeof minutes !== "number" || !Number.isInteger(minutes) || minutes <= 0) problems.push("minutes must be a positive whole number");
  if (tags !== undefined && (!Array.isArray(tags) || !tags.every((t) => typeof t === "string"))) problems.push("tags must be an array of text");

  if (problems.length > 0) {
    return res.status(400).json({ error: "Invalid recipe", problems });
  }
  next();
}

export function validateRecipePatch(req: Request, res: Response, next: NextFunction) {
  const body = req.body ?? {};
  const allowed = ["name", "cuisine", "minutes", "tags"];
  const problems: string[] = [];

  const sent = Object.keys(body).filter((k) => allowed.includes(k));
  if (sent.length === 0) problems.push(`send at least one of: ${allowed.join(", ")}`);
  if ("name" in body && (typeof body.name !== "string" || !body.name.trim())) problems.push("name must be text");
  if ("cuisine" in body && (typeof body.cuisine !== "string" || !body.cuisine.trim())) problems.push("cuisine must be text");
  if ("minutes" in body && (typeof body.minutes !== "number" || !Number.isInteger(body.minutes) || body.minutes <= 0)) problems.push("minutes must be a positive whole number");
  if ("tags" in body && (!Array.isArray(body.tags) || !body.tags.every((t: unknown) => typeof t === "string"))) problems.push("tags must be an array of text");

  if (problems.length > 0) {
    return res.status(400).json({ error: "Invalid update", problems });
  }
  next();
}
