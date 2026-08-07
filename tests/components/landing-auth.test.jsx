// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/feed",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

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
    expect(screen.getByRole("link", { name: /join blindly/i })).toHaveAttribute(
      "href",
      "/register",
    );
    expect(screen.getByRole("link", { name: /create a fan account/i })).toHaveAttribute(
      "href",
      "/register?role=USER",
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

  it("connects useful landing content to product routes visitors can open", () => {
    render(<Landing />);

    expect(
      screen.getByRole("heading", { name: /discover the work and keep the connection/i }),
    ).toBeVisible();
    expect(
      screen.getByText(/move naturally from a creator profile/i),
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

    expect(screen.getByRole("link", { name: /explore blindly/i })).toHaveAttribute(
      "href",
      "/explore",
    );
    expect(screen.queryByPlaceholderText(/search creators/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /create/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Blindly" })).toHaveAttribute(
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

  it("advertises the consumer workspace destinations without premium upsells", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );
    const { container } = render(<FanLayout><p>Release content</p></FanLayout>);

    [
      ["Home", "/home"],
      ["Feed", "/feed"],
      ["Explore", "/explore"],
      ["Live", "/live"],
      ["Subscriptions", "/subscriptions"],
      ["Messages", "/messages"],
      ["Notifications", "/notifications"],
      ["Collections", "/collections"],
      ["Wallet", "/wallet"],
      ["Rewards", "/rewards"],
      ["Saved Posts", "/saved"],
      ["Settings", "/settings"],
    ].forEach(([label, href]) => {
      screen.getAllByRole("link", { name: label }).forEach((link) =>
        expect(link).toHaveAttribute("href", href),
      );
    });
    ["Go Premium", "Upgrade Now"].forEach((label) => expect(screen.queryByText(label)).not.toBeInTheDocument());
    expect(container).not.toHaveTextContent(/premium|subscribe|unlock|upgrade|₹/i);
  });

  it("keeps successful notification state when the identity request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((path) => {
        if (path === "/api/auth/me") return Promise.reject(new Error("Identity unavailable"));
        return Promise.resolve(
          new Response(JSON.stringify([{ id: "notice-1", read: false }]), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
        );
      }),
    );

    render(<FanLayout><p>Release content</p></FanLayout>);

    expect((await screen.findAllByText("1")).length).toBeGreaterThan(0);
  });

  it("clears the user notification badge immediately and persists all notifications as read", async () => {
    let markedRead = false;
    const fetchMock = vi.fn((path, options = {}) => {
      if (path === "/api/auth/me") {
        return Promise.resolve(new Response(JSON.stringify({ name: "Leela Menon", handle: "leela" }), { status: 200 }));
      }
      if (path === "/api/notifications" && options.method === "POST") {
        markedRead = true;
        return Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify(markedRead ? [] : [{ id: "notice-1", read: false }]), { status: 200 }));
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<FanLayout><p>Release content</p></FanLayout>);
    expect((await screen.findAllByText("1")).length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole("link", { name: "Notifications" })[0]);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/notifications",
      expect.objectContaining({ method: "POST" }),
    ));
    await waitFor(() => expect(screen.queryAllByText("1")).toHaveLength(0));
  });

  it("keeps successful identity state when the notification request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((path) => {
        if (path === "/api/notifications") {
          return Promise.reject(new Error("Notifications unavailable"));
        }
        return Promise.resolve(
          new Response(JSON.stringify({ name: "Leela Menon", handle: "leela" }), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
        );
      }),
    );

    render(<FanLayout><p>Release content</p></FanLayout>);

    expect(await screen.findByText("Leela Menon")).toBeVisible();
    expect(screen.getByText("@leela")).toBeVisible();
  });

  it("refreshes identity and notifications after in-session update events", async () => {
    let userRequest = 0;
    let notificationRequest = 0;
    const fetchMock = vi.fn((path) => {
      if (path === "/api/auth/me") {
        userRequest += 1;
        const user = userRequest === 1
          ? { name: "Initial User", handle: "initial" }
          : { name: "Updated User", handle: "updated" };
        return Promise.resolve(
          new Response(JSON.stringify(user), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
        );
      }
      notificationRequest += 1;
      const notifications = notificationRequest === 1
        ? []
        : [{ id: "notice-1", read: false }, { id: "notice-2", read: false }];
      return Promise.resolve(
        new Response(JSON.stringify(notifications), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<FanLayout><p>Release content</p></FanLayout>);
    expect(await screen.findByText("Initial User")).toBeVisible();

    await act(async () => window.dispatchEvent(new Event("user-update")));
    expect(await screen.findByText("Updated User")).toBeVisible();
    expect(notificationRequest).toBe(1);

    await act(async () => window.dispatchEvent(new Event("notifications-update")));
    expect((await screen.findAllByText("2")).length).toBeGreaterThan(0);
    expect(userRequest).toBe(2);
  });
});
