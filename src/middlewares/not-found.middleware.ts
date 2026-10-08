import { Request, Response } from "express";

/**
 * 404 Not Found middleware.
 * 
 * Catches all requests that don't match any defined route.
 * Must be registered AFTER all routes but BEFORE the error handler.
 */
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ ok: false, message: "Route not found" });
};
