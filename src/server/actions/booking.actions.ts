"use server";

import {
  revalidatePath,
} from "next/cache";
import {
  redirect,
} from "next/navigation";

import {
  sendBookingCancellationEmail,
  sendBookingConfirmationEmail,
} from "@/lib/email/notifications";
import {
  bookingIdSchema,
  createBookingSchema,
  rescheduleBookingSchema,
} from "@/lib/validation/booking";
import {
  requireOrganizationContext,
  requireOrganizationPermission,
} from "@/server/authz/org-context";
import {
  findBookingNotificationDetails,
} from "@/server/repositories/notification.repository";
import {
  BookingConflictError,
  BookingDurationError,
  BookingNotFoundError,
  BookingOperationForbiddenError,
  BookingPastTimeError,
  BookingResourceUnavailableError,
  BookingTimeOrderError,
  cancelOrganizationBooking,
  createOrganizationBooking,
  rescheduleOrganizationBooking,
} from "@/server/services/booking.service";
import type {
  OrganizationContext,
} from "@/types/domain";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type BookingField =
  | "resourceId"
  | "title"
  | "notes"
  | "startTime"
  | "endTime";

export interface BookingActionState {
  status:
    | "idle"
    | "error";

  message?: string;

  fieldErrors?: Partial<
    Record<
      BookingField,
      string[]
    >
  >;
}

/* -------------------------------------------------------------------------- */
/*                                Error helpers                               */
/* -------------------------------------------------------------------------- */

function initialFailure(
  message: string,
): BookingActionState {
  return {
    status: "error",
    message,
  };
}

function mapBookingRuleError(
  error: unknown,
): BookingActionState | null {
  if (
    error instanceof
    BookingConflictError
  ) {
    return initialFailure(
      "This resource is already booked during the selected time.",
    );
  }

  if (
    error instanceof
    BookingPastTimeError
  ) {
    return initialFailure(
      "The booking cannot start in the past.",
    );
  }

  if (
    error instanceof
    BookingDurationError
  ) {
    return initialFailure(
      "A booking cannot be longer than 12 hours.",
    );
  }

  if (
    error instanceof
    BookingTimeOrderError
  ) {
    return initialFailure(
      "End time must be after start time.",
    );
  }

  if (
    error instanceof
    BookingResourceUnavailableError
  ) {
    return initialFailure(
      "The selected resource is no longer available.",
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                             Email notifications                            */
/* -------------------------------------------------------------------------- */

/*
 * These functions are intentionally called only
 * AFTER the booking service transaction has completed.
 *
 * A notification failure must not undo a successful
 * booking database operation.
 */

async function sendBookingCreatedNotification(
  context: OrganizationContext,
  bookingId: string,
): Promise<void> {
  try {
    const notification =
      await findBookingNotificationDetails(
        context.organizationId,
        bookingId,
      );

    if (!notification) {
      return;
    }

    await sendBookingConfirmationEmail({
      to:
        notification.userEmail,

      userName:
        notification.userName,

      organizationName:
        context.organizationName,

      organizationTimezone:
        context.organizationTimezone,

      bookingTitle:
        notification.bookingTitle,

      resourceName:
        notification.resourceName,

      startTime:
        notification.startTime,

      endTime:
        notification.endTime,
    });
  } catch (error) {
    console.error(
      "Booking confirmation notification failed.",
      {
        bookingId,

        message:
          error instanceof Error
            ? error.message
            : "Unknown notification error",
      },
    );
  }
}

async function sendBookingCancelledNotification(
  context: OrganizationContext,
  bookingId: string,
): Promise<void> {
  try {
    const notification =
      await findBookingNotificationDetails(
        context.organizationId,
        bookingId,
      );

    if (!notification) {
      return;
    }

    await sendBookingCancellationEmail({
      to:
        notification.userEmail,

      userName:
        notification.userName,

      organizationName:
        context.organizationName,

      organizationTimezone:
        context.organizationTimezone,

      bookingTitle:
        notification.bookingTitle,

      resourceName:
        notification.resourceName,

      startTime:
        notification.startTime,

      endTime:
        notification.endTime,
    });
  } catch (error) {
    console.error(
      "Booking cancellation notification failed.",
      {
        bookingId,

        message:
          error instanceof Error
            ? error.message
            : "Unknown notification error",
      },
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                               Create booking                               */
/* -------------------------------------------------------------------------- */

export async function createBookingAction(
  orgSlug: string,
  previousState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  void previousState;

  const context =
    await requireOrganizationPermission(
      orgSlug,
      "CREATE_BOOKING",
    );

  const parsed =
    createBookingSchema.safeParse({
      resourceId:
        formData.get(
          "resourceId",
        ),

      title:
        formData.get(
          "title",
        ),

      notes:
        formData.get(
          "notes",
        ),

      startTime:
        formData.get(
          "startTime",
        ),

      endTime:
        formData.get(
          "endTime",
        ),
    });

  if (!parsed.success) {
    return {
      status: "error",

      message:
        "Please correct the booking details.",

      fieldErrors:
        parsed.error.flatten()
          .fieldErrors,
    };
  }

  let booking: Awaited<
    ReturnType<
      typeof createOrganizationBooking
    >
  >;

  try {
    booking =
      await createOrganizationBooking({
        context,

        resourceId:
          parsed.data.resourceId,

        title:
          parsed.data.title,

        notes:
          parsed.data.notes,

        startTime:
          new Date(
            parsed.data.startTime,
          ),

        endTime:
          new Date(
            parsed.data.endTime,
          ),
      });
  } catch (error) {
    const mapped =
      mapBookingRuleError(
        error,
      );

    if (mapped) {
      return mapped;
    }

    throw error;
  }

  /*
   * The booking transaction has committed.
   * Email work happens afterwards.
   */
  await sendBookingCreatedNotification(
    context,
    booking.id,
  );

  revalidatePath(
    `/${context.organizationSlug}/bookings`,
  );

  revalidatePath(
    `/${context.organizationSlug}`,
  );

  redirect(
    `/${context.organizationSlug}/bookings`,
  );
}

/* -------------------------------------------------------------------------- */
/*                               Cancel booking                               */
/* -------------------------------------------------------------------------- */

export async function cancelBookingAction(
  orgSlug: string,
  bookingId: string,
  formData: FormData,
): Promise<void> {
  void formData;

  const context =
    await requireOrganizationContext(
      orgSlug,
    );

  const parsedId =
    bookingIdSchema.safeParse(
      bookingId,
    );

  if (!parsedId.success) {
    return;
  }

  try {
    await cancelOrganizationBooking({
      context,

      bookingId:
        parsedId.data,
    });
  } catch (error) {
    if (
      error instanceof
        BookingNotFoundError ||
      error instanceof
        BookingOperationForbiddenError
    ) {
      return;
    }

    throw error;
  }

  /*
   * Cancellation is committed before
   * notification delivery is attempted.
   *
   * We can still query the booking because
   * cancellation changes its status rather
   * than deleting it.
   */
  await sendBookingCancelledNotification(
    context,
    parsedId.data,
  );

  revalidatePath(
    `/${context.organizationSlug}/bookings`,
  );

  revalidatePath(
    `/${context.organizationSlug}`,
  );
}

/* -------------------------------------------------------------------------- */
/*                             Reschedule booking                             */
/* -------------------------------------------------------------------------- */

export async function rescheduleBookingAction(
  orgSlug: string,
  bookingId: string,
  previousState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  void previousState;

  const context =
    await requireOrganizationContext(
      orgSlug,
    );

  const parsedId =
    bookingIdSchema.safeParse(
      bookingId,
    );

  if (!parsedId.success) {
    return initialFailure(
      "Invalid booking.",
    );
  }

  const parsed =
    rescheduleBookingSchema.safeParse({
      startTime:
        formData.get(
          "startTime",
        ),

      endTime:
        formData.get(
          "endTime",
        ),
    });

  if (!parsed.success) {
    return {
      status: "error",

      message:
        "Please correct the booking times.",

      fieldErrors:
        parsed.error.flatten()
          .fieldErrors,
    };
  }

  try {
    await rescheduleOrganizationBooking({
      context,

      bookingId:
        parsedId.data,

      startTime:
        new Date(
          parsed.data.startTime,
        ),

      endTime:
        new Date(
          parsed.data.endTime,
        ),
    });
  } catch (error) {
    const mapped =
      mapBookingRuleError(
        error,
      );

    if (mapped) {
      return mapped;
    }

    if (
      error instanceof
        BookingNotFoundError ||
      error instanceof
        BookingOperationForbiddenError
    ) {
      return initialFailure(
        "The booking cannot be rescheduled.",
      );
    }

    throw error;
  }

  revalidatePath(
    `/${context.organizationSlug}/bookings`,
  );

  revalidatePath(
    `/${context.organizationSlug}`,
  );

  redirect(
    `/${context.organizationSlug}/bookings`,
  );
}