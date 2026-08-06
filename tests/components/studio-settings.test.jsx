// @vitest-environment jsdom
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
    const fetchMock = vi.fn((_url, options = {}) => Promise.resolve(new Response(
      JSON.stringify(options.method === "PATCH"
        ? { name: "Asha Rao", bio: "Textile artist", category: "Art", subscriptionPrice: 749 }
        : { name: "Asha Rao", bio: "Textile artist", category: "Art", subscriptionPrice: 499 }),
      { status: 200, headers: { "content-type": "application/json" } },
    )));
    vi.stubGlobal("fetch", fetchMock);

    render(<StudioSettingsPage />);

    const price = await screen.findByLabelText("Monthly price in INR");
    expect(price.value).toBe("499");
    fireEvent.change(price, { target: { value: "749" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/studio/settings",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          name: "Asha Rao",
          bio: "Textile artist",
          category: "Art",
          subscriptionPrice: 749,
        }),
      }),
    ));
    expect((await screen.findByRole("status")).textContent).toContain("Changes saved");
  });
});
