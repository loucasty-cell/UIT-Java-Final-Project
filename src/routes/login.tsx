import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/context/auth-context";
import { safeLoginRedirect } from "@/lib/auth-validation";
import { LoginForm } from "@/components/login-form";
import { BrandLogo } from "@/components/brand-logo";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: safeLoginRedirect(search.redirect),
  }),
  head: () => ({ meta: [{ title: "Sign in — SkillBridge" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { redirect } = Route.useSearch();
  const navigate = Route.useNavigate();
  if (isAuthenticated) return <Navigate to={redirect} replace />;
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-5 py-12">
      <section
        className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-10"
        aria-labelledby="login-heading"
      >
        <BrandLogo />
        <h1 id="login-heading" className="mt-8 text-3xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="mb-7 mt-2 text-sm text-muted-foreground">
          Sign in to your SkillBridge account to continue.
        </p>
        {isLoading ? (
          <p role="status">Checking your session…</p>
        ) : (
          <LoginForm onSuccess={() => navigate({ to: redirect, replace: true })} />
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to SkillBridge?{" "}
          <Link
            to="/register"
            search={{ redirect }}
            className="font-semibold text-primary underline underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
