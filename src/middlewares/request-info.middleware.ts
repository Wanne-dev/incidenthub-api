import { Request, Response, NextFunction } from "express";

/**
 * RequestInfo Middleware
 * 
 * Enriches the Request object with additional metadata.
 * Demonstrates how a middleware can add data before passing
 * the request to the next component.
 * 
 * Adds: req.requestInfo = { timestamp, method, path }
 */
export const requestInfo = (req: Request, res: Response, next: NextFunction) => {
  (req as any).requestInfo = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path
  };
  next();
};
