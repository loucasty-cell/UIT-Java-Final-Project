ALTER TABLE learning_requests
    ADD COLUMN IF NOT EXISTS learning_need_offer_id UUID REFERENCES learning_need_offers(id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_learning_requests_learning_need_offer
    ON learning_requests (learning_need_offer_id)
    WHERE learning_need_offer_id IS NOT NULL;

-- Backfill offers made before they were connected to My Sessions. A noticeboard
-- teaching offer is always a zero-point volunteer request from its learner to
-- the teacher who offered it.
INSERT INTO learning_requests (
    id, learner_id, mentor_id, mentor_offering_id, requested_skill_id,
    offered_user_skill_id, mode, point_cost, points_held, scheduled_start,
    duration_minutes, message, status, session_id, created_at, updated_at,
    version, learning_need_offer_id
)
SELECT
    gen_random_uuid(), need.learner_id, offer.teacher_id, NULL, need.skill_id,
    NULL, 'VOLUNTEER', 0, FALSE, offer.proposed_start,
    need.duration_minutes, offer.message, 'PENDING', NULL, offer.created_at,
    offer.created_at, 0, offer.id
FROM learning_need_offers offer
JOIN learning_needs need ON need.id = offer.learning_need_id
LEFT JOIN learning_requests request ON request.learning_need_offer_id = offer.id
WHERE request.id IS NULL;
