import type { ReactNode } from "react";
import { Link, Navigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/context/auth-context";
import { clearAuth } from "@/lib/auth-session";
import { safeLoginRedirect } from "@/lib/auth-validation";
import { Button } from "@/components/ui/button";

export function AuthGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, isAdmin, sessionError, refreshProfile } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (isLoading)
    return (
      <main className="grid min-h-svh place-items-center">
        <p role="status">Checking your session…</p>
      </main>
    );
  if (sessionError)
    return (
      <main className="grid min-h-svh place-items-center p-6">
        <section className="max-w-md space-y-4">
          <h1 className="text-xl font-semibold">Unable to check your session</h1>
          <p role="alert">{sessionError}</p>
          <Button onClick={() => void refreshProfile()}>Try again</Button>{" "}
          <Button variant="outline" onClick={clearAuth}>
            Back to sign in
          </Button>
        </section>
      </main>
    );
  if (!isAuthenticated)
    return pathname === "/admin" || pathname.startsWith("/admin/") ? (
      <Navigate to="/admin-login" replace />
    ) : (
      <Navigate to="/login" search={{ redirect: safeLoginRedirect(pathname) }} replace />
    );
  if ((pathname === "/admin" || pathname.startsWith("/admin/")) && !isAdmin)
    return (
      <main className="grid min-h-svh place-items-center p-6">
        <section>
          <h1 className="text-xl font-semibold">Access denied</h1>
          <p className="my-4">Your account does not have access to the admin portal.</p>
          <Link to="/" className="underline">
            Return to dashboard
          </Link>
        </section>
      </main>
    );
  return children;
}
