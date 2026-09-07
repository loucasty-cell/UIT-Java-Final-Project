-- Public sign-up must not grant privileged roles from user-controlled emails.
-- RegistrationService assigns USER; authorized workflows assign other roles.
-- Existing role assignments are preserved.
DROP TRIGGER IF EXISTS trg_auto_assign_roles ON users;
DROP FUNCTION IF EXISTS auto_assign_roles();
