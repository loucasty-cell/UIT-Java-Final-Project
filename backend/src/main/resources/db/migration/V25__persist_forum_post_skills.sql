CREATE TABLE forum_post_skills (
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id),
    PRIMARY KEY (post_id, skill_id)
);

CREATE INDEX idx_forum_post_skills_skill_id ON forum_post_skills(skill_id);
