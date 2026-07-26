import { z } from "zod";

function emptyStringToUndefined(value: unknown): unknown {
  if (
    typeof value === "string" &&
    value.trim() === ""
  ) {
    return undefined;
  }

  return value;
}

const optionalNotesSchema = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .max(3000, "Notes cannot exceed 3,000 characters.")
    .optional(),
);

export const bookingSchema = z
  .object({
    resourceId: z
      .string()
      .uuid("Select a valid resource."),

    title: z
      .string()
      .trim()
      .min(
        2,
        "Booking title must contain at least 2 characters.",
      )
      .max(
        160,
        "Booking title cannot exceed 160 characters.",
      ),

    notes: optionalNotesSchema,

    startTime: z.iso.datetime({
      offset: true,
    }),

    endTime: z.iso.datetime({
      offset: true,
    }),
  })
  .superRefine((booking, context) => {
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);

    if (endTime <= startTime) {
      context.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time must be after start time.",
      });
    }
  });

export type BookingInput = z.infer<
  typeof bookingSchema
>;