-- A stale pre-V35 application instance may have inserted PENDING reviews after
-- V35 ran. The current workflow publishes all completed-session reviews.
UPDATE reviews
SET moderation_status = 'VERIFIED'
WHERE moderation_status = 'PENDING';
