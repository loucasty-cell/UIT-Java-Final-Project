import { useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/lib/api-client";
import { registerSchema } from "@/lib/auth-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fields = [
  { name: "firstName", label: "First name", autoComplete: "given-name" },
  { name: "lastName", label: "Last name", autoComplete: "family-name" },
  { name: "email", label: "Email", autoComplete: "username" },
  { name: "password", label: "Password", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirm password", autoComplete: "new-password" },
] as const;
type Field = (typeof fields)[number]["name"];
const empty = { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" };

export function RegisterForm({ onSuccess }: { onSuccess: () => void | Promise<void> }) {
  const { register } = useAuth();
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [visible, setVisible] = useState(false);
  const submitting = useRef(false);
  const inputs = useRef<Partial<Record<Field, HTMLInputElement | null>>>({});
  const focusAfterSubmit = useRef<Field | null>(null);
  useEffect(() => {
    if (!pending && focusAfterSubmit.current) {
      inputs.current[focusAfterSubmit.current]?.focus();
      focusAfterSubmit.current = null;
    }
  }, [pending]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    setError(null);
    const result = registerSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(
        Object.fromEntries(
          Object.entries(fieldErrors).map(([key, messages]) => [key, messages?.[0]]),
        ),
      );
      const first = fields.find(({ name }) => fieldErrors[name]?.length);
      if (first) inputs.current[first.name]?.focus();
      return;
    }
    setErrors({});
    submitting.current = true;
    setPending(true);
    try {
      const { firstName, lastName, email, password } = result.data;
      await register({ firstName, lastName, email, password });
      setValues(empty);
      await onSuccess();
    } catch (failure) {
      if (failure instanceof ApiError) {
        const fieldErrors = (failure.data as { fieldErrors?: Record<string, string> } | null)
          ?.fieldErrors;
        if (fieldErrors) setErrors(fieldErrors);
        if (
          failure.status === 409 ||
          (failure.status === 400 && /already exists/i.test(failure.message))
        ) {
          setErrors({ email: "An account with this email already exists. Please sign in." });
          focusAfterSubmit.current = "email";
        } else {
          setError(
            failure.status === 429
              ? "Too many attempts. Please wait a moment and try again."
              : failure.status >= 500
                ? "The server could not create your account. Please try again shortly."
                : failure.message,
          );
        }
      } else
        setError(
          failure instanceof Error
            ? failure.message
            : "Unable to create your account. Please try again.",
        );
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4" aria-busy={pending}>
      {fields.map(({ name, label, autoComplete }) => {
        const passwordField = name === "password" || name === "confirmPassword";
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={`register-${name}`}>{label}</Label>
            <div className="relative">
              <Input
                id={`register-${name}`}
                ref={(element) => {
                  inputs.current[name] = element;
                }}
                type={
                  passwordField
                    ? visible
                      ? "text"
                      : "password"
                    : name === "email"
                      ? "email"
                      : "text"
                }
                autoComplete={autoComplete}
                autoCapitalize={name === "email" ? "none" : undefined}
                spellCheck={false}
                required
                disabled={pending}
                value={values[name]}
                aria-invalid={!!errors[name]}
                aria-describedby={
                  [errors[name] ? `${name}-error` : "", name === "password" ? "password-hint" : ""]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                onChange={(event) => {
                  setValues((previous) => ({ ...previous, [name]: event.target.value }));
                  setErrors((previous) => ({
                    ...previous,
                    [name]: undefined,
                    ...(name === "password" ? { confirmPassword: undefined } : {}),
                  }));
                  setError(null);
                }}
                className={`h-12 rounded-xl ${name === "password" ? "pr-12" : ""}`}
              />
              {name === "password" && (
                <button
                  type="button"
                  aria-label={visible ? "Hide passwords" : "Show passwords"}
                  aria-pressed={visible}
                  disabled={pending}
                  onClick={() => setVisible((value) => !value)}
                  className="absolute right-3 top-3 rounded text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {visible ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              )}
            </div>
            {name === "password" && (
              <p id="password-hint" className="text-xs text-muted-foreground">
                Use 8–100 characters, including a letter and a number.
              </p>
            )}
            {errors[name] && (
              <p id={`${name}-error`} role="alert" className="text-sm text-destructive">
                {errors[name]}
              </p>
            )}
          </div>
        );
      })}
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
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
