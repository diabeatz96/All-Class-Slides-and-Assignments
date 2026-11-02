// The last two stations on the assembly line, typed.

import type { Request, Response, NextFunction } from "express";

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
}

// Anything can be thrown, so we describe the parts we actually read.
// Every property is optional (?) because any of them might be missing.
type ErrorLike = {
  type?: string;    // set by express.json() for bad JSON
  status?: number;  // set by some Express errors
  code?: string;    // set by Supabase / Postgres, like "22P02"
  message?: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: ErrorLike, req: Request, res: Response, next: NextFunction) {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body is not valid JSON" });
  }
  console.error("Error:", err.code ?? "", err.message);
  res.status(err.status ?? 500).json({ error: "Something went wrong in the kitchen" });
}
