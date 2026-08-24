import "server-only";

import type {
  PoolClient,
  QueryResultRow,
} from "pg";

import {
  query,
} from "@/lib/db/query";
import type {
  Booking,
  BookingStatus,
  ResourceType,
} from "@/types/domain";

interface BookingRow
  extends QueryResultRow {
  id: string;

  organizationId: string;

  resourceId: string;

  bookedByMembershipId: string;

  title: string;

  notes: string | null;

  startTime: Date;

  endTime: Date;

  status: BookingStatus;

  cancelledAt: Date | null;

  cancelledByUserId:
    | string
    | null;

  createdAt: Date;

  updatedAt: Date;
}

export interface BookingListItem {
  id: string;

  organizationId: string;

  title: string;

  notes: string | null;

  startTime: Date;

  endTime: Date;

  status: BookingStatus;

  resourceId: string;

  resourceName: string;

  resourceType: ResourceType;

  bookedByMembershipId: string;

  bookedByUserId: string;

  bookedByName: string;

  cancelledAt: Date | null;
}

interface BookingListRow
  extends QueryResultRow,
    BookingListItem {}

interface ActiveResourceRow
  extends QueryResultRow {
  id: string;
  name: string;
}

const BOOKING_COLUMNS = `
  id,
  organization_id AS "organizationId",
  resource_id AS "resourceId",
  booked_by_membership_id AS "bookedByMembershipId",
  title,
  notes,
  start_time AS "startTime",
  end_time AS "endTime",
  status,
  cancelled_at AS "cancelledAt",
  cancelled_by_user_id AS "cancelledByUserId",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export async function findActiveBookingResource(
  client: PoolClient,
  organizationId: string,
  resourceId: string,
): Promise<{
  id: string;
  name: string;
} | null> {
  const result =
    await client.query<ActiveResourceRow>(
      `SELECT
         id,
         name
       FROM resources
       WHERE organization_id = $1
         AND id = $2
         AND is_active = TRUE
       LIMIT 1`,
      [
        organizationId,
        resourceId,
      ],
    );

  return result.rows[0] ?? null;
}

export async function insertBooking(
  client: PoolClient,
  input: {
    organizationId: string;
    resourceId: string;
    membershipId: string;
    title: string;
    notes?: string;
    startTime: Date;
    endTime: Date;
  },
): Promise<Booking> {
  const result =
    await client.query<BookingRow>(
      `INSERT INTO bookings (
         organization_id,
         resource_id,
         booked_by_membership_id,
         title,
         notes,
         start_time,
         end_time
       )
       VALUES (
         $1,
         $2,
         $3,
         $4,
         $5,
         $6,
         $7
       )
       RETURNING
         ${BOOKING_COLUMNS}`,
      [
        input.organizationId,
        input.resourceId,
        input.membershipId,
        input.title,
        input.notes ?? null,
        input.startTime,
        input.endTime,
      ],
    );

  const booking =
    result.rows[0];

  if (!booking) {
    throw new Error(
      "Booking insertion returned no booking.",
    );
  }

  return booking;
}

export async function listBookings(
  organizationId: string,
  rangeStart: Date,
  rangeEnd: Date,
  resourceId?: string,
): Promise<BookingListItem[]> {
  const values: unknown[] = [
    organizationId,
    rangeStart,
    rangeEnd,
  ];

  let resourceCondition = "";

  if (resourceId) {
    values.push(resourceId);

    resourceCondition =
      `AND b.resource_id = $${values.length}`;
  }

  const result =
    await query<BookingListRow>(
      `SELECT
         b.id,
         b.organization_id AS "organizationId",
         b.title,
         b.notes,
         b.start_time AS "startTime",
         b.end_time AS "endTime",
         b.status,
         b.cancelled_at AS "cancelledAt",

         r.id AS "resourceId",
         r.name AS "resourceName",
         r.type AS "resourceType",

         m.id AS "bookedByMembershipId",

         u.id AS "bookedByUserId",
         u.name AS "bookedByName"

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
         ON u.id = m.user_id

       WHERE b.organization_id = $1
         AND b.start_time < $3
         AND b.end_time > $2

         ${resourceCondition}

       ORDER BY
         b.start_time ASC,
         r.name ASC`,
      values,
    );

  return result.rows;
}

export async function getBookingById(
  organizationId: string,
  bookingId: string,
): Promise<Booking | null> {
  const result =
    await query<BookingRow>(
      `SELECT
         ${BOOKING_COLUMNS}
       FROM bookings
       WHERE organization_id = $1
         AND id = $2
       LIMIT 1`,
      [
        organizationId,
        bookingId,
      ],
    );

  return result.rows[0] ?? null;
}

export async function getBookingForUpdate(
  client: PoolClient,
  organizationId: string,
  bookingId: string,
): Promise<Booking | null> {
  const result =
    await client.query<BookingRow>(
      `SELECT
         ${BOOKING_COLUMNS}
       FROM bookings
       WHERE organization_id = $1
         AND id = $2
       LIMIT 1
       FOR UPDATE`,
      [
        organizationId,
        bookingId,
      ],
    );

  return result.rows[0] ?? null;
}

export async function cancelBookingRecord(
  client: PoolClient,
  organizationId: string,
  bookingId: string,
  cancelledByUserId: string,
): Promise<Booking | null> {
  const result =
    await client.query<BookingRow>(
      `UPDATE bookings
       SET
         status = 'CANCELLED',
         cancelled_at = NOW(),
         cancelled_by_user_id = $3
       WHERE organization_id = $1
         AND id = $2
         AND status = 'CONFIRMED'
       RETURNING
         ${BOOKING_COLUMNS}`,
      [
        organizationId,
        bookingId,
        cancelledByUserId,
      ],
    );

  return result.rows[0] ?? null;
}

export async function rescheduleBookingRecord(
  client: PoolClient,
  organizationId: string,
  bookingId: string,
  startTime: Date,
  endTime: Date,
): Promise<Booking | null> {
  const result =
    await client.query<BookingRow>(
      `UPDATE bookings
       SET
         start_time = $3,
         end_time = $4
       WHERE organization_id = $1
         AND id = $2
         AND status = 'CONFIRMED'
       RETURNING
         ${BOOKING_COLUMNS}`,
      [
        organizationId,
        bookingId,
        startTime,
        endTime,
      ],
    );

  return result.rows[0] ?? null;
}