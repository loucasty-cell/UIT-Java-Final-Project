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
  await user.click(screen.getByRole("button", { name: "Post Volunteer Session" }));
  await user.type(screen.getByLabelText("Title"), "Java for beginner");
  await user.type(screen.getByLabelText("Skill"), "Hand lettering");
  await user.type(screen.getByLabelText("Description"), "HI");
  await user.click(screen.getByRole("button", { name: "Publish" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("at least 20 characters");
  expect(forumService.createPost).not.toHaveBeenCalled();
  await user.clear(screen.getByLabelText("Description"));
  await user.type(
    screen.getByLabelText("Description"),
    "Learn hand lettering with practical exercises.",
  );
  await user.click(screen.getByRole("button", { name: "Publish" }));
  await waitFor(() =>
    expect(forumService.createPost).toHaveBeenCalledWith(
      expect.objectContaining({ skillIds: ["skill-id"], title: "Java for beginner" }),
    ),
  );
  expect(skillsService.ensureTeachingSkill).toHaveBeenCalledWith("Hand lettering");
});
