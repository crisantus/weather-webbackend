import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { authenticateUser } from "../../middlewares/auth.middleware.js";
import { login, logout, me, register } from "./auth.controller.js";

export const authRoutes = Router();

// Public auth endpoints.
authRoutes.post("/register", asyncHandler(register));
authRoutes.post("/login", asyncHandler(login));

// Protected auth endpoints require a valid Bearer token.
authRoutes.get("/me", asyncHandler(authenticateUser), asyncHandler(me));
authRoutes.post("/logout", asyncHandler(authenticateUser), asyncHandler(logout));
