ALTER TABLE forum_posts
    ADD COLUMN duration_minutes INTEGER;

UPDATE forum_posts
SET duration_minutes = 60
WHERE duration_minutes IS NULL;

ALTER TABLE forum_posts
    ALTER COLUMN duration_minutes SET NOT NULL,
    ADD CONSTRAINT chk_forum_posts_duration_minutes
        CHECK (duration_minutes BETWEEN 15 AND 480);
