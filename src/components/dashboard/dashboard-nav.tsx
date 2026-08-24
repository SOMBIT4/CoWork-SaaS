"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardNavigationItem {
  label: string;
  href: string;
}

interface DashboardNavProps {
  organizationSlug: string;

  canManageMembers: boolean;
  canViewAuditLog: boolean;
  canManageOrganization: boolean;
}

function NavigationLink({
  item,
}: {
  item: DashboardNavigationItem;
}) {
  const pathname = usePathname();

  const active =
    pathname === item.href ||
    (
      item.href !== "/" &&
      pathname.startsWith(
        `${item.href}/`,
      )
    );

  return (
    <Link
      href={item.href}
      className={[
        "block rounded-md px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-neutral-900 text-white"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
      ].join(" ")}
    >
      {item.label}
    </Link>
  );
}

export function DashboardNav({
  organizationSlug,
  canManageMembers,
  canViewAuditLog,
  canManageOrganization,
}: DashboardNavProps) {
  const root =
    `/${organizationSlug}`;

  const navigation: DashboardNavigationItem[] =
    [
      {
        label: "Dashboard",
        href: root,
      },
      {
        label: "Resources",
        href: `${root}/resources`,
      },
      {
        label: "Bookings",
        href: `${root}/bookings`,
      },
    ];

  if (canManageMembers) {
    navigation.push({
      label: "Members",
      href: `${root}/members`,
    });
  }

  if (canViewAuditLog) {
    navigation.push({
      label: "Audit log",
      href: `${root}/audit`,
    });
  }

  if (canManageOrganization) {
    navigation.push({
      label: "Settings",
      href: `${root}/settings`,
    });
  }

  return (
    <nav
      aria-label="Organization navigation"
      className="space-y-1"
    >
      {navigation.map((item) => (
        <NavigationLink
          key={item.href}
          item={item}
        />
      ))}
    </nav>
  );
}