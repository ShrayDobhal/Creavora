// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import SubscribersPage from "@/app/(studio)/studio/subscribers/page";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("renders persisted subscribers and links into the creator message workspace", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
    items: [{
      id: "subscription-1",
      tier: "Premium Monthly",
      price: 499,
      method: "UPI",
      renewsOn: "2026-09-07",
      status: "ACTIVE",
      user: { id: "fan-1", name: "Riya Shah", handle: "riya", avatar: null },
    }],
  }), { status: 200 })));

  render(<SubscribersPage />);

  expect(await screen.findByRole("heading", { name: "Riya Shah" })).toBeVisible();
  expect(screen.getByText("₹499")).toBeVisible();
  expect(screen.getByRole("link", { name: "Message subscriber" })).toHaveAttribute("href", "/studio/messages?userId=fan-1");
});
