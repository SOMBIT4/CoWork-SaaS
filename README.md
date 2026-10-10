# CoWork SaaS

> A production-oriented, multi-tenant coworking and shared-workspace management platform built with Next.js, TypeScript, PostgreSQL, and raw SQL.

[Live Demo](https://co-work-saa-s.vercel.app) · [GitHub Profile](https://github.com/SOMBIT4)

---

## Overview

**CoWork SaaS** is a full-stack workspace management platform for coworking spaces, shared offices, university labs, incubators, studios, and other organizations that manage reservable physical resources.

Each organization can manage its own:

- members;
- roles and permissions;
- desks, rooms, and cabins;
- bookings;
- invitations;
- audit history;
- dashboard statistics;
- operational settings.

The application is designed as a **multi-tenant SaaS**, so multiple organizations can use the same system while their data remains isolated.

Its strongest engineering feature is the **database-enforced conflict-safe booking engine**: PostgreSQL prevents overlapping confirmed bookings on the same resource, even when requests arrive concurrently.

---

## Why This Project Exists

Shared workspaces are often managed through spreadsheets, phone calls, chat messages, whiteboards, or simple calendars. This creates recurring problems:

- double-booked rooms;
- unclear resource availability;
- manual scheduling overhead;
- inconsistent permissions;
- weak operational visibility;
- no reliable audit trail;
- poor separation between organizations.

CoWork SaaS centralizes these workflows while prioritizing **booking integrity, tenant isolation, security, and maintainability**.

---

## Product Goals

1. **Prevent booking conflicts reliably** using PostgreSQL as the final source of truth.
2. **Keep organizations isolated** through membership checks and organization-scoped SQL.
3. **Enforce clear permissions** for `OWNER`, `ADMIN`, and `MEMBER`.
4. **Preserve operational history** through audit logs.
5. **Use production-oriented architecture** with layered services, repositories, transactions, and migrations.

---

## Key Features

### Authentication
- Signup
- Login / logout
- Auth.js Credentials provider
- JWT sessions
- Password hashing with `bcryptjs`
- Protected application routes

### Multi-Tenant Organizations
- Organization creation
- Automatic `OWNER` membership
- Unique slugs
- Organization switcher support
- Organization-scoped authorization
- Organization timezone support

### Role-Based Access Control
- `OWNER`
- `ADMIN`
- `MEMBER`
- Server-side permission checks
- Role-aware UI

### Resource Management
- Desks
- Rooms
- Cabins
- Capacity
- Floor
- Description
- Active/inactive state
- Filtering and search
- Safe deactivation instead of destructive deletion

### Conflict-Safe Booking
- Create bookings
- View bookings
- Cancel bookings
- Reschedule bookings
- Future-time validation
- Maximum duration rules
- Timezone-aware scheduling
- Adjacent bookings
- Database-level overlap protection

### Invitations & Membership
- Invite by email
- Assign `MEMBER` or `ADMIN`
- Cryptographically random tokens
- SHA-256 token hashing
- Expiration
- Single-use acceptance
- Email match verification
- Final-owner protection

### Audit Log
Tracks important actions such as:
- organization creation;
- resource creation/update/deactivation;
- booking creation/reschedule/cancellation;
- member invitation;
- invitation acceptance;
- role changes;
- member removal.

### Dashboard Analytics
- Active resources
- Bookings today
- Upcoming bookings
- Member count
- Estimated occupancy

### Email Infrastructure
Designed for:
- invitation emails;
- booking confirmations;
- booking cancellations;
- password reset;
- email verification.

### Health Monitoring
```text
GET /api/health
```

---

## Role & Permission Matrix

| Capability | MEMBER | ADMIN | OWNER |
|---|:---:|:---:|:---:|
| Access dashboard | ✅ | ✅ | ✅ |
| View active resources | ✅ | ✅ | ✅ |
| Create booking | ✅ | ✅ | ✅ |
| Cancel own valid future booking | ✅ | ✅ | ✅ |
| Reschedule own valid future booking | ✅ | ✅ | ✅ |
| Create resource | ❌ | ✅ | ✅ |
| Edit resource | ❌ | ✅ | ✅ |
| Deactivate resource | ❌ | ✅ | ✅ |
| Manage another member's booking | ❌ | ✅ | ✅ |
| Invite members | ❌ | ✅ | ✅ |
| Invite admins | ❌ | ✅ | ✅ |
| Manage allowed member roles | ❌ | ✅ | ✅ |
| View audit log | ❌ | ✅ | ✅ |
| Manage organization settings | ❌ | Limited | ✅ |
| Transfer ownership | ❌ | ❌ | Owner-controlled |
| Remove final owner | ❌ | ❌ | ❌ |

> Hiding a button is not authorization. Every protected mutation is validated on the server.

---

## Booking Conflict Strategy

A frontend availability check is not enough because two requests can see the same slot as free at the same moment.

The database uses an exclusion constraint conceptually equivalent to:

```sql
EXCLUDE USING gist (
  organization_id WITH =,
  resource_id WITH =,
  tstzrange(start_time, end_time, '[)') WITH &&
)
WHERE (status = 'CONFIRMED');
```

This guarantees:

```text
Existing: 10:00 → 11:00
Attempt:  10:30 → 11:30
Result:   Rejected
```

while allowing:

```text
Existing: 10:00 → 11:00
Next:     11:00 → 12:00
Result:   Allowed
```

The `[start, end)` interval model makes the start inclusive and end exclusive.

PostgreSQL exclusion violations are translated into a user-safe `BookingConflictError`.

---

## Multi-Tenancy Strategy

CoWork SaaS uses a **shared-database, shared-schema** model.

Tenant-owned records include `organization_id`.

Authorization resolves:

```text
orgSlug
+
authenticated user
+
membership
```

Repository queries use organization scope:

```sql
WHERE organization_id = $1
  AND id = $2
```

instead of querying tenant-owned records only by ID.

Composite foreign keys also prevent bookings from referencing resources or memberships from another organization.

---

## System Architecture

```mermaid
flowchart TB
    Browser[User Browser]

    subgraph App["Next.js Application"]
        UI[App Router UI]
        Actions[Server Actions / Route Handlers]
        Auth[Auth.js]
        AuthZ[Organization Authorization / RBAC]
        Services[Services / Business Logic]
        Repositories[Repositories / Raw SQL]
        DBUtils[Pool / Query / Transactions]
    end

    PostgreSQL[(PostgreSQL)]
    Email[Resend]

    Browser --> UI
    UI --> Actions
    Actions --> Auth
    Actions --> AuthZ
    AuthZ --> Services
    Services --> Repositories
    Repositories --> DBUtils
    DBUtils --> PostgreSQL
    Services -. after DB commit .-> Email
```

---

## Backend Architecture

### Actions / Route Handlers
Responsible for:
- authentication;
- request parsing;
- Zod validation;
- organization context;
- service calls;
- safe responses;
- redirects and revalidation.

### Services
Responsible for:
- business rules;
- authorization policy;
- transactions;
- domain errors;
- audit creation.

### Repositories
Responsible for:
- parameterized SQL;
- tenant-scoped reads/writes;
- explicit row mapping.

### Database Utilities
Responsible for:
- connection pool;
- query helper;
- transaction helper;
- DB error handling.

SQL and business rules are intentionally kept out of React components.

---

## Database ERD

```mermaid
erDiagram
    USERS {
        uuid id PK
        text email UK
        text name
        text password_hash
        text image_url
        timestamptz email_verified_at
        timestamptz created_at
        timestamptz updated_at
    }

    ORGANIZATIONS {
        uuid id PK
        text name
        text slug UK
        organization_plan plan
        text timezone
        timestamptz created_at
        timestamptz updated_at
    }

    MEMBERSHIPS {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        organization_role role
        timestamptz created_at
        timestamptz updated_at
    }

    RESOURCES {
        uuid id PK
        uuid organization_id FK
        text name
        resource_type type
        int capacity
        text floor
        text description
        boolean is_active
        uuid created_by_user_id FK
        timestamptz created_at
        timestamptz updated_at
    }

    BOOKINGS {
        uuid id PK
        uuid organization_id FK
        uuid resource_id FK
        uuid booked_by_membership_id FK
        text title
        text notes
        timestamptz start_time
        timestamptz end_time
        booking_status status
        timestamptz cancelled_at
        uuid cancelled_by_user_id FK
        timestamptz created_at
        timestamptz updated_at
    }

    ORGANIZATION_INVITATIONS {
        uuid id PK
        uuid organization_id FK
        text email
        organization_role role
        text token_hash UK
        uuid invited_by_user_id FK
        timestamptz expires_at
        timestamptz accepted_at
        uuid accepted_by_user_id FK
        timestamptz created_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid organization_id FK
        uuid actor_user_id FK
        text action
        text entity_type
        uuid entity_id
        jsonb metadata
        timestamptz created_at
    }

    PASSWORD_RESET_TOKENS {
        uuid id PK
        uuid user_id FK
        text token_hash UK
        timestamptz expires_at
        timestamptz used_at
        timestamptz created_at
    }

    EMAIL_VERIFICATION_TOKENS {
        uuid id PK
        uuid user_id FK
        text token_hash UK
        timestamptz expires_at
        timestamptz used_at
        timestamptz created_at
    }

    USERS ||--o{ MEMBERSHIPS : joins
    ORGANIZATIONS ||--o{ MEMBERSHIPS : contains
    ORGANIZATIONS ||--o{ RESOURCES : owns
    USERS ||--o{ RESOURCES : creates
    ORGANIZATIONS ||--o{ BOOKINGS : owns
    RESOURCES ||--o{ BOOKINGS : reserved_in
    MEMBERSHIPS ||--o{ BOOKINGS : books
    USERS ||--o{ BOOKINGS : may_cancel
    ORGANIZATIONS ||--o{ ORGANIZATION_INVITATIONS : issues
    USERS ||--o{ ORGANIZATION_INVITATIONS : participates
    ORGANIZATIONS ||--o{ AUDIT_LOGS : records
    USERS ||--o{ AUDIT_LOGS : acts
    USERS ||--o{ PASSWORD_RESET_TOKENS : receives
    USERS ||--o{ EMAIL_VERIFICATION_TOKENS : receives
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI | shadcn/ui-compatible components |
| Icons | Lucide React |
| Database | PostgreSQL 18 |
| Database access | `pg` / node-postgres |
| ORM | None |
| Authentication | Auth.js Credentials |
| Session strategy | JWT |
| Password hashing | bcryptjs |
| Validation | Zod |
| Date / timezone | date-fns, date-fns-tz |
| Email | Resend |
| Unit testing | Vitest |
| E2E testing | Playwright |
| Local database | Docker Compose |
| Local DB UI | Adminer |
| Production app | Vercel |
| Production database | Neon PostgreSQL |
| CI direction | GitHub Actions |

---

## Application Routes

```text
/
├── /login
├── /signup
├── /onboarding
├── /invite/[token]
├── /[orgSlug]
│   ├── /resources
│   │   ├── /new
│   │   └── /[resourceId]/edit
│   ├── /bookings
│   │   ├── /new
│   │   └── /[bookingId]/edit
│   ├── /members
│   ├── /audit
│   └── /settings
├── /api/auth/[...nextauth]
└── /api/health
```

---

## Project Structure

```text
coworking-saas/
├── database/
│   ├── migrations/
│   └── scripts/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   │   ├── db/
│   │   ├── email/
│   │   └── validation/
│   ├── server/
│   │   ├── actions/
│   │   ├── authz/
│   │   ├── repositories/
│   │   └── services/
│   └── types/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── compose.yaml
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

Install:

- Node.js 24.x
- npm
- Docker Desktop
- Git

For local development, PostgreSQL runs in Docker while Next.js runs directly on the host.

### Clone

```bash
git clone <YOUR_REPOSITORY_URL>
cd coworking-saas
```

### Install dependencies

```bash
npm install
```

---

## Environment Variables

Create:

```text
.env.local
```

Example:

```dotenv
NODE_ENV=development
APP_URL=http://localhost:3000

AUTH_SECRET=replace-with-a-long-random-secret

DATABASE_URL=postgresql://cowork:cowork_pass@localhost:5433/cowork_db

RESEND_API_KEY=
EMAIL_FROM=CoWork <noreply@example.com>

AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

Generate `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Never commit `.env.local`.

---

## Start PostgreSQL & Adminer

```bash
docker compose up -d postgres adminer
```

Verify:

```bash
docker compose ps
```

Local services:

```text
Application: http://localhost:3000
Adminer:     http://localhost:8080
PostgreSQL:  localhost:5433
```

Adminer:

```text
System:   PostgreSQL
Server:   postgres
Username: cowork
Password: cowork_pass
Database: cowork_db
```

---

## Database Setup

Check connection:

```bash
npm run db:check
```

Apply migrations:

```bash
npm run db:migrate
```

Seed local development data:

```bash
npm run db:seed
```

The project uses plain, versioned SQL migrations.

Do not modify an already-applied production migration. Add a new migration instead.

---

## Run the App

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Common Commands

```bash
npm run dev
npm run build
npm start

npm run lint
npm run typecheck

npm test
npm run test:watch

npm run db:check
npm run db:migrate
npm run db:seed
```

If enabled in the current branch:

```bash
npm run test:integration
npm run test:e2e
```

---

## Testing Strategy

### Unit Tests
Cover:
- role hierarchy;
- permissions;
- validation;
- booking-time rules;
- timezone behavior;
- PostgreSQL error mapping;
- invitation-token logic.

### Integration Tests
Run against a dedicated database such as `cowork_test`.

Important scenarios:
- organization creates owner membership;
- duplicate slug fails safely;
- cross-tenant resource access fails;
- first booking succeeds;
- overlapping booking fails;
- adjacent booking succeeds;
- cancellation releases the slot;
- reschedule conflict fails;
- invitation is single-use;
- expired invitation fails;
- member cannot perform admin action;
- concurrent overlapping requests result in one success and one failure.

### E2E
Critical Playwright flow:

```text
Signup
→ Login
→ Create organization
→ Create room
→ Create booking
→ Attempt overlap
→ See conflict
→ Cancel original
→ Create previously conflicting booking
```

---

## Security Decisions

### Parameterized SQL
User values are passed as parameters instead of string-concatenated into SQL.

### Tenant-Safe Queries
Tenant-owned queries always include organization scope.

### Password Storage
Passwords are hashed before storage.

### Invitation Tokens
Only token hashes are stored in PostgreSQL.

### Safe Audit Metadata
Audit logs must never include:
- passwords;
- raw invitation tokens;
- API keys;
- auth secrets;
- reset tokens.

### Safe Errors
Raw PostgreSQL errors are never returned directly to the browser.

---

## Production Deployment

### Architecture

```mermaid
flowchart LR
    User[User]
    Vercel[Vercel]
    App[Next.js Runtime]
    Neon[(Neon PostgreSQL)]
    Resend[Resend]

    User --> Vercel
    Vercel --> App
    App --> Neon
    App -. notifications .-> Resend
```

### Live App

**https://co-work-saa-s.vercel.app**

### Environment Separation

```text
LOCAL
Next.js
  ↓
Docker PostgreSQL

PRODUCTION
Vercel
  ↓
Neon PostgreSQL
```

### Production Environment Variables

Required:

```text
DATABASE_URL
AUTH_SECRET
APP_URL
```

Email:

```text
RESEND_API_KEY
EMAIL_FROM
```

Optional future integrations:

```text
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

Secrets belong in the deployment platform, never in Git.

---

## Production Migrations

Run migrations before a release starts depending on the new schema.

```bash
DATABASE_URL="production-database-url" node database/scripts/migrate.mjs
```

Use the provider-recommended direct connection for migration jobs and the pooled connection for serverless app traffic when appropriate.

---

## Health Check

Production:

```text
https://co-work-saa-s.vercel.app/api/health
```

Expected:

```json
{
  "status": "ok"
}
```

---

## Current Status

Established core areas include:

- authentication;
- multi-tenant organizations;
- RBAC;
- resource management;
- conflict-safe booking architecture;
- booking cancellation/rescheduling;
- member/invitation routes;
- audit route;
- dashboard statistics architecture;
- health endpoint;
- local PostgreSQL;
- Neon production PostgreSQL;
- Vercel deployment;
- public landing page.

Some newer production-readiness areas still require final end-to-end verification.

---

## Known Limitations / Work in Progress

Do not advertise these as fully complete until verified:

- complete password-reset UX;
- complete email-verification UX;
- production-grade distributed auth rate limiting;
- Stripe subscription enforcement;
- recurring bookings;
- public booking portals;
- advanced analytics;
- enterprise SSO;
- reliable notification outbox/retry system.

---

## Roadmap

### Reliability
- Complete PostgreSQL integration suite
- Complete concurrency test
- Complete Playwright critical flow
- Enforce CI
- Add production auth rate limiting
- Complete password reset
- Complete email verification
- Verify all email flows

### Product UX
- Visual day/week calendar
- Better mobile booking UX
- Loading skeletons
- Empty/error states
- Accessibility improvements
- Dark mode
- Better filtering

### Workspace Policies
- Operating hours
- Booking duration policies
- Lead time
- Booking horizon
- Cancellation windows
- Booking approval mode
- Resource-specific policies

### Booking Maturity
- Recurring bookings
- Maintenance blocks
- Check-in/check-out
- No-show state
- Waitlist
- Booking extensions

### Commercial SaaS
- Stripe Free/Pro plans
- Plan limits
- Billing portal
- Trial lifecycle
- Usage metering

### Enterprise
- Multi-location organizations
- API
- Webhooks
- SSO
- SCIM
- Custom roles
- Audit export
- Retention policies
- Advanced analytics

---

## Future Data Model

A future multi-location organization can evolve from:

```text
Organization
  ↓
Resource
```

to:

```text
Organization
  ↓
Location
  ↓
Floor / Zone
  ↓
Resource
```

Booking rules can also move into configurable organization/resource policy entities instead of remaining hard-coded.

---

## Development Principles

1. Correctness before visual polish.
2. Database constraints before frontend assumptions.
3. Server authorization before UI visibility.
4. Tenant scope on every tenant-owned query.
5. Business rules in services.
6. SQL in repositories.
7. External API calls outside database transactions.
8. Versioned SQL migrations.
9. Safe errors instead of raw DB messages.
10. Test failure paths as well as success paths.



## Project Summary

CoWork SaaS demonstrates how a resource-booking product can be engineered as a real multi-tenant application rather than a simple CRUD demo.

Its core engineering focus is:

```text
Multi-tenancy
+
RBAC
+
Raw PostgreSQL
+
Transactions
+
Database-enforced booking integrity
+
Secure invitation workflows
+
Auditability
+
Production deployment
```

The project prioritizes **tenant isolation, authorization, transaction boundaries, secure tokens, and concurrency-safe booking** before advanced UI, billing, or enterprise features.
