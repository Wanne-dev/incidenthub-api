import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

/**
 * Authorization Middleware - Admin Only
 * 
 * Restricts access to ADMIN role only (instructor-token).
 * Must be used AFTER the authenticate middleware.
 * 
 * TECHNICIAN role can: GET, POST, PUT, PATCH
 * ADMIN role can: everything including DELETE
 * 
 * Response on error: 403 Forbidden
 * {
 *   "ok": false,
 *   "message": "Forbidden: admin access required"
 * }
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).userRole !== "ADMIN") {
    return next(new AppError(403, "Forbidden: admin access required"));
  }
  next();
};
