"use client";

import { motion } from "framer-motion";
import {
  Boxes,
  CalendarDays,
  LayoutDashboard,
  ScrollText,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardNavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface DashboardNavigationGroup {
  label: string;
  items: DashboardNavigationItem[];
}

interface DashboardNavProps {
  organizationSlug: string;
  canManageMembers: boolean;
  canViewAuditLog: boolean;
  canManageOrganization: boolean;

  appearance?: "dark" | "light";

  onNavigate?: () => void;
}

function isNavigationItemActive(
  pathname: string,
  item: DashboardNavigationItem,
): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return (
    pathname === item.href ||
    pathname.startsWith(
      `${item.href}/`,
    )
  );
}

function NavigationLink({
  item,
  pathname,
  appearance,
  onNavigate,
}: {
  item: DashboardNavigationItem;
  pathname: string;
  appearance: "dark" | "light";
  onNavigate?: () => void;
}) {
  const active =
    isNavigationItemActive(
      pathname,
      item,
    );

  const Icon = item.icon;

  const darkClasses = active
    ? "bg-gradient-to-r from-white to-neutral-50 text-neutral-950 shadow-lg shadow-white/25"
    : "text-neutral-400 hover:bg-white/10 hover:text-white";

  const lightClasses = active
    ? "bg-gradient-to-r from-neutral-950 to-neutral-800 text-white shadow-lg shadow-neutral-950/30"
    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950";

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={
        active
          ? "page"
          : undefined
      }
      className="relative block"
    >
      <motion.div
        initial={false}
        animate={{
          scale: active ? 1 : 1,
        }}
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={[
          "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 relative overflow-hidden",
          appearance === "dark"
            ? `${darkClasses} focus-visible:ring-white/50`
            : `${lightClasses} focus-visible:ring-neutral-400`,
        ].join(" ")}
      >
        {/* Animated background for active state */}
        {active && (
          <motion.div
            layoutId={`nav-${appearance}`}
            className={[
              "absolute inset-0 rounded-xl",
              appearance === "dark"
                ? "bg-gradient-to-r from-white to-neutral-50"
                : "bg-gradient-to-r from-neutral-950 to-neutral-800",
            ].join(" ")}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}

        {/* Hover glow effect */}
        {!active && (
          <div className={[
            "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100",
            appearance === "dark"
              ? "bg-gradient-to-r from-white/5 to-transparent"
              : "bg-gradient-to-r from-neutral-950/5 to-transparent"
          ].join(" ")} />
        )}

        <motion.div
          animate={{
            rotate: active ? [0, -10, 10, -10, 0] : 0,
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
          className="relative z-10"
        >
          <Icon
            className={[
              "size-5 shrink-0 transition-all duration-300",
              active
                ? "drop-shadow-sm"
                : appearance === "dark"
                  ? "text-neutral-500 group-hover:text-neutral-200 group-hover:scale-110"
                  : "text-neutral-400 group-hover:text-neutral-700 group-hover:scale-110",
            ].join(" ")}
            strokeWidth={active ? 2.5 : 2}
          />
        </motion.div>

        <span className="relative z-10 tracking-tight">
          {item.label}
        </span>

        {/* Active indicator dot */}
        {active && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
            className={[
              "relative z-10 ml-auto size-2 rounded-full",
              appearance === "dark"
                ? "bg-neutral-950"
                : "bg-white"
            ].join(" ")}
          />
        )}
      </motion.div>
    </Link>
  );
}

export function DashboardNav({
  organizationSlug,
  canManageMembers,
  canViewAuditLog,
  canManageOrganization,
  appearance = "light",
  onNavigate,
}: DashboardNavProps) {
  const pathname =
    usePathname();

  const root =
    `/${organizationSlug}`;

  const workspaceItems: DashboardNavigationItem[] =
    [
      {
        label: "Dashboard",
        href: root,
        icon: LayoutDashboard,
        exact: true,
      },
      {
        label: "Bookings",
        href: `${root}/bookings`,
        icon: CalendarDays,
      },
      {
        label: "Resources",
        href: `${root}/resources`,
        icon: Boxes,
      },
    ];

  const managementItems: DashboardNavigationItem[] =
    [];

  if (canManageMembers) {
    managementItems.push({
      label: "Members",
      href: `${root}/members`,
      icon: Users,
    });
  }

  if (canViewAuditLog) {
    managementItems.push({
      label: "Audit log",
      href: `${root}/audit`,
      icon: ScrollText,
    });
  }

  if (
    canManageOrganization
  ) {
    managementItems.push({
      label: "Settings",
      href: `${root}/settings`,
      icon: Settings,
    });
  }

  const groups: DashboardNavigationGroup[] =
    [
      {
        label: "Workspace",
        items: workspaceItems,
      },
    ];

  if (
    managementItems.length >
    0
  ) {
    groups.push({
      label: "Management",
      items:
        managementItems,
    });
  }

  return (
    <nav
      aria-label="Organization navigation"
      className="space-y-8"
    >
      {groups.map(
        (group, groupIndex) => (
          <motion.div
            key={group.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: groupIndex * 0.1,
              ease: "easeOut"
            }}
          >
            <div className="mb-3 flex items-center gap-2 px-4">
              <p
                className={[
                  "text-[11px] font-bold uppercase tracking-[0.18em]",
                  appearance === "dark"
                    ? "text-neutral-500"
                    : "text-neutral-400",
                ].join(" ")}
              >
                {group.label}
              </p>
              <div
                className={[
                  "h-px flex-1",
                  appearance === "dark"
                    ? "bg-gradient-to-r from-neutral-800 to-transparent"
                    : "bg-gradient-to-r from-neutral-300 to-transparent"
                ].join(" ")}
              />
            </div>

            <div className="space-y-1.5">
              {group.items.map(
                (item, itemIndex) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: (groupIndex * 0.1) + (itemIndex * 0.05),
                      ease: "easeOut"
                    }}
                  >
                    <NavigationLink
                      item={item}
                      pathname={pathname}
                      appearance={appearance}
                      onNavigate={onNavigate}
                    />
                  </motion.div>
                ),
              )}
            </div>
          </motion.div>
        ),
      )}
    </nav>
  );
}
