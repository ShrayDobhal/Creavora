import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { fileURLToPath } from "node:url";
import path from "node:path";

// This script is intentionally limited to local development databases.
export const CATEGORY_OPTIONS = [
  "Food",
  "Fashion",
  "Fitness",
  "Gaming",
  "Education",
  "Music",
  "Travel",
  "Art",
  "Comedy",
  "Technology",
];

const LOCAL_DATABASE_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const DEFAULT_PASSWORD = "Test1234";

const creators = [
  ["aisha-bites", "Aisha Khan", "Food", "Mumbai", "Regional recipes and street-food stories from Mumbai."],
  ["meher-drapes", "Meher Iyer", "Fashion", "Chennai", "Handloom, styling, and thoughtful Indian fashion."],
  ["coach-kabir", "Kabir Mehta", "Fitness", "Delhi", "Strength training, yoga, and sustainable routines."],
  ["rohit-plays", "Rohit Verma", "Gaming", "Pune", "BGMI strategy, esports, and game-night energy."],
  ["naina-learns", "Naina Bose", "Education", "Kolkata", "Practical study systems and career learning."],
  ["raga-rhea", "Rhea Menon", "Music", "Bengaluru", "Indie music, songwriting, and Carnatic experiments."],
  ["wandering-aman", "Aman Sood", "Travel", "Shimla", "Slow travel through the Himalayas and beyond."],
  ["canvas-tara", "Tara Das", "Art", "Kolkata", "Illustration, murals, and a bright sketchbook."],
  ["comic-isha", "Isha Patel", "Comedy", "Ahmedabad", "Observations from Indian family group chats."],
  ["tech-with-vihaan", "Vihaan Rao", "Technology", "Hyderabad", "Friendly guides to Indian tech and tools."],
].map(([handle, name, category, city, bio], index) => ({
  handle,
  name,
  category,
  city,
  bio,
  email: `${handle}@seed.creavora.test`,
  avatar: `https://images.unsplash.com/photo-${1500000000000 + index}?auto=format&fit=crop&w=500&q=80`,
  coverImage: `https://images.unsplash.com/photo-${1510000000000 + index}?auto=format&fit=crop&w=1200&q=80`,
}));

function databaseUrlFor(env) {
  if (env.NODE_ENV !== "development") {
    if (env.NODE_ENV === "production") {
      throw new Error("Seed data is disabled in production");
    }
    throw new Error("Seed data is only enabled when NODE_ENV=development");
  }

  if (!env.SEED_DATABASE_URL) {
    throw new Error("SEED_DATABASE_URL must point to a local development database before seeding");
  }

  if (env.SEED_DEVELOPMENT_CONFIRMATION !== "local-development") {
    throw new Error("Set SEED_DEVELOPMENT_CONFIRMATION=local-development before seeding");
  }

  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be configured separately before seeding");
  }

  let parsed;
  try {
    parsed = new URL(env.SEED_DATABASE_URL);
  } catch {
    throw new Error("DATABASE_URL must be a valid local PostgreSQL URL before seeding");
  }

  let applicationDatabase;
  try {
    applicationDatabase = new URL(env.DATABASE_URL);
  } catch {
    throw new Error("DATABASE_URL must be a valid application database URL before seeding");
  }

  const seedPort = parsed.port || "5432";
  const applicationPort = applicationDatabase.port || "5432";
  if (
    parsed.hostname === applicationDatabase.hostname
    && seedPort === applicationPort
    && parsed.pathname === applicationDatabase.pathname
  ) {
    throw new Error("SEED_DATABASE_URL must differ from DATABASE_URL before seeding");
  }

  if (!parsed.protocol.startsWith("postgres") || !LOCAL_DATABASE_HOSTS.has(parsed.hostname)) {
    throw new Error("Seed data is only allowed for a local PostgreSQL DATABASE_URL");
  }

  return env.SEED_DATABASE_URL;
}

function createClient(databaseUrl) {
  return new PrismaClient({ adapter: new PrismaPg(databaseUrl) });
}

async function upsertUser(db, user, passwordHash) {
  return db.user.upsert({
    where: { email: user.email },
    update: {
      name: user.name,
      handle: user.handle,
      passwordHash,
      avatar: user.avatar,
      role: user.role,
      bio: user.bio,
      coverImage: user.coverImage,
      roleTitle: user.roleTitle,
      verified: user.verified,
    },
    create: { ...user, passwordHash },
  });
}

async function syncPostEngagement(db, posts) {
  for (const post of posts) {
    const [likesCount, commentsCount] = await Promise.all([
      db.like.count({ where: { postId: post.id } }),
      db.comment.count({ where: { postId: post.id } }),
    ]);
    await db.post.update({ where: { id: post.id }, data: { likesCount, commentsCount } });
  }
}

export async function upsertCreatorProfile(db, userId, category) {
  return db.creatorProfile.upsert({
    where: { userId },
    update: {
      category,
      subscriberCount: 0,
      monthlyRevenue: 0,
      totalEarnings: 0,
      availableBalance: 0,
    },
    create: { userId, category },
  });
}

export async function runSeed(env = process.env) {
  const databaseUrl = databaseUrlFor(env);
  const db = createClient(databaseUrl);

  try {
    const passwordHash = await bcrypt.hash(env.SEED_PASSWORD || DEFAULT_PASSWORD, 10);
    const fans = await Promise.all([
      upsertUser(db, {
        name: "Arjun Singh",
        email: "arjun@seed.creavora.test",
        handle: "arjun-seed",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=80",
        role: "FAN",
        bio: "Discovering independent Indian creators.",
        verified: false,
      }, passwordHash),
      upsertUser(db, {
        name: "Pooja Nair",
        email: "pooja@seed.creavora.test",
        handle: "pooja-seed",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
        role: "FAN",
        bio: "A curious supporter of art, food, and travel.",
        verified: false,
      }, passwordHash),
    ]);

    const seededCreators = [];
    for (const creator of creators) {
      const user = await upsertUser(db, {
        name: creator.name,
        email: creator.email,
        handle: creator.handle,
        avatar: creator.avatar,
        coverImage: creator.coverImage,
        role: "CREATOR",
        roleTitle: `${creator.category} Creator`,
        bio: `${creator.bio} Based in ${creator.city}, India.`,
        verified: true,
      }, passwordHash);
      seededCreators.push({ ...creator, user });
      await upsertCreatorProfile(db, user.id, creator.category);
    }

    // Posts have no natural unique key in the schema. Replacing posts owned by the
    // dedicated seed accounts makes this repeatable without touching real local users.
    await db.post.deleteMany({ where: { creatorId: { in: seededCreators.map(({ user }) => user.id) } } });
    const posts = [];
    for (const creator of seededCreators) {
      posts.push(await db.post.create({
        data: {
          creatorId: creator.user.id,
          content: `${creator.category} from ${creator.city}: a fresh creator note for the Creavora community.`,
          mediaUrl: creator.coverImage,
          mediaType: "image",
          isPremium: creator.category === "Education" || creator.category === "Fitness",
          price: creator.category === "Education" || creator.category === "Fitness" ? 149 : 0,
          likesCount: 0,
          commentsCount: 0,
          viewsCount: 0,
          publishedAt: new Date("2026-08-01T09:00:00.000Z"),
        },
      }));
    }

    for (const creator of seededCreators) {
      await db.follow.upsert({
        where: { followerId_followingId: { followerId: fans[0].id, followingId: creator.user.id } },
        update: {},
        create: { followerId: fans[0].id, followingId: creator.user.id },
      });
    }
    for (const [fan, post] of [[fans[0], posts[0]], [fans[0], posts[3]], [fans[1], posts[6]]]) {
      await db.like.upsert({
        where: { userId_postId: { userId: fan.id, postId: post.id } },
        update: {},
        create: { userId: fan.id, postId: post.id },
      });
      await db.bookmark.upsert({
        where: { userId_postId: { userId: fan.id, postId: post.id } },
        update: {},
        create: { userId: fan.id, postId: post.id },
      });
    }
    await db.comment.createMany({
      data: [
        { userId: fans[0].id, postId: posts[0].id, content: "Adding this to my Mumbai food list!" },
        { userId: fans[1].id, postId: posts[3].id, content: "Saving these gaming tips for the next squad night." },
      ],
    });
    await syncPostEngagement(db, posts);

    const communities = [
      [seededCreators[0], "India Food Trails", "Recipes, regional finds, and respectful food conversations."],
      [seededCreators[3], "Desi Gaming Squad", "BGMI tactics, game discoveries, and friendly tournaments."],
    ];
    for (const [owner, name, description] of communities) {
      const community = await db.community.findFirst({ where: { ownerId: owner.user.id, name } });
      const saved = community
        ? await db.community.update({ where: { id: community.id }, data: { description, memberCount: 3 } })
        : await db.community.create({ data: { ownerId: owner.user.id, name, description, memberCount: 3, avatar: owner.avatar } });
      await db.communityMember.upsert({
        where: { communityId_userId: { communityId: saved.id, userId: owner.user.id } },
        update: { role: "ADMIN" },
        create: { communityId: saved.id, userId: owner.user.id, role: "ADMIN" },
      });
      for (const fan of fans) {
        await db.communityMember.upsert({
          where: { communityId_userId: { communityId: saved.id, userId: fan.id } },
          update: {},
          create: { communityId: saved.id, userId: fan.id },
        });
      }
    }

    const titles = ["Welcome to your local Creavora feed", "Aisha Bites shared a new Food post"];
    await db.notification.deleteMany({ where: { userId: fans[0].id, title: { in: titles } } });
    await db.notification.createMany({
      data: [
        { userId: fans[0].id, title: titles[0], message: "Followed creators, saves, and communities are ready to explore.", type: "SYSTEM", read: false },
        { userId: fans[0].id, title: titles[1], message: "A fresh Mumbai food story is waiting in your feed.", type: "FOLLOW", read: false },
      ],
    });

    console.log(`Seeded ${seededCreators.length} Indian creators into ${new URL(databaseUrl).host}.`);
  } finally {
    await db.$disconnect();
  }
}

const invokedDirectly = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  runSeed().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
