-- Performance indexes for frequently queried columns
-- Migration V34: Database performance optimization

-- User skills lookup by user and direction
CREATE INDEX IF NOT EXISTS idx_user_skills_user_direction 
    ON user_skills(user_id, direction, created_at DESC);

-- Active mentor offerings lookup
CREATE INDEX IF NOT EXISTS idx_mentor_offerings_active 
    ON mentor_offerings(mentor_id, active) WHERE active = true;

-- Learning requests by direction and status
CREATE INDEX IF NOT EXISTS idx_learning_requests_direction_status 
    ON learning_requests(learner_id, mentor_id, status);

-- Sessions lookup by user
CREATE INDEX IF NOT EXISTS idx_sessions_learner 
    ON sessions(learner_id, status);
CREATE INDEX IF NOT EXISTS idx_sessions_mentor 
    ON sessions(mentor_id, status);

-- Reviews by reviewee
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee 
    ON reviews(reviewee_id);

-- Forum posts ordering
CREATE INDEX IF NOT EXISTS idx_forum_posts_created 
    ON forum_posts(created_at DESC);

-- Wallet transactions lookup
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_created 
    ON point_transactions(user_id, created_at DESC);

-- Notifications by user and read status
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
    ON notifications(user_id, read, created_at DESC);

-- Mentor applications status
CREATE INDEX IF NOT EXISTS idx_mentor_applications_status 
    ON mentor_applications(status);

-- Admin audit events
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_created 
    ON admin_audit_events(created_at DESC);

-- Disputes by status
CREATE INDEX IF NOT EXISTS idx_disputes_status 
    ON disputes(status, created_at DESC);

-- Reports by status
CREATE INDEX IF NOT EXISTS idx_reports_status 
    ON reports(status, created_at DESC);
