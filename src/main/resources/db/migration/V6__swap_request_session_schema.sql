CREATE TABLE swap_requests (
    id UUID PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES users(id),
    responder_id UUID NOT NULL REFERENCES users(id),
    offered_skill_id UUID NOT NULL REFERENCES skills(id),
    requested_skill_id UUID NOT NULL REFERENCES skills(id),
    point_cost INTEGER NOT NULL DEFAULT 0 CHECK (point_cost >= 0),
    points_held BOOLEAN NOT NULL DEFAULT FALSE,
    message VARCHAR(1000),
    status VARCHAR(50) NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_swap_requests_requester_created ON swap_requests (requester_id, created_at DESC);
CREATE INDEX idx_swap_requests_responder_created ON swap_requests (responder_id, created_at DESC);
CREATE INDEX idx_swap_requests_status ON swap_requests (status);

CREATE TABLE swap_sessions (
    id UUID PRIMARY KEY,
    swap_request_id UUID NOT NULL UNIQUE REFERENCES swap_requests(id),
    requester_id UUID NOT NULL REFERENCES users(id),
    responder_id UUID NOT NULL REFERENCES users(id),
    offered_skill_id UUID NOT NULL REFERENCES skills(id),
    requested_skill_id UUID NOT NULL REFERENCES skills(id),
    point_cost INTEGER NOT NULL DEFAULT 0 CHECK (point_cost >= 0),
    status VARCHAR(50) NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_swap_sessions_requester_created ON swap_sessions (requester_id, created_at DESC);
CREATE INDEX idx_swap_sessions_responder_created ON swap_sessions (responder_id, created_at DESC);
