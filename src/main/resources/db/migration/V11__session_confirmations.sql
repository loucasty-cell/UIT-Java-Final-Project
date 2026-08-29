CREATE TABLE session_confirmations (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES swap_sessions(id) ON DELETE CASCADE,
    confirmed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    confirmed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_session_confirmations UNIQUE (session_id, confirmed_by)
);

CREATE INDEX idx_session_confirmations_session ON session_confirmations (session_id);

ALTER TABLE swap_sessions ADD COLUMN auto_release_at TIMESTAMP WITH TIME ZONE;

