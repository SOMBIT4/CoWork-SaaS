"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  ChevronsUpDown,
  Sparkles,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";
import {
  useState,
  useTransition,
} from "react";

import type {
  OrganizationRole,
  OrganizationSummary,
} from "@/types/domain";

interface OrganizationSwitcherProps {
  organizations: OrganizationSummary[];
  currentOrganizationSlug: string;

  appearance?: "dark" | "light";

  onNavigate?: () => void;
}

function formatRole(
  role: OrganizationRole,
): string {
  switch (role) {
    case "OWNER":
      return "Owner";

    case "ADMIN":
      return "Admin";

    case "MEMBER":
      return "Member";
  }
}

export function OrganizationSwitcher({
  organizations,
  currentOrganizationSlug,
  appearance = "light",
  onNavigate,
}: OrganizationSwitcherProps) {
  const router =
    useRouter();

  const [
    pending,
    startTransition,
  ] = useTransition();

  const [isHovered, setIsHovered] = useState(false);

  const currentOrganization =
    organizations.find(
      (organization) =>
        organization.slug ===
        currentOrganizationSlug,
    );

  function handleOrganizationChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const slug =
      event.target.value;

    if (
      !slug ||
      slug ===
        currentOrganizationSlug
    ) {
      return;
    }

    onNavigate?.();

    startTransition(() => {
      router.push(
        `/${slug}`,
      );
    });
  }

  const isDark =
    appearance === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={[
        "rounded-2xl border p-4 relative overflow-hidden transition-all duration-300",
        isDark
          ? "border-white/20 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-xl"
          : "border-neutral-200 bg-gradient-to-br from-white to-neutral-50/50 shadow-lg",
      ].join(" ")}
    >
      {/* Animated background gradient */}
      <motion.div
        className={[
          "absolute inset-0 opacity-0 transition-opacity duration-500",
          isDark
            ? "bg-gradient-to-br from-white/5 via-transparent to-transparent"
            : "bg-gradient-to-br from-neutral-100/50 via-transparent to-transparent"
        ].join(" ")}
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Sparkle effect on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute top-2 right-2 z-10"
          >
            <Sparkles
              className={[
                "size-3",
                isDark ? "text-white/40" : "text-neutral-400"
              ].join(" ")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4 flex items-center gap-3 relative z-10">
        <motion.div
          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className={[
            "flex size-11 shrink-0 items-center justify-center rounded-xl border-2 relative overflow-hidden",
            isDark
              ? "border-white/20 bg-gradient-to-br from-white/20 to-white/5 text-white shadow-lg"
              : "border-neutral-300 bg-gradient-to-br from-white to-neutral-100 text-neutral-700 shadow-md",
          ].join(" ")}
        >
          {/* Animated shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
          />
          <Building2
            className="size-5 relative z-10"
            strokeWidth={2.5}
          />
        </motion.div>

        <div className="min-w-0 flex-1">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={[
              "text-[10px] font-bold uppercase tracking-[0.16em] flex items-center gap-1.5",
              isDark
                ? "text-neutral-400"
                : "text-neutral-500",
            ].join(" ")}
          >
            <span className={[
              "size-1.5 rounded-full animate-pulse",
              isDark ? "bg-green-400" : "bg-green-500"
            ].join(" ")} />
            Workspace
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={[
              "mt-1 truncate text-[15px] font-bold tracking-tight",
              isDark
                ? "text-white"
                : "text-neutral-900",
            ].join(" ")}
          >
            {currentOrganization
              ?.name ??
              "Organization"}
          </motion.p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative"
      >
        <label
          htmlFor="organization-switcher"
          className="sr-only"
        >
          Organization
        </label>

        <select
          id="organization-switcher"
          value={
            currentOrganizationSlug
          }
          disabled={pending}
          onChange={
            handleOrganizationChange
          }
          className={[
            "w-full appearance-none rounded-xl border-2 px-4 py-3 pr-10 text-sm font-semibold outline-none transition-all duration-300",
            "focus:ring-4 disabled:cursor-wait disabled:opacity-60",
            "hover:border-opacity-100",
            isDark
              ? "border-white/20 bg-neutral-900/80 backdrop-blur-sm text-neutral-100 focus:border-white/40 focus:ring-white/20 hover:bg-neutral-900"
              : "border-neutral-300 bg-white text-neutral-800 focus:border-neutral-400 focus:ring-neutral-200 hover:border-neutral-400 shadow-sm",
          ].join(" ")}
        >
          {organizations.map(
            (
              organization,
            ) => (
              <option
                key={
                  organization.id
                }
                value={
                  organization.slug
                }
                className="text-neutral-900 font-medium"
              >
                {
                  organization.name
                }{" "}
                •{" "}
                {formatRole(
                  organization.role,
                )}
              </option>
            ),
          )}
        </select>

        <motion.div
          animate={{
            rotate: pending ? 360 : 0,
          }}
          transition={{
            duration: 1,
            repeat: pending ? Infinity : 0,
            ease: "linear",
          }}
        >
          <ChevronsUpDown
            aria-hidden="true"
            className={[
              "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 transition-colors",
              isDark
                ? "text-neutral-400"
                : "text-neutral-500",
            ].join(" ")}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
