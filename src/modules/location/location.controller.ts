import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { createLocationSchema, updateLocationSchema } from "./location.validation.js";

// Validate :id route parameters before using them in database queries.
const idParamSchema = z.object({
  id: z.string().min(1)
});

// Fields returned to the frontend for a saved location.
const locationSelect = {
  id: true,
  name: true,
  country: true,
  latitude: true,
  longitude: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true
};

export const createLocation = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  // Validate the request body before creating the location.
  const data = createLocationSchema.parse(req.body);

  // Transaction keeps "unset old default" and "create new location" together.
  const location = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.location.updateMany({
        where: { userId: authReq.user.id },
        data: { isDefault: false }
      });
    }

    return tx.location.create({
      data: {
        userId: authReq.user.id,
        name: data.name,
        country: data.country,
        latitude: data.latitude,
        longitude: data.longitude,
        isDefault: data.isDefault ?? false
      },
      select: locationSelect
    });
  });

  res.status(201).json({
    status: true,
    message: "Location created successfully",
    location
  });
};

export const getLocations = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  // Only fetch locations owned by the logged-in user.
  const locations = await prisma.location.findMany({
    where: { userId: authReq.user.id },
    select: locationSelect,
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
  });

  res.status(200).json({
    status: true,
    message: "Locations fetched successfully",
    locations
  });
};

export const getLocation = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const { id } = idParamSchema.parse(req.params);
  // findFirst lets us check both id and ownership in one query.
  const location = await prisma.location.findFirst({
    where: { id, userId: authReq.user.id },
    select: locationSelect
  });

  if (!location) {
    throw new AppError("Location not found", 404);
  }

  res.status(200).json({
    status: true,
    message: "Location fetched successfully",
    location
  });
};

export const updateLocation = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const { id } = idParamSchema.parse(req.params);
  const data = updateLocationSchema.parse(req.body);
  // First make sure this location belongs to the logged-in user.
  const existingLocation = await prisma.location.findFirst({
    where: { id, userId: authReq.user.id }
  });

  if (!existingLocation) {
    throw new AppError("Location not found", 404);
  }

  // If this becomes default, unset all other default locations in the same transaction.
  const location = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.location.updateMany({
        where: { userId: authReq.user.id },
        data: { isDefault: false }
      });
    }

    return tx.location.update({
      where: { id: existingLocation.id },
      data,
      select: locationSelect
    });
  });

  res.status(200).json({
    status: true,
    message: "Location updated successfully",
    location
  });
};

export const deleteLocation = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const { id } = idParamSchema.parse(req.params);
  // Check ownership before deleting.
  const existingLocation = await prisma.location.findFirst({
    where: { id, userId: authReq.user.id }
  });

  if (!existingLocation) {
    throw new AppError("Location not found", 404);
  }

  await prisma.location.delete({ where: { id: existingLocation.id } });

  res.status(200).json({
    status: true,
    message: "Location deleted successfully"
  });
};

export const setDefaultLocation = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const { id } = idParamSchema.parse(req.params);
  // The user can only set their own location as default.
  const existingLocation = await prisma.location.findFirst({
    where: { id, userId: authReq.user.id }
  });

  if (!existingLocation) {
    throw new AppError("Location not found", 404);
  }

  // Ensure exactly one default location by clearing others before setting this one.
  const location = await prisma.$transaction(async (tx) => {
    await tx.location.updateMany({
      where: { userId: authReq.user.id },
      data: { isDefault: false }
    });

    return tx.location.update({
      where: { id: existingLocation.id },
      data: { isDefault: true },
      select: locationSelect
    });
  });

  res.status(200).json({
    status: true,
    message: "Default location updated successfully",
    location
  });
};
