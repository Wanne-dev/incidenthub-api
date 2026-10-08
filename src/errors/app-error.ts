/**
 * AppError - Custom error class for controlled application errors.
 * 
 * Allows controllers and middlewares to throw errors with
 * specific HTTP status codes that are handled centrally
 * by the error middleware.
 * 
 * Usage:
 *   throw new AppError(404, "Incident not found");
 *   next(new AppError(400, "Invalid priority"));
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
    // Maintains proper stack trace for where error was thrown (V8 only)
    Error.captureStackTrace(this, this.constructor);
  }
}
