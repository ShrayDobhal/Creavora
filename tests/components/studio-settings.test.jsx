// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import StudioSettingsPage from "@/app/(studio)/studio/settings/page";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("creator subscription pricing UI", () => {
  it("loads and persists the creator's chosen monthly charge", async () => {
    const fetchMock = vi.fn((url, options = {}) => Promise.resolve(new Response(
      JSON.stringify(options.method === "PATCH"
        ? { name: "Asha Rao", bio: "Textile artist", category: "Art", subscriptionPrice: 749 }
        : String(url) === "/api/profile"
          ? { name: "Asha Rao", bio: "Textile artist", handle: "asha", profileVisibility: "PUBLIC", counts: { followers: 4, following: 2, posts: 3 } }
          : { name: "Asha Rao", bio: "Textile artist", category: "Art", subscriptionPrice: 499, payoutMethod: "UPI", payoutDetails: "" }),
      { status: 200, headers: { "content-type": "application/json" } },
    )));
    vi.stubGlobal("fetch", fetchMock);

    render(<StudioSettingsPage />);

    const price = await screen.findByLabelText("Monthly price in INR");
    expect(price.value).toBe("499");
    expect(screen.getByLabelText("Upload avatar")).toBeInTheDocument();
    expect(screen.getByLabelText("Upload cover image")).toBeInTheDocument();
    fireEvent.change(price, { target: { value: "749" } });
    fireEvent.click(screen.getByRole("button", { name: "Save subscription" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/studio/settings",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          name: "Asha Rao",
          bio: "Textile artist",
          category: "Art",
          subscriptionPrice: 749,
          payoutMethod: "UPI",
          payoutDetails: "",
        }),
      }),
    ));
    expect((await screen.findByRole("status")).textContent).toContain("Subscription settings saved");
  });
});
