import "server-only";

import type {
  QueryResultRow,
} from "pg";

import {
  query,
} from "@/lib/db/query";

export interface DashboardAggregateResult {
  activeResources: number;

  confirmedBookingsToday: number;

  upcomingBookingsNextSevenDays: number;

  organizationMembers: number;

  bookedResourceHoursToday: number;
}

interface DashboardAggregateRow
  extends QueryResultRow {
  activeResources: number;

  confirmedBookingsToday: number;

  upcomingBookingsNextSevenDays: number;

  organizationMembers: number;

  bookedResourceHoursToday: number;
}

interface GetDashboardAggregatesInput {
  organizationId: string;

  todayStart: Date;

  todayEnd: Date;

  nextSevenDaysEnd: Date;
}

export async function getDashboardAggregates({
  organizationId,
  todayStart,
  todayEnd,
  nextSevenDaysEnd,
}: GetDashboardAggregatesInput): Promise<DashboardAggregateResult> {
  const result =
    await query<DashboardAggregateRow>(
      `SELECT

         (
           SELECT COUNT(*)::int
           FROM resources AS r
           WHERE r.organization_id = $1
             AND r.is_active = TRUE
         ) AS "activeResources",

         (
           SELECT COUNT(*)::int
           FROM bookings AS b
           WHERE b.organization_id = $1
             AND b.status = 'CONFIRMED'
             AND b.start_time < $3
             AND b.end_time > $2
         ) AS "confirmedBookingsToday",

         (
           SELECT COUNT(*)::int
           FROM bookings AS b
           WHERE b.organization_id = $1
             AND b.status = 'CONFIRMED'
             AND b.start_time < $4
             AND b.end_time > $2
         ) AS "upcomingBookingsNextSevenDays",

         (
           SELECT COUNT(*)::int
           FROM memberships AS m
           WHERE m.organization_id = $1
         ) AS "organizationMembers",

         COALESCE(
           (
             SELECT
               SUM(
                 EXTRACT(
                   EPOCH FROM (
                     LEAST(
                       b.end_time,
                       $3
                     )
                     -
                     GREATEST(
                       b.start_time,
                       $2
                     )
                   )
                 ) / 3600.0
               )::double precision

             FROM bookings AS b

             INNER JOIN resources AS r
               ON r.id =
                  b.resource_id
              AND r.organization_id =
                  b.organization_id

             WHERE b.organization_id = $1
               AND b.status = 'CONFIRMED'
               AND r.is_active = TRUE
               AND b.start_time < $3
               AND b.end_time > $2
           ),
           0
         )::double precision
           AS "bookedResourceHoursToday"`,
      [
        organizationId,
        todayStart,
        todayEnd,
        nextSevenDaysEnd,
      ],
    );

  const row =
    result.rows[0];

  if (!row) {
    throw new Error(
      "Dashboard aggregate query returned no result.",
    );
  }

  return row;
}