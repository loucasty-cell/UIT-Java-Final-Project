import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import type { AdminDisputeResponse, AdminReviewResponse, AdminUserResponse } from "@/types/api";
import { DisputeCard, UserModerationCard } from "./admin";

it("shows moderation controls and enables warning for four low ratings", async () => {
  const user = userEvent.setup();
  const account: AdminUserResponse = {
    id: "user-1",
    email: "htet@example.test",
    firstName: "Htet Yadanar",
    lastName: "Myo",
    displayName: "Htet Yadanar Myo",
    roles: ["USER"],
    status: "ACTIVE",
    warningCount: 0,
    verifiedReviewCount: 4,
    verifiedLowReviewCount: 4,
    verifiedAverageRating: 1,
    recommendedAction: "WARN",
    suspensionCount: 0,
    version: 1,
    createdAt: new Date().toISOString(),
  };
  const reviews = Array.from({ length: 4 }, (_, index) => lowReview(`review-${index + 1}`));

  render(
    <UserModerationCard
      account={account}
      reviews={reviews}
      currentAdminId="admin-1"
      reload={vi.fn().mockResolvedValue(undefined)}
    />,
  );

  expect(screen.getByText("Moderation actions")).toBeInTheDocument();
  expect(screen.getByText(/Warning available/)).toBeInTheDocument();
  const warnButton = screen.getByRole("button", { name: /Warn user/i });
  expect(warnButton).toBeDisabled();
  expect(screen.getByRole("button", { name: /Temporarily ban/i })).toBeDisabled();

  await user.type(
    screen.getByRole("textbox", { name: /Moderation reason for Htet Yadanar Myo/i }),
    "Repeated poor session conduct.",
  );
  expect(warnButton).toBeEnabled();
});

it("shows both people involved in a session report", () => {
  const dispute: AdminDisputeResponse = {
    id: "dispute-1",
    sessionId: "session-1",
    openedBy: { id: "user-1", displayName: "Mable Kim" },
    reportedUser: { id: "user-2", displayName: "Htet Yadanar Myo" },
    requesterId: "user-1",
    responderId: "user-2",
    reason: "Mentor or learner did not attend",
    details: "The mentor did not attend.",
    status: "OPEN",
    heldPoints: 25,
    createdAt: new Date().toISOString(),
  };

  render(<DisputeCard dispute={dispute} reload={vi.fn().mockResolvedValue(undefined)} />);

  expect(screen.getByText("Reported by Mable Kim")).toBeInTheDocument();
  expect(screen.getByText("Reported against Htet Yadanar Myo")).toBeInTheDocument();
});

function lowReview(id: string): AdminReviewResponse {
  return {
    id,
    sessionId: `session-${id}`,
    reviewerId: "reviewer-1",
    reviewerName: "Reviewer",
    revieweeId: "user-1",
    revieweeName: "Htet Yadanar Myo",
    skillId: "skill-1",
    rating: 1,
    status: "VERIFIED",
    createdAt: new Date().toISOString(),
    lowReviewCount: 4,
    lowReviewsSinceLastAction: 4,
    recommendedAction: "WARN",
  };
}
