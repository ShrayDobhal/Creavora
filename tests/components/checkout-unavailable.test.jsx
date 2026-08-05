// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import CheckoutPage from "@/app/checkout/page";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("renders checkout as a truthful unavailable Blindly route", () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ walletBalance: 0 }), { status: 200 }),
  ));

  render(<CheckoutPage />);

  expect(screen.getByRole("heading", { name: "Checkout is not available yet" })).toBeVisible();
  expect(screen.getByText(/Blindly subscriptions and payments are unavailable/i)).toBeVisible();
  expect(screen.queryByRole("button", { name: /pay.+securely/i })).not.toBeInTheDocument();
  expect(screen.queryAllByText(/Crevora|Available balance|XP rewarded|₹499|₹1,299|₹4,999/i)).toHaveLength(0);
});
