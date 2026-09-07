import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, it, vi } from "vitest";
import type { ComponentType } from "react";
import { Route } from "./wallet";
import { walletService } from "@/services/wallet.service";
vi.mock("@/lib/api-client", () => ({ getAccessToken: () => "test-token" }));
vi.mock("@/services/wallet.service", () => ({
  walletService: { getBalance: vi.fn(), getTransactions: vi.fn() },
}));
const Page = Route.options.component as ComponentType;
function renderPage() {
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <Page />
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(walletService.getBalance).mockResolvedValue({
    availablePoints: 7,
    heldPoints: 0,
    totalEarned: 7,
    totalSpent: 0,
  } as never);
  vi.mocked(walletService.getTransactions).mockResolvedValue({ content: [] } as never);
});
it("shows actual balance and empty history without fabricated transactions", async () => {
  renderPage();
  expect(await screen.findByText("No transactions yet.")).toBeInTheDocument();
  expect(screen.getByText("7")).toBeInTheDocument();
  expect(screen.queryByText("Welcome bonus")).not.toBeInTheDocument();
  expect(screen.queryByText("120")).not.toBeInTheDocument();
});
it("shows an API failure instead of substituting demo money", async () => {
  vi.mocked(walletService.getBalance).mockRejectedValue(new Error("Unavailable"));
  renderPage();
  expect(await screen.findByRole("alert")).toHaveTextContent("Could not load wallet data");
  expect(screen.queryByText("120")).not.toBeInTheDocument();
});
