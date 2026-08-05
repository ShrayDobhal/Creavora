// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import MessagesPage from "@/app/(fan)/messages/page";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("opens, reads, and sends from the thread pane at a 375px viewport", async () => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 375 });
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
});
