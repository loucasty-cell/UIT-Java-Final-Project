import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AuthGate } from "./auth-gate";
const state = vi.hoisted(() => ({
  path: "/",
  auth: {
    isLoading: false,
    isAuthenticated: false,
    isAdmin: false,
    sessionError: null as string | null,
    refreshProfile: vi.fn(),
  },
}));
vi.mock("@/context/auth-context", () => ({ useAuth: () => state.auth }));
vi.mock("@tanstack/react-router", () => ({
  useRouterState: () => state.path,
  Navigate: ({ to, search }: { to: string; search?: { redirect: string } }) => (
    <p>
      Redirect: {to} {search?.redirect}
    </p>
  ),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));
beforeEach(() => {
  state.path = "/";
  Object.assign(state.auth, {
    isLoading: false,
    isAuthenticated: false,
    isAdmin: false,
    sessionError: null,
  });
});
afterEach(cleanup);
const mount = () =>
  render(
    <AuthGate>
      <p>Private dashboard</p>
    </AuthGate>,
  );
it("hides private content while checking the session", () => {
  state.auth.isLoading = true;
  mount();
  expect(screen.getByRole("status")).toBeVisible();
  expect(screen.queryByText("Private dashboard")).not.toBeInTheDocument();
});
it("redirects a logged-out deep link to login", () => {
  state.path = "/sessions";
  mount();
  expect(screen.getByText("Redirect: /login /sessions")).toBeVisible();
  expect(screen.queryByText("Private dashboard")).not.toBeInTheDocument();
});
it("renders protected content only with a validated session", () => {
  state.auth.isAuthenticated = true;
  mount();
  expect(screen.getByText("Private dashboard")).toBeVisible();
});
it("blocks a non-admin direct URL", () => {
  state.auth.isAuthenticated = true;
  state.path = "/admin";
  mount();
  expect(screen.getByText("Access denied")).toBeVisible();
  expect(screen.queryByText("Private dashboard")).not.toBeInTheDocument();
});
it("keeps an administrator inside the admin portal", () => {
  state.auth.isAuthenticated = true;
  state.auth.isAdmin = true;
  state.path = "/settings";
  mount();
  expect(screen.getByText("Redirect: /admin")).toBeVisible();
  expect(screen.queryByText("Private dashboard")).not.toBeInTheDocument();
});
it("fails closed when the session cannot be checked", () => {
  state.auth.sessionError = "Offline";
  mount();
  expect(screen.getByRole("alert")).toHaveTextContent("Offline");
  expect(screen.queryByText("Private dashboard")).not.toBeInTheDocument();
});
