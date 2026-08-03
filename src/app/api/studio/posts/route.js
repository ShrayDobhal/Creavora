import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST create creator post
export async function POST(req) {
  try {
    const { content, mediaUrl, mediaType, isPremium, price } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Post content is required" }, { status: 400 });
    }

    const postPrice = isPremium ? parseFloat(price) : 0.0;

    // Get active creator (Ananya Sharma)
    const creator = await db.user.findUnique({
      where: { handle: "ananyasharma" },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
    }

    // Create the post in database
    const post = await db.post.create({
      data: {
        creatorId: creator.id,
        content: content.trim(),
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        isPremium: isPremium || false,
        price: postPrice,
        likesCount: 0,
        commentsCount: 0
      }
    });

    // Notify followers (Simulated)
    // Find our main fan (Arjun) to notify them!
    const fan = await db.user.findUnique({
      where: { handle: "arjun" }
    });

    if (fan) {
      await db.notification.create({
        data: {
          userId: fan.id,
          title: `New Post by ${creator.name}!`,
          message: isPremium
            ? `${creator.name} just posted a new premium locked post for ₹${postPrice.toFixed(0)}!`
            : `${creator.name} uploaded a new post: "${content.substring(0, 30)}..."`,
          type: "SYSTEM",
          read: false
        }
      });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("POST Creator Post Error:", error);
    return NextResponse.json({ error: "Failed to upload post" }, { status: 500 });
  }
}
