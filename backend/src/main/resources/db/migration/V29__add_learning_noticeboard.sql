CREATE TABLE learning_needs (
    id UUID PRIMARY KEY,
    learner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id),
    title VARCHAR(150) NOT NULL,
    description VARCHAR(5000) NOT NULL,
    availability_text VARCHAR(500),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes BETWEEN 15 AND 480),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_learning_needs_active_created_at ON learning_needs(active, created_at DESC);

CREATE TABLE learning_need_offers (
    id UUID PRIMARY KEY,
    learning_need_id UUID NOT NULL REFERENCES learning_needs(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message VARCHAR(2000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_learning_need_offers_need_teacher UNIQUE (learning_need_id, teacher_id)
);
