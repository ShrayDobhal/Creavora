// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const { push, getCreator } = vi.hoisted(() => ({
  push: vi.fn(),
  getCreator: vi.fn().mockResolvedValue({
    creator: {
      id: "creator-1",
      name: "Asha Rao",
      handle: "asha-rao",
      avatar: "https://cdn.example.test/asha.jpg",
      subscriptionPrice: 499,
    },
    posts: [],
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams("creator=asha-rao"),
}));

vi.mock("@/services/consumer-api", () => ({
  getCreator,
  createPaymentOrder: vi.fn(),
  verifyPayment: vi.fn(),
}));

import CheckoutPage from "@/app/checkout/page";

afterEach(() => cleanup());

it("shows the creator's database price and Razorpay payment choices", async () => {
  render(<CheckoutPage />);

  await waitFor(() => expect(getCreator).toHaveBeenCalledWith(expect.objectContaining({ handle: "asha-rao" })));
  expect(await screen.findByRole("heading", { name: "Asha Rao" })).toBeVisible();
  expect(screen.getAllByText(/₹499/).length).toBeGreaterThan(0);
  expect(screen.getByText("UPI")).toBeVisible();
  expect(screen.getByText("Cards")).toBeVisible();
  expect(screen.getByText("Net banking")).toBeVisible();
  expect(screen.getByRole("button", { name: "Pay ₹499 securely" })).toBeEnabled();
});
