// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ConsumerWorkspaceNav from "@/components/consumer/ConsumerWorkspaceNav";
import EditorialImage from "@/components/consumer/EditorialImage";
import HomeDashboard from "@/components/consumer/HomeDashboard";
import WalletPage from "@/app/(fan)/wallet/page";
import RewardsPage from "@/app/(fan)/rewards/page";
import LivePage from "@/app/(fan)/live/page";
import { CommunityCard } from "@/app/(fan)/explore/page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/home",
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const homeCreator = {
  id: "creator-1",
  name: "Asha Rao",
  handle: "asha-rao",
  avatar: "https://cdn.example.test/asha-avatar.jpg",
  coverImage: "https://cdn.example.test/asha-cover.jpg",
  roleTitle: "Textile artist",
  category: "Art",
  verified: true,
  followerCount: 24,
  isFollowing: false,
};

const homePost = {
  id: "post-1",
  content: "A new studio piece",
  mediaUrl: null,
  mediaType: null,
  isPremium: false,
  availability: "available",
  publishedAt: "2026-08-05T10:00:00.000Z",
  counts: { likes: 8, comments: 2, views: 30, shares: 1 },
  creator: homeCreator,
  viewer: { isLiked: false, isBookmarked: false, canManage: false },
};

const homeData = (overrides = {}) => ({
  viewer: { name: "Riya" },
  categories: [],
  creators: [],
  featuredPosts: [],
  stories: [],
  liveSessions: [],
  subscriptions: [],
  unreadNotifications: 0,
  ...overrides,
});

it("shows the complete desktop user navigation", () => {
  render(<ConsumerWorkspaceNav pathname="/home" variant="desktop" />);

  expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/home");
  expect(screen.getByRole("link", { name: "Saved Posts" })).toHaveAttribute("href", "/saved");
});

it("uses an honest Home empty state", () => {
  render(
    <HomeDashboard
      data={homeData()}
    />,
  );

  expect(
    screen.getByText("Your Blindly workspace is ready for new connections"),
  ).toBeInTheDocument();
  expect(screen.queryByText("Ananya Sharma")).not.toBeInTheDocument();
});

it("uses real creator media in the reference Home hierarchy", () => {
  render(
    <HomeDashboard
      data={homeData({
        categories: ["Art", "Fitness"],
        creators: [homeCreator],
      })}
    />,
  );

  expect(screen.getByRole("heading", { name: "Where creators come closer" })).toBeVisible();
  expect(screen.getByRole("img", { name: "Asha Rao featured creator" })).toHaveAttribute(
    "src",
    homeCreator.coverImage,
  );
  expect(screen.getByRole("heading", { name: "Recommended for you" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Live right now" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Your subscriptions" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Upcoming sessions" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Account activity" })).toBeVisible();
  expect(screen.getByRole("link", { name: "Art" })).toHaveAttribute(
    "href",
    "/explore?category=Art",
  );
});

it("wires featured post actions to their real handlers", async () => {
  const onLike = vi.fn().mockResolvedValue({ isLiked: true, likesCount: 9 });
  const onBookmark = vi.fn().mockResolvedValue({ isBookmarked: true });
  render(
    <HomeDashboard
      data={homeData({ featuredPosts: [homePost] })}
      onLike={onLike}
      onBookmark={onBookmark}
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: "Like post by Asha Rao" }));
  await waitFor(() => expect(onLike).toHaveBeenCalledWith("post-1"));
  fireEvent.click(screen.getByRole("button", { name: "Bookmark post" }));
  await waitFor(() => expect(onBookmark).toHaveBeenCalledWith("post-1"));
});

it("renders video stories with video media", () => {
  render(
    <HomeDashboard
      data={homeData({
        stories: [
          {
            id: "story-video",
            mediaUrl: "https://cdn.example.test/story.mp4",
            mediaType: "video",
            caption: "Studio tour",
            creator: homeCreator,
          },
        ],
      })}
    />,
  );

  const media = screen.getByLabelText("Asha Rao's story");
  expect(media.tagName).toBe("VIDEO");
  expect(media).toHaveAttribute("src", "https://cdn.example.test/story.mp4");
});

it("loads the Live page from the read-only API without static activity", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: "live-real",
              title: "Studio check-in",
              description: null,
              thumbnailUrl: "https://cdn.example.test/live.jpg",
              status: "LIVE",
              scheduledAt: null,
              startedAt: "2026-08-05T10:00:00.000Z",
              viewerCount: 14,
              host: homeCreator,
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    ),
  );

  render(<LivePage />);

  expect(await screen.findByText("Studio check-in")).toBeVisible();
  expect(screen.getByText("Asha Rao")).toBeVisible();
  expect(screen.queryByText("Ananya Sharma")).not.toBeInTheDocument();
  expect(screen.queryByRole("textbox", { name: /chat/i })).not.toBeInTheDocument();
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
