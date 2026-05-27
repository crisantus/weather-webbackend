import { z } from "zod";

// Rules for creating a saved location.
export const createLocationSchema = z.object({
  name: z.string().min(2, "Location name is required"),
  country: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  isDefault: z.boolean().optional()
});

// Updating can include any subset of fields, but at least one field is required.
export const updateLocationSchema = createLocationSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one location field is required"
);
