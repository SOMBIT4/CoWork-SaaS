import Link from "next/link";
import type { ReactNode } from "react";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { OrganizationSwitcher } from "@/components/dashboard/organization-switcher";
import { logoutAction } from "@/server/actions/auth.actions";
import {
  requireOrganizationContext,
} from "@/server/authz/org-context";
import {
  hasOrganizationPermission,
} from "@/server/authz/roles";
import { listOrganizationsForUser } from "@/server/repositories/organization.repository";

interface OrganizationLayoutProps {
  children: ReactNode;

  params: Promise<{
    orgSlug: string;
  }>;
}

export default async function OrganizationLayout({
  children,
  params,
}: OrganizationLayoutProps) {
  const { orgSlug } =
    await params;

  /*
   * Security boundary:
   *
   * This confirms the authenticated user actually
   * belongs to the organization from the URL.
   */
  const context =
    await requireOrganizationContext(
      orgSlug,
    );

  const organizations =
    await listOrganizationsForUser(
      context.userId,
    );

  const canManageMembers =
    hasOrganizationPermission(
      context.role,
      "MANAGE_MEMBERS",
    );

  const canViewAuditLog =
    hasOrganizationPermission(
      context.role,
      "VIEW_AUDIT_LOG",
    );

  const canManageOrganization =
    hasOrganizationPermission(
      context.role,
      "MANAGE_ORGANIZATION",
    );

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b bg-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <Link
            href={`/${context.organizationSlug}`}
            className="font-semibold"
          >
            CoWork
          </Link>

          <span className="text-sm text-neutral-500">
            {context.role}
          </span>
        </div>
      </header>

      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r bg-white lg:flex lg:flex-col">
          <div className="border-b p-6">
            <Link
              href={`/${context.organizationSlug}`}
              className="text-xl font-semibold tracking-tight"
            >
              CoWork
            </Link>

            <p className="mt-1 text-sm text-neutral-500">
              Workspace management
            </p>
          </div>

          <div className="p-4">
            <OrganizationSwitcher
              organizations={
                organizations
              }
              currentOrganizationSlug={
                context.organizationSlug
              }
            />
          </div>

          <div className="flex-1 px-4">
            <DashboardNav
              organizationSlug={
                context.organizationSlug
              }
              canManageMembers={
                canManageMembers
              }
              canViewAuditLog={
                canViewAuditLog
              }
              canManageOrganization={
                canManageOrganization
              }
            />
          </div>

          <div className="border-t p-4">
            <div className="mb-4">
              <p className="truncate text-sm font-medium">
                {
                  context.organizationName
                }
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                {context.role} ·{" "}
                {
                  context.organizationPlan
                }{" "}
                plan
              </p>
            </div>

            <form
              action={logoutAction}
            >
              <button
                type="submit"
                className="w-full rounded-md border px-3 py-2 text-sm font-medium hover:bg-neutral-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b bg-white">
            <div className="px-4 py-5 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold">
                    {
                      context.organizationName
                    }
                  </h1>

                  <p className="mt-1 text-sm text-neutral-500">
                    {
                      context.organizationTimezone
                    }
                    {" · "}
                    {context.role}
                  </p>
                </div>

                <div className="w-full sm:w-72 lg:hidden">
                  <OrganizationSwitcher
                    organizations={
                      organizations
                    }
                    currentOrganizationSlug={
                      context.organizationSlug
                    }
                  />
                </div>
              </div>

              <div className="mt-4 overflow-x-auto lg:hidden">
                <div className="min-w-max">
                  <DashboardNav
                    organizationSlug={
                      context.organizationSlug
                    }
                    canManageMembers={
                      canManageMembers
                    }
                    canViewAuditLog={
                      canViewAuditLog
                    }
                    canManageOrganization={
                      canManageOrganization
                    }
                  />
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}