/*
 * These constant arrays are the TypeScript equivalents of
 * the PostgreSQL enum values defined in the SQL migrations.
 *
 * Keep these values synchronized with the database enums.
 */

export const ORGANIZATION_ROLES = [
  "OWNER",
  "ADMIN",
  "MEMBER",
] as const;

export const ORGANIZATION_PLANS = [
  "FREE",
  "PRO",
] as const;

export const RESOURCE_TYPES = [
  "DESK",
  "ROOM",
  "CABIN",
] as const;

export const BOOKING_STATUSES = [
  "CONFIRMED",
  "CANCELLED",
] as const;


/*
 * These union types are generated from the arrays above.
 */

export type OrganizationRole =
  (typeof ORGANIZATION_ROLES)[number];

export type OrganizationPlan =
  (typeof ORGANIZATION_PLANS)[number];

export type ResourceType =
  (typeof RESOURCE_TYPES)[number];

export type BookingStatus =
  (typeof BOOKING_STATUSES)[number];


/*
 * Represents the signed-in user's membership and organization
 * information after tenant authorization succeeds.
 */

export interface OrganizationContext {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  organizationTimezone: string;

  membershipId: string;
  role: OrganizationRole;

  userId: string;
}


/*
 * Small organization representation used by organization
 * lists and the future organization switcher.
 */

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  plan: OrganizationPlan;
  membershipId: string;
  role: OrganizationRole;
}


/*
 * Shared representation of a coworking resource.
 */

export interface Resource {
  id: string;
  organizationId: string;
  name: string;
  type: ResourceType;
  capacity: number;
  floor: string | null;
  description: string | null;
  isActive: boolean;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}


/*
 * Shared representation of a booking.
 */

export interface Booking {
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
  cancelledByUserId: string | null;

  createdAt: Date;
  updatedAt: Date;
}