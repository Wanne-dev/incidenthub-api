import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

/**
 * validateId Middleware
 * 
 * Validates that the :id route parameter is a positive integer.
 * Invalid values: "abc", "-3", "4.5", "0"
 * 
 * Response on error: 400 Bad Request
 * {
 *   "ok": false,
 *   "message": "Invalid incident id"
 * }
 */
export const validateId = (req: Request, res: Response, next: NextFunction) => {
  const id = Number(String(req.params.id));
  if (!Number.isInteger(id) || id <= 0) {
    return next(new AppError(400, "Invalid incident id"));
  }
  next();
};
