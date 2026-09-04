import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { localSql, sqlLiteral } from "./local-database.mjs";

const base = process.env.FEATURE_TEST_BASE_URL || "http://localhost:9095";
if (process.env.FEATURE_TEST_ISOLATED_DATABASE !== "true") {
  throw new Error(
    "Run feature checks only against a disposable test database. Set FEATURE_TEST_ISOLATED_DATABASE=true after configuring that database; do not seed the everyday app database.",
  );
}
assert(["localhost", "127.0.0.1"].includes(new URL(base).hostname));
let checks = 0;
const preflight = await fetch(base + "/api/v1/learning-requests", {
  method: "OPTIONS",
  headers: {
    Origin: "http://localhost:3000",
    "Access-Control-Request-Method": "POST",
    "Access-Control-Request-Headers": "authorization,content-type,idempotency-key",
  },
});
assert.equal(preflight.status, 200);
assert.match(
  preflight.headers.get("access-control-allow-headers") || "",
  /idempotency-key/i,
  "Browser booking header must be allowed by CORS",
);
checks++;
async function call(path, user, method = "GET", body, expected = 200) {
  const response = await fetch(base + "/api/v1" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(user ? { Authorization: `Bearer ${user.accessToken}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  const raw = await response.text();
  const result = raw ? JSON.parse(raw) : undefined;
  assert.equal(response.status, expected, `${method} ${path}: ${result?.detail || raw}`);
  checks++;
  return result;
}
const suffix = randomUUID();
const accounts = [];
async function register(firstName) {
  const input = {
    firstName,
    lastName: "FlowCheck",
    email: `${firstName.toLowerCase()}-${suffix}@example.com`,
    password: "Sb1!" + randomBytes(16).toString("hex"),
  };
  const account = await call("/auth/register", undefined, "POST", input, 201);
  account.input = input;
  accounts.push(account);
  return account;
}
let admin;
try {
  const learner = await register("Learner");
  const mentor = await register("Mentor");
  admin = await register("Moderator");
  await call("/admin/disputes", learner, "GET", undefined, 403);
  localSql(
    `INSERT INTO user_roles(user_id, role) VALUES (${sqlLiteral(admin.user.id)}, 'ADMIN') ON CONFLICT DO NOTHING;`,
  );
  Object.assign(
    admin,
    await call("/auth/login", undefined, "POST", {
      email: admin.input.email,
      password: admin.input.password,
    }),
  );
  const metrics = await call("/admin/dashboard", admin);
  assert.equal(metrics.totalUsers, Number(localSql("SELECT count(*) FROM users;")));
  const skill = await call(
    "/me/skills/custom",
    mentor,
    "POST",
    { name: `Flow Skill ${suffix}`, direction: "TEACH", level: "INTERMEDIATE" },
    201,
  );
  const offered = await call(
    "/me/skills/custom",
    learner,
    "POST",
    { name: `Creative Skill ${suffix}`, direction: "TEACH", level: "INTERMEDIATE" },
    201,
  );
  const mentors = await call("/mentors?size=100", learner);
  assert((mentors.content || mentors).some((item) => item.user.id === mentor.user.id));
  const post = await call(
    "/forum/posts",
    mentor,
    "POST",
    {
      title: `Volunteer ${suffix}`,
      description: "A real volunteer session for local integration verification.",
      skillIds: [skill.skill.id],
      active: true,
    },
    201,
  );
  const posts = await call("/forum/posts?size=100", learner);
  assert.equal(
    (posts.content || posts)[0].id,
    post.id,
    "Newest volunteer posts must be visible first",
  );
  assert(
    (posts.content || posts).some(
      (item) => item.id === post.id && item.skillTags.some((tag) => tag.id === skill.skill.id),
    ),
  );
  await call(`/forum/posts/${post.id}/like`, learner, "PUT");
  assert.equal((await call(`/forum/posts/${post.id}`, learner)).likedByMe, true);
  await call(`/forum/posts/${post.id}/like`, learner, "DELETE");
  await call(
    `/forum/posts/${post.id}/comments`,
    learner,
    "POST",
    { body: "I would like to learn this skill." },
    201,
  );
  const comments = await call(`/forum/posts/${post.id}/comments`, mentor);
  assert((comments.content || comments).some((comment) => comment.author.id === learner.user.id));
  const makeRequest = async (mode, day) => {
    const body = {
      mentorId: mentor.user.id,
      requestedSkillId: skill.skill.id,
      mode,
      scheduledStart: new Date(Date.now() + day * 86400000).toISOString(),
      durationMinutes: 60,
      ...(mode === "VOLUNTEER" ? { sourceForumPostId: post.id } : {}),
      ...(mode === "SKILL_SWAP" ? { offeredUserSkillId: offered.id } : {}),
    };
    await call("/learning-requests", learner, "POST", { ...body, mentorId: learner.user.id }, 400);
    await call(
      "/learning-requests",
      learner,
      "POST",
      { ...body, scheduledStart: "2020-01-01T10:00:00Z" },
      400,
    );
    const request = await call("/learning-requests", learner, "POST", body, 201);
    assert(
      (await call("/learning-requests?direction=OUTGOING", learner)).some(
        (item) => item.id === request.id,
      ),
    );
    assert(
      (await call("/learning-requests?direction=INCOMING", mentor)).some(
        (item) => item.id === request.id,
      ),
    );
    await call(`/learning-requests/${request.id}/accept`, learner, "POST", undefined, 403);
    return await call(`/learning-requests/${request.id}/accept`, mentor, "POST");
  };
  for (const [mode, day] of [
    ["VOLUNTEER", 1],
    ["SKILL_SWAP", 2],
    ["POINTS", 3],
  ]) {
    const beforeMentor = await call("/me/wallet", mentor);
    const accepted = await makeRequest(mode, day);
    const session = (await call("/sessions/me", learner)).find(
      (item) => item.id === accepted.sessionId,
    );
    assert(session && session.mode === mode && session.status === "SCHEDULED");
    await call(`/sessions/${session.id}/completion-confirmations`, admin, "POST", undefined, 403);
    const first = await call(`/sessions/${session.id}/completion-confirmations`, learner, "POST");
    assert.equal(first.status, "AWAITING_CONFIRMATION");
    const active = await call("/sessions/active/me", learner);
    assert(!active.some((item) => item.id === session.id));
    const completed = await call(
      `/sessions/${session.id}/completion-confirmations`,
      mentor,
      "POST",
    );
    assert.equal(completed.status, "COMPLETED");
    const afterMentor = await call("/me/wallet", mentor);
    if (mode === "POINTS")
      assert.equal(afterMentor.availablePoints - beforeMentor.availablePoints, 10);
    await call(`/sessions/${session.id}/completion-confirmations`, mentor, "POST");
    assert.equal((await call("/me/wallet", mentor)).availablePoints, afterMentor.availablePoints);
  }
  const accepted = await makeRequest("VOLUNTEER", 4);
  const dispute = await call(
    `/sessions/${accepted.sessionId}/dispute`,
    learner,
    "POST",
    { reason: "Mentor did not attend", details: "Local verification report details." },
    201,
  );
  const disputes = await call("/admin/disputes?size=100", admin);
  assert(
    (disputes.content || disputes).some(
      (item) =>
        item.id === dispute.id &&
        item.details === "Local verification report details." &&
        item.sessionMode === "VOLUNTEER" &&
        item.openedBy.displayName === "Learner FlowCheck",
    ),
  );
  await call(`/admin/disputes/${dispute.id}/resolve`, admin, "POST", {
    resolution: "CANCEL_NO_TRANSFER",
    note: "Resolved during local verification.",
  });
  const report = await call(
    "/moderation/reports",
    learner,
    "POST",
    {
      targetType: "FORUM_POST",
      targetId: post.id,
      reason: "Other",
      details: "Local content report check.",
    },
    201,
  );
  const reports = await call("/admin/reports?size=100", admin);
  assert((reports.content || reports).some((item) => item.id === report.id));
  await call(`/admin/reports/${report.id}/dismiss`, admin, "POST", {
    reason: "Local verification complete.",
  });
  await call(`/forum/posts/${post.id}`, mentor, "DELETE", undefined, 204);
  console.log(
    `PASS: ${checks} local API checks: two-user posts, likes/comments, all three booking modes, roles, completion, point release, reports and admin resolution.`,
  );
} finally {
  if (admin)
    localSql(
      `DELETE FROM user_roles WHERE user_id = ${sqlLiteral(admin.user.id)} AND role = 'ADMIN';`,
    );
  for (const account of accounts)
    await call("/auth/logout", undefined, "POST", { refreshToken: account.refreshToken }, 204);
}
