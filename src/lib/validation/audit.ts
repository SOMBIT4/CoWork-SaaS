import { z } from "zod";

export const AUDIT_ACTIONS = [
  "ORGANIZATION_CREATED",
  "ORGANIZATION_UPDATED",

  "RESOURCE_CREATED",
  "RESOURCE_UPDATED",
  "RESOURCE_DEACTIVATED",

  "BOOKING_CREATED",
  "BOOKING_RESCHEDULED",
  "BOOKING_CANCELLED",

  "MEMBER_INVITED",
  "INVITATION_ACCEPTED",
  "MEMBER_ROLE_CHANGED",
  "MEMBER_REMOVED",
] as const;

export const AUDIT_ENTITY_TYPES = [
  "organization",
  "resource",
  "booking",
  "invitation",
  "membership",
] as const;

function emptyStringToUndefined(
  value: unknown,
): unknown {
  if (
    typeof value === "string" &&
    value.trim() === ""
  ) {
    return undefined;
  }

  return value;
}

export const auditFilterSchema =
  z.object({
    action: z.preprocess(
      emptyStringToUndefined,
      z
        .enum(AUDIT_ACTIONS)
        .optional(),
    ),

    entityType: z.preprocess(
      emptyStringToUndefined,
      z
        .enum(
          AUDIT_ENTITY_TYPES,
        )
        .optional(),
    ),
  });

export type AuditAction =
  (typeof AUDIT_ACTIONS)[number];

export type AuditEntityType =
  (typeof AUDIT_ENTITY_TYPES)[number];

export type AuditFilters =
  z.infer<
    typeof auditFilterSchema
  >;