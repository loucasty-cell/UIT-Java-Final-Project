-- Reviews from completed sessions are published immediately. Administrators
-- investigate only the low-rating pattern surfaced by the admin dashboard.
UPDATE reviews
SET moderation_status = 'VERIFIED'
WHERE moderation_status = 'PENDING';

ALTER TABLE reviews ALTER COLUMN moderation_status SET DEFAULT 'VERIFIED';
