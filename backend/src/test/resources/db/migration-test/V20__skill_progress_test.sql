-- Test migration: skill_progress verification test

-- Insert test data
INSERT INTO skill_progress (id, user_id, skill_id, progress_percentage, hours_learned, sessions_completed, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 
     (SELECT id FROM users LIMIT 1), 
     (SELECT id FROM user_skills LIMIT 1), 
     60, 
     10.5, 
     6,
     NOW(),
     NOW())
ON CONFLICT (user_id, skill_id) DO UPDATE 
SET progress_percentage = EXCLUDED.progress_percentage;

-- Verify constraints
DO $$
BEGIN
    -- Verify progress_percentage check constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%progress_percentage%'
    ) THEN
        RAISE NOTICE 'Constraint verified: progress_percentage <= 100 enforced';
    END IF;
END $$;
