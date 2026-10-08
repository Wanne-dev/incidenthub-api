import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

/**
 * validateTime Middleware
 * 
 * Validates the estimatedMinutes field:
 * - Must be a number
 * - Must be greater than 0
 * - Must not exceed 480 minutes (8 hours)
 * 
 * Reto 4 - Special rule for CRITICAL incidents:
 * CRITICAL incidents cannot exceed 60 estimated minutes.
 * This rule is implemented here because it validates time constraints
 * that are tied to the priority field (cross-field validation).
 * 
 * Response on error: 400 Bad Request
 */
export const validateTime = (req: Request, res: Response, next: NextFunction) => {
  const { estimatedMinutes, priority } = req.body;

  // Basic time validation
  if (typeof estimatedMinutes !== 'number' || estimatedMinutes <= 0 || estimatedMinutes > 480) {
    return next(new AppError(400, "estimatedMinutes must be a number between 1 and 480"));
  }

  // Reto 4: CRITICAL incidents cannot exceed 60 minutes
  if (priority === "CRITICAL" && estimatedMinutes > 60) {
    return next(new AppError(400, "CRITICAL incidents cannot exceed 60 estimated minutes"));
  }

  next();
};
