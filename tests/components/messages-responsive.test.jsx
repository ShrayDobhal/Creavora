// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import MessagesPage from "@/app/(fan)/messages/page";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("opens, reads, sends, and returns to conversations from the single phone pane at 320px", async () => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 320 });
  const participants = [
    { id: "creator-1", name: "Asha Rao", handle: "asha", avatar: null, roleTitle: "Artist" },
    { id: "creator-2", name: "Dev Shah", handle: "dev", avatar: null, roleTitle: "Coach" },
  ];
  const fetchMock = vi.fn((url, options = {}) => {
    const path = String(url);
    if (options.method === "POST") {
      return Promise.resolve(new Response(JSON.stringify({
        id: "message-sent",
        content: "Hello from mobile",
        mine: true,
        status: "SENT",
        createdAt: "2026-08-05T10:05:00.000Z",
      }), { status: 201 }));
    }
    if (path.includes("userId=")) {
      const participant = path.includes("creator-2") ? participants[1] : participants[0];
      return Promise.resolve(new Response(JSON.stringify({
        participant,
        items: [{
          id: `message-${participant.id}`,
          content: participant.id === "creator-2" ? "Mobile thread is readable" : "First thread",
          mine: false,
          status: "READ",
          createdAt: "2026-08-05T10:00:00.000Z",
        }],
      }), { status: 200 }));
    }
    return Promise.resolve(new Response(JSON.stringify({
      items: participants.map((participant) => ({
        participant,
        lastMessage: {
          id: `last-${participant.id}`,
          content: "Persisted message",
          mine: false,
          status: "READ",
          createdAt: "2026-08-05T09:55:00.000Z",
        },
      })),
    }), { status: 200 }));
  });
  vi.stubGlobal("fetch", fetchMock);

  render(<MessagesPage />);

  fireEvent.click(await screen.findByRole("button", { name: /Dev Shah/ }));
  expect(await screen.findByText("Mobile thread is readable")).toBeVisible();
  expect(screen.getByRole("button", { name: "Back to conversations" })).toBeVisible();
  expect(screen.getByRole("main", { name: "Messages workspace" })).toHaveClass(
    "flex-col",
    "overflow-x-hidden",
    "md:flex-row",
  );

  fireEvent.change(screen.getByRole("textbox", { name: "Message Dev Shah" }), {
    target: { value: "Hello from mobile" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));

  await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
    "/api/messages",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ receiverId: "creator-2", content: "Hello from mobile" }),
    }),
  ));

  fireEvent.click(screen.getByRole("button", { name: "Back to conversations" }));
  expect(screen.getByRole("heading", { name: "Messages" })).toBeVisible();
  expect(screen.getByRole("textbox", { name: "Message Dev Shah" }).closest(".hidden")).toHaveClass(
    "hidden",
    "md:flex",
  );
});

it("keeps mobile thread recovery controls available while a selected conversation loads or fails", async () => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 375 });
  const participant = { id: "creator-1", name: "Asha Rao", handle: "asha", avatar: null, roleTitle: "Artist" };
  let rejectThread;
  const fetchMock = vi.fn((url) => {
    if (String(url).includes("userId=")) {
      return new Promise((_, reject) => {
        rejectThread = reject;
      });
    }
    return Promise.resolve(new Response(JSON.stringify({
      items: [{
        participant,
        lastMessage: {
          id: "last-creator-1",
          content: "Persisted message",
          mine: false,
          status: "READ",
          createdAt: "2026-08-05T09:55:00.000Z",
        },
      }],
    }), { status: 200 }));
  });
  vi.stubGlobal("fetch", fetchMock);

  render(<MessagesPage />);

  fireEvent.click(await screen.findByRole("button", { name: /Asha Rao/ }));
  expect(screen.getByRole("status", { name: "" })).toHaveTextContent("Loading messages");
  expect(screen.getByRole("button", { name: "Back to conversations" })).toBeVisible();

  rejectThread(new Error("Thread request failed"));

  expect(await screen.findByRole("alert")).toHaveTextContent("Thread request failed");
  expect(screen.getByRole("button", { name: "Back to conversations" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Try again" })).toBeVisible();

  fireEvent.click(screen.getByRole("button", { name: "Back to conversations" }));
  expect(screen.queryByRole("button", { name: "Back to conversations" })).not.toBeInTheDocument();
});

it("opens a followed creator locally and promotes the starter after its first submitted message", async () => {
  const participant = { id: "creator-3", name: "Mina Das", handle: "mina", avatar: null, roleTitle: "Photographer", verified: true };
  const fetchMock = vi.fn((url, options = {}) => {
    if (options.method === "POST") {
      return Promise.resolve(new Response(JSON.stringify({
        id: "message-starter",
        content: "Hi Mina",
        mine: true,
        status: "SENT",
        createdAt: "2026-08-05T10:05:00.000Z",
      }), { status: 201 }));
    }
    return Promise.resolve(new Response(JSON.stringify({ items: [], suggestions: [participant] }), { status: 200 }));
  });
  vi.stubGlobal("fetch", fetchMock);

  render(<MessagesPage />);

  fireEvent.click(await screen.findByRole("button", { name: /Mina Das/ }));
  expect(await screen.findByText("No messages in this conversation yet.")).toBeVisible();
  expect(fetchMock).toHaveBeenCalledTimes(1);

  fireEvent.change(screen.getByRole("textbox", { name: "Message Mina Das" }), {
    target: { value: "Hi Mina" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));

  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  expect(fetchMock).toHaveBeenLastCalledWith(
    "/api/messages",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ receiverId: "creator-3", content: "Hi Mina" }),
    }),
  );
  expect(await screen.findByText("Hi Mina")).toBeVisible();

  fireEvent.click(screen.getByRole("button", { name: "Back to conversations" }));
  expect(screen.getByRole("button", { name: /Mina Das/ })).toBeVisible();
});
