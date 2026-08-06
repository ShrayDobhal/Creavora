import { beforeEach, expect, it, vi } from "vitest";

const notification = vi.hoisted(() => ({
  findMany: vi.fn(),
  updateMany: vi.fn(),
  deleteMany: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ db: { notification } }));
vi.mock("@/lib/middleware", () => ({ withAuth: (handler) => handler }));

import * as notificationRoute from "@/app/api/notifications/route";

beforeEach(() => {
  vi.clearAllMocks();
  notification.updateMany.mockResolvedValue({ count: 1 });
  notification.deleteMany.mockResolvedValue({ count: 1 });
});

it("marks one notification read only inside the authenticated inbox", async () => {
  const response = await notificationRoute.POST(
    new Request("http://localhost/api/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: "notification-1" }),
    }),
    { user: { id: "viewer-1" } },
  );

  expect(response.status).toBe(200);
  expect(notification.updateMany).toHaveBeenCalledWith({
    where: { id: "notification-1", userId: "viewer-1", read: false },
    data: { read: true },
  });
});

it("deletes one persisted notification only within the authenticated inbox", async () => {
  expect(notificationRoute.DELETE).toBeTypeOf("function");

  const response = await notificationRoute.DELETE(
    new Request("http://localhost/api/notifications?id=notification-1", { method: "DELETE" }),
    { user: { id: "viewer-1" } },
  );

  expect(response.status).toBe(200);
  expect(notification.deleteMany).toHaveBeenCalledWith({
    where: { id: "notification-1", userId: "viewer-1" },
  });
  expect(await response.json()).toEqual({ success: true, deletedCount: 1 });
});

it("clears only the authenticated user's persisted notifications", async () => {
  expect(notificationRoute.DELETE).toBeTypeOf("function");

  await notificationRoute.DELETE(
    new Request("http://localhost/api/notifications", { method: "DELETE" }),
    { user: { id: "viewer-1" } },
  );

  expect(notification.deleteMany).toHaveBeenCalledWith({
    where: { userId: "viewer-1" },
  });
});
