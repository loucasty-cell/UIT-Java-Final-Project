-- V12: Learning Requests and Schedule Conflict Support

-- Add scheduling and mode columns to swap_sessions
ALTER TABLE swap_sessions ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE swap_sessions ADD COLUMN IF NOT EXISTS mode VARCHAR(20) NOT NULL DEFAULT 'SKILL_SWAP';
ALTER TABLE swap_sessions ADD COLUMN IF NOT EXISTS recording_url VARCHAR(500);

-- Update scheduled_end for any existing sessions that have duration_minutes
UPDATE swap_sessions 
SET scheduled_end = scheduled_at + (duration_minutes || ' minutes')::INTERVAL 
WHERE scheduled_at IS NOT NULL AND duration_minutes IS NOT NULL AND scheduled_end IS NULL;

-- Index for fast conflict detection queries
CREATE INDEX IF NOT EXISTS idx_swap_sessions_schedule_conflict 
ON swap_sessions (scheduled_at, scheduled_end, status);

-- Create learning_requests table
CREATE TABLE IF NOT EXISTS learning_requests (
    id UUID PRIMARY KEY,
    learner_id UUID NOT NULL REFERENCES users(id),
    mentor_id UUID NOT NULL REFERENCES users(id),
    mentor_offering_id UUID REFERENCES mentor_offerings(id),
    requested_skill_id UUID NOT NULL REFERENCES skills(id),
    offered_user_skill_id UUID REFERENCES user_skills(id),
    mode VARCHAR(20) NOT NULL CHECK (mode IN ('POINTS', 'SKILL_SWAP', 'VOLUNTEER')),
    point_cost INTEGER NOT NULL DEFAULT 0 CHECK (point_cost >= 0),
    points_held BOOLEAN NOT NULL DEFAULT FALSE,
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED')),
    session_id UUID REFERENCES swap_sessions(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_learning_requests_learner ON learning_requests (learner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_requests_mentor ON learning_requests (mentor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_requests_status ON learning_requests (status);
