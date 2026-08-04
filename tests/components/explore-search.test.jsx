// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchPanel } from "@/components/consumer/SearchPanel";
import { CreatorCard } from "@/components/consumer/CreatorCard";
import { getFeed, search } from "@/services/consumer-api";
import ExplorePage from "@/app/(fan)/explore/page";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("SearchPanel", () => {
  it("debounces typed searches and sends only the latest trimmed query", async () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<SearchPanel onSearch={onSearch} />);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "  Asha" } });
    expect(onSearch).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTimeAsync(350));

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("Asha");
  });

  it("submits a non-empty search immediately and ignores whitespace", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchPanel onSearch={onSearch} />);

    const input = screen.getByRole("searchbox");
    await user.type(input, "   ");
    await user.click(screen.getByRole("button", { name: /search/i }));
    expect(onSearch).not.toHaveBeenCalled();

    await user.clear(input);
    await user.type(input, "  Jaipur craft  ");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(onSearch).toHaveBeenCalledWith("Jaipur craft");
  });

  it("cancels the pending debounce when a search is submitted quickly", async () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<SearchPanel onSearch={onSearch} />);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Asha" } });
    fireEvent.submit(screen.getByRole("search"));
    await act(() => vi.advanceTimersByTimeAsync(350));

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("Asha");
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
});

describe("Explore page", () => {
  it("does not invent missing subscriber counts in search creator cards", () => {
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

    expect(screen.queryByText(/subscribers/i)).not.toBeInTheDocument();
  });

  it("renders database discovery results instead of a local creator catalogue", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            categories: ["Art"],
            recommended: [
              {
                id: "creator-api",
                name: "Leela Menon",
                handle: "leela-menon",
                avatar: null,
                coverImage: null,
                roleTitle: "Mural artist",
                bio: "Public art from Kochi",
                verified: true,
                subscriberCount: 18,
                isFollowing: false,
                category: "Art",
              },
            ],
            trending: [],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    render(<ExplorePage />);

    expect(await screen.findByText("Leela Menon")).toBeVisible();
    expect(screen.getByRole("button", { name: "Art" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Explore" })).toBeVisible();
  });

  it("runs the same explicit search again", async () => {
    let searchCalls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn((url) => {
        if (String(url).startsWith("/api/discovery")) {
          return Promise.resolve(
            new Response(JSON.stringify({ categories: [], recommended: [], trending: [] }), {
              status: 200,
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

  it("does not display an unknown community member count as zero", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url) => Promise.resolve(
        new Response(
          JSON.stringify(
            String(url).startsWith("/api/discovery")
              ? { categories: [], recommended: [], trending: [] }
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
