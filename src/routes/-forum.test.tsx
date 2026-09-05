import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import type { ComponentType } from "react";
import { Route } from "./forum";
import { forumService } from "@/services/forum.service";
import { skillsService } from "@/services/skills.service";
vi.mock("@/context/auth-context", () => ({ useAuth: () => ({ user: { id: "mentor" } }) }));
vi.mock("@/services/forum.service", () => ({
  forumService: { getPosts: vi.fn(), createPost: vi.fn() },
}));
vi.mock("@/services/skills.service", () => ({ skillsService: { ensureTeachingSkill: vi.fn() } }));
const Page = Route.options.component as ComponentType;
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(forumService.getPosts).mockResolvedValue([]);
  vi.mocked(skillsService.ensureTeachingSkill).mockResolvedValue({
    id: "portfolio-id",
    skill: { id: "skill-id" },
  } as never);
});
it("explains short descriptions, then publishes a manually entered skill", async () => {
  const user = userEvent.setup();
  render(<Page />);
  await user.click(screen.getByRole("button", { name: "Offer a free session" }));
  await user.type(screen.getByLabelText("Session title"), "Java for beginner");
  await user.type(screen.getByLabelText("Skill to teach"), "Hand lettering");
  await user.type(screen.getByLabelText("What will learners practise?"), "HI");
  await user.click(screen.getByRole("button", { name: "Publish free session" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("at least 20 characters");
  expect(forumService.createPost).not.toHaveBeenCalled();
  await user.clear(screen.getByLabelText("What will learners practise?"));
  await user.type(
    screen.getByLabelText("What will learners practise?"),
    "Learn hand lettering with practical exercises.",
  );
  await user.click(screen.getByRole("button", { name: "Publish free session" }));
  await waitFor(() =>
    expect(forumService.createPost).toHaveBeenCalledWith(
      expect.objectContaining({
        durationMinutes: 60,
        skillIds: ["skill-id"],
        title: "Java for beginner",
      }),
    ),
  );
  expect(skillsService.ensureTeachingSkill).toHaveBeenCalledWith("Hand lettering");
});
