import "server-only";

import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { organizationSlugSchema } from "@/lib/validation/organization";
import {
  hasMinimumRole,
  hasOrganizationPermission,
  type OrganizationPermission,
} from "@/server/authz/roles";
import { findOrganizationContextForUser } from "@/server/repositories/organization.repository";
import type {
  OrganizationContext,
  OrganizationRole,
} from "@/types/domain";

/*
 * Returns the authenticated database user ID.
 *
 * This must be called server-side.
 */
export async function requireAuthenticatedUserId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user.id;
}

/*
 * Resolves a trusted tenant context.
 *
 * It verifies:
 *
 * 1. The user is authenticated.
 * 2. The slug has a valid format.
 * 3. The organization exists.
 * 4. The user has a membership in that organization.
 */
export async function requireOrganizationContext(
  orgSlug: string,
): Promise<OrganizationContext> {
  const parsedSlug =
    organizationSlugSchema.safeParse(orgSlug);

  if (!parsedSlug.success) {
    notFound();
  }

  const userId =
    await requireAuthenticatedUserId();

  const context =
    await findOrganizationContextForUser({
      userId,
      organizationSlug: parsedSlug.data,
    });

  if (!context) {
    /*
     * Do not reveal whether the organization exists
     * when the current user is not a member.
     */
    notFound();
  }

  return context;
}

/*
 * Use when access depends directly on the role hierarchy.
 *
 * Example:
 * requireOrganizationRole(slug, "ADMIN")
 *
 * Allows ADMIN and OWNER.
 * Rejects MEMBER.
 */
export async function requireOrganizationRole(
  orgSlug: string,
  requiredRole: OrganizationRole,
): Promise<OrganizationContext> {
  const context =
    await requireOrganizationContext(orgSlug);

  if (
    !hasMinimumRole(
      context.role,
      requiredRole,
    )
  ) {
    notFound();
  }

  return context;
}

/*
 * Preferred helper for pages and layouts.
 *
 * Named permissions are clearer than raw role comparisons.
 */
export async function requireOrganizationPermission(
  orgSlug: string,
  permission: OrganizationPermission,
): Promise<OrganizationContext> {
  const context =
    await requireOrganizationContext(orgSlug);

  if (
    !hasOrganizationPermission(
      context.role,
      permission,
    )
  ) {
    notFound();
  }

  return context;
}