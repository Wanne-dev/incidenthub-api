import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";
import { IncidentPriority } from "../models/incident.model";

/**
 * validatePriority Middleware
 * 
 * Validates that the priority field is one of the allowed values:
 * LOW, MEDIUM, HIGH, CRITICAL
 * 
 * Invalid values like "SUPER_IMPORTANT" or "urgent" produce 400 Bad Request.
 */
export const validatePriority = (req: Request, res: Response, next: NextFunction) => {
  const { priority } = req.body;
  const validPriorities: IncidentPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  
  if (!validPriorities.includes(priority)) {
    return next(new AppError(400, "Invalid priority. Use LOW, MEDIUM, HIGH or CRITICAL"));
  }
  next();
};
