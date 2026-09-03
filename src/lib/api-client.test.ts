import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { api, ApiError, refreshAuthTokens } from "./api-client";
import { clearAuth, getAccessToken, getRefreshToken, saveSession } from "./auth-session";
const session = {
  accessToken: "access",
  refreshToken: "refresh",
  accessTokenExpiresAt: "2099-01-01",
  user: {
    id: "u1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    displayName: "Test User",
    roles: ["USER"],
    status: "ACTIVE",
  },
};
const json = (data: unknown, status = 200, type = "application/json") =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": type } });
const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => {
  clearAuth();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
describe("real API authentication", () => {
  it("never attaches an old token or retries wrong login credentials", async () => {
    saveSession(session);
    fetchMock.mockResolvedValue(
      json(
        { detail: "Invalid email or password", code: "UNAUTHENTICATED" },
        401,
        "application/problem+json",
      ),
    );
    await expect(
      api.post("/api/v1/auth/login", { email: "test@example.com", password: "bad" }),
    ).rejects.toMatchObject({ status: 401, message: "Invalid email or password" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).has("Authorization")).toBe(false);
  });
  it("keeps structured backend validation errors", async () => {
    fetchMock.mockResolvedValue(
      json(
        { detail: "Invalid fields", fieldErrors: { email: "Email must be valid" } },
        400,
        "application/problem+json",
      ),
    );
    await expect(api.post("/api/v1/auth/login", {})).rejects.toMatchObject({
      status: 400,
      data: { fieldErrors: { email: "Email must be valid" } },
    });
  });
  it("reports network failure instead of creating a mock session", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(
      api.post("/api/v1/auth/login", { email: "student@university.edu", password: "password123" }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(getAccessToken()).toBeNull();
  });
  it("bounds a hung request", async () => {
    fetchMock.mockImplementation(
      (_url, config) =>
        new Promise((_resolve, reject) => {
          config?.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    );
    await expect(api.post("/api/v1/auth/login", {}, { timeoutMs: 5 })).rejects.toMatchObject({
      status: 0,
      message: expect.stringContaining("timed out"),
    });
  });
  it("refreshes once and retries an expired access token with the new token", async () => {
    saveSession(session);
    fetchMock
      .mockResolvedValueOnce(json({}, 401))
      .mockResolvedValueOnce(
        json({ ...session, accessToken: "new-access", refreshToken: "new-refresh" }),
      )
      .mockResolvedValueOnce(json({ id: "u1" }));
    expect(await api.get("/api/v1/me")).toEqual({ id: "u1" });
    expect(getAccessToken()).toBe("new-access");
    expect(getRefreshToken()).toBe("new-refresh");
    expect(new Headers(fetchMock.mock.calls[2][1]?.headers).get("Authorization")).toBe(
      "Bearer new-access",
    );
    expect(new Headers(fetchMock.mock.calls[1][1]?.headers).has("Authorization")).toBe(false);
  });
  it("shares concurrent refresh calls", async () => {
    saveSession(session);
    fetchMock.mockResolvedValue(json({ ...session, accessToken: "new" }));
    expect(await Promise.all([refreshAuthTokens(), refreshAuthTokens()])).toEqual(["new", "new"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("clears invalid refresh credentials and does not retry forever", async () => {
    saveSession(session);
    fetchMock.mockResolvedValueOnce(json({}, 401)).mockResolvedValueOnce(json({}, 403));
    await expect(api.get("/api/v1/me")).rejects.toMatchObject({ status: 401 });
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("does not restore tokens when a refresh completes after logout", async () => {
    saveSession(session);
    let complete!: (value: Response) => void;
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    );
    const refreshing = refreshAuthTokens();
    clearAuth();
    complete(json({ ...session, accessToken: "late-token" }));
    expect(await refreshing).toBeNull();
    expect(getAccessToken()).toBeNull();
  });
  it("does not clear a new login on a late 401 from the old session", async () => {
    saveSession(session);
    let complete!: (value: Response) => void;
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    );
    const oldRequest = api.get("/api/v1/me");
    clearAuth();
    saveSession({ ...session, accessToken: "other-account" });
    complete(json({}, 401));
    await expect(oldRequest).rejects.toMatchObject({ status: 401 });
    expect(getAccessToken()).toBe("other-account");
  });
  it("does not manufacture refresh tokens when offline", async () => {
    saveSession({ ...session, refreshToken: "mock-refresh" });
    fetchMock.mockRejectedValue(new TypeError("offline"));
    await expect(refreshAuthTokens()).rejects.toMatchObject({ status: 0 });
    expect(getAccessToken()).toBe("access");
  });
  it("clears tokens when the retried request is still unauthorized", async () => {
    saveSession(session);
    fetchMock
      .mockResolvedValueOnce(json({}, 401))
      .mockResolvedValueOnce(json(session))
      .mockResolvedValueOnce(json({}, 401));
    await expect(api.get("/api/v1/me")).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(getAccessToken()).toBeNull();
  });
  it("handles logout's empty 204 response", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    expect(await api.post("/api/v1/auth/logout", { refreshToken: "refresh" })).toBeUndefined();
  });
});
