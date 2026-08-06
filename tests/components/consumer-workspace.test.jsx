// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ConsumerWorkspaceNav from "@/components/consumer/ConsumerWorkspaceNav";
import EditorialImage from "@/components/consumer/EditorialImage";
import HomeDashboard from "@/components/consumer/HomeDashboard";
import { StoryStrip } from "@/components/consumer/StoryStrip";
import CreatorProfilePage from "@/app/(fan)/creator/[handle]/page";
import WalletPage from "@/app/(fan)/wallet/page";
import RewardsPage from "@/app/(fan)/rewards/page";
import LivePage from "@/app/(fan)/live/page";
import { CommunityCard } from "@/app/(fan)/explore/page";
import FeedPage from "@/app/(fan)/feed/page";
import MessagesPage from "@/app/(fan)/messages/page";
import CollectionsPage from "@/app/(fan)/collections/page";
import SavedPage from "@/app/(fan)/saved/page";
import SubscriptionsPage from "@/app/(fan)/subscriptions/page";
import { getLiveSessions } from "@/lib/consumer/workspace";

vi.mock("next/navigation", () => ({
  usePathname: () => "/home",
  useParams: () => ({ handle: "asha-rao" }),
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

it("uses an honest empty state when Feed has no active stories", () => {
  render(<StoryStrip stories={[]} />);

  expect(screen.getByText("No active stories right now.")).toBeVisible();
  expect(screen.queryByText("Ananya Sharma")).not.toBeInTheDocument();
});

it("renders real image and video stories without inventing story media", () => {
  render(
    <StoryStrip
      stories={[
        {
          id: "story-image",
          mediaUrl: "https://cdn.example.test/studio.jpg",
          mediaType: "image",
          caption: "Studio materials",
          creator: homeCreator,
        },
        {
          id: "story-video",
          mediaUrl: "https://cdn.example.test/studio.mp4",
          mediaType: "video",
          caption: "At the loom",
          creator: homeCreator,
        },
      ]}
    />,
  );

  expect(screen.getByRole("img", { name: "Studio materials" })).toHaveAttribute(
    "src",
    "https://cdn.example.test/studio.jpg",
  );
  expect(screen.getByLabelText("At the loom").tagName).toBe("VIDEO");
});

it("uses real creator media in the reference Home hierarchy", () => {
  render(
    <HomeDashboard
      data={homeData({
        categories: [
          { name: "Art", creatorCount: 3 },
          { name: "Fitness", creatorCount: 2 },
        ],
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
  expect(screen.getByRole("heading", { name: "Hangout rooms" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Account activity" })).toBeVisible();
  expect(screen.getByRole("link", { name: "Art" })).toHaveAttribute(
    "href",
    "/explore?category=Art",
  );
});

it("keeps the creator avatar in front of the profile cover", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(JSON.stringify({
      creator: homeCreator,
      posts: [],
    }), { status: 200, headers: { "content-type": "application/json" } })),
  );

  render(<CreatorProfilePage />);

  const avatar = await screen.findByLabelText("Asha Rao avatar");
  expect(avatar.parentElement).toHaveClass("relative", "z-10");
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

it("keeps Home upcoming sessions truthful when live rows fill their own limit", async () => {
  const rawCreator = {
    ...homeCreator,
    followers: [],
    creatorProfile: { category: "Art" },
    _count: { followers: 24 },
  };
  const liveRows = Array.from({ length: 5 }, (_, index) => ({
    id: `home-live-${index + 1}`,
    title: `Live ${index + 1}`,
    description: null,
    thumbnailUrl: null,
    status: "LIVE",
    scheduledAt: null,
    startedAt: new Date(`2026-08-05T0${index}:00:00.000Z`),
    viewerCount: index,
    host: rawCreator,
  }));
  const scheduled = {
    ...liveRows[0],
    id: "home-scheduled",
    title: "Scheduled studio tour",
    status: "SCHEDULED",
    scheduledAt: new Date("2026-08-06T10:00:00.000Z"),
    startedAt: null,
    viewerCount: 0,
  };
  const rows = [...liveRows, scheduled];
  const sessions = await getLiveSessions(
    {
      liveSession: {
        findMany: ({ where, take }) => {
          const statuses = typeof where.status === "string" ? [where.status] : where.status.in;
          return Promise.resolve(
            rows.filter((row) => statuses.includes(row.status)).slice(0, take),
          );
        },
      },
    },
    "viewer-1",
    { limit: 4 },
  );

  render(<HomeDashboard data={homeData({ liveSessions: sessions })} />);

  expect(screen.getByText("Scheduled studio tour")).toBeVisible();
  expect(screen.queryByText("No sessions are scheduled yet.")).not.toBeInTheDocument();
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

it("composes Feed discovery from the consumer Home response", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn((url) => {
      const path = String(url);
      const payload = path.startsWith("/api/posts")
        ? { items: [homePost], nextCursor: null }
        : path === "/api/profile"
          ? homeCreator
          : {
              ...homeData({
                categories: [{ name: "Art", creatorCount: 3 }],
                creators: [homeCreator],
                stories: [{
                  id: "feed-story",
                  mediaUrl: "https://cdn.example.test/feed-story.jpg",
                  mediaType: "image",
                  caption: "Behind the scenes",
                  creator: homeCreator,
                }],
                liveSessions: [{
                  id: "feed-live",
                  title: "Studio live",
                  status: "LIVE",
                  viewerCount: 15,
                  host: homeCreator,
                }],
              }),
            };
      return Promise.resolve(
        new Response(JSON.stringify(payload), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    }),
  );

  render(<FeedPage />);

  expect(await screen.findByRole("img", { name: "Behind the scenes" })).toHaveAttribute(
    "src",
    "https://cdn.example.test/feed-story.jpg",
  );
  expect(screen.getByRole("button", { name: "Trending" })).toBeVisible();
  expect(screen.getByRole("link", { name: "Art" })).toHaveAttribute(
    "href",
    "/explore?category=Art",
  );
  expect(screen.getByText("Studio live")).toBeVisible();
});

it("loads persisted conversations and sends to the selected participant id", async () => {
  const fetch = vi.fn((url, options) => {
    const path = String(url);
    const payload = options?.method === "POST"
      ? {
          id: "message-2",
          content: "Hello Asha",
          mine: true,
          status: "SENT",
          createdAt: "2026-08-05T10:01:00.000Z",
        }
      : path.includes("userId=")
        ? {
            participant: homeCreator,
            items: [{
              id: "message-1",
              content: "Welcome to the studio",
              mine: false,
              status: "READ",
              createdAt: "2026-08-05T10:00:00.000Z",
            }],
          }
        : {
            items: [{
              participant: homeCreator,
              lastMessage: {
                id: "message-1",
                content: "Welcome to the studio",
                mine: false,
                status: "READ",
                createdAt: "2026-08-05T10:00:00.000Z",
              },
            }],
          };
    return Promise.resolve(new Response(JSON.stringify(payload), { status: 200 }));
  });
  vi.stubGlobal("fetch", fetch);

  render(<MessagesPage />);

  expect(await screen.findByText("Welcome to the studio")).toBeVisible();
  fireEvent.change(screen.getByRole("textbox", { name: "Message Asha Rao" }), {
    target: { value: "Hello Asha" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));

  await waitFor(() => expect(fetch).toHaveBeenCalledWith(
    "/api/messages",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ receiverId: "creator-1", content: "Hello Asha" }),
    }),
  ));
  expect(screen.queryByText("Ananya Sharma")).not.toBeInTheDocument();
});

it("creates and removes persisted collections with an inline confirmation", async () => {
  let collections = [{
    id: "collection-1",
    name: "Studio references",
    description: "Pieces to revisit",
    postsCount: 2,
  }];
  const fetch = vi.fn((url, options = {}) => {
    if (options.method === "POST") {
      const input = JSON.parse(options.body);
      const created = { id: "collection-2", postsCount: 0, ...input };
      collections = [created, ...collections];
      return Promise.resolve(new Response(JSON.stringify(created), { status: 201 }));
    }
    if (options.method === "DELETE") {
      collections = collections.filter((item) => !String(url).includes(item.id));
      return Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }));
    }
    return Promise.resolve(new Response(JSON.stringify(collections), { status: 200 }));
  });
  vi.stubGlobal("fetch", fetch);

  render(<CollectionsPage />);

  expect(await screen.findByText("Studio references")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Create collection" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Collection name" }), {
    target: { value: "Ideas" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save collection" }));
  expect(await screen.findByText("Ideas")).toBeVisible();

  fireEvent.click(screen.getByRole("button", { name: "Delete Studio references" }));
  expect(screen.getByText("Delete Studio references?")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Confirm delete Studio references" }));
  await waitFor(() => expect(screen.queryByText("Studio references")).not.toBeInTheDocument());
});

it("loads saved posts and removes a bookmark through the persisted endpoint", async () => {
  const fetch = vi.fn((url, options) => Promise.resolve(new Response(
    JSON.stringify(options?.method === "POST"
      ? { isBookmarked: false }
      : { items: [homePost] }),
    { status: 200 },
  )));
  vi.stubGlobal("fetch", fetch);

  render(<SavedPage />);

  expect(await screen.findByText("A new studio piece")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Remove saved post by Asha Rao" }));
  await waitFor(() => expect(fetch).toHaveBeenCalledWith(
    "/api/posts/post-1/bookmark",
    expect.objectContaining({ method: "POST" }),
  ));
  await waitFor(() => expect(screen.queryByText("A new studio piece")).not.toBeInTheDocument());
});

it("joins a real recommended creator and cancels the persisted subscription", async () => {
  const subscription = {
    id: "subscription-1",
    tier: "Community access",
    renewsOn: "No renewal",
    status: "ACTIVE",
    creator: homeCreator,
  };
  const recommendation = {
    ...homeCreator,
    avatar: "https://cdn.example.test/asha-avatar.jpg",
    category: "Textile Art",
    followerCount: 1250,
  };
  const fetch = vi.fn((url, options = {}) => {
    const path = String(url);
    if (path === "/api/subscriptions" && options.method === "POST") {
      return Promise.resolve(new Response(JSON.stringify({ subscription, created: true }), { status: 201 }));
    }
    if (path === "/api/subscriptions/cancel") {
      return Promise.resolve(new Response(JSON.stringify({
        subscription: { ...subscription, status: "CANCELLED", cancelledAt: "2026-08-05T10:00:00.000Z" },
      }), { status: 200 }));
    }
    return Promise.resolve(new Response(JSON.stringify({ items: [], recommendations: [recommendation] }), { status: 200 }));
  });
  vi.stubGlobal("fetch", fetch);

  render(<SubscriptionsPage />);

  expect(await screen.findByText("Asha Rao")).toBeVisible();
  expect(screen.getByLabelText("Asha Rao avatar").querySelector("img")).toHaveAttribute("src", recommendation.avatar);
  expect(screen.getByText("Textile Art")).toBeVisible();
  expect(screen.getByText("1,250 followers")).toBeVisible();
  expect(screen.getByRole("heading", { name: "Recommended Creators for You" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Join Asha Rao for free" }));

  await waitFor(() => expect(fetch).toHaveBeenCalledWith(
    "/api/subscriptions",
    expect.objectContaining({ method: "POST", body: JSON.stringify({ creatorId: "creator-1" }) }),
  ));
  expect(await screen.findByText("You now have free access to Asha Rao.")).toBeVisible();
  expect(screen.queryByRole("button", { name: "Join Asha Rao for free" })).not.toBeInTheDocument();
  const activeAvatar = screen.getByLabelText("Asha Rao avatar");
  expect(activeAvatar).toHaveClass("aspect-square", "h-14", "w-14");
  expect(activeAvatar.querySelector("img")).toHaveClass("object-cover", "object-center");

  fireEvent.click(screen.getByRole("button", { name: "Cancel subscription to Asha Rao" }));
  await waitFor(() => expect(fetch).toHaveBeenCalledWith(
    "/api/subscriptions/cancel",
    expect.objectContaining({ method: "POST", body: JSON.stringify({ subscriptionId: "subscription-1" }) }),
  ));
  expect(await screen.findByText("Subscription to Asha Rao cancelled.")).toBeVisible();
  expect(screen.getByText("CANCELLED")).toBeVisible();
});

it("shows a creator-priced plan without granting free access", async () => {
  const recommendation = {
    ...homeCreator,
    category: "Textile Art",
    followerCount: 1250,
    subscriptionPrice: 599,
  };
  const fetch = vi.fn().mockResolvedValue(new Response(
    JSON.stringify({ items: [], recommendations: [recommendation] }),
    { status: 200 },
  ));
  vi.stubGlobal("fetch", fetch);

  render(<SubscriptionsPage />);

  expect(await screen.findByText("₹599 per month")).toBeVisible();
  expect(screen.getByRole("link", { name: "View Asha Rao subscription plan" })).toHaveAttribute("href", "/creator/asha-rao");
  expect(screen.queryByRole("button", { name: "Join Asha Rao for free" })).not.toBeInTheDocument();
});

it("rejoins a compatible cancelled free subscription through the real join endpoint", async () => {
  const cancelled = {
    id: "subscription-free-cancelled",
    tier: "Community access",
    price: 0,
    method: "FREE",
    renewsOn: "No renewal",
    status: "CANCELLED",
    creator: homeCreator,
  };
  const active = { ...cancelled, status: "ACTIVE", cancelledAt: null };
  const fetch = vi.fn((url, options = {}) => Promise.resolve(new Response(
    JSON.stringify(options.method === "POST"
      ? { subscription: active, created: false }
      : { items: [cancelled], recommendations: [] }),
    { status: 200 },
  )));
  vi.stubGlobal("fetch", fetch);

  render(<SubscriptionsPage />);

  fireEvent.click(await screen.findByRole("button", { name: "Rejoin Asha Rao for free" }));
  await waitFor(() => expect(fetch).toHaveBeenCalledWith(
    "/api/subscriptions",
    expect.objectContaining({ method: "POST", body: JSON.stringify({ creatorId: homeCreator.id }) }),
  ));
  expect(await screen.findByText("You now have free access to Asha Rao.")).toBeVisible();
  expect(screen.getByText("ACTIVE")).toBeVisible();
  expect(screen.queryByRole("button", { name: "Rejoin Asha Rao for free" })).not.toBeInTheDocument();
});

it.each([
  ["collections", CollectionsPage],
  ["saved posts", SavedPage],
  ["subscriptions", SubscriptionsPage],
])("keeps the %s page boundary inside narrow documents", (name, Page) => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [] }), { status: 200 })));

  const { container } = render(<Page />);

  expect(container.firstChild).toHaveClass("min-w-0", "overflow-x-hidden", "px-3", "sm:px-6");
});

it.each([
  ["collections", CollectionsPage, "No collections yet"],
  ["saved posts", SavedPage, "No saved posts"],
  ["subscriptions", SubscriptionsPage, "No subscriptions found"],
])("does not claim empty %s when loading fails", async (_name, Page, emptyCopy) => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
    JSON.stringify({ error: "Workspace unavailable" }),
    { status: 500 },
  )));

  render(<Page />);

  expect(await screen.findByRole("alert")).toHaveTextContent("Workspace unavailable");
  expect(screen.queryByText(emptyCopy)).not.toBeInTheDocument();
});

it("exposes collection creation failures inside the active dialog", async () => {
  vi.stubGlobal("fetch", vi.fn((_url, options = {}) => Promise.resolve(new Response(
    JSON.stringify(options.method === "POST" ? { error: "Collection could not be saved" } : []),
    { status: options.method === "POST" ? 500 : 200 },
  ))));

  render(<CollectionsPage />);

  expect(await screen.findByText("No collections yet")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Create collection" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Collection name" }), {
    target: { value: "Ideas" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save collection" }));

  const dialog = screen.getByRole("dialog");
  expect(await within(dialog).findByRole("alert")).toHaveTextContent("Collection could not be saved");
});

it("keeps the newly selected message thread loading when the prior request aborts", async () => {
  const secondCreator = {
    ...homeCreator,
    id: "creator-2",
    name: "Dev Shah",
    handle: "dev-shah",
  };
  let resolveSecondThread;
  const fetch = vi.fn((url, options = {}) => {
    const path = String(url);
    if (path === "/api/messages") {
      return Promise.resolve(new Response(JSON.stringify({
        items: [homeCreator, secondCreator].map((participant) => ({
          participant,
          lastMessage: {
            id: `last-${participant.id}`,
            content: "Persisted message",
            mine: false,
            status: "READ",
            createdAt: "2026-08-05T10:00:00.000Z",
          },
        })),
      }), { status: 200 }));
    }
    if (path.includes("creator-1")) {
      return new Promise((_resolve, reject) => {
        options.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
      });
    }
    return new Promise((resolve) => {
      resolveSecondThread = () => resolve(new Response(JSON.stringify({
        participant: secondCreator,
        items: [{
          id: "message-dev",
          content: "Dev's persisted message",
          mine: false,
          status: "READ",
          createdAt: "2026-08-05T10:02:00.000Z",
        }],
      }), { status: 200 }));
    });
  });
  vi.stubGlobal("fetch", fetch);

  render(<MessagesPage />);

  fireEvent.click(await screen.findByRole("button", { name: /Dev Shah/ }));
  await waitFor(() => expect(fetch).toHaveBeenCalledWith(
    "/api/messages?userId=creator-2",
    expect.objectContaining({ signal: expect.any(AbortSignal) }),
  ));
  expect(screen.getByText("Loading messages…")).toBeVisible();
  expect(screen.queryByText("Unable to load this conversation.")).not.toBeInTheDocument();

  resolveSecondThread();
  expect(await screen.findByText("Dev's persisted message")).toBeVisible();
});
