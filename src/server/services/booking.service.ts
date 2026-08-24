import "server-only";

import type { DatabaseError } from "pg";

import { withTransaction } from "@/lib/db/transaction";
import { MAX_BOOKING_DURATION_MS } from "@/lib/validation/booking";
import { hasOrganizationPermission } from "@/server/authz/roles";
import { insertAuditLog } from "@/server/repositories/audit.repository";
import {
  cancelBookingRecord,
  findActiveBookingResource,
  getBookingForUpdate,
  insertBooking,
  rescheduleBookingRecord,
} from "@/server/repositories/booking.repository";
import type {
  Booking,
  OrganizationContext,
} from "@/types/domain";

/* -------------------------------------------------------------------------- */
/*                                   Errors                                   */
/* -------------------------------------------------------------------------- */

export class BookingConflictError extends Error {
  readonly code = "BOOKING_CONFLICT";

  constructor() {
    super(
      "The resource is already booked during this time.",
    );

    this.name = "BookingConflictError";
  }
}

export class BookingResourceUnavailableError extends Error {
  readonly code =
    "BOOKING_RESOURCE_UNAVAILABLE";

  constructor() {
    super(
      "This resource is not available for booking.",
    );

    this.name =
      "BookingResourceUnavailableError";
  }
}

export class BookingNotFoundError extends Error {
  readonly code = "BOOKING_NOT_FOUND";

  constructor() {
    super(
      "The booking could not be found.",
    );

    this.name = "BookingNotFoundError";
  }
}

export class BookingOperationForbiddenError extends Error {
  readonly code =
    "BOOKING_OPERATION_FORBIDDEN";

  constructor() {
    super(
      "You cannot modify this booking.",
    );

    this.name =
      "BookingOperationForbiddenError";
  }
}

export class BookingPastTimeError extends Error {
  readonly code = "BOOKING_PAST_TIME";

  constructor() {
    super(
      "A booking cannot start in the past.",
    );

    this.name = "BookingPastTimeError";
  }
}

export class BookingDurationError extends Error {
  readonly code =
    "BOOKING_DURATION_INVALID";

  constructor() {
    super(
      "A booking cannot be longer than 12 hours.",
    );

    this.name = "BookingDurationError";
  }
}

export class BookingTimeOrderError extends Error {
  readonly code =
    "BOOKING_TIME_ORDER_INVALID";

  constructor() {
    super(
      "End time must be after start time.",
    );

    this.name = "BookingTimeOrderError";
  }
}

/* -------------------------------------------------------------------------- */
/*                           Database error helpers                           */
/* -------------------------------------------------------------------------- */

function isDatabaseBookingConflict(
  error: unknown,
): boolean {
  const databaseError =
    error as DatabaseError;

  return (
    databaseError?.code === "23P01" &&
    databaseError?.constraint ===
      "bookings_no_confirmed_overlap"
  );
}

/* -------------------------------------------------------------------------- */
/*                         Booking time validation                            */
/* -------------------------------------------------------------------------- */

export function assertValidBookingWindow(
  startTime: Date,
  endTime: Date,
  now = new Date(),
): void {
  if (
    Number.isNaN(
      startTime.getTime(),
    ) ||
    Number.isNaN(
      endTime.getTime(),
    )
  ) {
    throw new BookingTimeOrderError();
  }

  if (
    endTime.getTime() <=
    startTime.getTime()
  ) {
    throw new BookingTimeOrderError();
  }

  if (
    startTime.getTime() <
    now.getTime()
  ) {
    throw new BookingPastTimeError();
  }

  const duration =
    endTime.getTime() -
    startTime.getTime();

  if (
    duration >
    MAX_BOOKING_DURATION_MS
  ) {
    throw new BookingDurationError();
  }
}

/* -------------------------------------------------------------------------- */
/*                           Create booking                                   */
/* -------------------------------------------------------------------------- */

interface CreateOrganizationBookingInput {
  context: OrganizationContext;

  resourceId: string;

  title: string;

  notes?: string;

  startTime: Date;

  endTime: Date;
}

export async function createOrganizationBooking({
  context,
  resourceId,
  title,
  notes,
  startTime,
  endTime,
}: CreateOrganizationBookingInput): Promise<Booking> {
  assertValidBookingWindow(
    startTime,
    endTime,
  );

  try {
    return await withTransaction(
      async (client) => {
        /*
         * The resource lookup is tenant-scoped
         * and requires the resource to be active.
         */
        const resource =
          await findActiveBookingResource(
            client,
            context.organizationId,
            resourceId,
          );

        if (!resource) {
          throw new BookingResourceUnavailableError();
        }

        /*
         * PostgreSQL remains the final authority
         * for booking overlap prevention.
         *
         * An overlapping CONFIRMED booking will
         * trigger SQLSTATE 23P01.
         */
        const booking =
          await insertBooking(
            client,
            {
              organizationId:
                context.organizationId,

              resourceId,

              membershipId:
                context.membershipId,

              title,

              notes,

              startTime,

              endTime,
            },
          );

        await insertAuditLog(
          client,
          {
            organizationId:
              context.organizationId,

            actorUserId:
              context.userId,

            action:
              "BOOKING_CREATED",

            entityType:
              "booking",

            entityId:
              booking.id,

            metadata: {
              resourceId,

              resourceName:
                resource.name,

              startTime:
                startTime.toISOString(),

              endTime:
                endTime.toISOString(),
            },
          },
        );

        return booking;
      },
    );
  } catch (error) {
    if (
      isDatabaseBookingConflict(
        error,
      )
    ) {
      throw new BookingConflictError();
    }

    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*                         Booking authorization                              */
/* -------------------------------------------------------------------------- */

/*
 * Only these fields are required to determine
 * whether the current user may modify a booking.
 *
 * This is better than requiring a complete
 * Booking object.
 */
type BookingModificationCandidate =
  Pick<
    Booking,
    | "bookedByMembershipId"
    | "startTime"
  >;

type BookingModificationView =
  BookingModificationCandidate &
    Pick<
      Booking,
      "status"
    >;

function canModifyBooking(
  context: OrganizationContext,
  booking: BookingModificationCandidate,
): boolean {
  /*
   * OWNER and ADMIN may manage any
   * organization booking.
   */
  if (
    hasOrganizationPermission(
      context.role,
      "MANAGE_BOOKINGS",
    )
  ) {
    return true;
  }

  /*
   * MEMBER may modify only:
   *
   * 1. their own booking
   * 2. a booking that has not started yet
   */
  return (
    booking.bookedByMembershipId ===
      context.membershipId &&
    booking.startTime.getTime() >
      Date.now()
  );
}

export function canUserModifyBooking(
  context: OrganizationContext,
  booking: BookingModificationView,
): boolean {
  /*
   * Cancelled bookings cannot be
   * cancelled or rescheduled again.
   */
  if (
    booking.status !==
    "CONFIRMED"
  ) {
    return false;
  }

  return canModifyBooking(
    context,
    booking,
  );
}

/* -------------------------------------------------------------------------- */
/*                           Cancel booking                                   */
/* -------------------------------------------------------------------------- */

interface CancelOrganizationBookingInput {
  context: OrganizationContext;

  bookingId: string;
}

export async function cancelOrganizationBooking({
  context,
  bookingId,
}: CancelOrganizationBookingInput): Promise<Booking> {
  return withTransaction(
    async (client) => {
      /*
       * FOR UPDATE locks this booking while
       * cancellation is being processed.
       */
      const booking =
        await getBookingForUpdate(
          client,
          context.organizationId,
          bookingId,
        );

      if (!booking) {
        throw new BookingNotFoundError();
      }

      if (
        booking.status !==
        "CONFIRMED"
      ) {
        throw new BookingNotFoundError();
      }

      /*
       * Authorization is enforced again here,
       * even if the UI already hid the action.
       */
      if (
        !canModifyBooking(
          context,
          booking,
        )
      ) {
        throw new BookingOperationForbiddenError();
      }

      const cancelledBooking =
        await cancelBookingRecord(
          client,
          context.organizationId,
          booking.id,
          context.userId,
        );

      if (!cancelledBooking) {
        throw new BookingNotFoundError();
      }

      await insertAuditLog(
        client,
        {
          organizationId:
            context.organizationId,

          actorUserId:
            context.userId,

          action:
            "BOOKING_CANCELLED",

          entityType:
            "booking",

          entityId:
            booking.id,

          metadata: {
            resourceId:
              booking.resourceId,

            startTime:
              booking.startTime.toISOString(),

            endTime:
              booking.endTime.toISOString(),
          },
        },
      );

      return cancelledBooking;
    },
  );
}

/* -------------------------------------------------------------------------- */
/*                         Reschedule booking                                 */
/* -------------------------------------------------------------------------- */

interface RescheduleOrganizationBookingInput {
  context: OrganizationContext;

  bookingId: string;

  startTime: Date;

  endTime: Date;
}

export async function rescheduleOrganizationBooking({
  context,
  bookingId,
  startTime,
  endTime,
}: RescheduleOrganizationBookingInput): Promise<Booking> {
  /*
   * Apply exactly the same time rules used
   * during booking creation.
   */
  assertValidBookingWindow(
    startTime,
    endTime,
  );

  try {
    return await withTransaction(
      async (client) => {
        const existingBooking =
          await getBookingForUpdate(
            client,
            context.organizationId,
            bookingId,
          );

        if (!existingBooking) {
          throw new BookingNotFoundError();
        }

        if (
          existingBooking.status !==
          "CONFIRMED"
        ) {
          throw new BookingNotFoundError();
        }

        if (
          !canModifyBooking(
            context,
            existingBooking,
          )
        ) {
          throw new BookingOperationForbiddenError();
        }

        /*
         * A resource may have been deactivated
         * after the original booking was made.
         *
         * In that case, don't allow the booking
         * to be moved to a new time.
         */
        const resource =
          await findActiveBookingResource(
            client,
            context.organizationId,
            existingBooking.resourceId,
          );

        if (!resource) {
          throw new BookingResourceUnavailableError();
        }

        /*
         * Updating the time automatically runs
         * through the PostgreSQL exclusion
         * constraint again.
         */
        const booking =
          await rescheduleBookingRecord(
            client,
            context.organizationId,
            bookingId,
            startTime,
            endTime,
          );

        if (!booking) {
          throw new BookingNotFoundError();
        }

        await insertAuditLog(
          client,
          {
            organizationId:
              context.organizationId,

            actorUserId:
              context.userId,

            action:
              "BOOKING_RESCHEDULED",

            entityType:
              "booking",

            entityId:
              booking.id,

            metadata: {
              previousStartTime:
                existingBooking.startTime.toISOString(),

              previousEndTime:
                existingBooking.endTime.toISOString(),

              startTime:
                startTime.toISOString(),

              endTime:
                endTime.toISOString(),
            },
          },
        );

        return booking;
      },
    );
  } catch (error) {
    if (
      isDatabaseBookingConflict(
        error,
      )
    ) {
      throw new BookingConflictError();
    }

    throw error;
  }
}