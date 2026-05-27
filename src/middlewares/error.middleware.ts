import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

// Custom app error so controllers can choose the HTTP status code.
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Converts thrown errors into JSON responses the frontend can understand.
export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  // Zod errors come from validation schemas.
  if (error instanceof ZodError) {
    res.status(400).json({
      status: false,
      message: error.errors[0]?.message ?? "Invalid request data"
    });
    return;
  }

  // AppError is used for expected problems like "not found" or "unauthorized".
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: false,
      message: error.message
    });
    return;
  }

  // Anything else is unexpected, so log it and hide the details from users.
  console.error(error);
  res.status(500).json({
    status: false,
    message: "Something went wrong"
  });
};
