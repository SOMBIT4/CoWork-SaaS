import { z } from "zod";

import {
  RESOURCE_TYPES,
} from "@/types/domain";

function emptyStringToUndefined(
  value: unknown,
): unknown {
  if (
    typeof value === "string" &&
    value.trim() === ""
  ) {
    return undefined;
  }

  return value;
}

export const resourceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      2,
      "Resource name must contain at least 2 characters.",
    )
    .max(
      120,
      "Resource name cannot exceed 120 characters.",
    ),

  type: z.enum(
    RESOURCE_TYPES,
  ),

  capacity: z.coerce
    .number()
    .int(
      "Capacity must be a whole number.",
    )
    .min(
      1,
      "Capacity must be at least 1.",
    )
    .max(
      500,
      "Capacity cannot exceed 500.",
    ),

  floor: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .trim()
      .max(
        50,
        "Floor cannot exceed 50 characters.",
      )
      .optional(),
  ),

  description: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .trim()
      .max(
        2000,
        "Description cannot exceed 2000 characters.",
      )
      .optional(),
  ),
});

export const resourceIdSchema =
  z.string().uuid();

export const resourceFilterSchema =
  z.object({
    status: z
      .enum([
        "active",
        "inactive",
        "all",
      ])
      .default("active"),

    type: z.preprocess(
      emptyStringToUndefined,
      z
        .enum(RESOURCE_TYPES)
        .optional(),
    ),

    minCapacity: z.preprocess(
      emptyStringToUndefined,
      z.coerce
        .number()
        .int()
        .min(1)
        .max(500)
        .optional(),
    ),

    floor: z.preprocess(
      emptyStringToUndefined,
      z
        .string()
        .trim()
        .max(50)
        .optional(),
    ),

    search: z.preprocess(
      emptyStringToUndefined,
      z
        .string()
        .trim()
        .max(120)
        .optional(),
    ),
  });

export type ResourceInput =
  z.infer<typeof resourceSchema>;

export type ResourceFilters =
  z.infer<
    typeof resourceFilterSchema
  >;