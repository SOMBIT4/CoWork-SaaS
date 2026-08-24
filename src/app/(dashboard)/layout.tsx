import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { requireAuthenticatedUserId } from "@/server/authz/org-context";
import { findFirstOrganizationForUser } from "@/server/repositories/organization.repository";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const userId =
    await requireAuthenticatedUserId();

  /*
   * Dashboard routes require at least one
   * organization membership.
   *
   * A newly registered user with no organization
   * is sent back to onboarding.
   */
  const firstOrganization =
    await findFirstOrganizationForUser(
      userId,
    );

  if (!firstOrganization) {
    redirect("/onboarding");
  }

  return children;
}