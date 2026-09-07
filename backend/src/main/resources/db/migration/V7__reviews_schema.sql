CREATE TABLE reviews (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES swap_sessions(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),
    skill_id UUID NOT NULL REFERENCES skills(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    feedback VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_reviews_session_reviewer UNIQUE (session_id, reviewer_id)
);

CREATE INDEX idx_reviews_reviewee ON reviews (reviewee_id);
CREATE INDEX idx_reviews_skill ON reviews (skill_id);
