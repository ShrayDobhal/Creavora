// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchPanel } from "@/components/consumer/SearchPanel";
import { CreatorCard } from "@/components/consumer/CreatorCard";
import {
  createComment,
  getComments,
  getFeed,
  saveSearchHistory,
  search,
} from "@/services/consumer-api";
import ExplorePage from "@/app/(fan)/explore/page";

const discoveryCreator = {
  handle: "creator-handle",
  avatar: null,
  coverImage: null,
  roleTitle: "Creator",
  bio: null,
  verified: true,
  followerCount: 4,
  isFollowing: false,
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  window.history.replaceState({}, "", "/explore");
});

describe("SearchPanel", () => {
  it("identifies the Blindly search surface", () => {
    render(<SearchPanel onQueryChange={vi.fn()} onSubmit={vi.fn()} />);

    expect(screen.getByRole("searchbox")).toHaveAttribute(
      "placeholder",
      "Search Blindly creators, posts, and communities",
    );
  });

  it("debounces typed searches and sends only the latest trimmed query", async () => {
    vi.useFakeTimers();
    const onQueryChange = vi.fn();
    const onSubmit = vi.fn();
    render(<SearchPanel onQueryChange={onQueryChange} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "  Asha" } });
    expect(onQueryChange).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTimeAsync(350));

    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onQueryChange).toHaveBeenCalledWith("Asha");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits a non-empty search explicitly and ignores whitespace", async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();
    const onSubmit = vi.fn();
    render(<SearchPanel onQueryChange={onQueryChange} onSubmit={onSubmit} />);

    const input = screen.getByRole("searchbox");
    await user.type(input, "   ");
    await user.click(screen.getByRole("button", { name: /search/i }));
    expect(onSubmit).not.toHaveBeenCalled();

    await user.clear(input);
    await user.type(input, "  Jaipur craft  ");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(onSubmit).toHaveBeenCalledWith("Jaipur craft");
    expect(onQueryChange).not.toHaveBeenCalled();
  });

  it("cancels the pending debounce when a search is submitted quickly", async () => {
    vi.useFakeTimers();
    const onQueryChange = vi.fn();
    const onSubmit = vi.fn();
    render(<SearchPanel onQueryChange={onQueryChange} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Asha" } });
    fireEvent.submit(screen.getByRole("search"));
    await act(() => vi.advanceTimersByTimeAsync(350));

    expect(onQueryChange).not.toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("Asha");
  });

  it("synchronizes its visible value when the URL-backed query changes", () => {
    const { rerender } = render(
      <SearchPanel key="Asha" query="Asha" onQueryChange={vi.fn()} onSubmit={vi.fn()} />,
    );
    expect(screen.getByRole("searchbox")).toHaveValue("Asha");

    rerender(<SearchPanel key="empty" query="" onQueryChange={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });
});

describe("consumer API client", () => {
  it("builds cursor requests without sending an empty cursor", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ items: [], nextCursor: null }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await getFeed({ mode: "following", cursor: "next page" });

    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/posts?mode=following&limit=12&cursor=next+page",
    );
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: "same-origin" });
  });

  it("surfaces the API error message for failed searches", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Search is unavailable" }), {
          status: 503,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await expect(search({ query: "Asha" })).rejects.toThrow("Search is unavailable");
  });

  it("persists search history only through the explicit client mutation", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "history-1", query: "Asha" }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await saveSearchHistory({ query: " Asha ", type: "creators" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/search/history",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ query: "Asha", type: "creators" }),
      }),
    );
  });

  it("uses the real comment read and create endpoints", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await getComments("post/1");
    await createComment("post/1", " A useful note ");

    expect(fetchMock.mock.calls[0][0]).toBe("/api/posts/post%2F1/comment");
    expect(fetchMock.mock.calls[1]).toEqual([
      "/api/posts/post%2F1/comment",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ content: "A useful note" }),
      }),
    ]);
  });
});

describe("Explore page", () => {
  it("renders only discovery categories and filters creators by the selected category", async () => {
    const fetchMock = vi.fn((url) => Promise.resolve(
      new Response(
        JSON.stringify(
          String(url) === "/api/discovery"
            ? { categories: [{ name: "Fitness", creatorCount: 4 }, { name: "Technology", creatorCount: 2 }], creators: [] }
            : { items: [], nextCursor: null },
        ),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    ));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<ExplorePage />);

    expect(await screen.findByRole("button", { name: "Fitness, 4 creators" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Technology, 2 creators" })).toBeVisible();
    expect(screen.queryByRole("button", { name: /Art/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fitness, 4 creators" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/creators?category=Fitness&limit=12",
      expect.objectContaining({ credentials: "same-origin" }),
    );
  });

  it("applies a category supplied by a Home link", async () => {
    window.history.replaceState({}, "", "/explore?category=Art");
    const fetchMock = vi.fn((url) => Promise.resolve(
      new Response(
        JSON.stringify(
          String(url) === "/api/discovery"
            ? { categories: [{ name: "Art", creatorCount: 1 }], creators: [] }
            : {
                items: [
                  { ...discoveryCreator, id: "artist", name: "Leela Menon", category: "Art" },
                ],
                nextCursor: null,
              },
        ),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    ));
    vi.stubGlobal("fetch", fetchMock);

    render(<ExplorePage />);

    expect(await screen.findByText("Leela Menon")).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/creators?category=Art&limit=12",
      expect.objectContaining({ credentials: "same-origin" }),
    );
    expect(screen.getByRole("button", { name: "Art, 1 creators" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.queryByText("Dev Mehta")).not.toBeInTheDocument();
  });

  it("does not invent missing follower counts in search creator cards", () => {
    render(
      <CreatorCard
        creator={{
          id: "search-creator",
          name: "Leela Menon",
          handle: "leela-menon",
          avatar: null,
          roleTitle: "Mural artist",
          verified: true,
        }}
      />,
    );

    expect(screen.queryByText(/followers/i)).not.toBeInTheDocument();
  });

  it("renders database discovery results instead of a local creator catalogue", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url) => Promise.resolve(
        new Response(
          JSON.stringify(
            String(url) === "/api/discovery"
              ? { categories: [{ name: "Art", creatorCount: 1 }], creators: [] }
              : {
                  items: [
                    {
                      id: "creator-api",
                      name: "Leela Menon",
                      handle: "leela-menon",
                      avatar: null,
                      coverImage: "https://cdn.example.test/leela-cover.jpg",
                      roleTitle: "Mural artist",
                      bio: "Public art from Kochi",
                      verified: true,
                      followerCount: 18,
                      isFollowing: false,
                      category: "Art",
                    },
                  ],
                  nextCursor: null,
                },
          ),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )),
    );

    render(<ExplorePage />);

    expect(await screen.findByText("Leela Menon")).toBeVisible();
    expect(screen.getByRole("img", { name: "Leela Menon cover" })).toHaveAttribute(
      "src",
      "https://cdn.example.test/leela-cover.jpg",
    );
    expect(screen.getByText("18 followers")).toBeVisible();
    expect(screen.getByRole("button", { name: "Art, 1 creators" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Explore" })).toBeVisible();
  });

  it("paginates the complete twelve-category creator directory", async () => {
    const launchCategories = [
      "Fitness",
      "Sports",
      "Technology",
      "Fashion",
      "Food",
      "Travel",
      "Education",
      "Music",
      "Art",
      "Comedy",
      "Gaming",
      "Lifestyle",
    ];
    const firstPage = launchCategories.map((category, index) => ({
      ...discoveryCreator,
      id: `creator-${index + 1}`,
      name: `${category} Creator`,
      handle: `${category.toLowerCase()}-creator`,
      category,
    }));
    const fetchMock = vi.fn((url) => Promise.resolve(new Response(
      JSON.stringify(String(url) === "/api/discovery"
        ? { categories: launchCategories.map((name) => ({ name, creatorCount: 1 })), creators: [] }
        : String(url).includes("cursor=")
          ? {
            items: [{
              ...discoveryCreator,
              id: "creator-13",
              name: "Second Sports Creator",
              handle: "second-sports-creator",
              category: "Sports",
            }],
            nextCursor: null,
          }
          : { items: firstPage, nextCursor: "blindly-demo-user-page-12" }),
      { status: 200, headers: { "content-type": "application/json" } },
    )));
    vi.stubGlobal("fetch", fetchMock);

    render(<ExplorePage />);

    for (const category of launchCategories) {
      expect(await screen.findByText(`${category} Creator`)).toBeVisible();
    }
    expect(screen.getByRole("button", { name: "Sports, 1 creators" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Load more creators" }));

    expect(await screen.findByText("Second Sports Creator")).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/creators?category=All&limit=12&cursor=blindly-demo-user-page-12",
      expect.objectContaining({ credentials: "same-origin" }),
    );
  });

  it("runs the same explicit search again", async () => {
    let searchCalls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn((url) => {
        if (String(url) === "/api/discovery") {
          return Promise.resolve(
            new Response(JSON.stringify({ categories: [], creators: [] }), {
              status: 200,
              headers: { "content-type": "application/json" },
            }),
          );
        }
        if (String(url).startsWith("/api/creators")) {
          return Promise.resolve(
            new Response(JSON.stringify({ items: [], nextCursor: null }), {
              status: 200,
              headers: { "content-type": "application/json" },
            }),
          );
        }
        if (String(url) === "/api/search/history") {
          return Promise.resolve(
            new Response(JSON.stringify({ id: "history-1", query: "Asha" }), {
              status: 201,
              headers: { "content-type": "application/json" },
            }),
          );
        }
        searchCalls += 1;
        return Promise.resolve(
          new Response(
            JSON.stringify({
              creators: [],
              communities: [],
              posts: [{
                id: `result-${searchCalls}`,
                content: searchCalls === 1 ? "First result" : "Second result",
                mediaUrl: null,
                mediaType: null,
                isPremium: false,
                price: 0,
                publishedAt: "2026-08-04T10:00:00.000Z",
                counts: {},
                creator: {
                  id: "creator-1",
                  name: "Asha Rao",
                  handle: "asha-rao",
                  avatar: null,
                  roleTitle: "Textile artist",
                  verified: true,
                },
                viewer: { isLiked: false, isBookmarked: false },
                isLocked: false,
              }],
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          ),
        );
      }),
    );
    const user = userEvent.setup();
    render(<ExplorePage />);

    await user.type(screen.getByRole("searchbox"), "Asha");
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByText("First result")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByText("Second result")).toBeVisible();
    expect(searchCalls).toBe(2);
  });

  it("submits an Enter search without navigating away and retains the query in the URL", async () => {
    const fetchMock = vi.fn((url) => Promise.resolve(new Response(
      JSON.stringify(
        String(url) === "/api/discovery"
          ? { categories: [], creators: [] }
          : String(url).startsWith("/api/creators")
            ? { items: [], nextCursor: null }
            : String(url) === "/api/search/history"
              ? { id: "history-1", query: "Asha" }
              : { creators: [], posts: [], communities: [] },
      ),
      { status: String(url) === "/api/search/history" ? 201 : 200, headers: { "content-type": "application/json" } },
    )));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<ExplorePage />);

    await user.type(screen.getByRole("searchbox"), "Asha{enter}");

    expect(await screen.findByText("No matching results")).toBeVisible();
    expect(window.location.search).toBe("?q=Asha");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/search?q=Asha&type=all",
      expect.objectContaining({ credentials: "same-origin" }),
    );
  });

  it("loads, clears, and restores database search from browser history", async () => {
    window.history.replaceState({}, "", "/explore?q=Asha");
    const fetchMock = vi.fn((url) => Promise.resolve(new Response(
      JSON.stringify(
        String(url).startsWith("/api/search?")
          ? { creators: [], posts: [], communities: [] }
          : String(url) === "/api/discovery"
            ? { categories: [], creators: [] }
            : { items: [], nextCursor: null },
      ),
      { status: 200, headers: { "content-type": "application/json" } },
    )));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<ExplorePage />);

    expect(await screen.findByRole("heading", { name: "“Asha”" })).toBeVisible();
    expect(screen.getByRole("searchbox")).toHaveValue("Asha");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/search?q=Asha&type=all",
      expect.objectContaining({ credentials: "same-origin" }),
    );

    await user.click(screen.getByRole("button", { name: "Back to discovery" }));
    expect(window.location.search).toBe("");
    expect(screen.getByRole("searchbox")).toHaveValue("");

    window.history.replaceState({}, "", "/explore?q=Kochi");
    window.dispatchEvent(new PopStateEvent("popstate"));

    expect(await screen.findByRole("heading", { name: "“Kochi”" })).toBeVisible();
    expect(screen.getByRole("searchbox")).toHaveValue("Kochi");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/search?q=Kochi&type=all",
      expect.objectContaining({ credentials: "same-origin" }),
    ));
  });

  it("does not persist debounced reads and saves history after explicit submit", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((url) =>
      Promise.resolve(
        new Response(
          JSON.stringify(
            String(url).startsWith("/api/creators")
              ? { items: [], nextCursor: null }
              : String(url) === "/api/search/history"
                ? { id: "history-1", query: "Asha" }
                : { creators: [], posts: [], communities: [] },
          ),
          {
            status: String(url) === "/api/search/history" ? 201 : 200,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<ExplorePage />);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Asha" } });
    await act(() => vi.advanceTimersByTimeAsync(350));

    expect(fetchMock.mock.calls.filter(([url]) => String(url) === "/api/search/history")).toHaveLength(0);

    fireEvent.submit(screen.getByRole("search"));
    await act(() => Promise.resolve());

    expect(fetchMock.mock.calls.filter(([url]) => String(url) === "/api/search/history")).toHaveLength(1);
  });

  it("does not display an unknown community member count as zero", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url) => Promise.resolve(
        new Response(
          JSON.stringify(
            String(url).startsWith("/api/creators")
              ? { items: [], nextCursor: null }
              : {
                  creators: [],
                  posts: [],
                  communities: [{ id: "community-1", name: "Kochi Makers", description: null }],
                },
          ),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )),
    );
    const user = userEvent.setup();
    render(<ExplorePage />);

    await user.type(screen.getByRole("searchbox"), "Kochi");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByText("Kochi Makers")).toBeVisible();
    expect(screen.queryByText("0 members")).not.toBeInTheDocument();
  });
});
