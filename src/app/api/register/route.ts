import crypto from "crypto";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendRegistrationEmails } from "@/lib/email";
import { isRecaptchaEnabled, verifyRecaptcha } from "@/lib/recaptcha";

export async function POST(req: NextRequest) {
  try {
    const { title, firstName, lastName, email, password, recaptchaToken } = await req.json();

    if (!email || !password || !firstName || !lastName || !title) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    if (isRecaptchaEnabled()) {
      const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!isRecaptchaValid) {
        return NextResponse.json(
          { message: "reCAPTCHA verification failed." },
          { status: 400 },
        );
      }
    }

    const existingUser = await db.users.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.users.create({
      title,
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    let deeplink: string | null = null;
    try {
      const expiresMinutes =
        Number.parseInt(process.env.AUTO_LOGIN_TOKEN_EXPIRES_MINUTES || "") || 60;
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
      await db.autoLoginTokens.create({
        userId: user.id,
        token,
        expiresAt,
      });
      deeplink = `${req.nextUrl.origin}/?token=${token}`;
      console.log(`Generated deeplink for new user (expires in ${expiresMinutes} minutes):`, deeplink);
    } catch (tokenError) {
      console.error("Failed to generate auto-login token:", tokenError);
    }

    // Send welcome email and admin notification
    try {
      const emailResult = await sendRegistrationEmails({
        id: user.id,
        title,
        firstName,
        lastName,
        email,
        deeplink,
      });
      console.log("Registration emails result:", JSON.stringify(emailResult));
    } catch (emailError) {
      console.error("Failed to send registration emails:", emailError);
      // Email failures must not break registration
    }

    return NextResponse.json({
      message: "User registered successfully.",
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
