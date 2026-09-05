import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Profile } from "./index";

const state = vi.hoisted(() => ({
  getBalance: vi.fn(),
  getSkills: vi.fn(),
  getSessions: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (definition: object) => definition,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("@/context/auth-context", () => ({
  useAuth: () => ({
    user: {
      id: "user-1",
      email: "maya@example.com",
      displayName: "Maya Chen",
      firstName: "Maya",
      lastName: "Chen",
      bio: "I enjoy learning through collaborative projects.",
      major: "Computer Science",
      yearOfStudy: 3,
      roles: ["USER"],
    },
  }),
}));

vi.mock("@/services/wallet.service", () => ({
  walletService: { getBalance: state.getBalance },
}));
vi.mock("@/services/skills.service", () => ({
  skillsService: { getUserSkills: state.getSkills },
}));
vi.mock("@/services/sessions.service", () => ({
  sessionsService: { listSessions: state.getSessions },
}));
vi.mock("@/components/dashboard-extras", () => ({
  DashboardExtras: () => (
    <div>
      <p>Certificates</p>
      <p>My teaching posts</p>
      <button>Add teaching post</button>
      <p>Activity log</p>
    </div>
  ),
}));

describe("profile display", () => {
  beforeEach(() => {
    state.getBalance.mockResolvedValue({ availablePoints: 30, heldPoints: 4 });
    state.getSkills.mockResolvedValue([
      {
        id: "teaching-1",
        direction: "TEACH",
        level: "ADVANCED",
        skill: { id: "skill-1", name: "Java", category: "Programming" },
      },
      {
        id: "learning-1",
        direction: "LEARN",
        level: "BEGINNER",
        skill: { id: "skill-2", name: "Spanish", category: "Languages" },
      },
    ]);
    state.getSessions.mockResolvedValue([
      { id: "active-1", status: "SCHEDULED" },
      { id: "complete-1", status: "COMPLETED" },
    ]);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the requested read-only profile and routes editing to Settings", async () => {
    render(<Profile />);

    expect(await screen.findByText("Maya Chen")).toBeVisible();
    const profileDetails = screen.getByRole("complementary", { name: "Profile details" });
    const accountOverview = screen.getByRole("region", { name: "Account overview" });
    expect(
      within(profileDetails).getByText("I enjoy learning through collaborative projects."),
    ).toBeVisible();
    expect(within(profileDetails).getByText("Java · advanced")).toBeVisible();
    expect(within(profileDetails).getByText("Spanish · beginner")).toBeVisible();
    expect(within(accountOverview).getByText("Available points")).toBeVisible();
    expect(within(accountOverview).getByText("Points held")).toBeVisible();
    expect(within(accountOverview).getByText("Active sessions")).toBeVisible();
    expect(within(accountOverview).getByText("Completed sessions")).toBeVisible();
    expect(screen.getByText("Certificates")).toBeVisible();
    expect(screen.getByText("Activity log")).toBeVisible();
    expect(screen.getByText("My teaching posts")).toBeVisible();
    expect(screen.getByRole("link", { name: "Edit profile" })).toHaveAttribute("href", "/settings");
    expect(screen.getByRole("button", { name: "Add teaching post" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Add skill" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Upload certificate" })).not.toBeInTheDocument();
  });
});
