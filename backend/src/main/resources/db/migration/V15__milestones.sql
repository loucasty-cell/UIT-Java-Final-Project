-- V15: Milestone Points & Achievements

CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    condition_type VARCHAR(50) NOT NULL,
    condition_value INTEGER NOT NULL,
    points_reward INTEGER NOT NULL,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_milestones (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    milestone_id UUID NOT NULL REFERENCES milestones(id),
    achieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    points_awarded INTEGER NOT NULL,
    CONSTRAINT uq_user_milestone UNIQUE(user_id, milestone_id)
);

CREATE INDEX IF NOT EXISTS idx_user_milestones_user ON user_milestones (user_id);

-- Seed initial standard milestones
INSERT INTO milestones (id, code, title, description, condition_type, condition_value, points_reward, icon, created_at)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'FIRST_SESSION', 'First Learning Step', 'Complete your first learning session', 'SESSIONS_COMPLETED', 1, 5, 'award', now()),
    ('a2222222-2222-2222-2222-222222222222', 'FIVE_SESSIONS', 'Dedicated Learner', 'Complete 5 learning sessions', 'SESSIONS_COMPLETED', 5, 10, 'sparkles', now()),
    ('a3333333-3333-3333-3333-333333333333', 'TEN_SESSIONS', 'Mastery Journey', 'Complete 10 learning sessions', 'SESSIONS_COMPLETED', 10, 10, 'trophy', now()),
    ('a4444444-4444-4444-4444-444444444444', 'FIRST_TEACH', 'Knowledge Giver', 'Teach your first mentoring session', 'SESSIONS_TAUGHT', 1, 5, 'graduation-cap', now()),
    ('a5555555-5555-5555-5555-555555555555', 'FIVE_REVIEWS', 'Constructive Critic', 'Submit 5 constructive session reviews', 'REVIEWS_GIVEN', 5, 5, 'star', now()),
    ('a6666666-6666-6666-6666-666666666666', 'FIRST_SWAP', 'Peer Barterer', 'Complete your first reciprocal skill swap', 'SKILL_SWAPS_COMPLETED', 1, 5, 'repeat', now()),
    ('a7777777-7777-7777-7777-777777777777', 'VOLUNTEER_HERO', 'Community Pillar', 'Complete 5 volunteer mentoring sessions', 'VOLUNTEER_SESSIONS', 5, 10, 'heart-handshake', now()),
    ('a8888888-8888-8888-8888-888888888888', 'PERFECT_RATING', 'Top Rated Mentor', 'Maintain a high rating for 5+ reviews', 'REVIEWS_RECEIVED', 5, 10, 'crown', now())
ON CONFLICT (code) DO NOTHING;
