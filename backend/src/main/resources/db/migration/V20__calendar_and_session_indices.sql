-- V20: Calendar and Session Scheduling Index Optimizations
CREATE INDEX IF NOT EXISTS idx_swap_sessions_requester_sched ON swap_sessions (requester_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_swap_sessions_responder_sched ON swap_sessions (responder_id, scheduled_at);
