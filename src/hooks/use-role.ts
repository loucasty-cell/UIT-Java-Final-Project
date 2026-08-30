import { useAuth } from "@/context/auth-context";
import { type AppRole, normalizeRoles, hasAnyRole } from "@/lib/rbac";

/**
 * Hook to check if the current user has any of the specified roles.
 * Uses AuthContext (works inside React tree).
 *
 * @example
 * const isInstructor = useHasRole("MENTOR", "ADMIN");
 * const isAdmin = useHasRole("ADMIN");
 */
export function useHasRole(...roles: AppRole[]): boolean {
  const { user } = useAuth();
  const userRoles = (user as any)?.roles || [];
  return hasAnyRole(userRoles, ...roles);
}

/**
 * Hook that returns all normalized roles for the current user.
 *
 * @example
 * const roles = useUserRoles(); // ["USER", "MENTOR"]
 */
export function useUserRoles(): AppRole[] {
  const { user } = useAuth();
  const rawRoles = (user as any)?.roles || [];
  return normalizeRoles(rawRoles);
}
