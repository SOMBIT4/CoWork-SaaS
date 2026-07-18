import process from "node:process";

import bcrypt from "bcryptjs";
import { Client } from "pg";

const databaseUrl = process.env.DATABASE_URL;
const nodeEnvironment = process.env.NODE_ENV ?? "development";

if (!databaseUrl) {
  console.error(
    "DATABASE_URL is required. Check your .env.local file.",
  );
  process.exit(1);
}

if (nodeEnvironment === "production") {
  console.error(
    "Refusing to seed the database while NODE_ENV is production.",
  );
  process.exit(1);
}

const client = new Client({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 15_000,
  keepAlive: true,
  application_name: "coworking-saas-seeder",
});

const developmentUser = {
  name: "Demo Owner",
  email: "owner@example.com",
  password: "Password123!",
};

const developmentOrganization = {
  name: "Demo CoWork",
  slug: "demo-cowork",
  timezone: "Asia/Dhaka",
};

const developmentResources = [
  {
    name: "Meeting Room A",
    type: "ROOM",
    capacity: 8,
    floor: "1st Floor",
    description:
      "Meeting room suitable for team discussions and presentations.",
  },
  {
    name: "Meeting Room B",
    type: "ROOM",
    capacity: 6,
    floor: "1st Floor",
    description:
      "Compact meeting room for small team meetings.",
  },
  {
    name: "Conference Hall",
    type: "ROOM",
    capacity: 30,
    floor: "Ground Floor",
    description:
      "Large conference hall for events and presentations.",
  },
  {
    name: "Training Room",
    type: "ROOM",
    capacity: 20,
    floor: "2nd Floor",
    description:
      "Training room equipped for workshops and classes.",
  },
  {
    name: "Collaboration Room",
    type: "ROOM",
    capacity: 10,
    floor: "2nd Floor",
    description:
      "Flexible room for brainstorming and collaborative work.",
  },
  {
    name: "Desk 01",
    type: "DESK",
    capacity: 1,
    floor: "1st Floor",
    description:
      "Individual coworking desk with power and internet access.",
  },
  {
    name: "Desk 02",
    type: "DESK",
    capacity: 1,
    floor: "1st Floor",
    description:
      "Individual coworking desk near the main workspace.",
  },
  {
    name: "Desk 03",
    type: "DESK",
    capacity: 1,
    floor: "1st Floor",
    description:
      "Individual desk suitable for focused work.",
  },
  {
    name: "Desk 04",
    type: "DESK",
    capacity: 1,
    floor: "2nd Floor",
    description:
      "Quiet coworking desk on the second floor.",
  },
  {
    name: "Desk 05",
    type: "DESK",
    capacity: 1,
    floor: "2nd Floor",
    description:
      "Workspace with access to power and high-speed internet.",
  },
  {
    name: "Hot Desk A",
    type: "DESK",
    capacity: 1,
    floor: "Ground Floor",
    description:
      "Flexible hot desk available for short-term booking.",
  },
  {
    name: "Hot Desk B",
    type: "DESK",
    capacity: 1,
    floor: "Ground Floor",
    description:
      "Flexible workspace for visiting members.",
  },
  {
    name: "Private Cabin",
    type: "CABIN",
    capacity: 4,
    floor: "2nd Floor",
    description:
      "Private cabin suitable for a small team.",
  },
  {
    name: "Private Cabin B",
    type: "CABIN",
    capacity: 3,
    floor: "2nd Floor",
    description:
      "Small private cabin for focused team work.",
  },
  {
    name: "Executive Cabin",
    type: "CABIN",
    capacity: 2,
    floor: "3rd Floor",
    description:
      "Premium private cabin for executives or client meetings.",
  },
  {
    name: "Phone Booth 01",
    type: "CABIN",
    capacity: 1,
    floor: "1st Floor",
    description:
      "Private booth for calls and online meetings.",
  },
  {
    name: "Phone Booth 02",
    type: "CABIN",
    capacity: 1,
    floor: "2nd Floor",
    description:
      "Sound-controlled booth for private calls.",
  },
];

async function upsertResource({
  organizationId,
  userId,
  resource,
}) {
  const existingResult = await client.query(
    `SELECT id
     FROM resources
     WHERE organization_id = $1
       AND LOWER(name) = LOWER($2)
     LIMIT 1`,
    [organizationId, resource.name],
  );

  const existingResource = existingResult.rows[0];

  if (existingResource) {
    const updatedResult = await client.query(
      `UPDATE resources
       SET
         name = $3,
         type = $4,
         capacity = $5,
         floor = $6,
         description = $7,
         is_active = TRUE,
         created_by_user_id = $8
       WHERE organization_id = $1
         AND id = $2
       RETURNING id, name, type`,
      [
        organizationId,
        existingResource.id,
        resource.name,
        resource.type,
        resource.capacity,
        resource.floor,
        resource.description,
        userId,
      ],
    );

    return updatedResult.rows[0];
  }

  const insertedResult = await client.query(
    `INSERT INTO resources (
       organization_id,
       name,
       type,
       capacity,
       floor,
       description,
       is_active,
       created_by_user_id
     )
     VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7)
     RETURNING id, name, type`,
    [
      organizationId,
      resource.name,
      resource.type,
      resource.capacity,
      resource.floor,
      resource.description,
      userId,
    ],
  );

  return insertedResult.rows[0];
}

async function seedDatabase() {
  let connected = false;
  let transactionStarted = false;

  try {
    console.log("Connecting to PostgreSQL...");

    await client.connect();
    connected = true;

    console.log("PostgreSQL connection established.");

    await client.query("BEGIN");
    transactionStarted = true;

    const normalizedEmail =
      developmentUser.email.trim().toLowerCase();

    const passwordHash = await bcrypt.hash(
      developmentUser.password,
      12,
    );

    const userResult = await client.query(
      `INSERT INTO users (
         name,
         email,
         password_hash
       )
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash
       RETURNING id, name, email`,
      [
        developmentUser.name,
        normalizedEmail,
        passwordHash,
      ],
    );

    const user = userResult.rows[0];

    const organizationResult = await client.query(
      `INSERT INTO organizations (
         name,
         slug,
         timezone
       )
       VALUES ($1, $2, $3)
       ON CONFLICT (slug)
       DO UPDATE SET
         name = EXCLUDED.name,
         timezone = EXCLUDED.timezone
       RETURNING id, name, slug, timezone`,
      [
        developmentOrganization.name,
        developmentOrganization.slug,
        developmentOrganization.timezone,
      ],
    );

    const organization = organizationResult.rows[0];

    const membershipResult = await client.query(
      `INSERT INTO memberships (
         organization_id,
         user_id,
         role
       )
       VALUES ($1, $2, 'OWNER')
       ON CONFLICT (organization_id, user_id)
       DO UPDATE SET
         role = 'OWNER'
       RETURNING id, role`,
      [organization.id, user.id],
    );

    const membership = membershipResult.rows[0];
    const resources = [];

    for (const resource of developmentResources) {
      const savedResource = await upsertResource({
        organizationId: organization.id,
        userId: user.id,
        resource,
      });

      resources.push(savedResource);
    }

    await client.query("COMMIT");
    transactionStarted = false;

    console.log("");
    console.log("Database seed completed successfully.");
    console.log("-------------------------------------");
    console.log(`User: ${user.email}`);
    console.log(`Organization: ${organization.name}`);
    console.log(`Organization slug: ${organization.slug}`);
    console.log(`Membership role: ${membership.role}`);
    console.log(`Resources created or updated: ${resources.length}`);
    console.log("");
    console.log("Development login credentials:");
    console.log(`Email: ${developmentUser.email}`);
    console.log(`Password: ${developmentUser.password}`);
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(
          "Database seed rollback failed:",
          rollbackError,
        );
      }
    }

    console.error("Database seed failed.");
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (connected) {
      await client.end();
    }
  }
}

await seedDatabase();