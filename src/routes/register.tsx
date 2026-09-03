import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/context/auth-context";
import { safeLoginRedirect } from "@/lib/auth-validation";
import { RegisterForm } from "@/components/register-form";
import { BrandLogo } from "@/components/brand-logo";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: safeLoginRedirect(search.redirect),
  }),
  head: () => ({ meta: [{ title: "Create account — SkillBridge" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { redirect } = Route.useSearch();
  const navigate = Route.useNavigate();
  if (isAuthenticated) return <Navigate to={redirect} replace />;
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-5 py-8">
      <section
        className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-10"
        aria-labelledby="register-heading"
      >
        <BrandLogo />
        <h1 id="register-heading" className="mt-7 text-3xl font-semibold tracking-tight">
          Join SkillBridge
        </h1>
        <p className="mb-6 mt-2 text-sm text-muted-foreground">
          Create your account to start learning and sharing skills.
        </p>
        {isLoading ? (
          <p role="status">Checking your session…</p>
        ) : (
          <RegisterForm onSuccess={() => navigate({ to: redirect, replace: true })} />
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            search={{ redirect }}
            className="font-semibold text-primary underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
