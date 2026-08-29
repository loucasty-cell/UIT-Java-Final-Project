-- V17: Canonical platform settings seed (30 pts registration bonus, 5 pts forum contribution, 18h escrow auto-release)
UPDATE platform_settings
SET registration_bonus = 30,
    forum_contribution_reward = 5,
    escrow_release_hours = 18,
    updated_at = CURRENT_TIMESTAMP
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Fallback insert if row does not exist
INSERT INTO platform_settings (id, registration_bonus, forum_contribution_reward, escrow_release_hours, updated_by, updated_at, version)
VALUES ('00000000-0000-0000-0000-000000000001', 30, 5, 18, NULL, CURRENT_TIMESTAMP, 0)
ON CONFLICT (id) DO UPDATE SET
    registration_bonus = EXCLUDED.registration_bonus,
    forum_contribution_reward = EXCLUDED.forum_contribution_reward,
    escrow_release_hours = EXCLUDED.escrow_release_hours;
