import { describe, expect, it } from "vitest";
import { safeLoginRedirect, userDisplayName } from "./auth-validation";
describe("login destinations", () => {
  it.each([
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
    "/login",
    "/unknown",
    null,
    42,
  ])("rejects untrusted destination %s", (value) => {
    expect(safeLoginRedirect(value)).toBe("/");
  });
  it.each(["/", "/mentors", "/sessions", "/forum", "/admin"])(
    "keeps app destination %s",
    (value) => {
      expect(safeLoginRedirect(value)).toBe(value);
    },
  );
  it("uses real identity even when displayName is blank", () => {
    expect(userDisplayName({ displayName: "", firstName: "Test", lastName: "Student" })).toBe(
      "Test Student",
    );
  });
});
