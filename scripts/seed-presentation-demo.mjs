import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { localSql, sqlLiteral as q } from "./local-database.mjs";

// Explicit, local-only presentation seed. The learner is the existing real
// account; fictional mentor records are clearly labelled and never impersonate it.
const ownerId = process.argv[2];
const owners = localSql(
  `SELECT id FROM users WHERE email NOT LIKE '%@presentation.skillbridge.example' ${ownerId ? `AND id=${q(ownerId)}` : ""};`,
)
  .split(/\r?\n/)
  .filter(Boolean);
assert.equal(
  owners.length,
  1,
  "Pass the intended existing account ID when more than one real account exists.",
);
const owner = owners[0];
const emails = ["maya@presentation.skillbridge.example", "aung@presentation.skillbridge.example"];
assert.equal(
  localSql(`SELECT count(*) FROM users WHERE email IN (${emails.map(q).join(",")});`),
  "0",
  "Presentation demo already exists; refusing to duplicate it.",
);
const walletBefore = localSql(
  `SELECT available_points||':'||held_points FROM wallets WHERE user_id=${q(owner)};`,
);
const base = "http://localhost:9095/api/v1";
async function call(path, account, method = "GET", body, expected = 200) {
  const response = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(account ? { Authorization: `Bearer ${account.accessToken}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const raw = await response.text();
  assert.equal(response.status, expected, `${method} ${path}: ${raw}`);
  return raw ? JSON.parse(raw) : undefined;
}
const accounts = [];
try {
  const demos = [];
  for (const [index, firstName, skillName, title, description] of [
    [
      0,
      "Maya",
      "Java",
      "[Demo] Java basics for beginners",
      "Practise Java variables, loops, and simple classes with a friendly step-by-step lesson. This is a presentation example.",
    ],
    [
      1,
      "Aung",
      "MySQL",
      "[Demo] Write your first SQL queries",
      "Learn SELECT, WHERE, and JOIN using a small example database. Bring your questions to this free presentation session.",
    ],
  ]) {
    const account = await call(
      "/auth/register",
      null,
      "POST",
      {
        email: emails[index],
        firstName: `Demo ${firstName}`,
        lastName: "Mentor",
        password: `Sb1!${randomBytes(20).toString("hex")}`,
      },
      201,
    );
    accounts.push(account);
    const skill = await call(
      "/me/skills/custom",
      account,
      "POST",
      { name: skillName, direction: "TEACH", level: "ADVANCED", category: "Programming" },
      201,
    );
    const post = await call(
      "/forum/posts",
      account,
      "POST",
      {
        title,
        description,
        skillIds: [skill.skill.id],
        availabilityText: "Demo availability: weekday afternoons",
        active: true,
      },
      201,
    );
    demos.push({ account, skill, post });
  }
  const requests = [];
  for (const [index, demo] of demos.entries()) {
    const id = randomUUID();
    // Create zero-cost volunteer requests for the intended existing account.
    // Acceptance below uses the normal backend lifecycle rather than fabricated
    // session objects, so the cards remain interactive.
    localSql(`INSERT INTO learning_requests(id,learner_id,mentor_id,requested_skill_id,mode,point_cost,points_held,scheduled_start,duration_minutes,message,status,created_at,updated_at,source_forum_post_id)
      VALUES(${q(id)},${q(owner)},${q(demo.account.user.id)},${q(demo.skill.skill.id)},'VOLUNTEER',0,false,date_trunc('day',now())+interval '${index + 2} days 8 hours',60,'[Demo] Presentation example: volunteer learning session.','PENDING',now(),now(),${q(demo.post.id)});`);
    requests.push(id);
  }
  const accepted = await call(`/learning-requests/${requests[1]}/accept`, demos[1].account, "POST");
  assert(accepted.sessionId);
  // Show an incoming request in the same real account's Mentor tab as well.
  const teachId = localSql(
    `SELECT skill_id FROM user_skills WHERE user_id=${q(owner)} AND direction='TEACH' ORDER BY created_at LIMIT 1;`,
  );
  let incoming;
  if (teachId)
    incoming = await call(
      "/learning-requests",
      demos[0].account,
      "POST",
      {
        mentorId: owner,
        requestedSkillId: teachId,
        mode: "VOLUNTEER",
        scheduledStart: new Date(Date.now() + 4 * 86400000).toISOString(),
        durationMinutes: 60,
        message: "[Demo] Could you teach me this skill? Accept this example from your Mentor tab.",
      },
      201,
    );
  assert.equal(
    localSql(`SELECT status FROM learning_requests WHERE id=${q(requests[0])};`),
    "PENDING",
  );
  assert.equal(
    localSql(`SELECT status FROM swap_sessions WHERE id=${q(accepted.sessionId)};`),
    "SCHEDULED",
  );
  assert.equal(
    localSql(`SELECT available_points||':'||held_points FROM wallets WHERE user_id=${q(owner)};`),
    walletBefore,
  );
  const publicMentors = await call(`/mentors?size=100`, demos[0].account);
  assert(
    (publicMentors.content || publicMentors).some((m) => m.user.id === demos[1].account.user.id),
  );
  console.log(
    `Added 2 labelled demo mentors, 2 volunteer posts, 1 outgoing pending request, 1 active session${incoming ? ", and 1 incoming mentor request" : ""} to the existing account. Existing account points unchanged.`,
  );
} finally {
  for (const account of accounts)
    await call("/auth/logout", null, "POST", { refreshToken: account.refreshToken }, 204);
}
