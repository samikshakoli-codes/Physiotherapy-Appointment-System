import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  users,
  verificationTokens,
} from "@/db/schema";

import {
  generateVerificationToken,
  getVerificationExpiry,
} from "@/lib/verification";

import resend from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email?.toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Account not found",
        },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is already verified",
        },
        { status: 400 }
      );
    }

    const token = generateVerificationToken();

    await db.insert(verificationTokens).values({
      userId: user.id,
      token,
      expiresAt: getVerificationExpiry(),
    });

    const verificationUrl =
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;

    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.RESEND_TEST_EMAIL!,
      subject: "Verify your PhysioCare account",
      html: `
        <h2>Welcome to PhysioCare</h2>

        <p>Hello ${user.name},</p>

        <p>
          Please verify your email address to activate your account.
        </p>

        <p>
          <a href="${verificationUrl}">
            Verify Email Address
          </a>
        </p>

        <p>
          This verification link will expire in 24 hours.
        </p>
      `,
    });

    if (error) {
      console.error("Resend verification email failed:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to send verification email",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Verification email sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Resend verification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to resend verification email",
      },
      { status: 500 }
    );
  }
}