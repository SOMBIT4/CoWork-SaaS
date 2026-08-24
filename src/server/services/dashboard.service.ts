import "server-only";

import {
  createDashboardTimeRange,
} from "@/lib/dashboard/time-range";
import {
  getDashboardAggregates,
} from "@/server/repositories/dashboard.repository";
import type {
  OrganizationContext,
} from "@/types/domain";

const MILLISECONDS_PER_HOUR =
  60 * 60 * 1000;

export interface DashboardStatistics {
  activeResources: number;

  confirmedBookingsToday: number;

  upcomingBookingsNextSevenDays: number;

  organizationMembers: number;

  bookedResourceHoursToday: number;

  availableResourceHoursToday: number;

  estimatedOccupancyPercent: number;

  localDate: string;
}

function roundToOneDecimal(
  value: number,
): number {
  return (
    Math.round(
      value * 10,
    ) / 10
  );
}

export async function getOrganizationDashboardStatistics(
  context: OrganizationContext,
): Promise<DashboardStatistics> {
  /*
   * Current time is obtained in the
   * server service rather than directly
   * during React rendering.
   */
  const now =
    new Date();

  const range =
    createDashboardTimeRange(
      context.organizationTimezone,
      now,
    );

  const aggregates =
    await getDashboardAggregates({
      organizationId:
        context.organizationId,

      todayStart:
        range.todayStart,

      todayEnd:
        range.todayEnd,

      nextSevenDaysEnd:
        range.nextSevenDaysEnd,
    });

  /*
   * Using the actual difference between
   * the organization's two local midnight
   * boundaries also handles 23/25-hour
   * daylight-saving days correctly.
   */
  const dayHours =
    (
      range.todayEnd.getTime() -
      range.todayStart.getTime()
    ) /
    MILLISECONDS_PER_HOUR;

  const availableResourceHoursToday =
    aggregates.activeResources *
    dayHours;

  const estimatedOccupancyPercent =
    availableResourceHoursToday > 0
      ? Math.min(
          100,
          roundToOneDecimal(
            (
              aggregates.bookedResourceHoursToday /
              availableResourceHoursToday
            ) *
              100,
          ),
        )
      : 0;

  return {
    activeResources:
      aggregates.activeResources,

    confirmedBookingsToday:
      aggregates.confirmedBookingsToday,

    upcomingBookingsNextSevenDays:
      aggregates.upcomingBookingsNextSevenDays,

    organizationMembers:
      aggregates.organizationMembers,

    bookedResourceHoursToday:
      roundToOneDecimal(
        aggregates.bookedResourceHoursToday,
      ),

    availableResourceHoursToday:
      roundToOneDecimal(
        availableResourceHoursToday,
      ),

    estimatedOccupancyPercent,

    localDate:
      range.localDate,
  };
}