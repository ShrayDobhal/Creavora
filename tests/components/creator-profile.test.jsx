// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useParams: () => ({ handle: "missing-creator" }),
}));

import CreatorProfilePage from "@/app/(fan)/creator/[handle]/page";

describe("Creator profile", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows a failed profile request with a retry action", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Creator not found" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    render(<CreatorProfilePage />);

    expect(await screen.findByText("Creator not found")).toBeVisible();
    expect(screen.getByRole("button", { name: "Try again" })).toBeVisible();
    expect(screen.queryByText("Loading")).not.toBeInTheDocument();
  });

  it("does not display an unknown subscriber count as zero", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            creator: {
              id: "creator-1",
              name: "Leela Menon",
              handle: "missing-creator",
              avatar: null,
              coverImage: null,
              roleTitle: "Mural artist",
              bio: null,
              verified: true,
              isFollowing: false,
            },
            posts: [],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    render(<CreatorProfilePage />);

    expect(await screen.findByRole("heading", { name: /Leela Menon/i })).toBeVisible();
    expect(screen.queryByText("Subscribers")).not.toBeInTheDocument();
  });
});
