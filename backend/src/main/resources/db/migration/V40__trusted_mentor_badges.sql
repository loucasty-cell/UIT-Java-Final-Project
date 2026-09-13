ALTER TABLE users
    ADD COLUMN trusted_mentor BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN trusted_mentor_awarded_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN trusted_mentor_awarded_by UUID REFERENCES users(id);

CREATE INDEX idx_users_trusted_mentor
    ON users (trusted_mentor)
    WHERE trusted_mentor = TRUE;
