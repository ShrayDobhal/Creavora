// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import NotificationsPage from "@/app/(fan)/notifications/page";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const notificationItems = [
  {
    id: "notification-1",
    title: "Studio update",
    message: "A persisted post is ready",
    type: "LIKE",
    read: false,
    createdAt: "2026-08-05T10:00:00.000Z",
  },
  {
    id: "notification-2",
    title: "Account notice",
    message: "Your settings were saved",
    type: "SYSTEM",
    read: true,
    createdAt: "2026-08-05T09:00:00.000Z",
  },
];

it("persists per-row removal and clearing without fabricating an actor", async () => {
  const fetchMock = vi.fn((url, options = {}) => Promise.resolve(new Response(
    JSON.stringify(options.method === "DELETE"
      ? { success: true, deletedCount: 1 }
      : notificationItems),
    { status: 200 },
  )));
  vi.stubGlobal("fetch", fetchMock);

  render(<NotificationsPage />);

  expect(await screen.findByText("Studio update")).toBeVisible();
  expect(screen.queryByText("Ananya Sharma")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Remove Studio update" }));

  await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
    "/api/notifications?id=notification-1",
    expect.objectContaining({ method: "DELETE" }),
  ));
  await waitFor(() => expect(screen.queryByText("Studio update")).not.toBeInTheDocument());

  fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
    "/api/notifications",
    expect.objectContaining({ method: "DELETE" }),
  ));
  expect(await screen.findByText("Inbox is clean!")).toBeVisible();
});

it("shows an honest load error instead of a clean inbox for a failed response", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
    JSON.stringify({ error: "Notifications unavailable" }),
    { status: 503 },
  )));

  render(<NotificationsPage />);

  expect(await screen.findByRole("alert")).toHaveTextContent("Notifications unavailable");
  expect(screen.queryByText("Inbox is clean!")).not.toBeInTheDocument();
});
