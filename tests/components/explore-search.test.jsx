// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchPanel } from "@/components/consumer/SearchPanel";
import { CreatorCard } from "@/components/consumer/CreatorCard";
import { getFeed, search } from "@/services/consumer-api";
import ExplorePage from "@/app/(fan)/explore/page";

describe("SearchPanel", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

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
});

describe("consumer API client", () => {
  afterEach(() => vi.unstubAllGlobals());

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
  });
});
