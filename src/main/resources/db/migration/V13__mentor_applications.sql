-- V13: Mentor Applications & Review Schema

CREATE TABLE IF NOT EXISTS mentor_applications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    experience TEXT,
    motivation TEXT,
    admin_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS mentor_application_skills (
    application_id UUID NOT NULL REFERENCES mentor_applications(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id),
    PRIMARY KEY (application_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_mentor_apps_user ON mentor_applications (user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_apps_status ON mentor_applications (status);
