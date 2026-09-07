import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { localSql, sqlLiteral } from "./local-database.mjs";

// Only identities from the documented local verification runs. Never match all
// example.com accounts or infer disposable users from their display names alone.
const predicate = `(email ~ '^(learner|mentor|moderator)-[0-9a-f-]{36}@example[.]com$' AND last_name = 'FlowCheck')
 OR (email ~ '^browser(learner|mentor|admin)-[0-9a-f-]{36}@example[.]com$' AND last_name = 'Check')
 OR (email ~ '^(auth-check|signup-admin-mentor)-[0-9a-f-]{36}@example[.]com$' AND last_name = 'Check')
 OR email = 'signup-ui-20260903-1929@example.com'`;
const ids = localSql(`SELECT id FROM users WHERE ${predicate};`).split(/\r?\n/).filter(Boolean);
if (!ids.length) {
  console.log("No documented synthetic accounts remain.");
  process.exit(0);
}
if (!process.argv.includes("--apply")) {
  console.log(
    `${ids.length} documented synthetic accounts found. Use --apply to back up and remove their test records.`,
  );
  process.exit(0);
}

// Preserve a local recovery copy before changing data. This directory is ignored
// by Git and must never be published: it contains private database records.
const tables = localSql(
  "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;",
).split(/\r?\n/);
const backup = {};
for (const table of tables) {
  if (!/^[a-z_]+$/.test(table)) throw new Error("Unexpected table name");
  backup[table] = JSON.parse(
    localSql(`SELECT COALESCE(json_agg(t), '[]'::json) FROM "${table}" t;`),
  );
}
mkdirSync("backend/storage/backups", { recursive: true });
const backupPath = `backend/storage/backups/before-test-cleanup-${Date.now()}.json`;
writeFileSync(backupPath, JSON.stringify(backup), { mode: 0o600 });
if (JSON.parse(readFileSync(backupPath, "utf8")).users.length !== backup.users.length)
  throw new Error("Backup verification failed");

console.log(
  localSql(`BEGIN;
SET LOCAL lock_timeout = '5s';
CREATE TEMP TABLE cleanup_users AS SELECT id FROM users WHERE id IN (${ids.map(sqlLiteral).join(",")});
CREATE TEMP TABLE cleanup_requests AS SELECT id FROM learning_requests WHERE learner_id IN (SELECT id FROM cleanup_users) OR mentor_id IN (SELECT id FROM cleanup_users);
CREATE TEMP TABLE cleanup_sessions AS SELECT id FROM swap_sessions WHERE requester_id IN (SELECT id FROM cleanup_users) OR responder_id IN (SELECT id FROM cleanup_users);
CREATE TEMP TABLE cleanup_swaps AS SELECT id FROM swap_requests WHERE requester_id IN (SELECT id FROM cleanup_users) OR responder_id IN (SELECT id FROM cleanup_users);
CREATE TEMP TABLE cleanup_posts AS SELECT id FROM forum_posts WHERE author_id IN (SELECT id FROM cleanup_users);
CREATE TEMP TABLE cleanup_refs AS SELECT id FROM cleanup_requests UNION SELECT id FROM cleanup_sessions UNION SELECT id FROM cleanup_swaps UNION SELECT id FROM cleanup_posts;
-- Refund real learners before removing requests to synthetic mentors. Keep their
-- immutable hold/refund ledger rows as an accurate account of the balance.
DO $$ DECLARE e record; w record; BEGIN
  FOR e IN SELECT * FROM escrows WHERE status='HELD' AND learner_id NOT IN (SELECT id FROM cleanup_users) AND mentor_id IN (SELECT id FROM cleanup_users) FOR UPDATE LOOP
    SELECT * INTO STRICT w FROM wallets WHERE user_id=e.learner_id FOR UPDATE;
    IF w.held_points < e.amount THEN RAISE EXCEPTION 'Held balance does not cover test escrow'; END IF;
    UPDATE wallets SET available_points=available_points+e.amount, held_points=held_points-e.amount, updated_at=now(), version=version+1 WHERE id=w.id;
    INSERT INTO point_ledger(id,wallet_id,user_id,event_type,available_delta,held_delta,balance_after_available,balance_after_held,description,reference_type,reference_id,idempotency_key,created_at)
      VALUES(gen_random_uuid(),w.id,e.learner_id,'POINTS_REFUND',e.amount,-e.amount,w.available_points+e.amount,w.held_points-e.amount,'Refund: request to removed test mentor',e.reference_type,e.reference_id,'test-cleanup-'||e.id,now());
    UPDATE escrows SET status='REFUNDED', updated_at=now(),version=version+1 WHERE id=e.id;
  END LOOP;
END $$;
DELETE FROM reviews WHERE session_id IN (SELECT id FROM cleanup_sessions) OR reviewer_id IN (SELECT id FROM cleanup_users) OR reviewee_id IN (SELECT id FROM cleanup_users);
DELETE FROM session_confirmations WHERE session_id IN (SELECT id FROM cleanup_sessions);
DELETE FROM disputes WHERE session_id IN (SELECT id FROM cleanup_sessions) OR opened_by IN (SELECT id FROM cleanup_users);
DELETE FROM reports WHERE reporter_id IN (SELECT id FROM cleanup_users) OR target_id IN (SELECT id FROM cleanup_refs);
DELETE FROM notifications WHERE user_id IN (SELECT id FROM cleanup_users) OR reference_id IN (SELECT id FROM cleanup_refs);
DELETE FROM learning_requests WHERE id IN (SELECT id FROM cleanup_requests);
DELETE FROM swap_sessions WHERE id IN (SELECT id FROM cleanup_sessions);
DELETE FROM swap_requests WHERE id IN (SELECT id FROM cleanup_swaps);
DELETE FROM escrows WHERE learner_id IN (SELECT id FROM cleanup_users) OR mentor_id IN (SELECT id FROM cleanup_users);
DELETE FROM forum_comments WHERE author_id IN (SELECT id FROM cleanup_users) OR post_id IN (SELECT id FROM cleanup_posts);
DELETE FROM forum_likes WHERE user_id IN (SELECT id FROM cleanup_users) OR post_id IN (SELECT id FROM cleanup_posts);
DELETE FROM forum_posts WHERE id IN (SELECT id FROM cleanup_posts);
UPDATE forum_posts p SET like_count=(SELECT count(*) FROM forum_likes l WHERE l.post_id=p.id), comment_count=(SELECT count(*) FROM forum_comments c WHERE c.post_id=p.id);
DELETE FROM mentor_offerings WHERE mentor_id IN (SELECT id FROM cleanup_users);
DELETE FROM mentor_applications WHERE user_id IN (SELECT id FROM cleanup_users);
UPDATE mentor_applications SET reviewed_by=NULL WHERE reviewed_by IN (SELECT id FROM cleanup_users);
DELETE FROM user_milestones WHERE user_id IN (SELECT id FROM cleanup_users);
DELETE FROM watchlist_items WHERE user_id IN (SELECT id FROM cleanup_users) OR item_id IN (SELECT id FROM cleanup_refs);
DELETE FROM account_warnings WHERE user_id IN (SELECT id FROM cleanup_users) OR admin_id IN (SELECT id FROM cleanup_users);
DELETE FROM referral_rewards WHERE referrer_id IN (SELECT id FROM cleanup_users) OR referred_id IN (SELECT id FROM cleanup_users);
DELETE FROM admin_audit_events WHERE actor_id IN (SELECT id FROM cleanup_users);
DELETE FROM point_ledger WHERE user_id IN (SELECT id FROM cleanup_users);
DELETE FROM wallets WHERE user_id IN (SELECT id FROM cleanup_users);
UPDATE users SET referred_by=NULL WHERE referred_by IN (SELECT id FROM cleanup_users);
DELETE FROM users WHERE id IN (SELECT id FROM cleanup_users);
-- Remove only unused known test skills; shared genuine skills stay intact.
DELETE FROM skills s WHERE (s.name ~ '^(Flow Skill|Creative Skill) [0-9a-f-]{36}$' OR s.name IN ('Browser Verification Design','Watercolor Sketching','Watercolor Check Sep4','Brush lettering'))
AND NOT EXISTS (SELECT 1 FROM user_skills u WHERE u.skill_id=s.id)
AND NOT EXISTS (SELECT 1 FROM learning_requests r WHERE r.requested_skill_id=s.id)
AND NOT EXISTS (SELECT 1 FROM swap_requests r WHERE r.requested_skill_id=s.id OR r.offered_skill_id=s.id)
AND NOT EXISTS (SELECT 1 FROM swap_sessions r WHERE r.requested_skill_id=s.id OR r.offered_skill_id=s.id)
AND NOT EXISTS (SELECT 1 FROM forum_post_skills p WHERE p.skill_id=s.id)
AND NOT EXISTS (SELECT 1 FROM mentor_application_skills a WHERE a.skill_id=s.id)
AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.skill_id=s.id);
SELECT 'Removed '||count(*)||' synthetic accounts and their dependent test records.' FROM cleanup_users;
COMMIT;`),
);
console.log("Verified local recovery backup:", backupPath);
