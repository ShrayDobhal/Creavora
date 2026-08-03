const { PrismaClient } = require("../src/generated/prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning database...");
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding users...");

  // Fan User (Arjun)
  const arjun = await prisma.user.create({
    data: {
      name: "Arjun Singh",
      email: "arjun@crevora.com",
      handle: "arjun",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
      role: "FAN",
      walletBalance: 120.0,
      xp: 2450,
      level: 4,
      bio: "Fitness enthusiast & gaming fan. Exploring premium Indian creators. 🇮🇳",
    },
  });

  // Creators
  const creatorsData = [
    {
      name: "Ananya Sharma",
      email: "ananya@crevora.com",
      handle: "ananyasharma",
      avatar: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80",
      role: "CREATOR",
      bio: "Fashion Creator 👗 | Styling trends & daily vibes",
      coverImage: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&auto=format&fit=crop&q=80",
      roleTitle: "Fashion Creator",
      verified: true,
    },
    {
      name: "Rohit Gamer",
      email: "rohit@crevora.com",
      handle: "rohitgamer",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
      role: "CREATOR",
      bio: "Pro Gamer 🎮 | Streamer & Esports coach",
      coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
      roleTitle: "Gaming Creator",
      verified: true,
    },
    {
      name: "Meera Art",
      email: "meera@crevora.com",
      handle: "meeraart",
      avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=500&auto=format&fit=crop&q=80",
      role: "CREATOR",
      bio: "Digital Artist 🎨 | Creating oil paintings & sketches",
      coverImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80",
      roleTitle: "Digital Artist",
      verified: true,
    },
    {
      name: "Wander With Karan",
      email: "karan@crevora.com",
      handle: "wanderwithkaran",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80",
      role: "CREATOR",
      bio: "Travel Vlogger 🎒 | Wandering across India 🏔️",
      coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
      roleTitle: "Travel Vlogger",
      verified: true,
    },
    {
      name: "Fit With Neha",
      email: "neha@crevora.com",
      handle: "fitwithneha",
      avatar: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=500&auto=format&fit=crop&q=80",
      role: "CREATOR",
      bio: "Fitness Coach 🏃‍♀️ | Yoga & HIIT trainer",
      coverImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
      roleTitle: "Fitness Coach",
      verified: true,
    },
  ];

  const creators = [];
  for (const c of creatorsData) {
    const creator = await prisma.user.create({ data: c });
    creators.push(creator);
  }

  console.log("Seeding posts...");
  // Ananya Posts
  const ananya = creators[0];
  await prisma.post.create({
    data: {
      creatorId: ananya.id,
      content: "Indian ethnic wear is unmatched in its elegance! ✨ Wearing this handwoven Banarasi saree today.",
      mediaUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
      mediaType: "image",
      isPremium: false,
      likesCount: 1420,
      commentsCount: 98,
    },
  });

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
    },
  });

  // Rohit Gamer Posts
  const rohit = creators[1];
  await prisma.post.create({
    data: {
      creatorId: rohit.id,
      content: "Esports ready! Stream starts in 10 mins. Testing the new Battlegrounds Mobile India updates. 🎮🔥",
      mediaUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
      mediaType: "image",
      isPremium: false,
      likesCount: 2540,
      commentsCount: 110,
    },
  });

  // Meera Art Posts
  const meera = creators[2];
  await prisma.post.create({
    data: {
      creatorId: meera.id,
      content: "Finished working on this oil painting. It took me 12 hours, but the colors came out beautiful! 🎨🌸",
      mediaUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80",
      mediaType: "image",
      isPremium: false,
      likesCount: 890,
      commentsCount: 42,
    },
  });

  // Karan Posts
  const karan = creators[3];
  await prisma.post.create({
    data: {
      creatorId: karan.id,
      content: "Himachal mornings are a blessing. Waking up to snowcapped peaks in Spiti. 🏔️❄️",
      mediaUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
      mediaType: "image",
      isPremium: false,
      likesCount: 1890,
      commentsCount: 120,
    },
  });

  // Neha Posts
  const neha = creators[4];
  await prisma.post.create({
    data: {
      creatorId: neha.id,
      content: "Core workout checklist! Ready for the HIIT session today? Drink water and stay active. 💪🧘‍♀️",
      mediaUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
      mediaType: "image",
      isPremium: false,
      likesCount: 1102,
      commentsCount: 75,
    },
  });

  console.log("Seeding messages...");
  // Messages with Ananya
  await prisma.message.create({
    data: {
      senderId: ananya.id,
      receiverId: arjun.id,
      content: "Hey Arjun! 👋 Just wanted to say a big THANK YOU ❤️ Your support means a lot to me!",
      createdAt: new Date(Date.now() - 3600000 * 2),
    },
  });
  await prisma.message.create({
    data: {
      senderId: arjun.id,
      receiverId: ananya.id,
      content: "Hey Ananya! 😊 You're doing amazing work. Keep inspiring! 🔥",
      createdAt: new Date(Date.now() - 3600000 * 1.8),
    },
  });
  await prisma.message.create({
    data: {
      senderId: ananya.id,
      receiverId: arjun.id,
      isAudio: true,
      duration: "0:15",
      createdAt: new Date(Date.now() - 3600000 * 1.5),
    },
  });

  // Messages with Rohit
  await prisma.message.create({
    data: {
      senderId: rohit.id,
      receiverId: arjun.id,
      content: "Bro, did you see my clutch in BGMI yesterday? 🤯 We wiped the whole squad in 30 seconds!",
      createdAt: new Date(Date.now() - 3600000 * 3),
    },
  });

  console.log("Seeding subscriptions...");
  await prisma.subscription.create({
    data: {
      userId: arjun.id,
      creatorId: ananya.id,
      tier: "Premium Monthly",
      price: 499.0,
      renewsOn: "25 May, 2026",
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
      renewsOn: "24 May, 2026",
      method: "UPI (gpay@okhdfc)",
      status: "ACTIVE",
    },
  });

  console.log("Seeding transactions...");
  await prisma.transaction.create({
    data: {
      userId: arjun.id,
      amount: 1000.0,
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
      method: "UPI (Paytm)",
      reference: "SUB8237190",
      status: "COMPLETED",
    },
  });

  console.log("Seeding notifications...");
  await prisma.notification.create({
    data: {
      userId: arjun.id,
      title: "Ananya Sharma went Live!",
      message: "Ananya is streaming live now. Come join and say hi! 🎬✨",
      type: "LIVE",
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: arjun.id,
      title: "Wallet Deposit Successful",
      message: "₹1,000 has been added to your Crevora Wallet successfully.",
      type: "WALLET",
      read: true,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
