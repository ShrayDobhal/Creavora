import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clearAuthCookies, getTokensFromCookies, hashRefreshToken, verifyRefreshToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const { refreshToken } = await getTokensFromCookies();

    if (refreshToken) {
      const payload = verifyRefreshToken(refreshToken);
      if (payload?.sub) {
        // Check query param for logout everywhere
        const url = new URL(req.url);
        const everywhere = url.searchParams.get("everywhere") === "true";

        if (everywhere) {
          // Revoke ALL refresh tokens for this user
          await db.refreshToken.updateMany({
            where: { userId: payload.sub },
            data: { revoked: true },
          });
        } else {
          // Revoke only the current session's token
          await db.refreshToken.updateMany({
            where: { tokenHash: hashRefreshToken(refreshToken) },
            data: { revoked: true },
          });
        }

        // Log activity
        await db.activityLog.create({
          data: {
            userId: payload.sub,
            action: "LOGOUT",
            details: everywhere ? "Logged out of all devices" : "Logged out",
            ipAddress:
              req.headers.get("x-forwarded-for") ||
              req.headers.get("x-real-ip") ||
              "unknown",
          },
        });
      }
    }

    await clearAuthCookies();

    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    // Still clear cookies even if DB operations fail
    await clearAuthCookies();
    return NextResponse.json({ success: true, message: "Logged out" });
  }
}
