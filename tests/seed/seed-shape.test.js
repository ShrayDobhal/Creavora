import { describe, expect, it } from "vitest";

describe("development seed", () => {
  it("defines every Blindly launch category and never runs when NODE_ENV is production", async () => {
    const { CATEGORY_OPTIONS, LAUNCH_CATEGORIES, runSeed } = await import("../../prisma/seed.mjs");

    expect(LAUNCH_CATEGORIES).toEqual([
      "Fitness",
      "Sports",
      "Technology",
      "Fashion",
      "Food",
      "Travel",
      "Education",
      "Music",
      "Art",
      "Comedy",
      "Gaming",
      "Lifestyle",
    ]);
    expect(CATEGORY_OPTIONS).toEqual(expect.arrayContaining(LAUNCH_CATEGORIES));
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

  it("only permits the development environment before connecting", async () => {
    const { runSeed } = await import("../../prisma/seed.mjs");

    await expect(
      runSeed({
        NODE_ENV: "test",
        SEED_DATABASE_URL: "postgresql://creavora:creavora@localhost:5432/creavora_seed",
        SEED_DEVELOPMENT_CONFIRMATION: "local-development",
      }),
    ).rejects.toThrow("Seed data is only enabled when NODE_ENV=development");
  });

  it("rejects a seed URL that matches the application database", async () => {
    const { runSeed } = await import("../../prisma/seed.mjs");
    const databaseUrl = "postgresql://creavora:creavora@localhost:5432/creavora_seed";

    await expect(
      runSeed({
        NODE_ENV: "development",
        DATABASE_URL: databaseUrl,
        SEED_DATABASE_URL: databaseUrl,
        SEED_DEVELOPMENT_CONFIRMATION: "local-development",
      }),
    ).rejects.toThrow("SEED_DATABASE_URL must differ from DATABASE_URL before seeding");
  });

  it("rejects equivalent seed and application URLs with different query strings", async () => {
    const { runSeed } = await import("../../prisma/seed.mjs");

    await expect(
      runSeed({
        NODE_ENV: "development",
        DATABASE_URL: "postgresql://creavora:creavora@localhost:5432/creavora_seed?sslmode=disable",
        SEED_DATABASE_URL: "postgresql://creavora:creavora@localhost:5432/creavora_seed?application_name=seed",
        SEED_DEVELOPMENT_CONFIRMATION: "local-development",
      }),
    ).rejects.toThrow("SEED_DATABASE_URL must differ from DATABASE_URL before seeding");
  });

  it("requires an explicit local-development confirmation before connecting", async () => {
    const { runSeed } = await import("../../prisma/seed.mjs");

    await expect(
      runSeed({
        NODE_ENV: "development",
        DATABASE_URL: "postgresql://creavora:creavora@localhost:5432/creavora_app",
        SEED_DATABASE_URL: "postgresql://creavora:creavora@localhost:5432/creavora_seed",
      }),
    ).rejects.toThrow("Set SEED_DEVELOPMENT_CONFIRMATION=local-development before seeding");
  });

  it("requires an application database URL to prove the seed target is separate", async () => {
    const { runSeed } = await import("../../prisma/seed.mjs");

    await expect(
      runSeed({
        NODE_ENV: "development",
        SEED_DATABASE_URL: "postgresql://creavora:creavora@localhost:5432/creavora_seed",
        SEED_DEVELOPMENT_CONFIRMATION: "local-development",
      }),
    ).rejects.toThrow("DATABASE_URL must be configured separately before seeding");
  });

  it("rejects a non-local dedicated seed database before connecting", async () => {
    const { runSeed } = await import("../../prisma/seed.mjs");

    await expect(
      runSeed({
        NODE_ENV: "development",
        DATABASE_URL: "postgresql://creavora:creavora@localhost:5432/creavora_app",
        SEED_DATABASE_URL: "postgresql://creavora:creavora@db.example.test:5432/creavora_seed",
        SEED_DEVELOPMENT_CONFIRMATION: "local-development",
      }),
    ).rejects.toThrow("Seed data is only allowed for a local PostgreSQL DATABASE_URL");
  });

  it("clears stale creator aggregates through the repeat-seed upsert update", async () => {
    const { upsertCreatorProfile } = await import("../../prisma/seed.mjs");
    const profile = {
      userId: "creator-1",
      category: "Legacy",
      subscriberCount: 2500,
      monthlyRevenue: 18000,
      totalEarnings: 72000,
      availableBalance: 18000,
    };
    const db = {
      creatorProfile: {
        upsert: async ({ update }) => Object.assign(profile, update),
      },
    };

    await upsertCreatorProfile(db, "creator-1", "Food");

    expect(profile).toMatchObject({
      category: "Food",
      subscriberCount: 0,
      monthlyRevenue: 0,
      totalEarnings: 0,
      availableBalance: 0,
    });
  });
});
