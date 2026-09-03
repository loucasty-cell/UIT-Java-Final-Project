import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .max(255, "Email must be at most 255 characters.")
    .email("Enter a valid email address."),
  // Login checks presence, not registration complexity; preserve the password exactly.
  password: z
    .string()
    .max(100, "Password must be at most 100 characters.")
    .refine((value) => value.trim().length > 0, "Password is required."),
});

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required.")
      .max(100, "First name must be at most 100 characters."),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required.")
      .max(100, "Last name must be at most 100 characters."),
    email: loginSchema.shape.email,
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(100, "Password must be at most 100 characters.")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).+$/,
        "Password must contain at least one letter and one number.",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const destinations = new Set(["/", "/mentors", "/forum", "/sessions", "/admin"]);
type LoginDestination = "/" | "/mentors" | "/forum" | "/sessions" | "/admin";
export function safeLoginRedirect(value: unknown): LoginDestination {
  return typeof value === "string" && destinations.has(value) ? (value as LoginDestination) : "/";
}
export function userDisplayName(
  user: { displayName?: string; firstName?: string; lastName?: string; email?: string } | null,
) {
  return (
    user?.displayName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Your account"
  );
}
export function userInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
