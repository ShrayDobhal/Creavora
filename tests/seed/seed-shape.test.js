import { describe, expect, it } from "vitest";

describe("development seed", () => {
  it("defines Indian-market creator categories and never runs when NODE_ENV is production", async () => {
    const { CATEGORY_OPTIONS, runSeed } = await import("../../prisma/seed.mjs");

    expect(CATEGORY_OPTIONS).toContain("Food");
    expect(CATEGORY_OPTIONS).toEqual(
      expect.arrayContaining([
        "Fashion",
        "Fitness",
        "Gaming",
        "Education",
        "Music",
        "Travel",
        "Art",
        "Comedy",
        "Technology",
      ]),
    );
    await expect(runSeed({ NODE_ENV: "production" })).rejects.toThrow(
      "Seed data is disabled in production",
    );
  });

  it("requires an explicit development-only seed database before connecting", async () => {
    const { runSeed } = await import("../../prisma/seed.mjs");

    await expect(
      runSeed({
        NODE_ENV: "development",
        DATABASE_URL: "postgresql://creavora:creavora@localhost:5432/creavora_dev",
      }),
    ).rejects.toThrow("SEED_DATABASE_URL must point to a local development database before seeding");
  });

  it("requires an explicit local-development confirmation before connecting", async () => {
    const { runSeed } = await import("../../prisma/seed.mjs");

    await expect(
      runSeed({
        NODE_ENV: "development",
        SEED_DATABASE_URL: "postgresql://creavora:creavora@localhost:5432/creavora_seed",
      }),
    ).rejects.toThrow("Set SEED_DEVELOPMENT_CONFIRMATION=local-development before seeding");
  });

  it("rejects a non-local dedicated seed database before connecting", async () => {
    const { runSeed } = await import("../../prisma/seed.mjs");

    await expect(
      runSeed({
        NODE_ENV: "development",
        SEED_DATABASE_URL: "postgresql://creavora:creavora@db.example.test:5432/creavora_seed",
        SEED_DEVELOPMENT_CONFIRMATION: "local-development",
      }),
    ).rejects.toThrow("Seed data is only allowed for a local PostgreSQL DATABASE_URL");
  });
});
