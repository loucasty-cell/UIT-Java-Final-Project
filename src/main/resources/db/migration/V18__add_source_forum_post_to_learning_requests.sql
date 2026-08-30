-- V18: Add source_forum_post_id to track learning requests originating from forum posts

ALTER TABLE learning_requests 
ADD COLUMN source_forum_post_id UUID REFERENCES forum_posts(id);

-- Index for querying learning requests by source forum post
CREATE INDEX IF NOT EXISTS idx_learning_requests_source_forum 
ON learning_requests (source_forum_post_id) 
WHERE source_forum_post_id IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN learning_requests.source_forum_post_id IS 
'Optional reference to the forum post that triggered this learning request. When set, mode is typically VOLUNTEER.';
