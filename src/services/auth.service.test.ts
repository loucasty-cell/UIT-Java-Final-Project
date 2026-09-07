import { beforeEach, expect, it, vi } from "vitest";

const { patch } = vi.hoisted(() => ({ patch: vi.fn() }));

vi.mock("@/lib/api-client", () => ({ api: { patch } }));

import { authService } from "./auth.service";

beforeEach(() => patch.mockReset());

it("updates a profile using the current optimistic-lock version", async () => {
  const updated = { id: "user-1", version: 8 };
  patch.mockResolvedValue(updated);

  await expect(authService.updateProfile({ displayName: "Updated name" }, 7)).resolves.toEqual(
    updated,
  );

  expect(patch).toHaveBeenCalledWith(
    "/api/v1/me",
    { displayName: "Updated name" },
    { headers: { "If-Match": '"7"' } },
  );
});
