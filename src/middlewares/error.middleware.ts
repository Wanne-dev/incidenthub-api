import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

/**
 * Centralized error handling middleware.
 * 
 * Catches all errors passed via next(err) or thrown in controllers.
 * - AppError instances return their specific status code and message
 * - Unknown errors return 500 Internal Server Error
 * 
 * Must be registered LAST in the middleware chain (after all routes).
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ ok: false, message: err.message });
  }
  // Log unexpected errors for debugging (not shown to client)
  console.error("Unexpected error:", err);
  res.status(500).json({ ok: false, message: "Internal server error" });
};
