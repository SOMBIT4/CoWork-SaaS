import { z } from "zod";

function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
    });

    return true;
  } catch {
    return false;
  }
}

export const organizationSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Slug must contain at least 3 characters.")
  .max(60, "Slug cannot exceed 60 characters.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug can contain lowercase letters, numbers, and single hyphens.",
  );

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      2,
      "Organization name must contain at least 2 characters.",
    )
    .max(
      120,
      "Organization name cannot exceed 120 characters.",
    ),

  slug: organizationSlugSchema,

  timezone: z
    .string()
    .trim()
    .min(1, "Timezone is required.")
    .max(100, "Timezone cannot exceed 100 characters.")
    .refine(
      isValidTimezone,
      "Enter a valid timezone such as Asia/Dhaka.",
    ),
});

export type CreateOrganizationInput = z.infer<
  typeof createOrganizationSchema
>;