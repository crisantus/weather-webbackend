import type { Request, Response } from "express";
import { prisma } from "../../config/prisma.js";
import { comparePassword, hashPassword } from "../../utils/bcrypt.js";
import { createToken } from "../../utils/jwt.js";
import { AppError } from "../../middlewares/error.middleware.js";
import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

// Select only safe user fields. Never return the password hash to the frontend.
const userSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true
};

export const register = async (req: Request, res: Response) => {
  // Validate the incoming body before using it.
  const data = registerSchema.parse(req.body);
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

  if (existingUser) {
    throw new AppError("Email address is already registered", 409);
  }

  // Store a hashed password, not the plain text password.
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: await hashPassword(data.password)
    },
    select: userSelect
  });

  // The frontend stores this token and sends it on protected requests.
  const accessToken = createToken({ id: user.id, email: user.email, name: user.name });

  res.status(201).json({
    status: true,
    message: "Account created successfully",
    accessToken,
    user
  });
};

export const login = async (req: Request, res: Response) => {
  // Validate login credentials from the request body.
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Check the submitted password against the stored hash.
  const passwordMatches = await comparePassword(data.password, user.password);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  // Create a fresh token after a successful login.
  const accessToken = createToken({ id: user.id, email: user.email, name: user.name });

  res.status(200).json({
    status: true,
    message: "Login successful",
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
};

export const me = async (req: Request, res: Response) => {
  // authenticateUser added the current user to the request.
  const authReq = req as AuthenticatedRequest;
  const user = await prisma.user.findUnique({
    where: { id: authReq.user.id },
    select: userSelect
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    status: true,
    message: "Profile fetched successfully",
    user
  });
};

export const logout = async (_req: Request, res: Response) => {
  // JWT logout is handled on the frontend by deleting the saved token.
  res.status(200).json({
    status: true,
    message: "Logout successful"
  });
};
