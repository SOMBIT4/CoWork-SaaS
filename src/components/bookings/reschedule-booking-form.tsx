"use client";

import Link from "next/link";
import {
  useActionState,
  useState,
} from "react";
import {
  formatInTimeZone,
  fromZonedTime,
} from "date-fns-tz";

import {
  rescheduleBookingAction,
  type BookingActionState,
} from "@/server/actions/booking.actions";

const initialState: BookingActionState = {
  status: "idle",
};

interface RescheduleBookingFormProps {
  organizationSlug: string;
  bookingId: string;
  organizationTimezone: string;
  startTimeIso: string;
  endTimeIso: string;
}

function getZonedDate(
  iso: string,
  timezone: string,
): string {
  return formatInTimeZone(
    new Date(iso),
    timezone,
    "yyyy-MM-dd",
  );
}

function getZonedTime(
  iso: string,
  timezone: string,
): string {
  return formatInTimeZone(
    new Date(iso),
    timezone,
    "HH:mm",
  );
}

function zonedDateTimeToIso(
  date: string,
  time: string,
  timezone: string,
): string {
  if (!date || !time) {
    return "";
  }

  const value = fromZonedTime(
    `${date}T${time}:00`,
    timezone,
  );

  if (
    Number.isNaN(
      value.getTime(),
    )
  ) {
    return "";
  }

  return value.toISOString();
}

export function RescheduleBookingForm({
  organizationSlug,
  bookingId,
  organizationTimezone,
  startTimeIso,
  endTimeIso,
}: RescheduleBookingFormProps) {
  /*
   * The existing booking timestamps are stored
   * as absolute timestamps.
   *
   * Convert them into the organization's timezone
   * before showing them in the date/time inputs.
   */
  const [date, setDate] =
    useState(() =>
      getZonedDate(
        startTimeIso,
        organizationTimezone,
      ),
    );

  const [
    startTime,
    setStartTime,
  ] = useState(() =>
    getZonedTime(
      startTimeIso,
      organizationTimezone,
    ),
  );

  const [
    endTime,
    setEndTime,
  ] = useState(() =>
    getZonedTime(
      endTimeIso,
      organizationTimezone,
    ),
  );

  const action =
    rescheduleBookingAction.bind(
      null,
      organizationSlug,
      bookingId,
    );

  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    action,
    initialState,
  );

  const startIso =
    zonedDateTimeToIso(
      date,
      startTime,
      organizationTimezone,
    );

  const endIso =
    zonedDateTimeToIso(
      date,
      endTime,
      organizationTimezone,
    );

  const timesReady = Boolean(
    date &&
      startTime &&
      endTime,
  );

  return (
    <form
      action={formAction}
      className="space-y-6"
    >
      {state.message ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {state.message}
        </div>
      ) : null}

      {/*
       * The server action receives ISO timestamps.
       * The visible fields remain friendly local
       * date/time inputs.
       */}
      <input
        type="hidden"
        name="startTime"
        value={startIso}
      />

      <input
        type="hidden"
        name="endTime"
        value={endIso}
      />

      <div>
        <h3 className="text-sm font-medium">
          New booking time
        </h3>

        <p className="mt-1 text-xs text-neutral-500">
          Timezone:{" "}
          <strong>
            {organizationTimezone}
          </strong>
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <label
            htmlFor="rescheduleDate"
            className="text-sm font-medium"
          >
            Date
          </label>

          <input
            id="rescheduleDate"
            type="date"
            required
            value={date}
            onChange={(event) =>
              setDate(
                event.target.value,
              )
            }
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="rescheduleStart"
            className="text-sm font-medium"
          >
            Start time
          </label>

          <input
            id="rescheduleStart"
            type="time"
            required
            value={startTime}
            onChange={(event) =>
              setStartTime(
                event.target.value,
              )
            }
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="rescheduleEnd"
            className="text-sm font-medium"
          >
            End time
          </label>

          <input
            id="rescheduleEnd"
            type="time"
            required
            value={endTime}
            onChange={(event) =>
              setEndTime(
                event.target.value,
              )
            }
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {state.fieldErrors
        ?.startTime?.map(
          (error) => (
            <p
              key={error}
              className="text-sm text-red-600"
            >
              {error}
            </p>
          ),
        )}

      {state.fieldErrors
        ?.endTime?.map(
          (error) => (
            <p
              key={error}
              className="text-sm text-red-600"
            >
              {error}
            </p>
          ),
        )}

      <p className="text-xs text-neutral-500">
        The selected time is interpreted in{" "}
        <strong>
          {organizationTimezone}
        </strong>{" "}
        and converted to an absolute ISO timestamp
        before saving.
      </p>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={
            pending ||
            !timesReady
          }
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Saving..."
            : "Save new time"}
        </button>

        <Link
          href={`/${organizationSlug}/bookings`}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}