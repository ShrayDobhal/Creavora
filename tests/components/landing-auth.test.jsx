// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Landing from "@/app/landing/page";
import { TopBar } from "@/layouts/FanLayout";

describe("Landing auth entry points", () => {
  afterEach(cleanup);

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
    expect(screen.getByRole("link", { name: /browse live discovery/i })).toHaveAttribute(
      "href",
      "/explore",
    );
    expect(screen.getByRole("link", { name: /open the following feed/i })).toHaveAttribute(
      "href",
      "/feed",
    );
    expect(screen.getByRole("link", { name: /review saved posts/i })).toHaveAttribute(
      "href",
      "/saved",
    );
  });
});

describe("Fan navigation", () => {
  afterEach(cleanup);

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
  });
});
