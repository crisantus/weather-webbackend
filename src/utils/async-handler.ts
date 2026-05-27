import type { NextFunction, Request, Response } from "express";

// Wrap async controllers so thrown errors go to Express error middleware.
export const asyncHandler = (
  controller: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(controller(req, res, next)).catch(next);
  };
};
