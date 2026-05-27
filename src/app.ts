import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { historyRoutes } from "./modules/history/history.routes.js";
import { locationRoutes } from "./modules/location/location.routes.js";
import { weatherRoutes } from "./modules/weather/weather.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

// Create the Express application that holds middleware and routes.
export const app = express();

// Allow requests from the frontend URL, then allow JSON request bodies.
app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json());

// Simple endpoint for checking that the API server is running.
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: true,
    message: "WeatherTrack API is healthy"
  });
});

// Public test route for quickly checking the deployed backend in a browser.
app.get("/test", (_req, res) => {
  res.status(200).json({
    status: true,
    message: "Backend is live"
  });
});

// Attach each feature module to its API path.
app.use("/api/auth", authRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/weather-history", historyRoutes);

// Error middleware stays last so it can catch errors from every route above.
app.use(errorMiddleware);
