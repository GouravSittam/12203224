/**
 * Error handling middleware
 */

import { Request, Response, NextFunction } from "express";

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  console.error("Unhandled error:", error.message);

  // Don't expose internal errors in production
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : error.message;

  res.status(500).json({
    error: "Internal Server Error",
    message,
    statusCode: 500,
  });
}

/**
 * 404 handler middleware
 */
export function notFoundHandler(req: Request, res: Response): void {
  console.warn(`Route not found: ${req.method} ${req.path}`);

  res.status(404).json({
    error: "Not Found",
    message: "Route not found",
    statusCode: 404,
  });
}

/**
 * Request logging middleware
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();

  // Log request start
  console.log(`${req.method} ${req.path} - Request started`);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (this: Response, chunk?: any, encoding?: any): any {
    const duration = Date.now() - start;

    console.log(
      `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );

    return originalEnd.call(this, chunk, encoding);
  } as typeof res.end;

  next();
}
