import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

/**
 * validateIncident Middleware
 * 
 * Validates that the request body contains all required fields for creating/updating an incident:
 * - title, description, reporter, location, priority, estimatedMinutes
 * 
 * Stops the request before reaching the controller if any field is missing.
 * Response on error: 400 Bad Request
 */
export const validateIncident = (req: Request, res: Response, next: NextFunction) => {
  const { title, description, reporter, location, priority, estimatedMinutes } = req.body;
  
  if (!title || !description || !reporter || !location || !priority || !estimatedMinutes) {
    return next(new AppError(400, "Missing required fields: title, description, reporter, location, priority, estimatedMinutes"));
  }
  next();
};
