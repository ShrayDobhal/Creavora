// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));

import RegisterPage from "@/app/(auth)/register/page";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("lets fans join with Google directly and reserves handle selection for creators", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
    JSON.stringify({ handle: "new_member", available: true }),
    { status: 200, headers: { "content-type": "application/json" } },
  )));
  render(<RegisterPage />);

  expect(screen.getByRole("button", { name: "Join as User" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.queryByLabelText(/full name|email|password/i)).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Choose your handle")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: /continue with google/i })).toHaveAttribute(
    "href",
    "/api/auth/google/start?role=USER&redirect=%2F",
  );

  fireEvent.click(screen.getByRole("button", { name: "Join as Creator" }));
  expect(screen.queryByRole("link", { name: /continue with google/i })).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Choose your handle"), { target: { value: "New_Member" } });

  expect(await screen.findByText("@new_member is available", {}, { timeout: 1500 })).toBeVisible();
  expect(screen.getByRole("link", { name: /continue with google/i })).toHaveAttribute(
    "href",
    "/api/auth/google/start?intent=register&role=CREATOR&handle=new_member&redirect=%2Fstudio%2Fcontent",
  );
});
