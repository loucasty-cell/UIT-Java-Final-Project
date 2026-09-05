ALTER TABLE learning_needs
    ADD COLUMN IF NOT EXISTS allowed_modes VARCHAR(100) NOT NULL DEFAULT 'VOLUNTEER',
    ADD COLUMN IF NOT EXISTS exchange_user_skill_id UUID REFERENCES user_skills(id);
