// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { Tabs } from "@/ui/Bits.jsx";

afterEach(cleanup);

it("keeps long creator tab sets inside a horizontal scroll frame", () => {
  render(<Tabs items={["Feed", "Discussions", "Announcements", "Rooms", "Events", "Members", "Leaderboard"]} value="Feed" />);
  const feed = screen.getByRole("button", { name: "Feed" });
  expect(feed).toHaveClass("shrink-0");
  expect(feed.parentElement).toHaveClass("max-w-full", "overflow-x-auto");
});
