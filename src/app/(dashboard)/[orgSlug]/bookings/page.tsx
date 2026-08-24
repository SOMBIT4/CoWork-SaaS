import Link from "next/link";

import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

import { CancelBookingButton } from "@/components/bookings/cancel-booking-button";
import { bookingListFilterSchema } from "@/lib/validation/booking";
import { requireOrganizationContext } from "@/server/authz/org-context";
import { hasOrganizationPermission } from "@/server/authz/roles";
import { listBookings } from "@/server/repositories/booking.repository";
import { listResources } from "@/server/repositories/resource.repository";
import { canUserModifyBooking } from "@/server/services/booking.service";

interface BookingsPageProps {
  params: Promise<{
    orgSlug: string;
  }>;

  searchParams: Promise<{
    resourceId?: string;
    from?: string;
    to?: string;
  }>;
}

function addCalendarDay(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);

  const value = new Date(Date.UTC(year, month - 1, day + 1));

  return value.toISOString().slice(0, 10);
}

export default async function BookingsPage({
  params,
  searchParams,
}: BookingsPageProps) {
  const { orgSlug } = await params;

  const rawFilters = await searchParams;

  const context = await requireOrganizationContext(orgSlug);

  const timezone = context.organizationTimezone;

  const now = new Date();

  const defaultFrom = formatInTimeZone(now, timezone, "yyyy-MM-dd");

  const defaultTo = formatInTimeZone(
    new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    timezone,
    "yyyy-MM-dd",
  );

  const parsed = bookingListFilterSchema.safeParse(rawFilters);

  const resourceId = parsed.success ? parsed.data.resourceId : undefined;

  let from =
    parsed.success && parsed.data.from ? parsed.data.from : defaultFrom;

  let to = parsed.success && parsed.data.to ? parsed.data.to : defaultTo;

  /*
   * YYYY-MM-DD sorts correctly
   * lexicographically.
   */
  if (to < from) {
    from = defaultFrom;

    to = defaultTo;
  }

  const rangeStart = fromZonedTime(`${from}T00:00:00`, timezone);

  const rangeEnd = fromZonedTime(`${addCalendarDay(to)}T00:00:00`, timezone);

  const [bookings, resources] = await Promise.all([
    listBookings(context.organizationId, rangeStart, rangeEnd, resourceId),

    listResources(context.organizationId, {
      status: "active",
    }),
  ]);

  const canManageBookings = hasOrganizationPermission(
    context.role,
    "MANAGE_BOOKINGS",
  );

  const groups = new Map<string, typeof bookings>();

  for (const booking of bookings) {
    const key = formatInTimeZone(booking.startTime, timezone, "yyyy-MM-dd");

    const group = groups.get(key);

    if (group) {
      group.push(booking);
    } else {
      groups.set(key, [booking]);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-500">
            Workspace schedule
          </p>

          <h2 className="mt-2 text-3xl font-semibold">Bookings</h2>

          <p className="mt-2 text-neutral-600">
            Times are shown in <strong>{timezone}</strong>.
          </p>
        </div>

        <Link
          href={`/${context.organizationSlug}/bookings/new`}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
        >
          New booking
        </Link>
      </div>

      <form
        method="GET"
        className="mt-8 grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-4"
      >
        <select
          name="resourceId"
          defaultValue={resourceId ?? ""}
          className="rounded-md border bg-white px-3 py-2 text-sm"
        >
          <option value="">All resources</option>

          {resources.map((resource) => (
            <option key={resource.id} value={resource.id}>
              {resource.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="from"
          defaultValue={from}
          className="rounded-md border px-3 py-2 text-sm"
        />

        <input
          type="date"
          name="to"
          defaultValue={to}
          className="rounded-md border px-3 py-2 text-sm"
        />

        <button
          type="submit"
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Apply filters
        </button>
      </form>

      <div className="mt-6 space-y-6">
        {bookings.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center">
            <h3 className="font-medium">No bookings found</h3>

            <p className="mt-2 text-sm text-neutral-500">
              There are no bookings in this date range.
            </p>
          </div>
        ) : (
          Array.from(groups.entries()).map(([dateKey, dayBookings]) => (
            <div
              key={dateKey}
              className="overflow-hidden rounded-xl border bg-white"
            >
              <div className="border-b bg-neutral-50 px-5 py-3">
                <h3 className="font-semibold">
                  {formatInTimeZone(
                    dayBookings[0].startTime,
                    timezone,
                    "EEEE, MMMM d, yyyy",
                  )}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b text-neutral-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Time</th>

                      <th className="px-5 py-3 font-medium">Booking</th>

                      <th className="px-5 py-3 font-medium">Resource</th>

                      <th className="px-5 py-3 font-medium">Booked by</th>

                      <th className="px-5 py-3 font-medium">Status</th>

                      <th className="px-5 py-3 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {dayBookings.map((booking) => {
                      const canModify = canUserModifyBooking(context, booking);
                      return (
                        <tr key={booking.id}>
                          <td className="whitespace-nowrap px-5 py-4">
                            {formatInTimeZone(
                              booking.startTime,
                              timezone,
                              "h:mm a",
                            )}
                            {" – "}
                            {formatInTimeZone(
                              booking.endTime,
                              timezone,
                              "h:mm a",
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-medium">{booking.title}</p>

                            {booking.notes ? (
                              <p className="mt-1 max-w-sm truncate text-xs text-neutral-500">
                                {booking.notes}
                              </p>
                            ) : null}
                          </td>

                          <td className="px-5 py-4">{booking.resourceName}</td>

                          <td className="px-5 py-4">{booking.bookedByName}</td>

                          <td className="px-5 py-4">
                            <span
                              className={
                                booking.status === "CONFIRMED"
                                  ? "rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
                                  : "rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600"
                              }
                            >
                              {booking.status}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-4">
                              {canModify ? (
                                <>
                                  <Link
                                    href={`/${context.organizationSlug}/bookings/${booking.id}/edit`}
                                    className="font-medium hover:underline"
                                  >
                                    Reschedule
                                  </Link>

                                  <CancelBookingButton
                                    organizationSlug={context.organizationSlug}
                                    bookingId={booking.id}
                                    bookingTitle={booking.title}
                                  />
                                </>
                              ) : canManageBookings &&
                                booking.status === "CONFIRMED" ? (
                                <span className="text-xs text-neutral-400">
                                  Unavailable
                                </span>
                              ) : (
                                <span className="text-xs text-neutral-400">
                                  —
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
