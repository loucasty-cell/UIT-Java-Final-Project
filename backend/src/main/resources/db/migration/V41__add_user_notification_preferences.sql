ALTER TABLE users
    ADD COLUMN session_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN session_request_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN message_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE;
