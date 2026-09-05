import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PublicUserProfile } from "./users.$userId";

const state = vi.hoisted(() => ({
  currentUserId: "11111111-1111-4111-8111-111111111111",
  getPublicProfile: vi.fn(),
  getPublicSkills: vi.fn(),
}));

vi.mock("@/context/auth-context", () => ({
  useAuth: () => ({ user: { id: state.currentUserId } }),
}));

vi.mock("@/services/auth.service", () => ({
  authService: {
    getPublicProfile: state.getPublicProfile,
    getPublicSkills: state.getPublicSkills,
  },
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (definition: object) => ({ ...definition, useParams: vi.fn() }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

const viewedUserId = "22222222-2222-4222-8222-222222222222";

function mount() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <PublicUserProfile userId={viewedUserId} />
    </QueryClientProvider>,
  );
}

describe("public user profile", () => {
  beforeEach(() => {
    state.currentUserId = "11111111-1111-4111-8111-111111111111";
    state.getPublicProfile.mockResolvedValue({
      id: viewedUserId,
      displayName: "Mina Patel",
      bio: "I enjoy pair programming and practical projects.",
      major: "Computer Science",
      yearOfStudy: 3,
      averageRating: 4.8,
      reviewCount: 5,
    });
    state.getPublicSkills.mockResolvedValue([
      {
        id: "portfolio-1",
        skillId: "skill-1",
        skillName: "Java",
        category: "Programming",
        direction: "TEACH",
        level: "ADVANCED",
      },
      {
        id: "portfolio-2",
        skillId: "skill-2",
        skillName: "Spanish",
        category: "Languages",
        direction: "LEARN",
        level: "BEGINNER",
      },
    ]);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows another member's public details and both skill directions", async () => {
    mount();

    expect(await screen.findByRole("heading", { name: "Mina Patel" })).toBeVisible();
    expect(screen.getByText("Computer Science · Year 3")).toBeVisible();
    expect(screen.getByText("I enjoy pair programming and practical projects.")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Skills they can teach" })).toBeVisible();
    expect(screen.getByText("Java")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Skills they want to learn" })).toBeVisible();
    expect(screen.getByText("Spanish")).toBeVisible();
    expect(screen.queryByText("Open my private profile")).not.toBeInTheDocument();
    expect(state.getPublicProfile).toHaveBeenCalledWith(viewedUserId);
    expect(state.getPublicSkills).toHaveBeenCalledWith(viewedUserId);
  });

  it("identifies the profile when a member opens their own public view", async () => {
    state.currentUserId = viewedUserId;
    mount();

    expect(await screen.findByText("This is you")).toBeVisible();
    expect(screen.getByRole("link", { name: "Open my private profile" })).toBeVisible();
  });
});
