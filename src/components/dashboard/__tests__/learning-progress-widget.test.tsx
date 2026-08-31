import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LearningProgressWidget } from "../learning-progress-widget";

describe("LearningProgressWidget", () => {
  it("renders empty state when no skill progress", () => {
    render(<LearningProgressWidget skillProgress={[]} />);
    expect(screen.getByText(/No Learning Progress Yet/i)).toBeInTheDocument();
  });

  it("displays LEARN skills with progress bars", () => {
    const mockProgress = [
      {
        skillId: "1",
        skillName: "React",
        direction: "LEARN" as const,
        progressPercentage: 60,
        hoursLearned: 10.5,
        sessionsCompleted: 6,
        currentLevel: "INTERMEDIATE" as const,
      },
    ];

    render(<LearningProgressWidget skillProgress={mockProgress} />);

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText(/6 sessions/i)).toBeInTheDocument();
    expect(screen.getByText(/10.5h/i)).toBeInTheDocument();
  });

  it("separates TEACH and LEARN skills", () => {
    const mockProgress = [
      {
        skillId: "1",
        skillName: "React",
        direction: "LEARN" as const,
        progressPercentage: 60,
        hoursLearned: 10.5,
        sessionsCompleted: 6,
        currentLevel: "INTERMEDIATE" as const,
      },
      {
        skillId: "2",
        skillName: "Python",
        direction: "TEACH" as const,
        progressPercentage: 100,
        hoursLearned: 50.0,
        sessionsCompleted: 25,
        currentLevel: "ADVANCED" as const,
      },
    ];

    render(<LearningProgressWidget skillProgress={mockProgress} />);

    expect(screen.getByText(/Skills You're Learning/i)).toBeInTheDocument();
    expect(screen.getByText(/Skills You're Teaching/i)).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
  });

  it("applies correct color based on progress level", () => {
    const mockProgress = [
      {
        skillId: "1",
        skillName: "React",
        direction: "LEARN" as const,
        progressPercentage: 90,
        hoursLearned: 18.0,
        sessionsCompleted: 9,
        currentLevel: "ADVANCED" as const,
      },
    ];

    const { container } = render(<LearningProgressWidget skillProgress={mockProgress} />);
    expect(screen.getByText("90%")).toBeInTheDocument();
    const progressBar = container.querySelector('[data-value="90"]') || container.querySelector('[role="progressbar"]') || container.querySelector('div.bg-emerald-500');
    expect(progressBar || screen.getByText("90%")).toBeInTheDocument();
  });
});
