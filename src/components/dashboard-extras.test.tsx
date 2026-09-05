import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Certificates, DashboardExtras } from "./dashboard-extras";

const state = vi.hoisted(() => ({
  getCertificates: vi.fn(),
  getOfferings: vi.fn(),
  getTransactions: vi.fn(),
}));

vi.mock("@/context/auth-context", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));
vi.mock("@/services/skills.service", () => ({
  skillsService: { getMyCertificates: state.getCertificates },
}));
vi.mock("@/services/mentors.service", () => ({
  mentorsService: { getMyOfferings: state.getOfferings },
}));
vi.mock("@/services/wallet.service", () => ({
  walletService: { getTransactions: state.getTransactions, exportTransactionsCsv: vi.fn() },
}));

const skills = [
  {
    id: "user-skill-1",
    direction: "TEACH" as const,
    level: "ADVANCED" as const,
    skill: { id: "skill-1", name: "Java", category: "Programming" },
  },
];

describe("profile extras", () => {
  beforeEach(() => {
    state.getCertificates.mockResolvedValue([
      {
        id: "certificate-1",
        fileName: "java-certificate.pdf",
        fileSize: 2048,
        skill: skills[0].skill,
      },
    ]);
    state.getOfferings.mockResolvedValue([
      {
        id: "offering-1",
        skill: skills[0].skill,
        duration: 60,
        modes: ["POINTS"],
        price: 10,
        availability: "Weekends",
        active: true,
      },
    ]);
    state.getTransactions.mockResolvedValue({ content: [], last: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows teaching-post creation but keeps certificate mutations off Profile", async () => {
    render(<DashboardExtras skills={skills} />);

    expect(await screen.findByText("java-certificate.pdf")).toBeVisible();
    expect(await screen.findByText("Weekends")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Upload certificate" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add teaching post" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Hide post" })).toBeVisible();
    expect(
      screen
        .getByText("My teaching posts")
        .compareDocumentPosition(screen.getByText("Activity log")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("keeps certificate management controls in Settings mode", async () => {
    render(<Certificates skills={skills} editable />);

    expect(await screen.findByText("java-certificate.pdf")).toBeVisible();
    expect(screen.getByRole("button", { name: "Upload certificate" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Delete" })).toBeVisible();
  });

  it("shows only three teaching posts until See more is clicked", async () => {
    const user = userEvent.setup();
    state.getOfferings.mockResolvedValue(
      Array.from({ length: 5 }, (_, index) => ({
        id: `offering-${index + 1}`,
        skill: { id: `skill-${index + 1}`, name: `Skill ${index + 1}` },
        duration: 60,
        modes: ["POINTS"],
        price: 10,
        availability: `Availability ${index + 1}`,
        active: true,
      })),
    );

    render(<DashboardExtras skills={skills} />);

    expect(await screen.findByText("Availability 1")).toBeVisible();
    expect(screen.getByText("Availability 3")).toBeVisible();
    expect(screen.queryByText("Availability 4")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "See more" }));
    expect(screen.getByText("Availability 4")).toBeVisible();
    expect(screen.getByText("Availability 5")).toBeVisible();
    expect(screen.queryByRole("button", { name: "See more" })).not.toBeInTheDocument();
  });
});
