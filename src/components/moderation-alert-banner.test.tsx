import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { ModerationAlertBanner } from "./moderation-alert-banner";
import { notificationsService } from "@/services/notifications.service";

vi.mock("@/services/notifications.service", () => ({
  notificationsService: {
    getNotifications: vi.fn(),
    markAsRead: vi.fn(),
  },
}));
vi.mock("@/hooks/use-live-refresh", () => ({ useLiveRefresh: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(notificationsService.getNotifications).mockResolvedValue([
    {
      id: "warning-1",
      type: "ACCOUNT_WARNING",
      title: "Important account warning",
      message: "Three verified low reviews require an official warning.",
      read: false,
      createdAt: "2026-09-13T10:00:00Z",
    },
  ]);
  vi.mocked(notificationsService.markAsRead).mockResolvedValue({} as never);
});

it("keeps an account warning prominent until the user acknowledges it", async () => {
  const user = userEvent.setup();
  render(<ModerationAlertBanner />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Important account warning");
  expect(screen.getByRole("alert")).toHaveTextContent("remains visible until you acknowledge it");
  await user.click(screen.getByRole("button", { name: "I understand" }));
  await waitFor(() => expect(notificationsService.markAsRead).toHaveBeenCalledWith("warning-1"));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
