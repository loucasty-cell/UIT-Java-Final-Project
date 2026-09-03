// Exercise real local authentication without logging tokens or passwords.
// Reuses an ignored synthetic test account; never edits an existing user's data.
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
const base = process.env.AUTH_TEST_BASE_URL || "http://localhost:9095";
assert(
  ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
  "Auth tests may only target a local backend.",
);
const accountPath = new URL("../auth-test.local", import.meta.url);
let passed = 0;
async function call(path, body, expected, token) {
  const response = await fetch(base + path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, expected, path + " returned unexpected status");
  passed++;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
let account;
try {
  account = JSON.parse(await readFile(accountPath, "utf8"));
} catch {}
if (!account || account.base !== base) {
  account = {
    base,
    email: "auth-check-" + randomUUID() + "@example.com",
    password: "Sb1!" + randomBytes(18).toString("hex"),
  };
  const registered = await call(
    "/api/v1/auth/register",
    { ...account, firstName: "Auth", lastName: "Check" },
    201,
  );
  await writeFile(accountPath, JSON.stringify(account, null, 2) + "\n");
  await call("/api/v1/auth/logout", { refreshToken: registered.refreshToken }, 204);
}
const families = [];
try {
  for (const input of [
    {},
    { email: "", password: "" },
    { email: "invalid", password: "Password123" },
    { email: account.email, password: "" },
    { email: account.email, password: "   " },
    { email: null, password: null },
  ]) {
    const error = await call("/api/v1/auth/login", input, 400);
    assert(
      error.fieldErrors && Object.keys(error.fieldErrors).length > 0,
      "Validation must contain field errors",
    );
  }
  await call("/api/v1/auth/login", { email: account.email, password: "WrongPassword123" }, 401);
  await call(
    "/api/v1/auth/login",
    { email: "missing-" + randomUUID() + "@example.com", password: "Password123" },
    401,
  );
  await call("/api/v1/auth/refresh", { refreshToken: "" }, 400);
  await call("/api/v1/auth/logout", { refreshToken: "" }, 400);
  await call("/api/v1/me", undefined, 401);
  const login = await call(
    "/api/v1/auth/login",
    { email: account.email, password: account.password },
    200,
  );
  assert(login.accessToken && login.refreshToken && login.user.email === account.email);
  families.push(login.refreshToken);
  const profile = await call("/api/v1/me", undefined, 200, login.accessToken);
  assert.equal(profile.email, account.email);
  const rotated = await call("/api/v1/auth/refresh", { refreshToken: login.refreshToken }, 200);
  assert.notEqual(rotated.refreshToken, login.refreshToken);
  assert.equal(rotated.user.id, login.user.id);
  await call("/api/v1/me", undefined, 200, rotated.accessToken);
  // Logout by the original (rotated) token revokes the entire session family.
  await call("/api/v1/auth/logout", { refreshToken: login.refreshToken }, 204);
  await call("/api/v1/auth/refresh", { refreshToken: rotated.refreshToken }, 403);
  await call("/api/v1/auth/logout", { refreshToken: login.refreshToken }, 204);
  const again = await call(
    "/api/v1/auth/login",
    { email: account.email, password: account.password },
    200,
  );
  families.push(again.refreshToken);
  await call("/api/v1/me", undefined, 200, again.accessToken);
  console.log(
    "PASS: " +
      passed +
      " real API checks (input validation, rejected credentials, login, profile, refresh rotation, logout, revoked refresh, repeat login).",
  );
  console.log("Synthetic review account saved in ignored auth-test.local.");
} finally {
  for (const refreshToken of families) {
    await call("/api/v1/auth/logout", { refreshToken }, 204);
  }
}
