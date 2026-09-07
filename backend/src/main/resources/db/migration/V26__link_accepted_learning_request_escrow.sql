UPDATE escrows e
SET reference_type = 'SWAP_REQUEST', reference_id = s.swap_request_id, updated_at = CURRENT_TIMESTAMP
FROM learning_requests lr
JOIN swap_sessions s ON s.id = lr.session_id
WHERE e.reference_type = 'LEARNING_REQUEST'
  AND e.reference_id = lr.id
  AND e.status = 'HELD'
  AND lr.status = 'ACCEPTED';
