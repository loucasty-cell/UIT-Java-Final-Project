CREATE TABLE reports (
    id UUID PRIMARY KEY,
    reporter_id UUID NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    details VARCHAR(2000),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    action_taken VARCHAR(100),
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE account_warnings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    admin_id UUID NOT NULL,
    reason VARCHAR(50) NOT NULL,
    message VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE disputes (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL,
    session_mode VARCHAR(50) NOT NULL,
    opened_by UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    details VARCHAR(2000) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    resolution VARCHAR(50),
    resolution_note VARCHAR(2000),
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE platform_settings (
    id UUID PRIMARY KEY,
    registration_bonus INTEGER NOT NULL DEFAULT 50,
    forum_contribution_reward INTEGER NOT NULL DEFAULT 5,
    escrow_release_hours INTEGER NOT NULL DEFAULT 18,
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE admin_audit_events (
    id UUID PRIMARY KEY,
    actor_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    before_summary VARCHAR(2000),
    after_summary VARCHAR(2000),
    reason VARCHAR(500),
    request_id VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Seed default platform settings
INSERT INTO platform_settings (id, registration_bonus, forum_contribution_reward, escrow_release_hours, updated_by, updated_at, version)
VALUES ('00000000-0000-0000-0000-000000000001', 50, 5, 18, NULL, CURRENT_TIMESTAMP, 0);
