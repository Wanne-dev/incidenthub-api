import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

/**
 * Authentication Middleware
 * 
 * Validates the Authorization header for protected routes.
 * Accepted formats:
 *   Authorization: Bearer instructor-token  (ADMIN role)
 *   Authorization: Bearer technician-token  (TECHNICIAN role)
 * 
 * The role is stored in req.userRole for downstream authorization checks.
 * 
 * Response on error: 401 Unauthorized
 * {
 *   "ok": false,
 *   "message": "Unauthorized"
 * }
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError(401, "Unauthorized: missing Authorization header"));
  }

  // Check for Bearer token format
  if (authHeader === "Bearer instructor-token") {
    (req as any).userRole = "ADMIN";
    return next();
  }

  if (authHeader === "Bearer technician-token") {
    (req as any).userRole = "TECHNICIAN";
    return next();
  }

  return next(new AppError(401, "Unauthorized: invalid token"));
};
