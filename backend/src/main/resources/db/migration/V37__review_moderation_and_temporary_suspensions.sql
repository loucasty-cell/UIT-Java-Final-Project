ALTER TABLE users
    ADD COLUMN suspended_until TIMESTAMP WITH TIME ZONE,
    ADD COLUMN last_suspended_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN suspension_count INTEGER NOT NULL DEFAULT 0 CHECK (suspension_count >= 0);

ALTER TABLE reviews
    ADD COLUMN moderation_status VARCHAR(20) NOT NULL DEFAULT 'VERIFIED',
    ADD COLUMN reviewed_by UUID REFERENCES users(id),
    ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN admin_notes VARCHAR(1000);

-- Existing reviews predate the moderation queue and remain visible. New reviews
-- enter the queue until an administrator verifies or dismisses them.
ALTER TABLE reviews ALTER COLUMN moderation_status SET DEFAULT 'PENDING';

ALTER TABLE account_warnings
    ADD COLUMN evidence_review_ids VARCHAR(2000);

CREATE INDEX idx_reviews_moderation_status_created_at
    ON reviews (moderation_status, created_at DESC);
CREATE INDEX idx_reviews_reviewee_moderation_rating
    ON reviews (reviewee_id, moderation_status, rating, created_at DESC);
CREATE INDEX idx_users_suspended_until
    ON users (suspended_until)
    WHERE suspended_until IS NOT NULL;
