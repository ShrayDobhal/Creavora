import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

// ─── DEVELOPMENT SEED DATA ──────────────────────────────────────────────────
// This file contains DEVELOPMENT SEED DATA ONLY.
// All passwords are test-only and must never be used in production.

const DEFAULT_PASSWORD = "Test1234"; // For all seeded accounts (dev only)

async function hashPw(plain) {
  return bcrypt.hash(plain, 10);
}

async function main() {
  console.log("🧹 Cleaning database...");
  // Delete in dependency order
  await prisma.pollVote.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.communityReply.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.communityMember.deleteMany();
  await prisma.liveSessionAttendee.deleteMany();
  await prisma.liveSession.deleteMany();
  await prisma.event.deleteMany();
  await prisma.community.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.promotionCampaign.deleteMany();
  await prisma.withdrawalRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.report.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.story.deleteMany();
  await prisma.reel.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.post.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.featureFlag.deleteMany();
  await prisma.user.deleteMany();

  const pw = await hashPw(DEFAULT_PASSWORD);

  console.log("👤 Seeding users...");

  // ─── FAN USER ───────────────────────────────────────────────────────────
  const arjun = await prisma.user.create({
    data: {
      name: "Arjun Singh",
      email: "arjun@creavora.com",
      handle: "arjun",
      passwordHash: pw,
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
      role: "FAN",
      walletBalance: 2500.0,
      xp: 2450,
      level: 4,
      bio: "Fitness enthusiast & gaming fan. Exploring premium Indian creators. 🇮🇳",
    },
  });

  // ─── CREATORS ───────────────────────────────────────────────────────────
  const creatorsData = [
    {
      name: "Ananya Sharma",
      email: "ananya@creavora.com",
      handle: "ananyasharma",
      avatar: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80",
      role: "CREATOR",
      walletBalance: 48760.50,
      bio: "Fashion Creator 👗 | Styling trends & daily vibes",
      coverImage: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&auto=format&fit=crop&q=80",
      roleTitle: "Fashion Creator",
      verified: true,
      passwordHash: pw,
    },
    {
      name: "Rohit Gamer",
      email: "rohit@creavora.com",
      handle: "rohitgamer",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
      role: "CREATOR",
      walletBalance: 32100.00,
      bio: "Pro Gamer 🎮 | Streamer & Esports coach",
      coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
      roleTitle: "Gaming Creator",
      verified: true,
      passwordHash: pw,
    },
    {
      name: "Meera Art",
      email: "meera@creavora.com",
      handle: "meeraart",
      avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=500&auto=format&fit=crop&q=80",
      role: "CREATOR",
      walletBalance: 21500.00,
      bio: "Digital Artist 🎨 | Creating oil paintings & sketches",
      coverImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80",
      roleTitle: "Digital Artist",
      verified: true,
      passwordHash: pw,
    },
    {
      name: "Wander With Karan",
      email: "karan@creavora.com",
      handle: "wanderwithkaran",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80",
      role: "CREATOR",
      walletBalance: 15200.00,
      bio: "Travel Vlogger 🎒 | Wandering across India 🏔️",
      coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
      roleTitle: "Travel Vlogger",
      verified: true,
      passwordHash: pw,
    },
    {
      name: "Fit With Neha",
      email: "neha@creavora.com",
      handle: "fitwithneha",
      avatar: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=500&auto=format&fit=crop&q=80",
      role: "CREATOR",
      walletBalance: 18900.00,
      bio: "Fitness Coach 🏃‍♀️ | Yoga & HIIT trainer",
      coverImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
      roleTitle: "Fitness Coach",
      verified: true,
      passwordHash: pw,
    },
  ];

  const creators = [];
  for (const c of creatorsData) {
    const creator = await prisma.user.create({ data: c });
    creators.push(creator);
  }

  // ─── ADMIN USER ─────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@creavora.com",
      handle: "admin",
      passwordHash: pw,
      role: "ADMIN",
      verified: true,
      bio: "Platform Administrator",
    },
  });

  // ─── ADDITIONAL FAN USERS ───────────────────────────────────────────────
  const fan2 = await prisma.user.create({
    data: {
      name: "Pooja Singh",
      email: "pooja@creavora.com",
      handle: "poojasingh",
      passwordHash: pw,
      role: "FAN",
      walletBalance: 500.0,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
      bio: "Art lover & creator supporter 🎨",
    },
  });

  const fan3 = await prisma.user.create({
    data: {
      name: "Dev Kumar",
      email: "dev@creavora.com",
      handle: "devkumar",
      passwordHash: pw,
      role: "FAN",
      walletBalance: 750.0,
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80",
      bio: "Tech enthusiast 💻",
    },
  });

  console.log("📝 Seeding creator profiles...");
  const ananya = creators[0];
  const rohit = creators[1];
  const meera = creators[2];
  const karan = creators[3];
  const neha = creators[4];

  for (const c of creators) {
    await prisma.creatorProfile.create({
      data: {
        userId: c.id,
        category: c.roleTitle || "General",
        subscriberCount: Math.floor(Math.random() * 5000) + 500,
        totalEarnings: c.walletBalance * 3,
        availableBalance: c.walletBalance,
        monthlyRevenue: c.walletBalance * 0.3,
      },
    });
  }

  console.log("📸 Seeding posts...");
  const posts = [];

  posts.push(
    await prisma.post.create({
      data: {
        creatorId: ananya.id,
        content: "Indian ethnic wear is unmatched in its elegance! ✨ Wearing this handwoven Banarasi saree today.",
        mediaUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        isPremium: false,
        likesCount: 1420,
        commentsCount: 98,
        viewsCount: 5200,
        publishedAt: new Date(Date.now() - 3600000 * 2),
      },
    })
  );

  posts.push(
    await prisma.post.create({
      data: {
        creatorId: ananya.id,
        content: "Exclusive styling guide: 5 ways to drape a Banarasi saree for upcoming weddings! 👗💍",
        mediaUrl: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        isPremium: true,
        price: 299.0,
        likesCount: 320,
        commentsCount: 15,
        viewsCount: 980,
        publishedAt: new Date(Date.now() - 3600000 * 12),
      },
    })
  );

  posts.push(
    await prisma.post.create({
      data: {
        creatorId: rohit.id,
        content: "Esports ready! Stream starts in 10 mins. Testing the new Battlegrounds Mobile India updates. 🎮🔥",
        mediaUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        isPremium: false,
        likesCount: 2540,
        commentsCount: 110,
        viewsCount: 8700,
        publishedAt: new Date(Date.now() - 3600000 * 4),
      },
    })
  );

  posts.push(
    await prisma.post.create({
      data: {
        creatorId: rohit.id,
        content: "NEW GAMEPLAY ALERT! 🚀 This boss fight was INSANE! 😲 Exclusive full video for subscribers only.",
        mediaUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
        mediaType: "video",
        isPremium: true,
        price: 199.0,
        likesCount: 2300,
        commentsCount: 245,
        viewsCount: 12400,
        publishedAt: new Date(Date.now() - 3600000 * 8),
      },
    })
  );

  posts.push(
    await prisma.post.create({
      data: {
        creatorId: meera.id,
        content: "Finished working on this oil painting. It took me 12 hours, but the colors came out beautiful! 🎨🌸",
        mediaUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        likesCount: 890,
        commentsCount: 42,
        viewsCount: 3100,
        publishedAt: new Date(Date.now() - 3600000 * 6),
      },
    })
  );

  posts.push(
    await prisma.post.create({
      data: {
        creatorId: karan.id,
        content: "Himachal mornings are a blessing. Waking up to snowcapped peaks in Spiti. 🏔️❄️",
        mediaUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        likesCount: 1890,
        commentsCount: 120,
        viewsCount: 6300,
        publishedAt: new Date(Date.now() - 3600000 * 10),
      },
    })
  );

  posts.push(
    await prisma.post.create({
      data: {
        creatorId: neha.id,
        content: "Core workout checklist! Ready for the HIIT session today? Drink water and stay active. 💪🧘‍♀️",
        mediaUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        likesCount: 1102,
        commentsCount: 75,
        viewsCount: 4200,
        publishedAt: new Date(Date.now() - 3600000 * 5),
      },
    })
  );

  console.log("👥 Seeding follows...");
  const followPairs = [
    [arjun.id, ananya.id],
    [arjun.id, rohit.id],
    [arjun.id, meera.id],
    [arjun.id, karan.id],
    [arjun.id, neha.id],
    [fan2.id, ananya.id],
    [fan2.id, meera.id],
    [fan3.id, rohit.id],
    [fan3.id, karan.id],
  ];
  for (const [followerId, followingId] of followPairs) {
    await prisma.follow.create({ data: { followerId, followingId } });
  }

  console.log("❤️ Seeding likes...");
  for (const post of posts.slice(0, 5)) {
    await prisma.like.create({ data: { userId: arjun.id, postId: post.id } });
  }
  await prisma.like.create({ data: { userId: fan2.id, postId: posts[0].id } });
  await prisma.like.create({ data: { userId: fan3.id, postId: posts[2].id } });

  console.log("💬 Seeding comments...");
  await prisma.comment.create({
    data: {
      userId: arjun.id,
      postId: posts[0].id,
      content: "Absolutely stunning! 🔥 You always nail the traditional looks!",
    },
  });
  await prisma.comment.create({
    data: {
      userId: fan2.id,
      postId: posts[0].id,
      content: "Love this saree! Where can I get one? 😍",
    },
  });
  await prisma.comment.create({
    data: {
      userId: arjun.id,
      postId: posts[2].id,
      content: "That clutch at the end was insane bro! 🎮",
    },
  });

  console.log("🔖 Seeding bookmarks...");
  await prisma.bookmark.create({ data: { userId: arjun.id, postId: posts[0].id } });
  await prisma.bookmark.create({ data: { userId: arjun.id, postId: posts[4].id } });
  await prisma.bookmark.create({ data: { userId: arjun.id, postId: posts[5].id } });

  console.log("💬 Seeding conversations & messages...");
  // Create conversations
  const conv1 = await prisma.conversation.create({ data: { type: "DIRECT" } });
  await prisma.conversationParticipant.createMany({
    data: [
      { conversationId: conv1.id, userId: arjun.id },
      { conversationId: conv1.id, userId: ananya.id },
    ],
  });

  const conv2 = await prisma.conversation.create({ data: { type: "DIRECT" } });
  await prisma.conversationParticipant.createMany({
    data: [
      { conversationId: conv2.id, userId: arjun.id },
      { conversationId: conv2.id, userId: rohit.id },
    ],
  });

  // Messages
  await prisma.message.create({
    data: {
      conversationId: conv1.id,
      senderId: ananya.id,
      receiverId: arjun.id,
      content: "Hey Arjun! 👋 Just wanted to say a big THANK YOU ❤️ Your support means a lot to me!",
      status: "READ",
      createdAt: new Date(Date.now() - 3600000 * 2),
    },
  });
  await prisma.message.create({
    data: {
      conversationId: conv1.id,
      senderId: arjun.id,
      receiverId: ananya.id,
      content: "Hey Ananya! 😊 You're doing amazing work. Keep inspiring! 🔥",
      status: "READ",
      createdAt: new Date(Date.now() - 3600000 * 1.8),
    },
  });
  await prisma.message.create({
    data: {
      conversationId: conv1.id,
      senderId: ananya.id,
      receiverId: arjun.id,
      isAudio: true,
      duration: "0:15",
      status: "DELIVERED",
      createdAt: new Date(Date.now() - 3600000 * 1.5),
    },
  });
  await prisma.message.create({
    data: {
      conversationId: conv2.id,
      senderId: rohit.id,
      receiverId: arjun.id,
      content: "Bro, did you see my clutch in BGMI yesterday? 🤯 We wiped the whole squad in 30 seconds!",
      status: "DELIVERED",
      createdAt: new Date(Date.now() - 3600000 * 3),
    },
  });

  console.log("📋 Seeding subscriptions...");
  await prisma.subscription.create({
    data: {
      userId: arjun.id,
      creatorId: ananya.id,
      tier: "Premium Monthly",
      price: 499.0,
      renewsOn: "25 Aug, 2026",
      method: "UPI (paytm@upi)",
      status: "ACTIVE",
    },
  });
  await prisma.subscription.create({
    data: {
      userId: arjun.id,
      creatorId: rohit.id,
      tier: "Standard Monthly",
      price: 299.0,
      renewsOn: "24 Aug, 2026",
      method: "UPI (gpay@okhdfc)",
      status: "ACTIVE",
    },
  });
  await prisma.subscription.create({
    data: {
      userId: fan2.id,
      creatorId: ananya.id,
      tier: "Premium Monthly",
      price: 499.0,
      renewsOn: "30 Aug, 2026",
      method: "Wallet Balance",
      status: "ACTIVE",
    },
  });

  console.log("💰 Seeding transactions...");
  await prisma.transaction.create({
    data: {
      userId: arjun.id,
      amount: 5000.0,
      type: "DEPOSIT",
      method: "UPI (Paytm)",
      reference: "UPI9823471029",
      status: "COMPLETED",
    },
  });
  await prisma.transaction.create({
    data: {
      userId: arjun.id,
      amount: 499.0,
      type: "SUBSCRIPTION",
      method: "Wallet Balance",
      reference: "SUB8237190",
      status: "COMPLETED",
    },
  });
  await prisma.transaction.create({
    data: {
      userId: arjun.id,
      amount: 299.0,
      type: "SUBSCRIPTION",
      method: "Wallet Balance",
      reference: "SUB8237191",
      status: "COMPLETED",
    },
  });
  // Creator earnings
  await prisma.transaction.create({
    data: {
      userId: ananya.id,
      amount: 499.0,
      type: "EARNING",
      method: "Fan Subscription",
      reference: "EARN100001",
      status: "COMPLETED",
    },
  });
  await prisma.transaction.create({
    data: {
      userId: rohit.id,
      amount: 299.0,
      type: "EARNING",
      method: "Fan Subscription",
      reference: "EARN100002",
      status: "COMPLETED",
    },
  });

  console.log("🔔 Seeding notifications...");
  const notifications = [
    {
      userId: arjun.id,
      title: "Ananya Sharma went Live!",
      message: "Ananya is streaming live now. Come join and say hi! 🎬✨",
      type: "LIVE",
      read: false,
    },
    {
      userId: arjun.id,
      title: "Wallet Deposit Successful",
      message: "₹5,000 has been added to your Creavora Wallet successfully.",
      type: "WALLET",
      read: true,
    },
    {
      userId: arjun.id,
      title: "New Post by Rohit Gamer!",
      message: 'Rohit Gamer uploaded a new post: "Esports ready! Stream starts..."',
      type: "SYSTEM",
      read: false,
    },
    {
      userId: arjun.id,
      title: "Subscription Confirmed",
      message: "You are now subscribed to Ananya Sharma (Premium Monthly). Received 150 XP!",
      type: "SUBSCRIPTION",
      read: true,
    },
    {
      userId: ananya.id,
      title: "New Premium Subscriber!",
      message: "Arjun Singh has subscribed to your Premium Monthly tier.",
      type: "SUBSCRIPTION",
      read: false,
    },
  ];
  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }

  console.log("📚 Seeding collections...");
  const col1 = await prisma.collection.create({
    data: {
      userId: arjun.id,
      name: "Fashion Inspo",
      description: "My favorite fashion posts",
      postsCount: 1,
    },
  });
  await prisma.collection.create({
    data: {
      userId: arjun.id,
      name: "Gaming Highlights",
      description: "Best gaming moments",
      postsCount: 0,
    },
  });
  await prisma.collection.create({
    data: {
      userId: arjun.id,
      name: "Travel Goals",
      description: "Places to visit",
      postsCount: 0,
    },
  });

  console.log("🏘️ Seeding communities...");
  const fashionCommunity = await prisma.community.create({
    data: {
      ownerId: ananya.id,
      name: "Ananya's Fashion Hub",
      description: "A community for fashion lovers! Share your outfits, get styling tips, and connect with fellow fashionistas. 👗✨",
      memberCount: 3,
      avatar: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&auto=format&fit=crop&q=80",
    },
  });
  await prisma.communityMember.createMany({
    data: [
      { communityId: fashionCommunity.id, userId: ananya.id, role: "ADMIN" },
      { communityId: fashionCommunity.id, userId: arjun.id },
      { communityId: fashionCommunity.id, userId: fan2.id },
    ],
  });
  const cPost1 = await prisma.communityPost.create({
    data: {
      communityId: fashionCommunity.id,
      authorId: ananya.id,
      content: "Welcome to the community! 🎉 Introduce yourself and share your style inspo!",
      isPinned: true,
      likesCount: 12,
      repliesCount: 2,
    },
  });
  await prisma.communityReply.create({
    data: {
      postId: cPost1.id,
      authorId: arjun.id,
      content: "Hey everyone! Big fan of ethnic wear and fusion styles 🙏",
    },
  });

  const gamingCommunity = await prisma.community.create({
    data: {
      ownerId: rohit.id,
      name: "Rohit's Gaming Squad",
      description: "Join the squad! BGMI tournaments, game reviews, and esports discussions. 🎮🔥",
      memberCount: 2,
      avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80",
    },
  });
  await prisma.communityMember.createMany({
    data: [
      { communityId: gamingCommunity.id, userId: rohit.id, role: "ADMIN" },
      { communityId: gamingCommunity.id, userId: arjun.id },
    ],
  });

  console.log("📺 Seeding live sessions...");
  await prisma.liveSession.create({
    data: {
      hostId: ananya.id,
      title: "Live Q&A Session",
      description: "Ask me anything about fashion, styling, and creating content!",
      status: "SCHEDULED",
      scheduledAt: new Date(Date.now() + 3600000 * 4),
      viewerCount: 0,
    },
  });
  await prisma.liveSession.create({
    data: {
      hostId: rohit.id,
      title: "BGMI Tournament Practice",
      description: "Warming up for the weekend tournament. Join and watch!",
      status: "SCHEDULED",
      scheduledAt: new Date(Date.now() + 3600000 * 6),
      viewerCount: 0,
    },
  });

  console.log("🏆 Seeding achievements...");
  const achievements = [
    { name: "Early Supporter", description: "Be among the first 1000 users", icon: "🌟", xpReward: 100, category: "SOCIAL" },
    { name: "Content Consumer", description: "Watch 10 premium posts", icon: "📺", xpReward: 50, category: "ENGAGEMENT" },
    { name: "Community Starter", description: "Join your first community", icon: "🏘️", xpReward: 75, category: "SOCIAL" },
    { name: "Generous Tipper", description: "Send your first tip", icon: "💰", xpReward: 100, category: "ENGAGEMENT" },
    { name: "Social Butterfly", description: "Follow 10 creators", icon: "🦋", xpReward: 150, category: "SOCIAL" },
  ];
  for (const a of achievements) {
    await prisma.achievement.create({ data: a });
  }

  console.log("🚩 Seeding feature flags...");
  await prisma.featureFlag.createMany({
    data: [
      { key: "live_streaming", enabled: true, description: "Enable live streaming feature" },
      { key: "payments_razorpay", enabled: false, description: "Enable Razorpay payment gateway" },
      { key: "push_notifications", enabled: false, description: "Enable push notifications" },
      { key: "ai_recommendations", enabled: false, description: "Enable AI-powered content recommendations" },
      { key: "dark_mode", enabled: true, description: "Enable dark mode" },
    ],
  });

  console.log("✅ Database seeded successfully!");
  console.log("");
  console.log("──────────────────────────────────────────────");
  console.log("  TEST ACCOUNTS (password for all: Test1234)  ");
  console.log("──────────────────────────────────────────────");
  console.log("  FAN:     arjun@creavora.com");
  console.log("  CREATOR: ananya@creavora.com");
  console.log("  CREATOR: rohit@creavora.com");
  console.log("  CREATOR: meera@creavora.com");
  console.log("  CREATOR: karan@creavora.com");
  console.log("  CREATOR: neha@creavora.com");
  console.log("  ADMIN:   admin@creavora.com");
  console.log("  FAN:     pooja@creavora.com");
  console.log("  FAN:     dev@creavora.com");
  console.log("──────────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
