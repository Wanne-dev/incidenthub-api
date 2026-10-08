import { Request, Response, NextFunction } from "express";

/**
 * Logger Middleware
 * 
 * Logs every incoming request with timestamp, method and path.
 * Format: [2026-10-08T19:50:00.000Z] GET /api/incidents
 * 
 * Registered early in the middleware chain to capture all requests.
 */
export const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};
