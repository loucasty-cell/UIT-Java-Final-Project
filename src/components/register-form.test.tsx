import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RegisterForm } from "./register-form";
import { ApiError } from "@/lib/api-client";
const { register } = vi.hoisted(() => ({ register: vi.fn() }));
vi.mock("@/context/auth-context", () => ({ useAuth: () => ({ register }) }));
beforeEach(() => {
  register.mockReset();
});
afterEach(cleanup);
const valid = {
  "First name": "New",
  "Last name": "Student",
  Email: "new@example.com",
  Password: "Password123",
  "Confirm password": "Password123",
};
function setup(overrides = {}) {
  const success = vi.fn();
  render(<RegisterForm onSuccess={success} />);
  for (const [label, value] of Object.entries({ ...valid, ...overrides })) {
    fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } });
  }
  return success;
}
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Create account" }));
it.each([
  [{ "First name": "   " }, "First name is required."],
  [{ "Last name": "" }, "Last name is required."],
  [{ "First name": "a".repeat(101) }, "First name must be at most 100 characters."],
  [{ "Last name": "a".repeat(101) }, "Last name must be at most 100 characters."],
  [{ Email: "" }, "Email is required."],
  [{ Email: "invalid" }, "Enter a valid email address."],
  [{ Email: "a".repeat(250) + "@example.com" }, "Email must be at most 255 characters."],
  [{ Password: "Ab1" }, "Password must be at least 8 characters."],
  [{ Password: "abcdefgh" }, "Password must contain at least one letter and one number."],
  [{ Password: "12345678" }, "Password must contain at least one letter and one number."],
  [{ Password: "a1".repeat(51) }, "Password must be at most 100 characters."],
  [{ "Confirm password": "" }, "Please confirm your password."],
  [{ "Confirm password": "Different123" }, "Passwords do not match."],
])("rejects invalid sign-up input %# before sending", async (input, message) => {
  setup(input);
  submit();
  expect(await screen.findByText(message)).toBeVisible();
  expect(register).not.toHaveBeenCalled();
});
it("trims names/email, preserves password, and omits confirmation from the API", async () => {
  const success = setup({
    "First name": " New ",
    "Last name": " Student ",
    Email: " new@example.com ",
    Password: " Password123 ",
    "Confirm password": " Password123 ",
  });
  register.mockResolvedValue({});
  submit();
  await waitFor(() => expect(success).toHaveBeenCalledOnce());
  expect(register).toHaveBeenCalledWith({
    firstName: "New",
    lastName: "Student",
    email: "new@example.com",
    password: " Password123 ",
  });
});
it("prevents duplicate submission and disables fields while creating", async () => {
  let resolve!: (value: object) => void;
  register.mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const success = setup();
  submit();
  fireEvent.submit(screen.getByRole("button", { name: "Creating account…" }).closest("form")!);
  expect(register).toHaveBeenCalledOnce();
  expect(screen.getByLabelText("Email")).toBeDisabled();
  resolve({});
  await waitFor(() => expect(success).toHaveBeenCalledOnce());
});
it.each([400, 409])("shows duplicate-email feedback for status %s", async (status) => {
  const success = setup();
  register.mockRejectedValue(
    new ApiError(status, "User with this email already exists: new@example.com"),
  );
  submit();
  expect(
    await screen.findByText("An account with this email already exists. Please sign in."),
  ).toBeVisible();
  expect(success).not.toHaveBeenCalled();
  await waitFor(() => expect(screen.getByLabelText("Email")).toHaveFocus());
});
it.each([
  [new ApiError(429, "Rate limited"), "Too many attempts. Please wait a moment and try again."],
  [
    new ApiError(500, "Server error"),
    "The server could not create your account. Please try again shortly.",
  ],
  [new Error("Unable to connect to the server."), "Unable to connect to the server."],
])("shows recoverable errors without claiming success %#", async (failure, message) => {
  const success = setup();
  register.mockRejectedValue(failure);
  submit();
  expect(await screen.findByText(message)).toBeVisible();
  expect(success).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Create account" })).toBeEnabled();
  expect(screen.getByLabelText("Email")).toHaveValue(valid.Email);
});
it("shows server field errors", async () => {
  setup();
  register.mockRejectedValue(
    new ApiError(400, "Validation failed", "Bad Request", undefined, undefined, {
      fieldErrors: { email: "Email was rejected" },
    }),
  );
  submit();
  expect(await screen.findByText("Email was rejected")).toBeVisible();
});
it("toggles both password fields without submitting", () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: "Show passwords" }));
  expect(screen.getByLabelText("Password", { exact: true })).toHaveAttribute("type", "text");
  expect(screen.getByLabelText("Confirm password")).toHaveAttribute("type", "text");
  fireEvent.click(screen.getByRole("button", { name: "Hide passwords" }));
  expect(screen.getByLabelText("Password", { exact: true })).toHaveAttribute("type", "password");
  expect(register).not.toHaveBeenCalled();
});
