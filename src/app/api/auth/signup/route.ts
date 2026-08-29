import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  users,
  patientProfiles,
  physiotherapistProfiles,
  verificationTokens,
} from "@/db/schema";

import {
  patientSignupSchema,
  physiotherapistSignupSchema,
} from "@/lib/validation";

import {
  generateVerificationToken,
  getVerificationExpiry,
} from "@/lib/verification";

import resend from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.role === "PATIENT") {
      const result = patientSignupSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { error: "Invalid patient registration details" },
          { status: 400 }
        );
      }

      const data = result.data;

      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, data.email.toLowerCase()),
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }

      const passwordHash = await bcrypt.hash(data.password, 12);

      const [user] = await db
        .insert(users)
        .values({
          name: data.name,
          email: data.email.toLowerCase(),
          passwordHash,
          role: "PATIENT",
        })
        .returning();

      await db.insert(patientProfiles).values({
        userId: user.id,
        age: data.age,
        gender: data.gender,
        contactNumber: data.contactNumber,
      });

      const token = generateVerificationToken();

      await db.insert(verificationTokens).values({
        userId: user.id,
        token,
        expiresAt: getVerificationExpiry(),
      });

      const verificationUrl =
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;

await resend.emails.send({
  from: "onboarding@resend.dev",
  to: process.env.RESEND_TEST_EMAIL!,
  subject: "Verify your PhysioCare account",
  html: `
    <h2>Welcome to PhysioCare</h2>
    <p>Hello ${data.name},</p>

    <p>Please verify your email address to activate your account.</p>

    <p>
      <a href="${verificationUrl}">
        Verify Email Address
      </a>
    </p>

    <p>This verification link will expire in 24 hours.</p>
  `,
});

      return NextResponse.json(
        {
          message: "Account created. Please verify your email.",
          verificationToken: token,
        },
        { status: 201 }
      );
    }

    if (body.role === "PHYSIOTHERAPIST") {
      const result = physiotherapistSignupSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { error: "Invalid physiotherapist registration details" },
          { status: 400 }
        );
      }

      const data = result.data;

      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, data.email.toLowerCase()),
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }

      const passwordHash = await bcrypt.hash(data.password, 12);

      const [user] = await db
        .insert(users)
        .values({
          name: data.name,
          email: data.email.toLowerCase(),
          passwordHash,
          role: "PHYSIOTHERAPIST",
        })
        .returning();

      await db.insert(physiotherapistProfiles).values({
        userId: user.id,
        qualification: data.qualification,
        specialization: data.specialization,
        clinicAddress: data.clinicAddress,
        feesPerAppointment: data.feesPerAppointment.toString(),
        contactNumber: data.contactNumber,
      });

      const token = generateVerificationToken();

      await db.insert(verificationTokens).values({
        userId: user.id,
        token,
        expiresAt: getVerificationExpiry(),
      });

      const verificationUrl =
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;

await resend.emails.send({
  from: "onboarding@resend.dev",
  to: process.env.RESEND_TEST_EMAIL!,
  subject: "Verify your PhysioCare account",
  html: `
    <h2>Welcome to PhysioCare</h2>
    <p>Hello ${data.name},</p>

    <p>Please verify your email address to activate your account.</p>

    <p>
      <a href="${verificationUrl}">
        Verify Email Address
      </a>
    </p>

    <p>This verification link will expire in 24 hours.</p>
  `,
});

      return NextResponse.json(
        {
          message: "Account created. Please verify your email.",
          verificationToken: token,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: "Invalid role" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      { error: "Unable to create account" },
      { status: 500 }
    );
  }
}