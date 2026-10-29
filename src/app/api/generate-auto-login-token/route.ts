import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const defaultExpiresMinutes =
      Number.parseInt(process.env.AUTO_LOGIN_TOKEN_EXPIRES_MINUTES || "") || 60;
    const { userId, email, expiresInMinutes = defaultExpiresMinutes } = await req.json();

    if (!userId && !email) {
      return NextResponse.json(
        { message: "Either userId or email is required." },
        { status: 400 },
      );
    }

    let user;
    if (email) {
      user = await db.users.findUnique({ where: { email } });
    } else if (userId) {
      user = await db.users.findUnique({ where: { id: userId } });
    }

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    await db.autoLoginTokens.create({
      userId: user.id,
      token,
      expiresAt,
    });

    const deeplink = `${req.nextUrl.origin}/?token=${token}`;

    console.log(`Generated auto-login token (expires in ${expiresInMinutes} minutes):`, deeplink);

    return NextResponse.json({
      token,
      expiresAt: expiresAt.toISOString(),
      expiresInMinutes,
      deeplink,
    });
  } catch (error) {
    console.error("Generate auto-login token error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
