import Link from "next/link";

import {
  requireOrganizationContext,
} from "@/server/authz/org-context";
import {
  getOrganizationDashboardStatistics,
} from "@/server/services/dashboard.service";

interface DashboardPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

interface DashboardCardProps {
  label: string;

  value:
    | string
    | number;

  description: string;
}

function DashboardCard({
  label,
  value,
  description,
}: DashboardCardProps) {
  return (
    <article className="rounded-xl border bg-white p-5">
      <p className="text-sm font-medium text-neutral-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-2 text-sm text-neutral-500">
        {description}
      </p>
    </article>
  );
}

export default async function DashboardPage({
  params,
}: DashboardPageProps) {
  const { orgSlug } =
    await params;

  const context =
    await requireOrganizationContext(
      orgSlug,
    );

  const statistics =
    await getOrganizationDashboardStatistics(
      context,
    );

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-500">
            Dashboard
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Welcome to{" "}
            {
              context.organizationName
            }
          </h2>

          <p className="mt-2 text-neutral-600">
            Overview for{" "}
            <strong>
              {
                statistics.localDate
              }
            </strong>{" "}
            in{" "}
            <strong>
              {
                context.organizationTimezone
              }
            </strong>
            .
          </p>
        </div>

        <Link
          href={`/${context.organizationSlug}/bookings/new`}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          New booking
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <DashboardCard
          label="Active resources"
          value={
            statistics.activeResources
          }
          description="Resources currently available for new bookings."
        />

        <DashboardCard
          label="Bookings today"
          value={
            statistics.confirmedBookingsToday
          }
          description="Confirmed bookings overlapping today."
        />

        <DashboardCard
          label="Next 7 days"
          value={
            statistics.upcomingBookingsNextSevenDays
          }
          description="Confirmed bookings in the seven-day window."
        />

        <DashboardCard
          label="Members"
          value={
            statistics.organizationMembers
          }
          description="Users with organization membership."
        />

        <DashboardCard
          label="Estimated occupancy"
          value={`${statistics.estimatedOccupancyPercent}%`}
          description="Booked resource-hours compared with today's available resource-hours."
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border bg-white p-6">
          <h3 className="font-semibold">
            Occupancy details
          </h3>

          <p className="mt-2 text-sm text-neutral-600">
            Estimated occupancy is based
            on resource-hours rather than
            people or seat capacity.
          </p>

          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-neutral-500">
                Booked resource-hours
              </dt>

              <dd className="font-medium">
                {
                  statistics.bookedResourceHoursToday
                }
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-neutral-500">
                Available resource-hours
              </dt>

              <dd className="font-medium">
                {
                  statistics.availableResourceHoursToday
                }
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 border-t pt-4">
              <dt className="text-sm font-medium">
                Estimated occupancy
              </dt>

              <dd className="text-lg font-semibold">
                {
                  statistics.estimatedOccupancyPercent
                }
                %
              </dd>
            </div>
          </dl>

          <p className="mt-5 text-xs leading-5 text-neutral-500">
            Formula: booked resource-hours
            ÷ available resource-hours ×
            100. The first version treats
            each active resource as
            available for the entire local
            calendar day.
          </p>
        </article>

        <article className="rounded-xl border bg-white p-6">
          <h3 className="font-semibold">
            Quick actions
          </h3>

          <p className="mt-2 text-sm text-neutral-600">
            Common workspace management
            actions.
          </p>

          <div className="mt-6 grid gap-3">
            <Link
              href={`/${context.organizationSlug}/bookings/new`}
              className="rounded-lg border p-4 transition hover:bg-neutral-50"
            >
              <p className="font-medium">
                Create booking
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                Reserve an active
                workspace resource.
              </p>
            </Link>

            <Link
              href={`/${context.organizationSlug}/bookings`}
              className="rounded-lg border p-4 transition hover:bg-neutral-50"
            >
              <p className="font-medium">
                View bookings
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                Review the organization
                schedule.
              </p>
            </Link>

            <Link
              href={`/${context.organizationSlug}/resources`}
              className="rounded-lg border p-4 transition hover:bg-neutral-50"
            >
              <p className="font-medium">
                View resources
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                Browse desks, rooms and
                cabins.
              </p>
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}