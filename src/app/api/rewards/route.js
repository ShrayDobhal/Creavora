import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST claim rewards (claim XP)
export async function POST(req) {
  try {
    const { questId, xpReward } = await req.json();
    const rewardValue = parseInt(xpReward);

    if (isNaN(rewardValue) || rewardValue <= 0) {
      return NextResponse.json({ error: "Invalid XP reward value" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { handle: "arjun" },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Level up calculation: e.g. 1000 XP per level
    const currentXp = user.xp + rewardValue;
    const currentLevel = user.level;
    const targetLevelThreshold = currentLevel * 1000;

    let newLevel = currentLevel;
    let didLevelUp = false;

    if (currentXp >= targetLevelThreshold) {
      newLevel += 1;
      didLevelUp = true;
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        xp: currentXp,
        level: newLevel,
      }
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: user.id,
        title: didLevelUp ? "Level Up! 🎉" : "Rewards Claimed",
        message: didLevelUp
          ? `Congratulations! You leveled up to Level ${newLevel}! Keep earning rewards.`
          : `You claimed ${rewardValue} XP from completing quest: "${questId}".`,
        type: "SYSTEM",
        read: false,
      }
    });

    return NextResponse.json({
      success: true,
      xp: updatedUser.xp,
      level: updatedUser.level,
      didLevelUp
    });
  } catch (error) {
    console.error("POST Claim Rewards Error:", error);
    return NextResponse.json({ error: "Failed to claim rewards" }, { status: 500 });
  }
}
