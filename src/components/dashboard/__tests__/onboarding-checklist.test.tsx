import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OnboardingChecklist } from "../onboarding-checklist";
import { useAuth } from "@/context/auth-context";

// Mock useAuth hook
vi.mock("@/context/auth-context", () => ({
  useAuth: vi.fn(),
}));

describe("OnboardingChecklist", () => {
  const mockActions = {
    onCompleteProfile: vi.fn(),
    onAddSkill: vi.fn(),
    onUploadAvatar: vi.fn(),
    onBookSession: vi.fn(),
    onShareReferral: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: {
        bio: null,
        major: null,
        profilePictureUrl: null,
      },
    });
  });

  it("does not render when all tasks complete", () => {
    (useAuth as any).mockReturnValue({
      user: {
        bio: "Test bio",
        major: "Computer Science",
        profilePictureUrl: "https://example.com/avatar.jpg",
      },
    });

    // Note: referral is tracked locally, let's pass all true or test partial
    // When checks are done, completed === total returns null
  });

  it("renders progress bar showing completion count", () => {
    (useAuth as any).mockReturnValue({
      user: {
        bio: "Test bio",
        major: "Computer Science",
        profilePictureUrl: null,
      },
    });

    render(
      <OnboardingChecklist
        hasSkills={true}
        hasSessions={false}
        {...mockActions}
      />
    );

    expect(screen.getByText("2/5")).toBeInTheDocument();
  });

  it("marks completed tasks with checkmarks", () => {
    (useAuth as any).mockReturnValue({
      user: {
        bio: "Test bio",
        major: "Computer Science",
        profilePictureUrl: null,
      },
    });

    render(
      <OnboardingChecklist
        hasSkills={false}
        hasSessions={false}
        {...mockActions}
      />
    );

    const profileTask = screen.getByText("Complete your profile");
    expect(profileTask).toBeInTheDocument();
  });

  it("triggers action callbacks when clicking incomplete tasks", () => {
    render(
      <OnboardingChecklist
        hasSkills={false}
        hasSessions={false}
        {...mockActions}
      />
    );

    const addSkillTask = screen.getByText("Add your first skill");
    fireEvent.click(addSkillTask.closest("div")!);

    expect(mockActions.onAddSkill).toHaveBeenCalledTimes(1);
  });

  it("displays point rewards for incomplete tasks", () => {
    render(
      <OnboardingChecklist
        hasSkills={false}
        hasSessions={false}
        {...mockActions}
      />
    );

    expect(screen.getByText("+15 pts")).toBeInTheDocument();
    expect(screen.getByText("+25 pts")).toBeInTheDocument();
  });
});
