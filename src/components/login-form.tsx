import { useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/lib/api-client";
import { loginSchema } from "@/lib/auth-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  onSuccess,
  adminOnly = false,
}: {
  onSuccess: () => void | Promise<void>;
  adminOnly?: boolean;
}) {
  const { login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    setError(null);
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      setErrors({ email: fields.email?.[0], password: fields.password?.[0] });
      (fields.email ? emailInput : passwordInput).current?.focus();
      return;
    }
    setErrors({});
    submitting.current = true;
    setPending(true);
    try {
      const response = await login(result.data);
      if (
        adminOnly &&
        !response.user.roles.some((role) => role.replace(/^ROLE_/i, "").toUpperCase() === "ADMIN")
      ) {
        await logout();
        throw new Error(
          "This account does not have administrator access. Use the user sign-in page.",
        );
      }
      setPassword("");
      await onSuccess();
    } catch (failure) {
      if (failure instanceof ApiError) {
        const fields = (failure.data as { fieldErrors?: Record<string, string> } | null)
          ?.fieldErrors;
        if (fields) setErrors({ email: fields.email, password: fields.password });
        setError(
          failure.status === 401
            ? "Incorrect email or password. Please try again."
            : failure.status === 429
              ? "Too many attempts. Please wait a moment and try again."
              : failure.status >= 500
                ? "The server could not sign you in. Please try again shortly."
                : failure.message,
        );
      } else
        setError(
          failure instanceof Error ? failure.message : "Unable to sign in. Please try again.",
        );
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5" aria-busy={pending}>
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          ref={emailInput}
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={email}
          disabled={pending}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          onChange={(event) => {
            setEmail(event.target.value);
            setErrors((previous) => ({ ...previous, email: undefined }));
            setError(null);
          }}
          placeholder="you@example.com"
          className="h-12 rounded-xl"
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-sm text-destructive">
            {errors.email}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <div className="relative">
          <Input
            id="login-password"
            ref={passwordInput}
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            disabled={pending}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((previous) => ({ ...previous, password: undefined }));
              setError(null);
            }}
            className="h-12 rounded-xl pr-12"
          />
          <button
            type="button"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            disabled={pending}
            onClick={() => setVisible((value) => !value)}
            className="absolute right-3 top-3 rounded text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary"
          >
            {visible ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" role="alert" className="text-sm text-destructive">
            {errors.password}
          </p>
        )}
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-12 w-full rounded-xl">
        {pending && <LoaderCircle aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />}
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
