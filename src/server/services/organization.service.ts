import "server-only";

import { isUniqueViolation } from "@/lib/db/errors";
import { withTransaction } from "@/lib/db/transaction";
import type { CreateOrganizationInput } from "@/lib/validation/organization";
import { insertAuditLog } from "@/server/repositories/audit.repository";
import {
  insertOrganization,
  insertOwnerMembership,
} from "@/server/repositories/organization.repository";

export class OrganizationSlugTakenError
  extends Error {
  readonly code =
    "ORGANIZATION_SLUG_TAKEN";

  constructor() {
    super(
      "An organization with this slug already exists.",
    );

    this.name =
      "OrganizationSlugTakenError";
  }
}

interface CreateOrganizationForUserInput {
  userId: string;
  organization: CreateOrganizationInput;
}

export async function createOrganizationForUser({
  userId,
  organization: input,
}: CreateOrganizationForUserInput) {
  try {
    return await withTransaction(
      async (client) => {
        const organization =
          await insertOrganization(
            client,
            input,
          );

        const membership =
          await insertOwnerMembership(
            client,
            organization.id,
            userId,
          );

        await insertAuditLog(
          client,
          {
            organizationId:
              organization.id,

            actorUserId: userId,

            action:
              "ORGANIZATION_CREATED",

            entityType:
              "organization",

            entityId:
              organization.id,

            metadata: {
              name:
                organization.name,

              slug:
                organization.slug,

              timezone:
                organization.timezone,
            },
          },
        );

        return {
          organization,
          membership,
        };
      },
    );
  } catch (error) {
    if (
      isUniqueViolation(
        error,
        "organizations_slug_unique",
      )
    ) {
      throw new OrganizationSlugTakenError();
    }

    throw error;
  }
}