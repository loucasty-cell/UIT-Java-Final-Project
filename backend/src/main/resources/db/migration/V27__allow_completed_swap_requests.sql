-- Completion has been a Java state since the session workflow was introduced.
-- Keep PostgreSQL's constraint aligned so confirming a session can commit.
ALTER TABLE swap_requests DROP CONSTRAINT IF EXISTS chk_swap_requests_status;
ALTER TABLE swap_requests ADD CONSTRAINT chk_swap_requests_status
    CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'COMPLETED'));
