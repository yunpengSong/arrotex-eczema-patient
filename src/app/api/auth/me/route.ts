import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    const user = await db.users.findUnique({ where: { email: decoded.email } });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        title: user.title,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
