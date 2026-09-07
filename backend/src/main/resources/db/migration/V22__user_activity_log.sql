-- V22: Track daily user activity for streak and engagement calculations
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    login_count INT DEFAULT 0,
    sessions_attended INT DEFAULT 0,
    hours_learned DECIMAL(10,2) DEFAULT 0.0,
    points_earned INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_date ON user_activity_log(user_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON user_activity_log(user_id);
