// Local-only registration regression test. Creates one synthetic account per run.
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
const base = process.env.AUTH_TEST_BASE_URL || "http://localhost:9095";
assert(
  ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
  "Only local backends are allowed.",
);
let passed = 0;
async function call(path, body, status, token) {
  const response = await fetch(base + path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, status, `${path}: unexpected status`);
  passed++;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
const input = {
  firstName: "Registration",
  lastName: "Check",
  email: `signup-admin-mentor-${randomUUID()}@example.com`,
  password: "Sb1!" + randomBytes(18).toString("hex"),
};
for (const invalid of [
  {},
  { ...input, firstName: " " },
  { ...input, lastName: "" },
  { ...input, firstName: "a".repeat(101) },
  { ...input, lastName: "a".repeat(101) },
  { ...input, email: "bad-email" },
  { ...input, email: "a".repeat(255) + "@example.com" },
  { ...input, password: "Ab1" },
  { ...input, password: "abcdefgh" },
  { ...input, password: "12345678" },
  { ...input, password: "a1".repeat(51) },
]) {
  const error = await call("/api/v1/auth/register", invalid, 400);
  assert(error.fieldErrors && Object.keys(error.fieldErrors).length, "Expected field errors");
}
const families = [];
try {
  const created = await call("/api/v1/auth/register", input, 201);
  assert(created.accessToken && created.refreshToken && created.user.id);
  assert.deepEqual(created.user.roles, ["USER"]);
  families.push(created.refreshToken);
  const profile = await call("/api/v1/me", undefined, 200, created.accessToken);
  assert.equal(profile.email, input.email);
  assert.equal(profile.firstName, input.firstName);
  assert.deepEqual(profile.roles, ["USER"], "Email must not grant ADMIN or MENTOR");
  const duplicate = await call("/api/v1/auth/register", input, 400);
  assert.match(duplicate.detail, /already exists/i);
  await call("/api/v1/auth/logout", { refreshToken: created.refreshToken }, 204);
  await call("/api/v1/auth/refresh", { refreshToken: created.refreshToken }, 403);
  const login = await call(
    "/api/v1/auth/login",
    { email: input.email, password: input.password },
    200,
  );
  families.push(login.refreshToken);
  assert.equal(login.user.id, created.user.id);
  assert.deepEqual(login.user.roles, ["USER"]);
  await call("/api/v1/me", undefined, 200, login.accessToken);
  console.log(
    `PASS: ${passed} registration API checks (validation, create, default role, duplicate email, logout and subsequent login).`,
  );
} finally {
  for (const refreshToken of families) await call("/api/v1/auth/logout", { refreshToken }, 204);
}
