import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { fetchWeatherByCity, fetchWeatherByCoordinates, type WeatherResult } from "./weather.api.js";

const currentWeatherQuerySchema = z.object({
  city: z.string().min(2, "City name is required")
});

const locationParamSchema = z.object({
  locationId: z.string().min(1)
});

// Save each successful weather lookup so it appears in history.
const saveWeatherHistory = async (
  userId: string,
  weather: WeatherResult,
  locationId?: string
) => {
  return prisma.weatherHistory.create({
    data: {
      userId,
      locationId,
      locationName: weather.locationName,
      country: weather.country,
      temperature: weather.temperature,
      condition: weather.condition,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed,
      pressure: weather.pressure,
      feelsLike: weather.feelsLike
    }
  });
};

export const getCurrentWeather = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  // Validate the city query string, e.g. /api/weather/current?city=Lagos.
  const { city } = currentWeatherQuerySchema.parse(req.query);
  const weather = await fetchWeatherByCity(city);
  const history = await saveWeatherHistory(authReq.user.id, weather);

  res.status(200).json({
    status: true,
    message: "Current weather fetched successfully",
    weather,
    historyId: history.id
  });
};

export const getWeatherForLocation = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const { locationId } = locationParamSchema.parse(req.params);
  // Make sure the saved location belongs to the logged-in user.
  const location = await prisma.location.findFirst({
    where: { id: locationId, userId: authReq.user.id }
  });

  if (!location) {
    throw new AppError("Location not found", 404);
  }

  // Prefer coordinates when available; otherwise search by city/country text.
  const weather =
    location.latitude !== null && location.longitude !== null
      ? await fetchWeatherByCoordinates(location.latitude, location.longitude)
      : await fetchWeatherByCity([location.name, location.country].filter(Boolean).join(", "));

  const history = await saveWeatherHistory(authReq.user.id, weather, location.id);

  res.status(200).json({
    status: true,
    message: "Location weather fetched successfully",
    weather,
    historyId: history.id
  });
};
