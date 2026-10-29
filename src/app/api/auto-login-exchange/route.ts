import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing token" },
        { status: 400 },
      );
    }

    const loginToken = await db.autoLoginTokens.findUnique({ where: { token } });

    if (!loginToken) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing token" },
        { status: 400 },
      );
    }

    if (loginToken.used) {
      return NextResponse.json(
        { success: false, error: "This login link has already been used" },
        { status: 400 },
      );
    }

    if (new Date(loginToken.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: "This login link has expired" },
        { status: 400 },
      );
    }

    const user = await db.users.findUnique({ where: { id: loginToken.user_id } });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 400 },
      );
    }

    await db.autoLoginTokens.markAsUsed(loginToken.id);

    const jwtToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        title: user.title,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });

    response.cookies.set("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Auto-login exchange error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
