import type { OrganizationRole } from "@/types/domain";

const ROLE_LEVEL = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
} as const satisfies Readonly<
  Record<OrganizationRole, number>
>;

/*
 * Named permissions make page and service code easier to read.
 *
 * Add new permissions here as the application grows.
 */
export const ORGANIZATION_PERMISSION_MINIMUM_ROLE = {
  VIEW_ORGANIZATION: "MEMBER",
  CREATE_BOOKING: "MEMBER",

  MANAGE_RESOURCES: "ADMIN",
  MANAGE_BOOKINGS: "ADMIN",
  MANAGE_MEMBERS: "ADMIN",
  VIEW_AUDIT_LOG: "ADMIN",

  MANAGE_ORGANIZATION: "OWNER",
  DELETE_ORGANIZATION: "OWNER",
  TRANSFER_OWNERSHIP: "OWNER",
} as const satisfies Record<string, OrganizationRole>;

export type OrganizationPermission =
  keyof typeof ORGANIZATION_PERMISSION_MINIMUM_ROLE;

export class OrganizationForbiddenError extends Error {
  readonly code = "ORGANIZATION_FORBIDDEN";

  constructor(
    message = "You do not have permission to perform this operation.",
  ) {
    super(message);
    this.name = "OrganizationForbiddenError";
  }
}

export function hasMinimumRole(
  actualRole: OrganizationRole,
  requiredRole: OrganizationRole,
): boolean {
  return (
    ROLE_LEVEL[actualRole] >=
    ROLE_LEVEL[requiredRole]
  );
}

export function hasOrganizationPermission(
  actualRole: OrganizationRole,
  permission: OrganizationPermission,
): boolean {
  const requiredRole =
    ORGANIZATION_PERMISSION_MINIMUM_ROLE[
      permission
    ];

  return hasMinimumRole(
    actualRole,
    requiredRole,
  );
}

/*
 * Use this inside services when the organization context
 * has already been loaded.
 */
export function assertMinimumRole(
  actualRole: OrganizationRole,
  requiredRole: OrganizationRole,
): void {
  if (
    !hasMinimumRole(
      actualRole,
      requiredRole,
    )
  ) {
    throw new OrganizationForbiddenError();
  }
}

/*
 * Use this inside services when checking a named permission.
 */
export function assertOrganizationPermission(
  actualRole: OrganizationRole,
  permission: OrganizationPermission,
): void {
  if (
    !hasOrganizationPermission(
      actualRole,
      permission,
    )
  ) {
    throw new OrganizationForbiddenError();
  }
}

export function isOrganizationOwner(
  role: OrganizationRole,
): boolean {
  return role === "OWNER";
}