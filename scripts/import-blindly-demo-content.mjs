import { PrismaPg } from "@prisma/adapter-pg";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { LAUNCH_CREATOR_FIXTURES, LAUNCH_FEED_FIXTURES } from "../prisma/seed.mjs";
import { PrismaClient } from "../src/generated/prisma/client.js";

const DEMO_CONFIRMATION = "blindly-production-demo-content";
const DEMO_EMAIL_DOMAIN = "blindly.demo";
const DEMO_ID_PREFIX = "blindly-demo";
const DEMO_POST_PREFIX = "[blindly-demo:";
const HOUR_IN_MS = 60 * 60 * 1000;

const DEMO_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=500&q=80",
];

const DEMO_COMMENTS = {
  Fitness: "This demo fitness routine fits neatly into a busy Bengaluru morning.",
  Sports: "The grassroots sports angle makes this demo post worth saving.",
  Technology: "A useful technology demo for India-first creator workflows.",
  Fashion: "Love seeing handloom fashion represented in the demo feed.",
  Food: "This fictional food trail has my Mumbai weekend planned.",
  Travel: "The travel demo gets the pace of Indian rail journeys right.",
  Education: "A practical education idea for the demo learning community.",
  Music: "This demo music session would make a lovely indie playlist opener.",
  Art: "The Kolkata palette gives this fictional art studio real warmth.",
  Comedy: "A very accurate comedy demo of the family group-chat experience.",
  Gaming: "The gaming squad strategy in this demo post is wonderfully calm.",
  Lifestyle: "This fictional lifestyle ritual feels made for monsoon evenings.",
};

function dateFrom(now, hours) {
  return new Date(now.getTime() + hours * HOUR_IN_MS);
}

function createDatabaseClient(databaseUrl) {
  return new PrismaClient({ adapter: new PrismaPg(databaseUrl) });
}

export function assertDemoImportEnvironment(env) {
  if (env.BLINDLY_DEMO_CONTENT_CONFIRMATION !== DEMO_CONFIRMATION) {
    throw new Error(
      `Set BLINDLY_DEMO_CONTENT_CONFIRMATION=${DEMO_CONFIRMATION} to import demo content`,
    );
  }

  let databaseUrl;
  try {
    databaseUrl = new URL(env.DATABASE_URL);
  } catch {
    throw new Error("DATABASE_URL must be a PostgreSQL URL");
  }

  if (
    !new Set(["postgres:", "postgresql:"]).has(databaseUrl.protocol)
    || !databaseUrl.hostname
    || databaseUrl.pathname.length <= 1
  ) {
    throw new Error("DATABASE_URL must be a PostgreSQL URL");
  }
}

export async function importBlindlyDemoContent({ database, now }) {
  const demoNow = new Date(now);
  const creators = [];
  const feedFixturesByCategory = new Map(LAUNCH_CREATOR_FIXTURES.map(({ category }) => [
    category,
    LAUNCH_FEED_FIXTURES.filter((post) => post.category === category),
  ]));

  for (const [index, fixture] of LAUNCH_CREATOR_FIXTURES.entries()) {
    const id = `${DEMO_ID_PREFIX}-user-${fixture.handle}`;
    const userData = {
      name: `${fixture.name} (Blindly Demo)`,
      email: `${DEMO_ID_PREFIX}-${fixture.handle}@${DEMO_EMAIL_DOMAIN}`,
      handle: `${DEMO_ID_PREFIX}-${fixture.handle}`,
      avatar: DEMO_AVATARS[index],
      role: "CREATOR",
      bio: `Fictional demo creator for ${fixture.category}, based in ${fixture.city}, India. ${fixture.bio}`,
      coverImage: feedFixturesByCategory.get(fixture.category)[0].mediaUrl,
      roleTitle: `${fixture.category} Demo Creator`,
      location: `${fixture.city}, India`,
      verified: false,
      deletedAt: null,
    };
    const user = await database.user.upsert({
      where: { id },
      update: userData,
      create: { id, ...userData },
    });
    creators.push({ ...fixture, user });

    await database.creatorProfile.upsert({
      where: { userId: user.id },
      update: { category: fixture.category },
      create: { id: `${DEMO_ID_PREFIX}-profile-${fixture.handle}`, userId: user.id, category: fixture.category },
    });
  }

  const creatorsByCategory = new Map(creators.map((creator) => [creator.category, creator]));
  const posts = [];
  const categoryPostIndexes = new Map();
  for (const [index, fixture] of LAUNCH_FEED_FIXTURES.entries()) {
    const creator = creatorsByCategory.get(fixture.category);
    const postIndex = categoryPostIndexes.get(fixture.category) || 0;
    categoryPostIndexes.set(fixture.category, postIndex + 1);
    const categorySlug = fixture.category.toLowerCase();
    const id = `${DEMO_ID_PREFIX}-post-${categorySlug}-${postIndex + 1}`;
    const postData = {
      creatorId: creator.user.id,
      content: `${DEMO_POST_PREFIX}${categorySlug}:${postIndex + 1}] ${fixture.content}`,
      mediaUrl: fixture.mediaUrl,
      mediaType: "image",
      isPremium: false,
      price: 0,
      likesCount: 1,
      commentsCount: postIndex === 0 ? 1 : 0,
      viewsCount: 240 + index * 37,
      sharesCount: 4 + (index % 9),
      publishedAt: dateFrom(demoNow, -(index + 1) * 3),
      deletedAt: null,
    };
    posts.push(await database.post.upsert({
      where: { id },
      update: postData,
      create: { id, ...postData },
    }));
  }

  for (const [index, creator] of creators.entries()) {
    const storyData = {
      userId: creator.user.id,
      mediaUrl: feedFixturesByCategory.get(creator.category)[1].mediaUrl,
      mediaType: "image",
      caption: `[blindly-demo:story:${creator.category.toLowerCase()}] A fictional ${creator.category} story for previewing Blindly.`,
      viewsCount: 30 + index * 11,
      expiresAt: dateFrom(demoNow, 24 + index),
      deletedAt: null,
    };
    await database.story.upsert({
      where: { id: `${DEMO_ID_PREFIX}-story-${creator.handle}` },
      update: storyData,
      create: { id: `${DEMO_ID_PREFIX}-story-${creator.handle}`, ...storyData },
    });
  }

  for (const [liveIndex, creatorIndex] of [0, 3, 6, 9].entries()) {
    const creator = creators[creatorIndex];
    const liveData = {
      hostId: creator.user.id,
      title: `[blindly-demo:live:${creator.category.toLowerCase()}] ${creator.category} creator room`,
      description: `A scheduled fictional demo session hosted from ${creator.city}, India.`,
      thumbnailUrl: feedFixturesByCategory.get(creator.category)[2].mediaUrl,
      status: "SCHEDULED",
      scheduledAt: dateFrom(demoNow, 24 * (liveIndex + 1)),
      startedAt: null,
      endedAt: null,
      viewerCount: 0,
      maxViewers: 0,
    };
    await database.liveSession.upsert({
      where: { id: `${DEMO_ID_PREFIX}-live-${creator.handle}` },
      update: liveData,
      create: { id: `${DEMO_ID_PREFIX}-live-${creator.handle}`, ...liveData },
    });
  }

  for (const [index, creator] of creators.entries()) {
    const followedCreator = creators[(index + 1) % creators.length];
    await database.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: creator.user.id,
          followingId: followedCreator.user.id,
        },
      },
      update: {},
      create: { followerId: creator.user.id, followingId: followedCreator.user.id },
    });
  }

  const creatorIndexById = new Map(creators.map((creator, index) => [creator.user.id, index]));
  for (const post of posts) {
    const postCreatorIndex = creatorIndexById.get(post.creatorId);
    const creator = creators[(postCreatorIndex + 1) % creators.length];
    await database.like.upsert({
      where: { userId_postId: { userId: creator.user.id, postId: post.id } },
      update: {},
      create: { userId: creator.user.id, postId: post.id },
    });
  }

  for (const [index, creator] of creators.entries()) {
    const post = posts.find(({ creatorId }) => creatorId === creator.user.id);
    const commenter = creators[(index + 2) % creators.length];
    const commentData = {
      userId: commenter.user.id,
      postId: post.id,
      content: `[blindly-demo:comment:${index + 1}] ${DEMO_COMMENTS[creator.category]}`,
      likesCount: 0,
      deletedAt: null,
    };
    await database.comment.upsert({
      where: { id: `${DEMO_ID_PREFIX}-comment-${creator.handle}` },
      update: commentData,
      create: { id: `${DEMO_ID_PREFIX}-comment-${creator.handle}`, ...commentData },
    });
  }

  return {
    users: creators.length,
    creatorProfiles: creators.length,
    posts: posts.length,
    stories: creators.length,
    liveSessions: 4,
    follows: creators.length,
    likes: posts.length,
    comments: creators.length,
  };
}

export async function runDemoContentImport({
  env = process.env,
  now = new Date(),
  createDatabaseClient: makeDatabaseClient = createDatabaseClient,
} = {}) {
  assertDemoImportEnvironment(env);
  const database = makeDatabaseClient(env.DATABASE_URL);

  try {
    return await importBlindlyDemoContent({ database, now });
  } finally {
    await database.$disconnect();
  }
}

const invokedDirectly = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  runDemoContentImport()
    .then((counts) => {
      console.log(`Imported Blindly demo content: ${JSON.stringify(counts)}`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
