import "server-only";

import type {
  QueryResultRow,
} from "pg";

import {
  query,
} from "@/lib/db/query";
import type {
  BookingStatus,
} from "@/types/domain";

export interface BookingNotificationDetails {
  bookingId: string;

  bookingTitle: string;

  startTime: Date;

  endTime: Date;

  status: BookingStatus;

  resourceName: string;

  userId: string;

  userName: string;

  userEmail: string;
}

interface BookingNotificationRow
  extends QueryResultRow,
    BookingNotificationDetails {}

export async function findBookingNotificationDetails(
  organizationId: string,
  bookingId: string,
): Promise<BookingNotificationDetails | null> {
  const result =
    await query<BookingNotificationRow>(
      `SELECT
         b.id AS "bookingId",
         b.title AS "bookingTitle",
         b.start_time AS "startTime",
         b.end_time AS "endTime",
         b.status,

         r.name AS "resourceName",

         u.id AS "userId",
         u.name AS "userName",
         u.email AS "userEmail"

       FROM bookings AS b

       INNER JOIN resources AS r
         ON r.id = b.resource_id
        AND r.organization_id =
            b.organization_id

       INNER JOIN memberships AS m
         ON m.id =
            b.booked_by_membership_id
        AND m.organization_id =
            b.organization_id

       INNER JOIN users AS u
         ON u.id =
            m.user_id

       WHERE b.organization_id = $1
         AND b.id = $2

       LIMIT 1`,
      [
        organizationId,
        bookingId,
      ],
    );

  return result.rows[0] ?? null;
}