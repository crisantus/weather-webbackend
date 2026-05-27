import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getCurrentWeather, getWeatherForLocation } from "./weather.controller.js";

export const weatherRoutes = Router();

// Weather endpoints require login because searches are saved to user history.
weatherRoutes.use(asyncHandler(authenticateUser));

// Search current weather by city name.
weatherRoutes.get("/current", asyncHandler(getCurrentWeather));

// Search current weather using one of the user's saved locations.
weatherRoutes.get("/location/:locationId", asyncHandler(getWeatherForLocation));
