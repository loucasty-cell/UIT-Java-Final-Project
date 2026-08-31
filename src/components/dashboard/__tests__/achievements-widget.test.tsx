import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AchievementsWidget } from "../achievements-widget";
import type { MilestoneResponse } from "@/types/api";

describe("AchievementsWidget", () => {
  it("renders empty state when no milestones", () => {
    render(<AchievementsWidget milestones={[]} />);
    expect(screen.getByText(/No Achievements Yet/i)).toBeInTheDocument();
  });

  it("displays achieved milestones with icons", () => {
    const mockMilestones: MilestoneResponse[] = [
      {
        id: "1",
        code: "FIRST_SESSION",
        title: "First Session",
        description: "Complete your first session",
        conditionType: "SESSION_COUNT",
        conditionValue: 1,
        pointsReward: 10,
        icon: "🎯",
        achieved: true,
        achievedAt: "2026-08-01T00:00:00Z",
      },
    ];

    render(<AchievementsWidget milestones={mockMilestones} />);

    expect(screen.getByText("First Session")).toBeInTheDocument();
    expect(screen.getByText("🎯")).toBeInTheDocument();
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
  });

  it("shows next milestone progress with progress bar", () => {
    const mockMilestones: MilestoneResponse[] = [
      {
        id: "1",
        code: "FIRST_SESSION",
        title: "First Session",
        description: "Complete your first session",
        conditionType: "SESSION_COUNT",
        conditionValue: 1,
        pointsReward: 10,
        achieved: true,
        achievedAt: "2026-08-01T00:00:00Z",
      },
      {
        id: "2",
        code: "TEN_SESSIONS",
        title: "10 Sessions",
        description: "Complete 10 sessions",
        conditionType: "SESSION_COUNT",
        conditionValue: 10,
        pointsReward: 50,
        achieved: false,
        progress: 40,
      },
    ];

    render(<AchievementsWidget milestones={mockMilestones} />);

    expect(screen.getByText(/Next Milestone/i)).toBeInTheDocument();
    expect(screen.getByText("10 Sessions")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByText("+50 pts")).toBeInTheDocument();
  });

  it("limits displayed achieved badges to 8", () => {
    const mockMilestones: MilestoneResponse[] = Array.from({ length: 15 }, (_, i) => ({
      id: `${i}`,
      code: `MILESTONE_${i}`,
      title: `Milestone ${i}`,
      description: `Description ${i}`,
      conditionType: "SESSION_COUNT",
      conditionValue: i + 1,
      pointsReward: 10,
      achieved: true,
      achievedAt: "2026-08-01T00:00:00Z",
    }));

    const { container } = render(<AchievementsWidget milestones={mockMilestones} />);
    const grid = container.querySelector(".grid.grid-cols-4");
    const badges = grid?.children;
    expect(badges?.length).toBeLessThanOrEqual(8);
  });
});
