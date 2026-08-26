import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    const verification = await db.query.verificationTokens.findFirst({
      where: eq(verificationTokens.token, token),
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, verification.userId));

    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.id, verification.id),
          eq(verificationTokens.userId, verification.userId)
        )
      );

    return NextResponse.json({
      message: "Email verified successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Verification error:", error);

    return NextResponse.json(
      { error: "Unable to verify email" },
      { status: 500 }
    );
  }
}