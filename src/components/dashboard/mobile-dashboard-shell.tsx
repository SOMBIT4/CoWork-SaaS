"use client";

import {
  Building2,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import {
  DashboardNav,
} from "@/components/dashboard/dashboard-nav";
import {
  OrganizationSwitcher,
} from "@/components/dashboard/organization-switcher";
import {
  logoutAction,
} from "@/server/actions/auth.actions";
import type {
  OrganizationRole,
  OrganizationSummary,
} from "@/types/domain";

interface MobileDashboardShellProps {
  organizationName: string;
  organizationSlug: string;
  organizationTimezone: string;
  organizationRole: OrganizationRole;
  organizationPlan: string;

  organizations: OrganizationSummary[];

  canManageMembers: boolean;
  canViewAuditLog: boolean;
  canManageOrganization: boolean;
}

export function MobileDashboardShell({
  organizationName,
  organizationSlug,
  organizationTimezone,
  organizationRole,
  organizationPlan,
  organizations,
  canManageMembers,
  canViewAuditLog,
  canManageOrganization,
}: MobileDashboardShellProps) {
  const [
    open,
    setOpen,
  ] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  function closeNavigation() {
    setOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href={`/${organizationSlug}`}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white">
              <Building2
                className="size-[18px]"
                strokeWidth={1.8}
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-neutral-950">
                {organizationName}
              </p>

              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">
                CoWork
              </p>
            </div>
          </Link>

          <button
            type="button"
            aria-label="Open navigation"
            aria-expanded={open}
            aria-controls="mobile-dashboard-navigation"
            onClick={() =>
              setOpen(true)
            }
            className="flex size-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          >
            <Menu
              className="size-5"
              strokeWidth={1.8}
            />
          </button>
        </div>
      </header>

      {open ? (
        <div
          id="mobile-dashboard-navigation"
          className="fixed inset-0 z-50 lg:hidden"
        >
          <button
            type="button"
            aria-label="Close navigation"
            onClick={
              closeNavigation
            }
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Organization navigation"
            className="absolute inset-y-0 left-0 flex w-[min(88vw,340px)] flex-col border-r border-white/10 bg-neutral-950 text-white shadow-2xl"
          >
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
              <Link
                href={`/${organizationSlug}`}
                onClick={
                  closeNavigation
                }
                className="flex items-center gap-3"
              >
                <div className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                  <Building2
                    className="size-[18px]"
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    CoWork
                  </p>

                  <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">
                    Workspace OS
                  </p>
                </div>
              </Link>

              <button
                type="button"
                aria-label="Close navigation"
                onClick={
                  closeNavigation
                }
                className="flex size-9 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-white/10 hover:text-white"
              >
                <X
                  className="size-5"
                />
              </button>
            </div>

            <div className="border-b border-white/10 p-4">
              <OrganizationSwitcher
                organizations={
                  organizations
                }
                currentOrganizationSlug={
                  organizationSlug
                }
                appearance="dark"
                onNavigate={
                  closeNavigation
                }
              />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
              <DashboardNav
                organizationSlug={
                  organizationSlug
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
                onNavigate={
                  closeNavigation
                }
              />
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="truncate text-sm font-medium text-white">
                  {
                    organizationName
                  }
                </p>

                <p className="mt-1 truncate text-xs text-neutral-500">
                  {
                    organizationTimezone
                  }
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-300">
                    {
                      organizationRole
                    }
                  </span>

                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                    {
                      organizationPlan
                    }
                  </span>
                </div>
              </div>

              <form
                action={
                  logoutAction
                }
              >
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white"
                >
                  <LogOut
                    className="size-4"
                    strokeWidth={1.8}
                  />

                  Sign out
                </button>
              </form>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}