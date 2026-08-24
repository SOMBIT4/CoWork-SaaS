"use client";

import {
  cancelBookingAction,
} from "@/server/actions/booking.actions";

interface CancelBookingButtonProps {
  organizationSlug: string;

  bookingId: string;

  bookingTitle: string;
}

export function CancelBookingButton({
  organizationSlug,
  bookingId,
  bookingTitle,
}: CancelBookingButtonProps) {
  const action =
    cancelBookingAction.bind(
      null,
      organizationSlug,
      bookingId,
    );

  return (
    <form
      action={action}
      onSubmit={(event) => {
        const confirmed =
          window.confirm(
            `Cancel "${bookingTitle}"?`,
          );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="text-sm font-medium text-red-600 hover:text-red-700"
      >
        Cancel
      </button>
    </form>
  );
}