import {
  formatInTimeZone,
} from "date-fns-tz";

import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
  auditFilterSchema,
} from "@/lib/validation/audit";
import {
  requireOrganizationPermission,
} from "@/server/authz/org-context";
import {
  listAuditLogs,
} from "@/server/repositories/audit.repository";

interface AuditPageProps {
  params: Promise<{
    orgSlug: string;
  }>;

  searchParams: Promise<{
    action?: string;
    entityType?: string;
  }>;
}

function formatAction(
  action: string,
): string {
  return action
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0)
          .toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function formatEntityType(
  value: string,
): string {
  return (
    value.charAt(0)
      .toUpperCase() +
    value.slice(1)
  );
}

function hasMetadata(
  metadata: Record<
    string,
    unknown
  >,
): boolean {
  return (
    Object.keys(
      metadata,
    ).length > 0
  );
}

export default async function AuditPage({
  params,
  searchParams,
}: AuditPageProps) {
  const { orgSlug } =
    await params;

  const rawFilters =
    await searchParams;

  /*
   * Audit access is server-side protected.
   *
   * OWNER and ADMIN currently receive
   * VIEW_AUDIT_LOG permission.
   */
  const context =
    await requireOrganizationPermission(
      orgSlug,
      "VIEW_AUDIT_LOG",
    );

  const parsedFilters =
    auditFilterSchema.safeParse({
      action:
        rawFilters.action,

      entityType:
        rawFilters.entityType,
    });

  const filters =
    parsedFilters.success
      ? parsedFilters.data
      : {};

  const auditLogs =
    await listAuditLogs(
      context.organizationId,
      filters,
    );

  return (
    <section>
      <div>
        <p className="text-sm font-medium text-neutral-500">
          Security and activity
        </p>

        <h2 className="mt-2 text-3xl font-semibold">
          Audit log
        </h2>

        <p className="mt-2 text-neutral-600">
          Review important activity
          in{" "}
          {
            context.organizationName
          }.
        </p>
      </div>

      {/* Filters */}
      <form
        method="GET"
        className="mt-8 grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-[1fr_1fr_auto_auto]"
      >
        <select
          name="action"
          defaultValue={
            filters.action ?? ""
          }
          className="rounded-md border bg-white px-3 py-2 text-sm"
        >
          <option value="">
            All actions
          </option>

          {AUDIT_ACTIONS.map(
            (action) => (
              <option
                key={action}
                value={action}
              >
                {formatAction(
                  action,
                )}
              </option>
            ),
          )}
        </select>

        <select
          name="entityType"
          defaultValue={
            filters.entityType ??
            ""
          }
          className="rounded-md border bg-white px-3 py-2 text-sm"
        >
          <option value="">
            All entity types
          </option>

          {AUDIT_ENTITY_TYPES.map(
            (entityType) => (
              <option
                key={
                  entityType
                }
                value={
                  entityType
                }
              >
                {formatEntityType(
                  entityType,
                )}
              </option>
            ),
          )}
        </select>

        <button
          type="submit"
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Apply filters
        </button>

        <a
          href={`/${context.organizationSlug}/audit`}
          className="rounded-md border px-4 py-2 text-center text-sm font-medium hover:bg-neutral-50"
        >
          Reset
        </a>
      </form>

      {/* Audit records */}
      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        {auditLogs.length ===
        0 ? (
          <div className="p-10 text-center">
            <h3 className="font-medium">
              No audit activity found
            </h3>

            <p className="mt-2 text-sm text-neutral-500">
              No records match the
              selected filters.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {auditLogs.map(
              (auditLog) => (
                <article
                  key={
                    auditLog.id
                  }
                  className="p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium">
                          {formatAction(
                            auditLog.action,
                          )}
                        </h3>

                        {auditLog.entityType ? (
                          <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600">
                            {formatEntityType(
                              auditLog.entityType,
                            )}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-2 text-sm text-neutral-600">
                        Actor:{" "}
                        <strong>
                          {auditLog.actorName ??
                            "System / unavailable user"}
                        </strong>

                        {auditLog.actorEmail ? (
                          <>
                            {" "}
                            (
                            {
                              auditLog.actorEmail
                            }
                            )
                          </>
                        ) : null}
                      </p>

                      {auditLog.entityId ? (
                        <p className="mt-1 break-all text-xs text-neutral-500">
                          Entity ID:{" "}
                          {
                            auditLog.entityId
                          }
                        </p>
                      ) : null}
                    </div>

                    <time className="whitespace-nowrap text-sm text-neutral-500">
                      {formatInTimeZone(
                        auditLog.createdAt,
                        context.organizationTimezone,
                        "MMM d, yyyy, h:mm:ss a",
                      )}
                    </time>
                  </div>

                  {hasMetadata(
                    auditLog.metadata,
                  ) ? (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-neutral-600">
                        View metadata
                      </summary>

                      <pre className="mt-3 overflow-x-auto rounded-md bg-neutral-950 p-4 text-xs text-neutral-100">
                        {JSON.stringify(
                          auditLog.metadata,
                          null,
                          2,
                        )}
                      </pre>
                    </details>
                  ) : null}
                </article>
              ),
            )}
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-neutral-500">
        Showing up to 100 most recent
        matching audit records. Times
        are displayed in{" "}
        <strong>
          {
            context.organizationTimezone
          }
        </strong>
        .
      </p>
    </section>
  );
}