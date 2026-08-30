import type { ReactNode } from "react";
import { useHasRole } from "@/hooks/use-role";
import type { AppRole } from "@/lib/rbac";

interface RequireRoleProps {
  /** One or more roles — user must have AT LEAST ONE to see children */
  roles: AppRole[];
  /** Content shown when user lacks the required role (default: nothing) */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Conditionally renders children based on user role.
 * This is for UI-level hiding only — route-level security
 * is enforced by `beforeLoad` guards in route-guards.ts.
 *
 * @example
 * <RequireRole roles={["ADMIN"]}>
 *   <AdminPanel />
 * </RequireRole>
 *
 * <RequireRole roles={["MENTOR", "ADMIN"]} fallback={<BecomeInstructorCTA />}>
 *   <InstructorDashboard />
 * </RequireRole>
 */
export function RequireRole({ roles, fallback = null, children }: RequireRoleProps) {
  const allowed = useHasRole(...roles);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
