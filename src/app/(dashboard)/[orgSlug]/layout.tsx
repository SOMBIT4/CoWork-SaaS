import {
  Building2,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import type {
  ReactNode,
} from "react";

import {
  DashboardNav,
} from "@/components/dashboard/dashboard-nav";
import {
  MobileDashboardShell,
} from "@/components/dashboard/mobile-dashboard-shell";
import {
  OrganizationSwitcher,
} from "@/components/dashboard/organization-switcher";
import {
  logoutAction,
} from "@/server/actions/auth.actions";
import {
  requireOrganizationContext,
} from "@/server/authz/org-context";
import {
  hasOrganizationPermission,
} from "@/server/authz/roles";
import {
  listOrganizationsForUser,
} from "@/server/repositories/organization.repository";

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
   * Security boundary.
   *
   * UI redesign does not replace
   * server-side organization authorization.
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col border-r border-white/10 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white shadow-2xl lg:flex">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/50 via-transparent to-neutral-900/50 pointer-events-none" />
        
        {/* Brand */}
        <div className="relative flex h-20 items-center border-b border-white/10 px-5 bg-black/20 backdrop-blur-xl">
          <Link
            href={`/${context.organizationSlug}`}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-white/20 rounded-xl blur-xl group-hover:bg-white/30 transition-all duration-300" />
              <div className="relative flex size-11 items-center justify-center rounded-xl border-2 border-white/20 bg-gradient-to-br from-white/20 to-white/5 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Building2
                  className="size-5"
                  strokeWidth={2.5}
                />
              </div>
            </div>

            <div>
              <p className="text-[16px] font-bold tracking-tight group-hover:tracking-wide transition-all duration-300">
                CoWork
              </p>

              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400 group-hover:text-neutral-300 transition-colors">
                Workspace OS
              </p>
            </div>
          </Link>
        </div>

        {/* Workspace selector */}
        <div className="relative border-b border-white/10 p-5 bg-black/10">
          <OrganizationSwitcher
            organizations={
              organizations
            }
            currentOrganizationSlug={
              context.organizationSlug
            }
            appearance="dark"
          />
        </div>

        {/* Navigation */}
        <div className="relative flex-1 overflow-y-auto px-4 py-7 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
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
            appearance="dark"
          />
        </div>

        {/* Sidebar footer */}
        <div className="relative border-t border-white/10 p-5 bg-black/20 backdrop-blur-xl">
          <div className="mb-4 rounded-2xl border-2 border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-4 shadow-xl backdrop-blur-sm hover:border-white/20 transition-all duration-300">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-white">
                  {
                    context.organizationName
                  }
                </p>

                <p className="mt-1.5 truncate text-xs font-medium text-neutral-400">
                  {
                    context.organizationTimezone
                  }
                </p>
              </div>

              {/* Status indicator */}
              <div className="flex flex-col items-end gap-1">
                <span className="size-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-green-400">
                  Live
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border-2 border-white/20 bg-gradient-to-r from-white/20 to-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-lg backdrop-blur-sm">
                {context.role}
              </span>

              <span className="rounded-full border-2 border-white/10 bg-gradient-to-r from-neutral-800 to-neutral-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-300 shadow-lg">
                {
                  context.organizationPlan
                }
              </span>
            </div>
          </div>

          <form
            action={logoutAction}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-neutral-300 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white hover:shadow-lg hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <LogOut
                className="size-4"
                strokeWidth={2.5}
              />

              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile header + navigation */}
      <MobileDashboardShell
        organizationName={
          context.organizationName
        }
        organizationSlug={
          context.organizationSlug
        }
        organizationTimezone={
          context.organizationTimezone
        }
        organizationRole={
          context.role
        }
        organizationPlan={
          context.organizationPlan
        }
        organizations={
          organizations
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

      {/* Application content */}
      <div className="min-h-screen lg:pl-[280px]">
        {/* Desktop top bar */}
        <header className="sticky top-0 z-30 hidden h-20 border-b-2 border-slate-700/40 bg-slate-900/95 backdrop-blur-2xl shadow-xl shadow-slate-950/20 lg:block">
          <div className="flex h-full items-center justify-between gap-6 px-8 xl:px-10">
            <div className="min-w-0 flex items-center gap-3">
              {/* Animated pulse indicator */}
              <div className="relative">
                <div className="size-3 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                <div className="absolute inset-0 size-3 rounded-full bg-emerald-500 animate-ping opacity-75" />
              </div>

              <div>
                <p className="truncate text-[15px] font-bold tracking-tight text-white">
                  {
                    context.organizationName
                  }
                </p>

                <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">
                  {
                    context.organizationTimezone
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="rounded-full border-2 border-slate-600/50 bg-slate-800/60 backdrop-blur-sm px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-200 shadow-lg hover:shadow-xl hover:scale-105 hover:border-slate-500/60 transition-all duration-300">
                {
                  context.role
                }
              </span>

              <span className="relative overflow-hidden rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300">
                {/* Shine animation */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shine_3s_ease-in-out_infinite]" />
                <span className="relative z-10">
                  {
                    context.organizationPlan
                  }{" "}
                  plan
                </span>
              </span>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10 xl:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}