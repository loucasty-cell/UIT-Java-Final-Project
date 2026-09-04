import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ComponentType } from "react";
import { Route } from "./sessions";
import { sessionsService } from "@/services/sessions.service";
import { learningRequestsService } from "@/services/learning-requests.service";

vi.mock("@/context/auth-context", () => ({ useAuth: () => ({ user: { id: "learner-1" } }) }));
vi.mock("@/services/sessions.service", () => ({
  sessionsService: { listSessions: vi.fn(), completeSession: vi.fn(), disputeSession: vi.fn() },
}));
vi.mock("@/services/learning-requests.service", () => ({
  learningRequestsService: {
    listRequests: vi.fn(),
    acceptRequest: vi.fn(),
    rejectRequest: vi.fn(),
    cancelRequest: vi.fn(),
  },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
const Page = Route.options.component as ComponentType;
const scheduled = {
  id: "session-1",
  learnerId: "learner-1",
  mentorId: "mentor-2",
  responder: { id: "mentor-2", displayName: "Real Mentor" },
  mode: "VOLUNTEER",
  status: "SCHEDULED",
  pointCost: 0,
  createdAt: "2026-09-03T10:00:00Z",
};
describe("My Sessions real API flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sessionsService.listSessions).mockResolvedValue([scheduled as never]);
    vi.mocked(learningRequestsService.listRequests).mockImplementation(async (direction) =>
      direction === "OUTGOING"
        ? [
            {
              id: "request-1",
              learnerId: "learner-1",
              mentorId: "mentor-2",
              mentorName: "Real Mentor",
              requestedSkill: { id: "skill", name: "Java", category: "Programming" },
              mode: "VOLUNTEER",
              status: "PENDING",
              scheduledStart: "2026-10-01T10:00:00Z",
            } as never,
          ]
        : [],
    );
  });
  it("shows outgoing requests under Learner and keeps Mentor separate", async () => {
    const user = userEvent.setup();
    render(<Page />);
    await screen.findByText("Session with Real Mentor");
    await user.click(screen.getByRole("tab", { name: "Requests (1)" }));
    expect(screen.getByText("Java")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: /^Mentor$/ }));
    expect(screen.getByText("No active sessions.")).toBeInTheDocument();
    expect(screen.queryByText("Java")).not.toBeInTheDocument();
  });
  it("removes a confirmed session from Active after the API succeeds", async () => {
    const user = userEvent.setup();
    render(<Page />);
    await screen.findByText("Session with Real Mentor");
    vi.mocked(sessionsService.completeSession).mockResolvedValue({
      id: "session-1",
      status: "AWAITING_CONFIRMATION",
      pointsReleased: 0,
      confirmedByMe: true,
      confirmedByOther: false,
    });
    vi.mocked(sessionsService.listSessions).mockResolvedValue([
      { ...scheduled, status: "AWAITING_CONFIRMATION" } as never,
    ]);
    await user.click(screen.getByRole("button", { name: "Complete Session" }));
    await user.click(screen.getByRole("button", { name: "Confirm completion" }));
    await waitFor(() => expect(sessionsService.completeSession).toHaveBeenCalledWith("session-1"));
    await screen.findByText("No active sessions.");
    expect(screen.getByRole("tab", { name: "Awaiting confirmation (1)" })).toBeInTheDocument();
  });
  it("does not pretend completion succeeded when the backend rejects it", async () => {
    const user = userEvent.setup();
    render(<Page />);
    await screen.findByText("Session with Real Mentor");
    vi.mocked(sessionsService.completeSession).mockRejectedValue(new Error("Unavailable"));
    await user.click(screen.getByRole("button", { name: "Complete Session" }));
    await user.click(screen.getByRole("button", { name: "Confirm completion" }));
    await waitFor(() => expect(sessionsService.completeSession).toHaveBeenCalled());
    expect(screen.getByText("Session with Real Mentor")).toBeInTheDocument();
  });
});
