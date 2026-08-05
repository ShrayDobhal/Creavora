import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { fileURLToPath } from "node:url";
import path from "node:path";

// This script is intentionally limited to local development databases.
export const LAUNCH_CATEGORIES = [
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
];

export const CATEGORY_OPTIONS = LAUNCH_CATEGORIES;

const LAUNCH_POST_COPY = {
  Fitness: [
    "A 20-minute strength circuit for the days your calendar is full.",
    "Three mobility checks that make a desk day feel lighter.",
    "Sunday recovery: a calm stretch flow for your living room.",
    "A beginner-friendly kettlebell session built for a small balcony.",
    "Five steady kilometres along Marine Drive before the city wakes.",
  ],
  Sports: [
    "A closer look at the passing patterns that changed the match.",
    "Practice-day drills for sharper footwork and faster decisions.",
    "The local sports stories worth following this weekend.",
    "What a packed evening at the neighbourhood badminton court taught me.",
    "Notes from a grassroots football academy building confidence in Jaipur.",
  ],
  Technology: [
    "A practical guide to clearing the digital clutter from your week.",
    "Small keyboard shortcuts that make everyday work feel quicker.",
    "What I learned while building a simpler creator toolkit.",
    "A clear look at UPI safety settings everyone should review.",
    "Inside a Hyderabad maker space where hardware ideas become prototypes.",
  ],
  Fashion: [
    "Three ways to style a handloom layer through the monsoon.",
    "A capsule wardrobe note: texture, colour, and repeat wear.",
    "Behind the seams of a thoughtful Chennai market find.",
    "A wedding-season colour story shaped by craft clusters in Kutch.",
    "Repeat-wear ideas for one linen sari across a working week.",
  ],
  Food: [
    "A bright Mumbai breakfast plate worth making at home.",
    "The spice balance behind a comforting weeknight curry.",
    "A neighbourhood food walk with room for one more stop.",
    "Testing three approaches to crisp dosas on an ordinary weekday morning.",
    "A seasonal thali from Pune where every small bowl has a purpose.",
  ],
  Travel: [
    "A slow morning on a Himalayan trail before the crowds arrive.",
    "Packing light for a two-day train journey across the coast.",
    "Three details that make a familiar city feel new again.",
    "A practical guide to a quiet weekend among the backwaters near Kochi.",
    "Window-seat notes from the Konkan Railway after the first monsoon rain.",
  ],
  Education: [
    "A focused study session starts with one realistic next step.",
    "How to turn a long reading list into a useful learning plan.",
    "The revision ritual that keeps exam week manageable.",
    "A simple portfolio checklist for students applying to their first internship.",
    "How a Bengaluru study circle keeps difficult subjects collaborative.",
  ],
  Music: [
    "A new melody built from an afternoon of tiny experiments.",
    "Listening notes from a session where rhythm led the way.",
    "Three songs for a quiet commute and a clear head.",
    "Building a warm acoustic arrangement around one honest vocal take.",
    "Field recordings from Chennai that found their way into a new track.",
  ],
  Art: [
    "Sketchbook colours inspired by a rainy Kolkata street.",
    "A mural detail that changed after one unexpected brushstroke.",
    "Making space for play in a serious studio practice.",
    "Block-print experiments inspired by the geometry of old Ahmedabad homes.",
    "A ceramic glaze test that finally captured the blue of a monsoon sky.",
  ],
  Comedy: [
    "The family group-chat update nobody asked to receive.",
    "A field guide to politely escaping an endless voice note.",
    "Observations from the queue where everyone became an expert.",
    "The exact moment a family video call becomes a public debate.",
    "A respectful study of the uncle who forwards news before reading it.",
  ],
  Gaming: [
    "A team-comms reset for calmer and smarter game nights.",
    "The map route that turned a close round into a win.",
    "Weekend squad plans: practice, play, and celebrate the chaos.",
    "A low-pressure aim routine for players returning after a long break.",
    "Reviewing an Indian indie game that turns local folklore into exploration.",
  ],
  Lifestyle: [
    "A gentle reset for a home that works with your routine.",
    "Small rituals that make an ordinary evening feel intentional.",
    "The weekend table setup that invites friends to linger.",
    "A renter-friendly reading corner made with pieces from local markets.",
    "The ten-minute evening reset that keeps a busy Mumbai flat calm.",
  ],
};

const LAUNCH_IMAGE_IDS = {
  Fitness: ["photo-1517836357463-d25dfeac3438", "photo-1571019613454-1cb2f99b2d8b", "photo-1534438327276-14e5300c3a48", "photo-1576678927484-cc907957088c", "photo-1599058917212-d750089bc07e"],
  Sports: ["photo-1461896836934-ffe607ba8211", "photo-1547347298-4074fc3086f0", "photo-1517466787929-bc90951d0974", "photo-1579952363873-27f3bade9f55", "photo-1531415074968-036ba1b575da"],
  Technology: ["photo-1518770660439-4636190af475", "photo-1498050108023-c5249f4df085", "photo-1555066931-4365d14bab8c", "photo-1519389950473-47ba0277781c", "photo-1488590528505-98d2b5aba04b"],
  Fashion: ["photo-1445205170230-053b83016050", "photo-1483985988355-763728e1935b", "photo-1469334031218-e382a71b716b", "photo-1490481651871-ab68de25d43d", "photo-1525507119028-ed4c629a60a3"],
  Food: ["photo-1504674900247-0877df9cc836", "photo-1546069901-ba9599a7e63c", "photo-1565299624946-b28f40a0ae38", "photo-1512621776951-a57141f2eefd", "photo-1565958011703-44f9829ba187"],
  Travel: ["photo-1500530855697-b586d89ba3ee", "photo-1469474968028-56623f02e42e", "photo-1501785888041-af3ef285b470", "photo-1524492412937-b28074a5d7da", "photo-1507525428034-b723cf961d3e"],
  Education: ["photo-1503676260728-1c00da094a0b", "photo-1523050854058-8df90110c9f1", "photo-1457369804613-52c61a468e7d", "photo-1509062522246-3755977927d7", "photo-1523240795612-9a054b0db644"],
  Music: ["photo-1511379938547-c1f69419868d", "photo-1493225457124-a3eb161ffa5f", "photo-1516280440614-37939bbacd81", "photo-1524368535928-5b5e00ddc76b", "photo-1501386761578-eac5c94b800a"],
  Art: ["photo-1549490349-8643362247b5", "photo-1513364776144-60967b0f800f", "photo-1547891654-e66ed7ebb968", "photo-1579783902614-a3fb3927b6a5", "photo-1500534314209-a25ddb2bd429"],
  Comedy: ["photo-1527529482837-4698179dc6ce", "photo-1505236858219-8359eb29e329", "photo-1517457373958-b7bdd4587205", "photo-1492684223066-81342ee5ff30", "photo-1543269865-cbf427effbad"],
  Gaming: ["photo-1542751371-adc38448a05e", "photo-1511512578047-dfb367046420", "photo-1598550476439-6847785fcea6", "photo-1493711662062-fa541adb3fc8", "photo-1550745165-9bc0b252726f"],
  Lifestyle: ["photo-1500534623283-312aade485b7", "photo-1493663284031-b7e3aefcae8e", "photo-1484101403633-562f891dc89a", "photo-1616486338812-3dadae4b4ace", "photo-1522708323590-d24dbb6b0267"],
};

export const LAUNCH_FEED_FIXTURES = LAUNCH_CATEGORIES.flatMap((category, categoryIndex) => (
  LAUNCH_POST_COPY[category].map((content, postIndex) => ({
    category,
    content,
    mediaUrl: `https://images.unsplash.com/${LAUNCH_IMAGE_IDS[category][postIndex]}?auto=format&fit=crop&w=1200&q=82`,
    isPremium: false,
    price: 0,
    publishedAt: new Date(Date.UTC(2026, 7, 1, 9, categoryIndex * 5 + postIndex)).toISOString(),
  }))
));

const LOCAL_DATABASE_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const DEFAULT_PASSWORD = "Test1234";

export const LAUNCH_CREATOR_FIXTURES = [
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
  ["sporty-samar", "Samar Kapoor", "Sports", "Jaipur", "Match analysis, training notes, and local sports stories."],
  ["everyday-neha", "Neha Kulkarni", "Lifestyle", "Mumbai", "Simple routines, welcoming homes, and everyday inspiration."],
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
    for (const creator of LAUNCH_CREATOR_FIXTURES) {
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
    const creatorsByCategory = new Map(seededCreators.map((creator) => [creator.category, creator]));
    const posts = [];
    for (const fixture of LAUNCH_FEED_FIXTURES) {
      const creator = creatorsByCategory.get(fixture.category);
      posts.push(await db.post.create({
        data: {
          creatorId: creator.user.id,
          content: fixture.content,
          category: fixture.category,
          mediaUrl: fixture.mediaUrl,
          mediaType: "image",
          isPremium: fixture.isPremium,
          price: fixture.price,
          likesCount: 0,
          commentsCount: 0,
          viewsCount: 0,
          publishedAt: new Date(fixture.publishedAt),
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
