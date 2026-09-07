-- V19__seed_demo_roles_and_data.sql
-- Seed Admin and Mentor roles for demo accounts and auto-assign trigger

INSERT INTO user_roles (user_id, role)
SELECT id, 'ADMIN' FROM users WHERE email ILIKE '%admin%'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'MENTOR' FROM users WHERE email ILIKE '%instructor%' OR email ILIKE '%mentor%'
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION auto_assign_roles()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email ILIKE '%admin%' THEN
        INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'ADMIN') ON CONFLICT DO NOTHING;
    END IF;
    IF NEW.email ILIKE '%instructor%' OR NEW.email ILIKE '%mentor%' THEN
        INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'MENTOR') ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_assign_roles ON users;
CREATE TRIGGER trg_auto_assign_roles
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION auto_assign_roles();

