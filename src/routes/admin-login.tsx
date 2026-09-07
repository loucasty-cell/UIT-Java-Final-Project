import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/context/auth-context";
import { LoginForm } from "@/components/login-form";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin-login")({ component: AdminLoginPage });
function AdminLoginPage() {
  const { isAdmin, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = Route.useNavigate();
  if (isAdmin) return <Navigate to="/admin" replace />;
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <BrandLogo />
        <h1 className="mt-8 text-3xl font-semibold">Administrator sign in</h1>
        <p className="mb-7 mt-2 text-sm text-muted-foreground">
          Sign in with an account granted the ADMIN role.
        </p>
        {isLoading ? (
          <p role="status">Checking your session…</p>
        ) : isAuthenticated ? (
          <div className="space-y-3">
            <p>Your current account is a user account. Sign out to use an administrator account.</p>
            <Button onClick={() => void logout()}>Sign out</Button>
          </div>
        ) : (
          <LoginForm adminOnly onSuccess={() => navigate({ to: "/admin", replace: true })} />
        )}
        <p className="mt-6 text-center text-sm">
          <Link to="/login" search={{ redirect: "/" }} className="text-primary underline">
            User sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
