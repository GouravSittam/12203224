import { Request, Response, NextFunction } from "express";

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
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

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    error: "Not Found",
    message: "The requested resource was not found.",
    statusCode: 404,
  });
}

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  next();
}
