/**
 * SkillBridge RBAC utilities
 * Core role definitions and helpers used by guards, hooks, and components.
 */

/** Backend roles that map 1:1 to JWT claims and DB `user_roles` */
export type AppRole = "USER" | "MENTOR" | "ADMIN";

/** All valid roles for validation */
export const ALL_ROLES: AppRole[] = ["USER", "MENTOR", "ADMIN"];

/**
 * Normalize raw role strings from JWT / backend.
 * Strips `ROLE_` prefix and uppercases for consistent comparison.
 * e.g. "ROLE_ADMIN" → "ADMIN", "mentor" → "MENTOR"
 */
export function normalizeRole(raw: string): AppRole {
  return raw.replace(/^ROLE_/i, "").toUpperCase() as AppRole;
}

/** Normalize an array of raw role strings */
export function normalizeRoles(raw: string[]): AppRole[] {
  return raw.map(normalizeRole);
}

/** Check if user has a specific role */
export function hasRole(roles: string[] | undefined | null, role: AppRole): boolean {
  if (!roles || roles.length === 0) return false;
  const normalized = normalizeRoles(roles);
  return normalized.includes(role);
}

/** Check if user has ANY of the specified roles */
export function hasAnyRole(
  roles: string[] | undefined | null,
  ...requiredRoles: AppRole[]
): boolean {
  if (!roles || roles.length === 0) return false;
  const normalized = normalizeRoles(roles);
  return requiredRoles.some((r) => normalized.includes(r));
}

/** Check if user has ALL of the specified roles */
export function hasAllRoles(
  roles: string[] | undefined | null,
  ...requiredRoles: AppRole[]
): boolean {
  if (!roles || roles.length === 0) return false;
  const normalized = normalizeRoles(roles);
  return requiredRoles.every((r) => normalized.includes(r));
}

/**
 * Get the user's role set from localStorage user object.
 * Used in route guards where React context isn't available.
 */
export function getRolesFromStorage(storageKey: string): AppRole[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [];
    const user = JSON.parse(stored);
    return normalizeRoles(user?.roles || []);
  } catch {
    return [];
  }
}

/**
 * Determine the best redirect target after login based on roles.
 */
export function getPostLoginRedirect(roles: AppRole[]): string {
  if (roles.includes("ADMIN")) return "/admin";
  // MENTOR and USER both go to their profile workspace
  return "/";
}
