import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./login-form";
import { ApiError } from "@/lib/api-client";
const { login } = vi.hoisted(() => ({ login: vi.fn() }));
vi.mock("@/context/auth-context", () => ({ useAuth: () => ({ login }) }));
beforeEach(() => {
  login.mockReset();
});
afterEach(cleanup);
function setup() {
  const success = vi.fn();
  render(<LoginForm onSuccess={success} />);
  return success;
}
function fill(email = "test@example.com", password = "Password123") {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Password", { exact: true }), {
    target: { value: password },
  });
}
describe("login form validation", () => {
  it.each([
    ["", "", "Email is required."],
    ["bad-address", "password", "Enter a valid email address."],
    ["test@example.com", "", "Password is required."],
    ["test@example.com", "   ", "Password is required."],
    ["a".repeat(250) + "@example.com", "password", "Email must be at most 255 characters."],
    ["test@example.com", "a".repeat(101), "Password must be at most 100 characters."],
  ])("rejects invalid inputs %# without a request", async (email, password, message) => {
    setup();
    fill(email, password);
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText(message)).toBeVisible();
    expect(login).not.toHaveBeenCalled();
  });
  it("trims the email, preserves password spaces, and signs in using Enter", async () => {
    const success = setup();
    login.mockResolvedValue({});
    fill(" test@example.com ", " Password123 ");
    await userEvent.click(screen.getByLabelText("Password", { exact: true }));
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(success).toHaveBeenCalledOnce());
    expect(login).toHaveBeenCalledWith({ email: "test@example.com", password: " Password123 " });
  });
  it("allows short existing passwords to be checked by the server", async () => {
    setup();
    login.mockRejectedValue(new ApiError(401, "Invalid credentials"));
    fill("test@example.com", "short");
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Incorrect email or password. Please try again.")).toBeVisible();
  });
  it("toggles password visibility without submitting", () => {
    setup();
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByLabelText("Password", { exact: true })).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(screen.getByLabelText("Password", { exact: true })).toHaveAttribute("type", "password");
    expect(login).not.toHaveBeenCalled();
  });
  it("prevents duplicate submissions while login is pending", async () => {
    setup();
    let done!: () => void;
    login.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          done = resolve;
        }),
    );
    fill();
    const form = screen.getByRole("button", { name: "Sign in" }).closest("form")!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(login).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Signing in…" })).toBeDisabled();
    done();
    await waitFor(() => expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled());
  });
  it.each([
    [new ApiError(403, "Account has been disabled."), "Account has been disabled."],
    [new ApiError(429, "Limit exceeded"), "Too many attempts. Please wait a moment and try again."],
    [
      new ApiError(500, "Internal error"),
      "The server could not sign you in. Please try again shortly.",
    ],
    [new ApiError(0, "Cannot connect to the server."), "Cannot connect to the server."],
  ])("shows a recoverable server failure %#", async (failure, message) => {
    const success = setup();
    login.mockRejectedValue(failure);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
    expect(success).not.toHaveBeenCalled();
  });
  it("shows server field validation and clears errors when edited", async () => {
    setup();
    login.mockRejectedValue(
      new ApiError(400, "Invalid fields", "Validation", undefined, undefined, {
        fieldErrors: { email: "Email is not valid" },
      }),
    );
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Email is not valid")).toBeVisible();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "other@example.com" } });
    expect(screen.queryByText("Email is not valid")).not.toBeInTheDocument();
  });
});
