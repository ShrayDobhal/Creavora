// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FeedCard } from "@/components/consumer/FeedCard";
import FeedPage from "@/app/(fan)/feed/page";

const post = {
  id: "post-1",
  content: "Handloom notes from Jaipur.",
  mediaUrl: "https://cdn.example.test/jaipur.jpg",
  mediaType: "image",
  isPremium: false,
  price: 0,
  publishedAt: "2026-08-04T10:00:00.000Z",
  counts: { likes: 8, comments: 2, views: 34, shares: 1 },
  creator: {
    id: "creator-1",
    name: "Asha Rao",
    handle: "asha-rao",
    avatar: null,
    roleTitle: "Textile artist",
    verified: true,
    subscriberCount: 42,
    isFollowing: false,
  },
  viewer: {
    isLiked: false,
    isBookmarked: false,
    isFollowing: false,
  },
  isLocked: false,
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("FeedCard", () => {
  it("rolls back the heart count when a like request fails", async () => {
    const user = userEvent.setup();
    render(
      <FeedCard
        post={post}
        onLike={vi.fn().mockRejectedValue(new Error("Network error"))}
        onBookmark={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /like/i }));

    expect(await screen.findByText("Network error")).toBeVisible();
    expect(screen.getByRole("button", { name: /like/i })).toHaveTextContent("8");
    expect(screen.getByRole("button", { name: /like/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("keeps the server count after an optimistic like succeeds", async () => {
    const user = userEvent.setup();
    render(
      <FeedCard
        post={post}
        onLike={vi.fn().mockResolvedValue({ isLiked: true, likesCount: 12 })}
        onBookmark={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /like/i }));

    expect(screen.getByRole("button", { name: /unlike/i })).toHaveTextContent("12");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders API media and an initial when no avatar is available", () => {
    render(<FeedCard post={post} onLike={vi.fn()} onBookmark={vi.fn()} />);

    expect(screen.getByRole("img", { name: /handloom notes/i })).toHaveAttribute(
      "src",
      post.mediaUrl,
    );
    expect(screen.getByLabelText("Asha Rao avatar")).toHaveTextContent("AR");
  });

  it("does not display unknown engagement counts as zero", () => {
    render(
      <FeedCard
        post={{ ...post, counts: {} }}
        onLike={vi.fn()}
        onBookmark={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /like/i })).not.toHaveTextContent("0");
    expect(screen.queryByLabelText(/comments/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/shares/i)).not.toBeInTheDocument();
  });
});

describe("Feed page", () => {
  it("renders API posts and offers pagination only when the server returns a cursor", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [{ ...post, id: "api-post", content: "API-only post from Kochi." }],
          nextCursor: "next-page",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<FeedPage />);

    expect(await screen.findByText("API-only post from Kochi.")).toBeVisible();
    expect(screen.getByRole("button", { name: /load more/i })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Feed" })).toBeVisible();
  });

  it("re-enables pagination after a mode change aborts an in-flight page", async () => {
    const followingPost = {
      ...post,
      id: "following-post",
      content: "Following-only post.",
    };
    const fetchMock = vi.fn((url, options = {}) => {
      const requestUrl = String(url);
      if (requestUrl.includes("cursor=latest-next")) {
        return new Promise((_resolve, reject) => {
          options.signal.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        });
      }
      const page = requestUrl.includes("mode=following")
        ? { items: [followingPost], nextCursor: "following-next" }
        : { items: [post], nextCursor: "latest-next" };
      return Promise.resolve(
        new Response(JSON.stringify(page), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<FeedPage />);

    await user.click(await screen.findByRole("button", { name: "Load more" }));
    expect(screen.getByRole("button", { name: "Loading more" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Following" }));

    expect(await screen.findByText("Following-only post.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Load more" })).toBeEnabled();
  });
});
