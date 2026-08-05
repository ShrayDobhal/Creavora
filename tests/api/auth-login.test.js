import { expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));

import { POST } from "@/app/api/auth/login/route";

it("returns a client error when the login body is malformed JSON", async () => {
  const response = await POST(
    new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    }),
  );

  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: "Invalid JSON body" });
});
