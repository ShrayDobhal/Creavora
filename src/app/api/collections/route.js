import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET collections for Arjun
export async function GET() {
  try {
    const user = await db.user.findUnique({
      where: { handle: "arjun" },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const collections = await db.collection.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error("GET Collections Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST create new collection
export async function POST(req) {
  try {
    const { name, description } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { handle: "arjun" },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const collection = await db.collection.create({
      data: {
        userId: user.id,
        name: name.trim(),
        description: description || null,
        postsCount: 0
      }
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error("POST Collection Error:", error);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}

// DELETE collection
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Collection ID is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { handle: "arjun" },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const collection = await db.collection.findUnique({
      where: { id }
    });

    if (!collection || collection.userId !== user.id) {
      return NextResponse.json({ error: "Collection not found or unauthorized" }, { status: 404 });
    }

    await db.collection.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Collection Error:", error);
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}
