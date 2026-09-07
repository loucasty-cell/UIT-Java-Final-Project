-- V5: user profile fields on users + points schema (wallets, point_ledger, escrows)

-- Profile columns (all optional, filled via PATCH /api/v1/me)
ALTER TABLE users ADD COLUMN display_name VARCHAR(100);
ALTER TABLE users ADD COLUMN major VARCHAR(100);
ALTER TABLE users ADD COLUMN year_of_study INTEGER;
ALTER TABLE users ADD COLUMN bio VARCHAR(1000);
ALTER TABLE users ADD COLUMN timezone VARCHAR(100);
ALTER TABLE users ADD COLUMN avatar_object_key VARCHAR(500);

-- One wallet per user; balances are server-owned and never client-supplied
CREATE TABLE wallets (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    available_points INTEGER NOT NULL DEFAULT 0 CHECK (available_points >= 0),
    held_points INTEGER NOT NULL DEFAULT 0 CHECK (held_points >= 0),
    total_earned INTEGER NOT NULL DEFAULT 0,
    total_spent INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_wallets_user_id ON wallets (user_id);

-- Immutable, append-only point activity log; every balance change writes exactly one row
CREATE TABLE point_ledger (
    id UUID PRIMARY KEY,
    wallet_id UUID NOT NULL,
    user_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    available_delta INTEGER NOT NULL,
    held_delta INTEGER NOT NULL,
    balance_after_available INTEGER NOT NULL,
    balance_after_held INTEGER NOT NULL,
    description VARCHAR(500),
    reference_type VARCHAR(50),
    reference_id UUID,
    idempotency_key VARCHAR(200) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_point_ledger_user_created ON point_ledger (user_id, created_at DESC);
CREATE INDEX idx_point_ledger_reference ON point_ledger (reference_type, reference_id);

-- Escrowed point holds between a learner and a mentor for one learning session
CREATE TABLE escrows (
    id UUID PRIMARY KEY,
    learner_id UUID NOT NULL,
    mentor_id UUID NOT NULL,
    reference_type VARCHAR(50) NOT NULL,
    reference_id UUID NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'HELD',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_escrows_reference ON escrows (reference_type, reference_id);
