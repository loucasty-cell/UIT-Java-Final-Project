CREATE TABLE mentor_offerings (
    id UUID PRIMARY KEY,
    mentor_id UUID NOT NULL,
    teach_user_skill_id UUID NOT NULL,
    point_cost INTEGER NOT NULL,
    points_enabled BOOLEAN NOT NULL,
    skill_swap_enabled BOOLEAN NOT NULL,
    volunteer_enabled BOOLEAN NOT NULL,
    duration_minutes INTEGER NOT NULL,
    availability_text VARCHAR(500),
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL
);

CREATE TABLE forum_posts (
    id UUID PRIMARY KEY,
    author_id UUID NOT NULL,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(5000) NOT NULL,
    availability_text VARCHAR(500),
    active BOOLEAN NOT NULL,
    like_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL
);

CREATE TABLE forum_comments (
    id UUID PRIMARY KEY,
    post_id UUID NOT NULL,
    author_id UUID NOT NULL,
    body VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL
);
