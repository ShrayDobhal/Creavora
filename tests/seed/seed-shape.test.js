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
});
