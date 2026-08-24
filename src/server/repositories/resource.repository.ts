import "server-only";

import type {
  PoolClient,
  QueryResultRow,
} from "pg";

import { query } from "@/lib/db/query";
import type {
  ResourceFilters,
  ResourceInput,
} from "@/lib/validation/resource";
import type {
  Resource,
  ResourceType,
} from "@/types/domain";

interface ResourceRow
  extends QueryResultRow {
  id: string;
  organizationId: string;
  name: string;
  type: ResourceType;
  capacity: number;
  floor: string | null;
  description: string | null;
  isActive: boolean;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

const RESOURCE_COLUMNS = `
  id,
  organization_id AS "organizationId",
  name,
  type,
  capacity,
  floor,
  description,
  is_active AS "isActive",
  created_by_user_id AS "createdByUserId",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export async function listResources(
  organizationId: string,
  filters: ResourceFilters,
): Promise<Resource[]> {
  const conditions: string[] = [
    "organization_id = $1",
  ];

  const values: unknown[] = [
    organizationId,
  ];

  if (filters.status === "active") {
    conditions.push(
      "is_active = TRUE",
    );
  }

  if (
    filters.status === "inactive"
  ) {
    conditions.push(
      "is_active = FALSE",
    );
  }

  if (filters.type) {
    values.push(filters.type);

    conditions.push(
      `type = $${values.length}`,
    );
  }

  if (
    filters.minCapacity !==
    undefined
  ) {
    values.push(
      filters.minCapacity,
    );

    conditions.push(
      `capacity >= $${values.length}`,
    );
  }

  if (filters.floor) {
    values.push(filters.floor);

    conditions.push(
      `LOWER(floor) = LOWER($${values.length})`,
    );
  }

  if (filters.search) {
    values.push(
      `%${filters.search}%`,
    );

    conditions.push(
      `name ILIKE $${values.length}`,
    );
  }

  const result =
    await query<ResourceRow>(
      `SELECT
         ${RESOURCE_COLUMNS}
       FROM resources
       WHERE ${conditions.join(
         "\n AND ",
       )}
       ORDER BY
         is_active DESC,
         name ASC`,
      values,
    );

  return result.rows;
}

export async function getResourceById(
  organizationId: string,
  resourceId: string,
): Promise<Resource | null> {
  const result =
    await query<ResourceRow>(
      `SELECT
         ${RESOURCE_COLUMNS}
       FROM resources
       WHERE organization_id = $1
         AND id = $2
       LIMIT 1`,
      [
        organizationId,
        resourceId,
      ],
    );

  return result.rows[0] ?? null;
}

export async function createResource(
  client: PoolClient,
  organizationId: string,
  userId: string,
  input: ResourceInput,
): Promise<Resource> {
  const result =
    await client.query<ResourceRow>(
      `INSERT INTO resources (
         organization_id,
         name,
         type,
         capacity,
         floor,
         description,
         created_by_user_id
       )
       VALUES (
         $1,
         $2,
         $3,
         $4,
         $5,
         $6,
         $7
       )
       RETURNING
         ${RESOURCE_COLUMNS}`,
      [
        organizationId,
        input.name,
        input.type,
        input.capacity,
        input.floor ?? null,
        input.description ?? null,
        userId,
      ],
    );

  const resource =
    result.rows[0];

  if (!resource) {
    throw new Error(
      "Resource insertion returned no resource.",
    );
  }

  return resource;
}

export async function updateResource(
  client: PoolClient,
  organizationId: string,
  resourceId: string,
  input: ResourceInput,
): Promise<Resource | null> {
  const result =
    await client.query<ResourceRow>(
      `UPDATE resources
       SET
         name = $3,
         type = $4,
         capacity = $5,
         floor = $6,
         description = $7
       WHERE organization_id = $1
         AND id = $2
       RETURNING
         ${RESOURCE_COLUMNS}`,
      [
        organizationId,
        resourceId,
        input.name,
        input.type,
        input.capacity,
        input.floor ?? null,
        input.description ?? null,
      ],
    );

  return result.rows[0] ?? null;
}

export async function deactivateResource(
  client: PoolClient,
  organizationId: string,
  resourceId: string,
): Promise<Resource | null> {
  const result =
    await client.query<ResourceRow>(
      `UPDATE resources
       SET is_active = FALSE
       WHERE organization_id = $1
         AND id = $2
         AND is_active = TRUE
       RETURNING
         ${RESOURCE_COLUMNS}`,
      [
        organizationId,
        resourceId,
      ],
    );

  return result.rows[0] ?? null;
}