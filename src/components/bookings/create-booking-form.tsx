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
  createBookingAction,
  type BookingActionState,
} from "@/server/actions/booking.actions";
import type {
  ResourceType,
} from "@/types/domain";

interface BookingResourceOption {
  id: string;
  name: string;
  type: ResourceType;
  capacity: number;
}

interface CreateBookingFormProps {
  organizationSlug: string;
  organizationTimezone: string;
  resources: BookingResourceOption[];
}

const initialState: BookingActionState = {
  status: "idle",
};

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

export function CreateBookingForm({
  organizationSlug,
  organizationTimezone,
  resources,
}: CreateBookingFormProps) {
  const [date, setDate] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const action =
    createBookingAction.bind(
      null,
      organizationSlug,
    );

  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    action,
    initialState,
  );

  /*
   * This runs only after a user action.
   *
   * Date.now() is allowed here because
   * event handlers are not part of render.
   */
  function handleUseSuggestedTime() {
    const fifteenMinutes =
      15 * 60 * 1000;

    const oneHour =
      60 * 60 * 1000;

    /*
     * Suggest a booking roughly one
     * hour from the current time.
     */
    const futureTime =
      Date.now() + oneHour;

    /*
     * Round upward to the next
     * 15-minute boundary.
     */
    const roundedStartTime =
      Math.ceil(
        futureTime /
          fifteenMinutes,
      ) *
      fifteenMinutes;

    const suggestedStart =
      new Date(
        roundedStartTime,
      );

    const suggestedEnd =
      new Date(
        roundedStartTime +
          oneHour,
      );

    /*
     * Display the suggested values
     * using the organization's timezone.
     */
    setDate(
      formatInTimeZone(
        suggestedStart,
        organizationTimezone,
        "yyyy-MM-dd",
      ),
    );

    setStartTime(
      formatInTimeZone(
        suggestedStart,
        organizationTimezone,
        "HH:mm",
      ),
    );

    setEndTime(
      formatInTimeZone(
        suggestedEnd,
        organizationTimezone,
        "HH:mm",
      ),
    );
  }

  /*
   * Convert organization-local values
   * into absolute UTC ISO timestamps.
   */
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

  const timesReady =
    Boolean(
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

      {/* Resource */}
      <div className="space-y-2">
        <label
          htmlFor="resourceId"
          className="text-sm font-medium"
        >
          Resource
        </label>

        <select
          id="resourceId"
          name="resourceId"
          required
          defaultValue=""
          className="w-full rounded-md border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-black"
        >
          <option
            value=""
            disabled
          >
            Select a resource
          </option>

          {resources.map(
            (resource) => (
              <option
                key={resource.id}
                value={resource.id}
              >
                {resource.name}
                {" · "}
                {resource.type}
                {" · Capacity "}
                {resource.capacity}
              </option>
            ),
          )}
        </select>

        {state.fieldErrors
          ?.resourceId?.map(
            (error) => (
              <p
                key={error}
                className="text-sm text-red-600"
              >
                {error}
              </p>
            ),
          )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="text-sm font-medium"
        >
          Booking title
        </label>

        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={2}
          maxLength={120}
          placeholder="Team planning meeting"
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
        />

        {state.fieldErrors
          ?.title?.map(
            (error) => (
              <p
                key={error}
                className="text-sm text-red-600"
              >
                {error}
              </p>
            ),
          )}
      </div>

      {/* Date/time header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">
            Booking time
          </h3>

          <p className="mt-1 text-xs text-neutral-500">
            Timezone:{" "}
            <strong>
              {organizationTimezone}
            </strong>
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleUseSuggestedTime
          }
          className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Use suggested time
        </button>
      </div>

      {/* Date/time fields */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <label
            htmlFor="bookingDate"
            className="text-sm font-medium"
          >
            Date
          </label>

          <input
            id="bookingDate"
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
            htmlFor="bookingStart"
            className="text-sm font-medium"
          >
            Start time
          </label>

          <input
            id="bookingStart"
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
            htmlFor="bookingEnd"
            className="text-sm font-medium"
          >
            End time
          </label>

          <input
            id="bookingEnd"
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
        Booking times are interpreted in{" "}
        <strong>
          {organizationTimezone}
        </strong>{" "}
        and converted to absolute ISO timestamps before
        being saved.
      </p>

      {/* Notes */}
      <div className="space-y-2">
        <label
          htmlFor="notes"
          className="text-sm font-medium"
        >
          Notes
        </label>

        <textarea
          id="notes"
          name="notes"
          rows={5}
          maxLength={2000}
          placeholder="Optional booking notes..."
          className="w-full resize-y rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
        />

        {state.fieldErrors
          ?.notes?.map(
            (error) => (
              <p
                key={error}
                className="text-sm text-red-600"
              >
                {error}
              </p>
            ),
          )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={
            pending ||
            !timesReady ||
            resources.length ===
              0
          }
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Creating..."
            : "Create booking"}
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