-- V23: Enterprise hardening — pgcrypto, skills TZ fix, auto-release index, ShedLock, contract phase
-- Requires pgcrypto for gen_random_uuid() (V21/V22 used it without extension)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fix skills table: naive TIMESTAMP → TIMESTAMPTZ (UTC) — zero-downtime safe (expand phase)
-- If table already uses TIMESTAMPTZ (new DBs after fix), USING clause is idempotent
DO $$ BEGIN
  PERFORM 1 FROM information_schema.columns
   WHERE table_name='skills' AND column_name='created_at' AND data_type='timestamp without time zone';
  IF FOUND THEN
    ALTER TABLE skills ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
    ALTER TABLE skills ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';
  END IF;
END $$;

-- Performance: escrow auto-release scheduler scans auto_release_at
CREATE INDEX IF NOT EXISTS idx_swap_sessions_auto_release ON swap_sessions(auto_release_at) WHERE auto_release_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_swap_sessions_status_auto_release ON swap_sessions(status, auto_release_at) WHERE auto_release_at IS NOT NULL;

-- ShedLock table for distributed scheduler lock (enterprise: 2+ pods safe)
CREATE TABLE IF NOT EXISTS shedlock (
    name VARCHAR(64) NOT NULL,
    lock_until TIMESTAMPTZ NOT NULL,
    locked_at TIMESTAMPTZ NOT NULL,
    locked_by VARCHAR(255) NOT NULL,
    PRIMARY KEY (name)
);

-- Tighten swap_sessions status contract (defense-in-depth — was VARCHAR without CHECK)
-- Add CHECK only if not present
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='chk_swap_sessions_status'
  ) THEN
    ALTER TABLE swap_sessions ADD CONSTRAINT chk_swap_sessions_status
      CHECK (status IN ('ACCEPTED','SCHEDULED','STARTED','AWAITING_CONFIRMATION','COMPLETED','CANCELLED','DISPUTED'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='chk_swap_requests_status'
  ) THEN
    ALTER TABLE swap_requests ADD CONSTRAINT chk_swap_requests_status
      CHECK (status IN ('PENDING','ACCEPTED','REJECTED','COMPLETED','CANCELLED','EXPIRED'));
  END IF;
END $$;
