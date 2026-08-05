import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authenticate: vi.fn(),
  subscriptionCount: vi.fn(),
  followCount: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    subscription: { count: mocks.subscriptionCount },
    follow: { count: mocks.followCount },
  },
}));
vi.mock("@/lib/middleware", () => ({ authenticate: mocks.authenticate }));

import { GET } from "@/app/api/auth/me/route";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.subscriptionCount.mockResolvedValue(2);
  mocks.followCount.mockResolvedValueOnce(7).mockResolvedValueOnce(3);
});

it("keeps detailed address out of the authenticated identity response", async () => {
  mocks.authenticate.mockResolvedValue({
    user: {
      id: "user-1",
      name: "Neha Rao",
      email: "neha@example.test",
      handle: "neha-runs",
      role: "USER",
      address: "Bandra West, Mumbai 400050",
      passwordHash: "secret-hash",
      deletedAt: null,
    },
  });

  const response = await GET(new Request("http://localhost/api/auth/me"));
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body).toMatchObject({
    id: "user-1",
    activeSubsCount: 2,
    followersCount: 7,
    followingCount: 3,
  });
  expect(body).not.toHaveProperty("address");
  expect(body).not.toHaveProperty("passwordHash");
});
