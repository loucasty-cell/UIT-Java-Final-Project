/**
 * TanStack Router route guards for SkillBridge.
 * Used in route `beforeLoad` to enforce auth and role requirements.
 *
 * These run BEFORE the component mounts, so they use localStorage
 * (not React context) to check auth state.
 */
import { redirect } from "@tanstack/react-router";
import { getAccessToken, STORAGE_KEYS } from "@/lib/api-client";
import { type AppRole, hasAnyRole, getRolesFromStorage, getPostLoginRedirect } from "@/lib/rbac";

/**
 * Require authenticated user. Redirects to /login if not authenticated.
 * Use in `beforeLoad` for any protected route.
 *
 * @example
 * export const Route = createFileRoute("/sessions")({
 *   beforeLoad: requireAuth,
 *   component: SessionsPage,
 * });
 */
export function requireAuth() {
  const token = getAccessToken();
  if (!token) {
    throw redirect({ to: "/login" });
  }
}

/**
 * Require specific role(s). Redirects to / with a toast if user lacks the role.
 * Always also checks for authentication first.
 *
 * @example
 * export const Route = createFileRoute("/admin")({
 *   beforeLoad: requireRole("ADMIN"),
 *   component: AdminPage,
 * });
 *
 * export const Route = createFileRoute("/instructor")({
 *   beforeLoad: requireRole("MENTOR", "ADMIN"),
 *   component: InstructorPage,
 * });
 */
export function requireRole(...roles: AppRole[]) {
  return () => {
    // First check auth
    const token = getAccessToken();
    if (!token) {
      throw redirect({ to: "/login" });
    }

    // Then check role
    const userRoles = getRolesFromStorage(STORAGE_KEYS.USER);
    if (!hasAnyRole(userRoles, ...roles)) {
      throw redirect({ to: "/" });
    }
  };
}

/**
 * Guest-only route. Redirects authenticated users to their role-appropriate page.
 * Use for /login and /register routes.
 *
 * @example
 * export const Route = createFileRoute("/login")({
 *   beforeLoad: guestOnly,
 *   component: LoginPage,
 * });
 */
export function guestOnly() {
  const token = getAccessToken();
  if (token) {
    const roles = getRolesFromStorage(STORAGE_KEYS.USER);
    const target = getPostLoginRedirect(roles);
    throw redirect({ to: target });
  }
}
