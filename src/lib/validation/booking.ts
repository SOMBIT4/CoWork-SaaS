import { z } from "zod";

export const MAX_BOOKING_DURATION_HOURS = 12;

export const MAX_BOOKING_DURATION_MS =
  MAX_BOOKING_DURATION_HOURS *
  60 *
  60 *
  1000;

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

export const bookingIdSchema =
  z.string().uuid();

export const createBookingSchema =
  z
    .object({
      resourceId: z
        .string()
        .uuid(
          "Select a valid resource.",
        ),

      title: z
        .string()
        .trim()
        .min(
          2,
          "Booking title must contain at least 2 characters.",
        )
        .max(
          120,
          "Booking title cannot exceed 120 characters.",
        ),

      notes: z.preprocess(
        emptyStringToUndefined,
        z
          .string()
          .trim()
          .max(
            2000,
            "Notes cannot exceed 2000 characters.",
          )
          .optional(),
      ),

      startTime: z.iso.datetime({
        offset: true,
      }),

      endTime: z.iso.datetime({
        offset: true,
      }),
    })
    .superRefine(
      (value, context) => {
        const start =
          new Date(
            value.startTime,
          );

        const end =
          new Date(
            value.endTime,
          );

        if (
          end.getTime() <=
          start.getTime()
        ) {
          context.addIssue({
            code:
              "custom",
            path: [
              "endTime",
            ],
            message:
              "End time must be after start time.",
          });
        }
      },
    );

export const rescheduleBookingSchema =
  z
    .object({
      startTime:
        z.iso.datetime({
          offset: true,
        }),

      endTime:
        z.iso.datetime({
          offset: true,
        }),
    })
    .superRefine(
      (value, context) => {
        const start =
          new Date(
            value.startTime,
          );

        const end =
          new Date(
            value.endTime,
          );

        if (
          end.getTime() <=
          start.getTime()
        ) {
          context.addIssue({
            code:
              "custom",
            path: [
              "endTime",
            ],
            message:
              "End time must be after start time.",
          });
        }
      },
    );

export const bookingListFilterSchema =
  z.object({
    resourceId: z.preprocess(
      emptyStringToUndefined,
      z
        .string()
        .uuid()
        .optional(),
    ),

    from: z.preprocess(
      emptyStringToUndefined,
      z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
        )
        .optional(),
    ),

    to: z.preprocess(
      emptyStringToUndefined,
      z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
        )
        .optional(),
    ),
  });

export type CreateBookingInput =
  z.infer<
    typeof createBookingSchema
  >;

export type RescheduleBookingInput =
  z.infer<
    typeof rescheduleBookingSchema
  >;