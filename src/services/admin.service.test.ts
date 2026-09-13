import { beforeEach, expect, it, vi } from "vitest";

const { get, post, patch } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));
vi.mock("@/lib/api-client", () => ({ api: { get, post, patch } }));

import { adminService } from "./admin.service";

beforeEach(() => vi.clearAllMocks());

it("normalizes the existing user-list endpoint for the admin table", async () => {
  get.mockResolvedValue([{ id: "user-1", firstName: "Ada" }]);
  const page = await adminService.getUsers({ page: 0, size: 200 });
  expect(page.content).toHaveLength(1);
  expect(page.totalElements).toBe(1);
  expect(get).toHaveBeenCalledWith("/api/v1/admin/users", { page: 0, size: 200 });
});

it("sends review evidence and the user version for a temporary suspension", async () => {
  patch.mockResolvedValue({ id: "user-1", status: "SUSPENDED" });
  await adminService.updateStatus(
    "user-1",
    "SUSPENDED",
    "Continued bad conduct after an official warning.",
    4,
    ["review-4", "review-5"],
  );
  expect(patch).toHaveBeenCalledWith(
    "/api/v1/admin/users/user-1/status",
    {
      status: "SUSPENDED",
      reason: "Continued bad conduct after an official warning.",
      reviewIds: ["review-4", "review-5"],
    },
    { headers: { "If-Match": '"4"' } },
  );
});

it("loads only reviews that need administrator attention", async () => {
  get.mockResolvedValue({ content: [{ id: "review-1", rating: 1 }] });
  await adminService.getReviewsNeedingAttention({ page: 0, size: 200 });
  expect(get).toHaveBeenCalledWith("/api/v1/admin/reviews", { page: 0, size: 200 });
});

it("sends an optimistic admin decision when awarding the Trusted Mentor badge", async () => {
  patch.mockResolvedValue({ id: "mentor-1", trustedMentor: true });
  await adminService.updateTrustedMentorBadge("mentor-1", true, 7);
  expect(patch).toHaveBeenCalledWith(
    "/api/v1/admin/users/mentor-1/trusted-mentor",
    { trustedMentor: true },
    { headers: { "If-Match": '"7"' } },
  );
});
