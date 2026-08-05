import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { createCollectionSchema, validateBody } from "@/lib/validators";

// GET collections for active authenticated user
export const GET = withAuth(async (req, { user }) => {
  try {
    const collections = await db.collection.findMany({
      where: { userId: user.id, deletedAt: null },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error("GET Collections Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
});

// POST create new collection for authenticated user
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const { error, data } = validateBody(createCollectionSchema, body);

    if (error) {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }

    const collection = await db.collection.create({
      data: {
        userId: user.id,
        name: data.name,
        description: data.description || null,
        postsCount: 0
      }
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error("POST Collection Error:", error);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
});

// DELETE collection
export const DELETE = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Collection ID is required" }, { status: 400 });
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
});
