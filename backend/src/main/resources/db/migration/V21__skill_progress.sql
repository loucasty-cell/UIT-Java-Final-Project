-- V21: Track detailed skill learning progress
CREATE TABLE IF NOT EXISTS skill_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES user_skills(id) ON DELETE CASCADE,
    progress_percentage INT DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    hours_learned DECIMAL(10,2) DEFAULT 0.0,
    sessions_completed INT DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_skill_progress_user ON skill_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_progress_skill ON skill_progress(skill_id);
