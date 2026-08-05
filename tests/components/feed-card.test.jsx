// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
  publishedAt: "2026-08-04T10:00:00.000Z",
  counts: { likes: 8, comments: 2, views: 34, shares: 1 },
  creator: {
    id: "creator-1",
    name: "Asha Rao",
    handle: "asha-rao",
    avatar: null,
    roleTitle: "Textile artist",
    verified: true,
    followerCount: 42,
    isFollowing: false,
  },
  viewer: {
    isLiked: false,
    isBookmarked: false,
    isFollowing: false,
  },
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

  it("keeps post actions usable after its image media fails", () => {
    render(<FeedCard post={post} onLike={vi.fn()} onBookmark={vi.fn()} />);

    fireEvent.error(screen.getByRole("img", { name: post.content }));

    expect(screen.getByRole("button", { name: "Like post by Asha Rao" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Bookmark post" })).toBeEnabled();
    expect(screen.getByText("Media unavailable")).toBeVisible();
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

  it("shows unavailable work without paid-release claims", () => {
    const { container } = render(
      <FeedCard
        post={{
          ...post,
          content: null,
          mediaUrl: null,
          isPremium: true,
          availability: "coming_soon",
        }}
        onLike={vi.fn()}
        onBookmark={vi.fn()}
      />,
    );

    expect(
      screen.getByText("This post is not available in the current release."),
    ).toBeVisible();
    expect(container).not.toHaveTextContent(/premium|subscribe|unlock|upgrade|₹/i);
  });

  it("loads and creates comments through explicit callbacks", async () => {
    const user = userEvent.setup();
    const onLoadComments = vi.fn().mockResolvedValue([
      {
        id: "comment-1",
        content: "Beautiful work",
        user: { id: "user-2", name: "Riya", handle: "riya", avatar: null },
      },
    ]);
    const onCreateComment = vi.fn().mockResolvedValue({
      comment: {
        id: "comment-2",
        content: "Thanks for sharing",
        user: { id: "viewer-1", name: "Viewer", handle: "viewer", avatar: null },
      },
      commentsCount: 3,
    });

    render(
      <FeedCard
        post={post}
        onLike={vi.fn()}
        onBookmark={vi.fn()}
        onLoadComments={onLoadComments}
        onCreateComment={onCreateComment}
      />,
    );

    await user.click(screen.getByRole("button", { name: "View 2 comments" }));
    expect(await screen.findByText("Beautiful work")).toBeVisible();
    await user.type(screen.getByRole("textbox", { name: "Add a comment" }), "Thanks for sharing");
    await user.click(screen.getByRole("button", { name: "Post comment" }));

    expect(onLoadComments).toHaveBeenCalledWith("post-1");
    expect(onCreateComment).toHaveBeenCalledWith("post-1", "Thanks for sharing");
    expect(await screen.findByText("Thanks for sharing")).toBeVisible();
    expect(screen.getByRole("button", { name: "Hide 3 comments" })).toBeVisible();
  });

  it("shows a comment read failure without hiding the post", async () => {
    const user = userEvent.setup();
    render(
      <FeedCard
        post={post}
        onLike={vi.fn()}
        onBookmark={vi.fn()}
        onLoadComments={vi.fn().mockRejectedValue(new Error("Comments are unavailable"))}
        onCreateComment={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "View 2 comments" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Comments are unavailable");
    expect(screen.getByText(post.content)).toBeVisible();
  });

  it("supports replies and owner-only comment editing and deletion", async () => {
    const user = userEvent.setup();
    const root = {
      id: "comment-1",
      parentId: null,
      content: "Original comment",
      createdAt: "2026-08-04T11:00:00.000Z",
      user: { id: "viewer-1", name: "Viewer", handle: "viewer", avatar: null },
      viewer: { canManage: true },
    };
    const onCreateComment = vi.fn().mockResolvedValue({
      comment: { ...root, id: "comment-2", parentId: root.id, content: "A reply" },
      commentsCount: 3,
    });
    const onUpdateComment = vi.fn().mockResolvedValue({ ...root, content: "Edited comment" });
    const onDeleteComment = vi.fn().mockResolvedValue({ commentsCount: 2 });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<FeedCard post={post} onLike={vi.fn()} onBookmark={vi.fn()} onLoadComments={vi.fn().mockResolvedValue([root])} onCreateComment={onCreateComment} onUpdateComment={onUpdateComment} onDeleteComment={onDeleteComment} />);
    await user.click(screen.getByRole("button", { name: "View 2 comments" }));
    expect(await screen.findByText("Original comment")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Reply" }));
    await user.type(screen.getByPlaceholderText("Write a reply"), "A reply");
    await user.click(screen.getByRole("button", { name: "Post reply" }));
    expect(onCreateComment).toHaveBeenCalledWith("post-1", "A reply", "comment-1");

    await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    await user.clear(screen.getByRole("textbox", { name: "Edit comment" }));
    await user.type(screen.getByRole("textbox", { name: "Edit comment" }), "Edited comment");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onUpdateComment).toHaveBeenCalledWith("post-1", "comment-1", "Edited comment");
    expect(await screen.findByText("Edited comment")).toBeVisible();

    await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    expect(onDeleteComment).toHaveBeenCalledWith("post-1", "comment-1");
    expect(screen.queryByText("Edited comment")).not.toBeInTheDocument();
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

  it("offers every supported feed mode", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ items: [], nextCursor: null }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    render(<FeedPage />);

    expect(screen.getByRole("button", { name: "Latest" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Following" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Trending" })).toBeVisible();
  });
});
