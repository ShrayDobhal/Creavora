import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));

import { createHandleAvailabilityGet } from "@/app/api/auth/handle-availability/route";

describe("handle availability", () => {
  it("normalizes and confirms an unused handle without caching", async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const response = await createHandleAvailabilityGet({ user: { findFirst } })(
      new Request("http://localhost/api/auth/handle-availability?handle=%40My_Handle"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ handle: "my_handle", available: true });
  });

  it("reports a taken handle and rejects malformed values", async () => {
    const findFirst = vi.fn().mockResolvedValue({ id: "user-1" });
    const handler = createHandleAvailabilityGet({ user: { findFirst } });
    const taken = await handler(new Request("http://localhost/api/auth/handle-availability?handle=member_one"));
    const malformed = await handler(new Request("http://localhost/api/auth/handle-availability?handle=no%20spaces"));

    expect(await taken.json()).toEqual({ handle: "member_one", available: false });
    expect(malformed.status).toBe(400);
  });
});
