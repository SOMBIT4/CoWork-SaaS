import {
  notFound,
} from "next/navigation";

import {
  RescheduleBookingForm,
} from "@/components/bookings/reschedule-booking-form";
import {
  bookingIdSchema,
} from "@/lib/validation/booking";
import {
  requireOrganizationContext,
} from "@/server/authz/org-context";
import {
  getBookingById,
} from "@/server/repositories/booking.repository";
import {
  canUserModifyBooking,
} from "@/server/services/booking.service";

interface EditBookingPageProps {
  params: Promise<{
    orgSlug: string;
    bookingId: string;
  }>;
}

export default async function EditBookingPage({
  params,
}: EditBookingPageProps) {
  const {
    orgSlug,
    bookingId,
  } = await params;

  const context =
    await requireOrganizationContext(
      orgSlug,
    );

  const parsedId =
    bookingIdSchema.safeParse(
      bookingId,
    );

  if (!parsedId.success) {
    notFound();
  }

  const booking =
    await getBookingById(
      context.organizationId,
      parsedId.data,
    );

  if (!booking) {
    notFound();
  }

  if (
    !canUserModifyBooking(
      context,
      booking,
    )
  ) {
    notFound();
  }

  return (
    <section className="max-w-2xl">
      <p className="text-sm font-medium text-neutral-500">
        Bookings
      </p>

      <h2 className="mt-2 text-3xl font-semibold">
        Reschedule booking
      </h2>

      <p className="mt-2 text-neutral-600">
        Change the booking time
        for{" "}
        <strong>
          {booking.title}
        </strong>
        .
      </p>

      <div className="mt-8 rounded-xl border bg-white p-6">
        <RescheduleBookingForm
          organizationSlug={
            context.organizationSlug
          }
          bookingId={
            booking.id
          }
          organizationTimezone={
            context.organizationTimezone
          }
          startTimeIso={
            booking.startTime.toISOString()
          }
          endTimeIso={
            booking.endTime.toISOString()
          }
        />
      </div>
    </section>
  );
}