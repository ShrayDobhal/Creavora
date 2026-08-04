// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/feed" }));

import Landing from "@/app/landing/page";
import FanLayout, { TopBar } from "@/layouts/FanLayout";
import { CATEGORY_OPTIONS } from "@/lib/consumer/constants";

describe("Landing auth entry points", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders separate normal-user and creator login entry points", () => {
    render(<Landing />);

    const userLoginLinks = screen.getAllByRole("link", { name: /user login/i });
    expect(userLoginLinks.length).toBeGreaterThan(0);
    userLoginLinks.forEach((link) => expect(link).toHaveAttribute("href", "/login"));
    expect(screen.getByRole("link", { name: /join creavora/i })).toHaveAttribute(
      "href",
      "/register",
    );
    expect(screen.getByRole("link", { name: /creator login/i })).toHaveAttribute(
      "href",
      "/creator-login",
    );
  });

  it("uses real destinations instead of placeholder landing controls", () => {
    const { container } = render(<Landing />);

    expect(container.querySelector('a[href="#"]')).not.toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.getByRole("link", { name: /browse active creator profiles/i })).toHaveAttribute(
      "href",
      "/explore",
    );
  });

  it("grounds community proof in product routes visitors can inspect", () => {
    render(<Landing />);

    expect(
      screen.getByRole("heading", { name: /community proof you can inspect/i }),
    ).toBeVisible();
    expect(
      screen.getByText(/no anonymous testimonials or inflated totals/i),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: /browse discovery/i })).toHaveAttribute(
      "href",
      "/explore",
    );
    expect(screen.getByRole("link", { name: /open the following feed/i })).toHaveAttribute(
      "href",
      "/feed",
    );
    expect(screen.queryByRole("link", { name: /saved|collection/i })).not.toBeInTheDocument();
  });

  it("renders the shared release taxonomy instead of a landing-only category list", () => {
    render(<Landing />);

    CATEGORY_OPTIONS.forEach((category) => {
      expect(screen.getByText(category)).toBeVisible();
    });
    expect(screen.queryByText("Business")).not.toBeInTheDocument();
  });
});

describe("Fan navigation", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("offers a real Explore destination without inert search or create controls", () => {
    render(<TopBar />);

    expect(screen.getByRole("link", { name: /explore creavora/i })).toHaveAttribute(
      "href",
      "/explore",
    );
    expect(screen.queryByPlaceholderText(/search creators/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /create/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Creavora" })).toHaveAttribute(
      "href",
      "/landing",
    );
    expect(screen.queryAllByText(/Arjun|premium fan|wallet balance/i)).toHaveLength(0);
    expect(screen.queryByText("120")).not.toBeInTheDocument();
  });

  it("renders only the loaded account identity with a neutral initials avatar", () => {
    render(<TopBar user={{ name: "Leela Menon", handle: "leela" }} />);

    expect(screen.getByLabelText("Leela Menon avatar")).toHaveTextContent("LM");
    expect(screen.getByText("Leela Menon")).toBeVisible();
    expect(screen.getByText("@leela")).toBeVisible();
  });

  it("advertises only database-backed release routes in consumer navigation", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );
    render(<FanLayout><p>Release content</p></FanLayout>);

    expect(screen.getByRole("link", { name: "Feed" })).toHaveAttribute("href", "/feed");
    expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute("href", "/explore");
    screen.getAllByRole("link", { name: "Notifications" }).forEach((link) =>
      expect(link).toHaveAttribute("href", "/notifications"),
    );
    [
      "Live Now",
      "Subscriptions",
      "Messages",
      "Collections",
      "My Wallet",
      "Earn Rewards",
      "Saved Posts",
      "Go Premium",
      "Upgrade Now",
    ].forEach((label) => expect(screen.queryByText(label)).not.toBeInTheDocument());
  });
});
