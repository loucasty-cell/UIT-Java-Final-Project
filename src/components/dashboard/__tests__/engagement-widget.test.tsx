import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EngagementWidget } from "../engagement-widget";

describe("EngagementWidget", () => {
  it("renders empty state for new users", () => {
    render(<EngagementWidget engagement={undefined} />);
    expect(screen.getByText(/Start Your Streak!/i)).toBeInTheDocument();
  });

  it("displays current streak with fire emoji", () => {
    const mockEngagement = {
      currentStreak: 7,
      longestStreak: 10,
      hoursThisWeek: 5.5,
      hoursThisMonth: 15.0,
    };

    render(<EngagementWidget engagement={mockEngagement} />);

    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText(/days active/i)).toBeInTheDocument();
    expect(screen.getAllByText(/🔥/i).length).toBeGreaterThan(0);
  });

  it("shows 'On Fire!' badge for 7+ day streaks", () => {
    const mockEngagement = {
      currentStreak: 7,
      longestStreak: 10,
      hoursThisWeek: 5.5,
      hoursThisMonth: 15.0,
    };

    render(<EngagementWidget engagement={mockEngagement} />);

    expect(screen.getByText("On Fire! 🔥")).toBeInTheDocument();
  });

  it("displays weekly and monthly hours", () => {
    const mockEngagement = {
      currentStreak: 3,
      longestStreak: 5,
      hoursThisWeek: 8.5,
      hoursThisMonth: 20.5,
    };

    render(<EngagementWidget engagement={mockEngagement} />);

    expect(screen.getByText("8.5h")).toBeInTheDocument();
    expect(screen.getByText("20.5h")).toBeInTheDocument();
    expect(screen.getByText(/This Week/i)).toBeInTheDocument();
    expect(screen.getByText(/This Month/i)).toBeInTheDocument();
  });

  it("displays best streak stat", () => {
    const mockEngagement = {
      currentStreak: 3,
      longestStreak: 15,
      hoursThisWeek: 5.0,
      hoursThisMonth: 10.0,
    };

    render(<EngagementWidget engagement={mockEngagement} />);

    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText(/Best Streak/i)).toBeInTheDocument();
  });
});
