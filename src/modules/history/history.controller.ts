import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import { AppError } from "../../middlewares/error.middleware.js";

// Optional filters for the history list endpoint.
const historyQuerySchema = z.object({
  locationId: z.string().optional(),
  date: z.string().optional()
});

// Validate :id route parameters.
const idParamSchema = z.object({
  id: z.string().min(1)
});

// Fields returned to the frontend for weather history.
const historySelect = {
  id: true,
  locationId: true,
  locationName: true,
  country: true,
  temperature: true,
  condition: true,
  humidity: true,
  windSpeed: true,
  pressure: true,
  feelsLike: true,
  createdAt: true
};

export const getWeatherHistory = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const query = historyQuerySchema.parse(req.query);
  // Start with the logged-in user's records, then add optional filters.
  const where: {
    userId: string;
    locationId?: string;
    createdAt?: { gte: Date; lt: Date };
  } = { userId: authReq.user.id };

  if (query.locationId) {
    where.locationId = query.locationId;
  }

  // If date is supplied, fetch records from that one calendar day.
  if (query.date) {
    const start = new Date(query.date);

    if (Number.isNaN(start.getTime())) {
      throw new AppError("Date filter must be a valid date", 400);
    }

    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    where.createdAt = { gte: start, lt: end };
  }

  // Newest searches appear first.
  const histories = await prisma.weatherHistory.findMany({
    where,
    select: historySelect,
    orderBy: { createdAt: "desc" }
  });

  res.status(200).json({
    status: true,
    message: "Weather history fetched successfully",
    histories
  });
};

export const getWeatherHistoryItem = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const { id } = idParamSchema.parse(req.params);
  // Fetch one history item, but only if it belongs to the logged-in user.
  const history = await prisma.weatherHistory.findFirst({
    where: { id, userId: authReq.user.id },
    select: historySelect
  });

  if (!history) {
    throw new AppError("Weather history not found", 404);
  }

  res.status(200).json({
    status: true,
    message: "Weather history fetched successfully",
    history
  });
};

export const deleteWeatherHistoryItem = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const { id } = idParamSchema.parse(req.params);
  // Check ownership before deleting a single history record.
  const history = await prisma.weatherHistory.findFirst({
    where: { id, userId: authReq.user.id }
  });

  if (!history) {
    throw new AppError("Weather history not found", 404);
  }

  await prisma.weatherHistory.delete({ where: { id: history.id } });

  res.status(200).json({
    status: true,
    message: "Weather history deleted successfully"
  });
};

export const clearWeatherHistory = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;

  // Delete all weather history records for the logged-in user.
  await prisma.weatherHistory.deleteMany({
    where: { userId: authReq.user.id }
  });

  res.status(200).json({
    status: true,
    message: "Weather history cleared successfully"
  });
};
