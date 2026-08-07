import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withCreatorAuth } from "@/lib/middleware";
import { creatorSettingsSchema, validateBody } from "@/lib/validators";
import { consumerErrorResponse } from "@/lib/consumer/http";

const selectSettings = {
  id: true,
  name: true,
  bio: true,
  creatorProfile: {
    select: { category: true, subscriptionPrice: true, payoutMethod: true, payoutDetails: true },
  },
};

const presentSettings = (user) => ({
  name: user.name,
  bio: user.bio ?? "",
  category: user.creatorProfile?.category ?? "Lifestyle",
  subscriptionPrice: user.creatorProfile?.subscriptionPrice ?? 0,
  payoutMethod: user.creatorProfile?.payoutMethod ?? "UPI",
  payoutDetails: user.creatorProfile?.payoutDetails ?? "",
});

export function createStudioSettingsGet(database = db) {
  return async (_req, { user }) => {
    try {
      const settings = await database.user.findFirst({
        where: { id: user.id, role: "CREATOR", deletedAt: null, banned: false },
        select: selectSettings,
      });
      if (!settings) return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
      return NextResponse.json(presentSettings(settings));
    } catch (error) {
      return consumerErrorResponse(error, "Failed to load creator settings");
    }
  };
}

export function createStudioSettingsPatch(database = db) {
  return async (req, { user }) => {
    try {
      const { error, data } = validateBody(creatorSettingsSchema, await req.json());
      if (error) return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });

      const settings = await database.$transaction(async (transaction) => {
        const activeCreator = await transaction.user.findFirst({
          where: { id: user.id, role: "CREATOR", deletedAt: null, banned: false },
          select: { id: true },
        });
        if (!activeCreator) return null;

        await transaction.user.update({
          where: { id: user.id },
          data: { name: data.name, bio: data.bio },
        });
        await transaction.creatorProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            category: data.category,
            subscriptionPrice: data.subscriptionPrice,
            payoutMethod: data.payoutMethod,
            payoutDetails: data.payoutDetails,
          },
          update: {
            category: data.category,
            subscriptionPrice: data.subscriptionPrice,
            payoutMethod: data.payoutMethod,
            payoutDetails: data.payoutDetails,
          },
        });
        return transaction.user.findUnique({ where: { id: user.id }, select: selectSettings });
      });

      if (!settings) return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
      return NextResponse.json(presentSettings(settings));
    } catch (error) {
      if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      return consumerErrorResponse(error, "Failed to save creator settings");
    }
  };
}

export const GET = withCreatorAuth(createStudioSettingsGet());
export const PATCH = withCreatorAuth(createStudioSettingsPatch());
