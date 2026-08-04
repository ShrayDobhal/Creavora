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
