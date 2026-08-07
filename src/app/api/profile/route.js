import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import { updateProfileSchema, validateBody } from "@/lib/validators";
import {
  getCurrentProfile,
  HANDLE_TAKEN,
  INVALID_PROFILE_MEDIA,
  PROFILE_NOT_FOUND,
  updateCurrentProfile,
} from "@/lib/consumer/profile";

const notFoundResponse = () =>
  NextResponse.json({ error: PROFILE_NOT_FOUND }, { status: 404 });

const errorResponse = (error, fallbackMessage) => {
  if (error?.message === PROFILE_NOT_FOUND) return notFoundResponse();
  if (error?.message === INVALID_PROFILE_MEDIA) {
    return NextResponse.json({ error: "Validation failed", details: [{ field: "media", message: error.message }] }, { status: 400 });
  }
  if (error?.message === HANDLE_TAKEN || error?.code === "P2002") {
    return NextResponse.json({ error: HANDLE_TAKEN }, { status: 409 });
  }
  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  console.error(fallbackMessage, error);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
};

export function createProfileGet(database = db) {
  return async (_req, { user }) => {
    try {
      return NextResponse.json(await getCurrentProfile(database, user.id));
    } catch (error) {
      return errorResponse(error, "Failed to load profile");
    }
  };
}

export function createProfilePatch(database = db) {
  return async (req, { user }) => {
    try {
      const body = await req.json();
      const { error, data } = validateBody(updateProfileSchema, body);
      if (error) {
        return NextResponse.json(
          { error: "Validation failed", details: error },
          { status: 400 },
        );
      }
      return NextResponse.json(await updateCurrentProfile(database, user.id, data));
    } catch (error) {
      return errorResponse(error, "Failed to update profile");
    }
  };
}

export const GET = withAuth(createProfileGet());
export const PATCH = withAuth(createProfilePatch());
