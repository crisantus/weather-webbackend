import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  clearWeatherHistory,
  deleteWeatherHistoryItem,
  getWeatherHistory,
  getWeatherHistoryItem
} from "./history.controller.js";

export const historyRoutes = Router();

// All history routes are protected because history belongs to a user.
historyRoutes.use(asyncHandler(authenticateUser));

// List history, fetch one item, delete one item, or clear all history.
historyRoutes.get("/", asyncHandler(getWeatherHistory));
historyRoutes.get("/:id", asyncHandler(getWeatherHistoryItem));
historyRoutes.delete("/:id", asyncHandler(deleteWeatherHistoryItem));
historyRoutes.delete("/", asyncHandler(clearWeatherHistory));
