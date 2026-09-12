CREATE TABLE learning_need_availability (
    learning_need_id UUID NOT NULL REFERENCES learning_needs(id) ON DELETE CASCADE,
    available_date DATE NOT NULL,
    available_time TIME NOT NULL,
    PRIMARY KEY (learning_need_id, available_date, available_time)
);

CREATE TABLE forum_post_availability (
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    available_date DATE NOT NULL,
    available_time TIME NOT NULL,
    PRIMARY KEY (post_id, available_date, available_time)
);
