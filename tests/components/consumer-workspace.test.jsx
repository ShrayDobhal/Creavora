// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ConsumerWorkspaceNav from "@/components/consumer/ConsumerWorkspaceNav";
import EditorialImage from "@/components/consumer/EditorialImage";
import HomeDashboard from "@/components/consumer/HomeDashboard";
import WalletPage from "@/app/(fan)/wallet/page";
import RewardsPage from "@/app/(fan)/rewards/page";
import { CommunityCard } from "@/app/(fan)/explore/page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/home",
}));

afterEach(() => {
  cleanup();
});

it("shows the complete desktop user navigation", () => {
  render(<ConsumerWorkspaceNav pathname="/home" variant="desktop" />);

  expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/home");
  expect(screen.getByRole("link", { name: "Saved Posts" })).toHaveAttribute("href", "/saved");
});

it("uses an honest Home empty state", () => {
  render(
    <HomeDashboard
      data={{
        viewer: { name: "Riya" },
        categories: [],
        creators: [],
        featuredPosts: [],
        stories: [],
        liveSessions: [],
        subscriptions: [],
        unreadNotifications: 0,
      }}
    />,
  );

  expect(
    screen.getByText("Your Blindly workspace is ready for new connections"),
  ).toBeInTheDocument();
  expect(screen.queryByText("Ananya Sharma")).not.toBeInTheDocument();
});

it("shows wallet as unavailable without fabricated balances or payment controls", () => {
  render(<WalletPage />);

  expect(screen.getByRole("heading", { name: "Wallet unavailable" })).toBeVisible();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  expect(screen.queryByText(/â‚¹|balance|deposit|payment/i)).not.toBeInTheDocument();
});

it("shows rewards as unavailable without fabricated progress or claim controls", () => {
  render(<RewardsPage />);

  expect(screen.getByRole("heading", { name: "Rewards unavailable" })).toBeVisible();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  expect(screen.queryByText(/xp|leaderboard|badge|claim|progress/i)).not.toBeInTheDocument();
});

it("keeps the mobile primary navigation available through tablet widths", () => {
  render(<ConsumerWorkspaceNav pathname="/home" variant="mobile" />);

  expect(screen.getByRole("navigation", { name: "Mobile primary navigation" })).toHaveClass("lg:hidden");
});

it("replaces failed editorial media with an accessible fallback", async () => {
  render(
    <EditorialImage
      src="https://invalid.example/photo.jpg"
      alt="Studio portrait"
      fallbackLabel="Photo unavailable"
    />,
  );

  fireEvent.error(screen.getByRole("img", { name: "Studio portrait" }));

  expect(await screen.findByText("Photo unavailable")).toBeInTheDocument();
});

it("keeps the community card meaningful when its cover image fails", async () => {
  render(<CommunityCard community={{ id: "community-1", name: "Kochi Makers", coverImage: "https://invalid.example/community.jpg" }} />);

  fireEvent.error(screen.getByRole("img", { name: "Kochi Makers cover image" }));

  expect(await screen.findByText("Community cover unavailable")).toBeInTheDocument();
});
