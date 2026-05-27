import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { AppError } from "./error.middleware.js";
import { verifyToken, type TokenUser } from "../utils/jwt.js";

export type AuthenticatedRequest = Request & {
  user: TokenUser;
};

// Checks the Bearer token, loads the user, and attaches that user to req.user.
export const authenticateUser = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // Protected routes require an Authorization header like: Bearer token_here.
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Authentication token is required", 401);
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  // Confirm the token belongs to a real user that still exists in the database.
  const user = await prisma.user.findUnique({
    where: { id: payload.tokenUser.id },
    select: { id: true, email: true, name: true }
  });

  if (!user) {
    throw new AppError("Authenticated user no longer exists", 401);
  }

  // Save the authenticated user on the request for controllers to use.
  (req as AuthenticatedRequest).user = user;
  next();
};
