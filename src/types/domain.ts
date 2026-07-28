/*
 * Keep these values synchronized with the PostgreSQL enums
 * defined in database/migrations/0001_initial_schema.sql.
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

export type OrganizationRole =
  (typeof ORGANIZATION_ROLES)[number];

export type OrganizationPlan =
  (typeof ORGANIZATION_PLANS)[number];

export type ResourceType =
  (typeof RESOURCE_TYPES)[number];

export type BookingStatus =
  (typeof BOOKING_STATUSES)[number];

/*
 * The trusted tenant context returned only after:
 *
 * 1. Authentication succeeds.
 * 2. The organization exists.
 * 3. The user has a membership in that organization.
 */
export interface OrganizationContext {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  organizationTimezone: string;
  organizationPlan: OrganizationPlan;

  membershipId: string;
  role: OrganizationRole;

  userId: string;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  plan: OrganizationPlan;

  membershipId: string;
  role: OrganizationRole;
}

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