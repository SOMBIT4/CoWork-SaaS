CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE organization_role AS ENUM (
  'OWNER',
  'ADMIN',
  'MEMBER'
);

CREATE TYPE organization_plan AS ENUM (
  'FREE',
  'PRO'
);

CREATE TYPE resource_type AS ENUM (
  'DESK',
  'ROOM',
  'CABIN'
);

CREATE TYPE booking_status AS ENUM (
  'CONFIRMED',
  'CANCELLED'
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =========================================================
-- Users
-- =========================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  email TEXT NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT,
  image_url TEXT,
  email_verified_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT users_email_lowercase
    CHECK (email = LOWER(email)),

  CONSTRAINT users_email_length
    CHECK (
      CHAR_LENGTH(email) >= 3
      AND CHAR_LENGTH(email) <= 320
    ),

  CONSTRAINT users_name_length
    CHECK (
      CHAR_LENGTH(BTRIM(name)) >= 2
      AND CHAR_LENGTH(BTRIM(name)) <= 100
    )
);

CREATE UNIQUE INDEX users_email_unique
  ON users (email);


-- =========================================================
-- Organizations
-- =========================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  plan organization_plan NOT NULL DEFAULT 'FREE',
  timezone TEXT NOT NULL DEFAULT 'UTC',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT organizations_name_length
    CHECK (
      CHAR_LENGTH(BTRIM(name)) >= 2
      AND CHAR_LENGTH(BTRIM(name)) <= 120
    ),

  CONSTRAINT organizations_slug_length
    CHECK (
      CHAR_LENGTH(slug) >= 3
      AND CHAR_LENGTH(slug) <= 60
    ),

  CONSTRAINT organizations_slug_format
    CHECK (
      slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    ),

  CONSTRAINT organizations_timezone_length
    CHECK (
      CHAR_LENGTH(BTRIM(timezone)) >= 1
      AND CHAR_LENGTH(BTRIM(timezone)) <= 100
    )
);

CREATE UNIQUE INDEX organizations_slug_unique
  ON organizations (slug);


-- =========================================================
-- Memberships
-- =========================================================

CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  organization_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role organization_role NOT NULL DEFAULT 'MEMBER',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT memberships_organization_fk
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE CASCADE,

  CONSTRAINT memberships_user_fk
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT memberships_user_organization_unique
    UNIQUE (organization_id, user_id),

  /*
   * This composite uniqueness is required so bookings can
   * reference a membership together with its organization.
   */
  CONSTRAINT memberships_id_organization_unique
    UNIQUE (id, organization_id)
);

CREATE INDEX memberships_user_id_idx
  ON memberships (user_id);

CREATE INDEX memberships_organization_id_idx
  ON memberships (organization_id);


-- =========================================================
-- Resources
-- =========================================================

CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  type resource_type NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  floor TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_user_id UUID NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT resources_organization_fk
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE CASCADE,

  CONSTRAINT resources_created_by_user_fk
    FOREIGN KEY (created_by_user_id)
    REFERENCES users(id)
    ON DELETE RESTRICT,

  CONSTRAINT resources_capacity_valid
    CHECK (
      capacity >= 1
      AND capacity <= 500
    ),

  CONSTRAINT resources_name_length
    CHECK (
      CHAR_LENGTH(BTRIM(name)) >= 2
      AND CHAR_LENGTH(BTRIM(name)) <= 120
    ),

  CONSTRAINT resources_floor_length
    CHECK (
      floor IS NULL
      OR CHAR_LENGTH(floor) <= 50
    ),

  CONSTRAINT resources_description_length
    CHECK (
      description IS NULL
      OR CHAR_LENGTH(description) <= 2000
    ),

  /*
   * Required for the composite foreign key in bookings.
   */
  CONSTRAINT resources_id_organization_unique
    UNIQUE (id, organization_id)
);

CREATE UNIQUE INDEX resources_org_name_unique
  ON resources (
    organization_id,
    LOWER(name)
  );

CREATE INDEX resources_org_active_idx
  ON resources (
    organization_id,
    is_active
  );

CREATE INDEX resources_org_type_idx
  ON resources (
    organization_id,
    type
  );


-- =========================================================
-- Bookings
-- =========================================================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  organization_id UUID NOT NULL,
  resource_id UUID NOT NULL,
  booked_by_membership_id UUID NOT NULL,

  title TEXT NOT NULL,
  notes TEXT,

  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  status booking_status NOT NULL DEFAULT 'CONFIRMED',

  cancelled_at TIMESTAMPTZ,
  cancelled_by_user_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT bookings_time_order
    CHECK (end_time > start_time),

  CONSTRAINT bookings_title_length
    CHECK (
      CHAR_LENGTH(BTRIM(title)) >= 2
      AND CHAR_LENGTH(BTRIM(title)) <= 160
    ),

  CONSTRAINT bookings_notes_length
    CHECK (
      notes IS NULL
      OR CHAR_LENGTH(notes) <= 3000
    ),

  /*
   * A confirmed booking cannot already contain cancellation data.
   * A cancelled booking must contain its cancellation time.
   *
   * cancelled_by_user_id remains nullable because the cancelling
   * user may later be deleted.
   */
  CONSTRAINT bookings_cancellation_state_valid
    CHECK (
      (
        status = 'CONFIRMED'
        AND cancelled_at IS NULL
        AND cancelled_by_user_id IS NULL
      )
      OR
      (
        status = 'CANCELLED'
        AND cancelled_at IS NOT NULL
      )
    ),

  CONSTRAINT bookings_organization_fk
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE CASCADE,

  /*
   * The organization ID is included in this foreign key.
   * This prevents a booking from referencing a resource
   * belonging to another organization.
   */
  CONSTRAINT bookings_resource_in_same_organization_fk
    FOREIGN KEY (
      resource_id,
      organization_id
    )
    REFERENCES resources (
      id,
      organization_id
    )
    ON DELETE RESTRICT,

  /*
   * This prevents a booking from referencing a membership
   * belonging to another organization.
   */
  CONSTRAINT bookings_membership_in_same_organization_fk
    FOREIGN KEY (
      booked_by_membership_id,
      organization_id
    )
    REFERENCES memberships (
      id,
      organization_id
    )
    ON DELETE RESTRICT,

  CONSTRAINT bookings_cancelled_by_user_fk
    FOREIGN KEY (cancelled_by_user_id)
    REFERENCES users(id)
    ON DELETE SET NULL,

  CONSTRAINT bookings_id_organization_unique
    UNIQUE (id, organization_id)
);

/*
 * [) means:
 *
 * - start time is inclusive;
 * - end time is exclusive.
 *
 * Therefore:
 *
 * 10:00–11:00
 * 11:00–12:00
 *
 * are allowed because they are adjacent rather than overlapping.
 *
 * PostgreSQL will reject concurrent overlapping confirmed
 * bookings for the same resource.
 */
ALTER TABLE bookings
ADD CONSTRAINT bookings_no_confirmed_overlap
EXCLUDE USING gist (
  organization_id WITH =,
  resource_id WITH =,
  tstzrange(
    start_time,
    end_time,
    '[)'
  ) WITH &&
)
WHERE (status = 'CONFIRMED');

CREATE INDEX bookings_org_start_idx
  ON bookings (
    organization_id,
    start_time
  );

CREATE INDEX bookings_resource_start_idx
  ON bookings (
    resource_id,
    start_time
  );

CREATE INDEX bookings_member_start_idx
  ON bookings (
    booked_by_membership_id,
    start_time
  );

CREATE INDEX bookings_org_status_start_idx
  ON bookings (
    organization_id,
    status,
    start_time
  );


-- =========================================================
-- Organization invitations
-- =========================================================

CREATE TABLE organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  organization_id UUID NOT NULL,
  email TEXT NOT NULL,
  role organization_role NOT NULL DEFAULT 'MEMBER',

  token_hash TEXT NOT NULL,

  invited_by_user_id UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,

  accepted_at TIMESTAMPTZ,
  accepted_by_user_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT invitations_email_lowercase
    CHECK (email = LOWER(email)),

  CONSTRAINT invitations_email_length
    CHECK (
      CHAR_LENGTH(email) >= 3
      AND CHAR_LENGTH(email) <= 320
    ),

  CONSTRAINT invitations_owner_not_allowed
    CHECK (role <> 'OWNER'),

  CONSTRAINT invitations_expiry_valid
    CHECK (expires_at > created_at),

  /*
   * An unaccepted invitation must not have an accepted user.
   * accepted_by_user_id may become NULL later if that user
   * account is deleted.
   */
  CONSTRAINT invitations_acceptance_state_valid
    CHECK (
      accepted_at IS NOT NULL
      OR accepted_by_user_id IS NULL
    ),

  CONSTRAINT invitations_organization_fk
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE CASCADE,

  CONSTRAINT invitations_invited_by_user_fk
    FOREIGN KEY (invited_by_user_id)
    REFERENCES users(id)
    ON DELETE RESTRICT,

  CONSTRAINT invitations_accepted_by_user_fk
    FOREIGN KEY (accepted_by_user_id)
    REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE UNIQUE INDEX organization_invitations_token_hash_unique
  ON organization_invitations (token_hash);

CREATE INDEX organization_invitations_org_email_idx
  ON organization_invitations (
    organization_id,
    email
  );

CREATE INDEX organization_invitations_pending_idx
  ON organization_invitations (
    organization_id,
    expires_at
  )
  WHERE accepted_at IS NULL;


-- =========================================================
-- Audit logs
-- =========================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  organization_id UUID NOT NULL,
  actor_user_id UUID,

  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT audit_logs_action_not_blank
    CHECK (
      CHAR_LENGTH(BTRIM(action)) >= 2
      AND CHAR_LENGTH(BTRIM(action)) <= 100
    ),

  CONSTRAINT audit_logs_entity_type_length
    CHECK (
      entity_type IS NULL
      OR CHAR_LENGTH(entity_type) <= 100
    ),

  CONSTRAINT audit_logs_metadata_object
    CHECK (
      jsonb_typeof(metadata) = 'object'
    ),

  CONSTRAINT audit_logs_organization_fk
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE CASCADE,

  CONSTRAINT audit_logs_actor_user_fk
    FOREIGN KEY (actor_user_id)
    REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE INDEX audit_logs_org_created_idx
  ON audit_logs (
    organization_id,
    created_at DESC
  );

CREATE INDEX audit_logs_entity_idx
  ON audit_logs (
    organization_id,
    entity_type,
    entity_id
  );


-- =========================================================
-- updated_at triggers
-- =========================================================

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER organizations_set_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER memberships_set_updated_at
BEFORE UPDATE ON memberships
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER resources_set_updated_at
BEFORE UPDATE ON resources
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER bookings_set_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();