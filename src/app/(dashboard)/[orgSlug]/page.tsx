import { DashboardClient } from "@/components/dashboard/dashboard-client";
import {
  requireOrganizationContext,
} from "@/server/authz/org-context";
import {
  hasOrganizationPermission,
} from "@/server/authz/roles";
import {
  getOrganizationDashboardStatistics,
} from "@/server/services/dashboard.service";

interface DashboardPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

export default async function DashboardPage({
  params,
}: DashboardPageProps) {
  const { orgSlug } = await params;

  const context = await requireOrganizationContext(orgSlug);
  const statistics = await getOrganizationDashboardStatistics(context);
  const canViewAuditLog = hasOrganizationPermission(context.role, "VIEW_AUDIT_LOG");

  return (
    <DashboardClient
      context={{
        organizationSlug: context.organizationSlug,
        organizationName: context.organizationName,
        organizationTimezone: context.organizationTimezone,
        role: context.role,
      }}
      statistics={statistics}
      canViewAuditLog={canViewAuditLog}
    />
  );
}
