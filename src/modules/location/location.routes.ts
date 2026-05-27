import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  createLocation,
  deleteLocation,
  getLocation,
  getLocations,
  setDefaultLocation,
  updateLocation
} from "./location.controller.js";

export const locationRoutes = Router();

// Every location route is protected by authentication.
locationRoutes.use(asyncHandler(authenticateUser));

// CRUD routes for saved locations.
locationRoutes.post("/", asyncHandler(createLocation));
locationRoutes.get("/", asyncHandler(getLocations));
locationRoutes.get("/:id", asyncHandler(getLocation));
locationRoutes.patch("/:id", asyncHandler(updateLocation));
locationRoutes.delete("/:id", asyncHandler(deleteLocation));

// Extra action route for marking one location as the default.
locationRoutes.patch("/:id/default", asyncHandler(setDefaultLocation));
