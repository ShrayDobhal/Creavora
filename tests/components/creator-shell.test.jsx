// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreatorLayout from "@/layouts/CreatorLayout";

const route = vi.hoisted(() => ({ pathname: "/studio/content" }));

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("creator shell", () => {
  beforeEach(() => {
    route.pathname = "/studio/content";
    vi.stubGlobal("fetch", vi.fn((url) => Promise.resolve(new Response(JSON.stringify(
      url === "/api/auth/me"
        ? { id: "creator-1", name: "Nisha", handle: "nisha", avatar: null, walletBalance: 0 }
        : [],
    ), { status: 200 }))));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("keeps the sidebar fixed and activates Content without activating Dashboard", async () => {
    render(<CreatorLayout><div>Creator content</div></CreatorLayout>);
    await waitFor(() => expect(screen.getAllByText("Nisha").length).toBeGreaterThan(0));

    const dashboard = screen.getByRole("link", { name: "Dashboard" });
    const content = screen.getByRole("link", { name: "Content" });
    expect(dashboard).not.toHaveClass("bg-brand-50");
    expect(content).toHaveClass("bg-brand-50");
    expect(content.closest("aside")).toHaveClass("fixed", "overflow-y-auto", "overscroll-contain");
  });

  it("submits creator searches to the real studio search route", () => {
    render(<CreatorLayout><div>Creator content</div></CreatorLayout>);
    const input = screen.getByRole("searchbox", { name: "Search creators, posts, and communities" });
    expect(input).toHaveAttribute("name", "q");
    expect(input.closest("form")).toHaveAttribute("action", "/studio/search");
    expect(input.closest("form")).toHaveAttribute("method", "get");
  });
});
