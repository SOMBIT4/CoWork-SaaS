-- =========================================================
-- Password reset tokens
-- =========================================================

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL,
  token_hash TEXT NOT NULL,

  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT password_reset_tokens_expiry_valid
    CHECK (expires_at > created_at),

  CONSTRAINT password_reset_tokens_used_at_valid
    CHECK (
      used_at IS NULL
      OR used_at >= created_at
    ),

  CONSTRAINT password_reset_tokens_user_fk
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX password_reset_tokens_hash_unique
  ON password_reset_tokens (token_hash);

CREATE INDEX password_reset_tokens_user_idx
  ON password_reset_tokens (user_id);

CREATE INDEX password_reset_tokens_active_idx
  ON password_reset_tokens (
    user_id,
    expires_at
  )
  WHERE used_at IS NULL;


-- =========================================================
-- Email verification tokens
-- =========================================================

CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL,
  token_hash TEXT NOT NULL,

  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT email_verification_tokens_expiry_valid
    CHECK (expires_at > created_at),

  CONSTRAINT email_verification_tokens_used_at_valid
    CHECK (
      used_at IS NULL
      OR used_at >= created_at
    ),

  CONSTRAINT email_verification_tokens_user_fk
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX email_verification_tokens_hash_unique
  ON email_verification_tokens (token_hash);

CREATE INDEX email_verification_tokens_user_idx
  ON email_verification_tokens (user_id);

CREATE INDEX email_verification_tokens_active_idx
  ON email_verification_tokens (
    user_id,
    expires_at
  )
  WHERE used_at IS NULL;