import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./auth-context";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/lib/api-client";
import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  saveSession,
  STORAGE_KEYS,
} from "@/lib/auth-session";
vi.mock("@/services/auth.service", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
}));
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
let lastError: unknown;
function Probe() {
  const auth = useAuth();
  return (
    <div>
      <p data-testid="status">
        {auth.isLoading ? "loading" : auth.isAuthenticated ? auth.user?.email : "guest"}
      </p>
      <p>{auth.sessionError}</p>
      <button
        onClick={() =>
          void auth.login({ email: "test@example.com", password: "Password123" }).catch((error) => {
            lastError = error;
          })
        }
      >
        Login
      </button>
      <button
        onClick={() =>
          void auth.logout().catch((error) => {
            lastError = error;
          })
        }
      >
        Logout
      </button>
    </div>
  );
}
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </QueryClientProvider>,
  );
  return client;
}
beforeEach(() => {
  clearAuth();
  vi.clearAllMocks();
  lastError = undefined;
});
afterEach(cleanup);
describe("session lifecycle", () => {
  it("does not trust a cached or malformed user without tokens", async () => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(session.user));
    mount();
    expect(await screen.findByText("guest")).toBeVisible();
    expect(authService.getProfile).not.toHaveBeenCalled();
  });
  it("validates the stored session against the backend on reload", async () => {
    saveSession(session);
    localStorage.setItem(STORAGE_KEYS.USER, "{broken-json");
    vi.mocked(authService.getProfile).mockResolvedValue(session.user);
    mount();
    expect(await screen.findByText("test@example.com")).toBeVisible();
    expect(authService.getProfile).toHaveBeenCalledOnce();
  });
  it("clears expired sessions rejected by the backend", async () => {
    saveSession(session);
    vi.mocked(authService.getProfile).mockRejectedValue(new ApiError(401, "Unauthorized"));
    mount();
    expect(await screen.findByText("guest")).toBeVisible();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
  it("shows a retryable error instead of protected content when restoration is offline", async () => {
    saveSession(session);
    vi.mocked(authService.getProfile).mockRejectedValue(new ApiError(0, "Cannot connect"));
    mount();
    expect(await screen.findByText("Cannot connect")).toBeVisible();
    expect(screen.getByTestId("status")).toHaveTextContent("guest");
    expect(getRefreshToken()).toBe("refresh");
  });
  it("saves successful credentials and clears user cache immediately on logout even offline", async () => {
    vi.mocked(authService.login).mockResolvedValue(session);
    vi.mocked(authService.logout).mockRejectedValue(new ApiError(0, "offline"));
    const client = mount();
    fireEvent.click(screen.getByText("Login"));
    await screen.findByText("test@example.com");
    client.setQueryData(["private"], { secret: "account data" });
    fireEvent.click(screen.getByText("Logout"));
    await screen.findByText("guest");
    expect(authService.logout).toHaveBeenCalledWith("refresh");
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.USER)).toBeNull();
    expect(client.getQueryData(["private"])).toBeUndefined();
    await waitFor(() => expect(lastError).toBeInstanceOf(ApiError));
  });
  it("rejects malformed login payloads without authenticating", async () => {
    vi.mocked(authService.login).mockResolvedValue({ user: session.user } as typeof session);
    mount();
    fireEvent.click(screen.getByText("Login"));
    await waitFor(() => expect(lastError).toBeInstanceOf(Error));
    expect(screen.getByTestId("status")).toHaveTextContent("guest");
    expect(getAccessToken()).toBeNull();
  });
  it("ignores a profile response completing after logout", async () => {
    saveSession(session);
    let resolve!: (value: typeof session.user) => void;
    vi.mocked(authService.getProfile).mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    vi.mocked(authService.logout).mockResolvedValue();
    mount();
    fireEvent.click(screen.getByText("Logout"));
    await act(async () => resolve(session.user));
    expect(screen.getByTestId("status")).toHaveTextContent("guest");
    expect(getAccessToken()).toBeNull();
  });
  it("does not let a delayed login undo logout", async () => {
    let resolve!: (value: typeof session) => void;
    vi.mocked(authService.login).mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    vi.mocked(authService.logout).mockResolvedValue();
    mount();
    fireEvent.click(screen.getByText("Login"));
    fireEvent.click(screen.getByText("Logout"));
    await act(async () => resolve(session));
    expect(screen.getByTestId("status")).toHaveTextContent("guest");
    expect(getAccessToken()).toBeNull();
  });
  it("synchronizes logout from another tab", async () => {
    saveSession(session);
    vi.mocked(authService.getProfile).mockResolvedValue(session.user);
    mount();
    await screen.findByText("test@example.com");
    act(() => {
      localStorage.clear();
      window.dispatchEvent(
        new StorageEvent("storage", { key: STORAGE_KEYS.ACCESS_TOKEN, newValue: null }),
      );
    });
    expect(screen.getByTestId("status")).toHaveTextContent("guest");
  });
});
