import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  physiotherapistProfiles,
  users,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/get-current-user";

/* =========================
   GET PHYSIOTHERAPIST PROFILE
========================= */

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (currentUser.role !== "PHYSIOTHERAPIST") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only physiotherapists can access this profile",
        },
        { status: 403 }
      );
    }

    const profile = await db
      .select({
        id: physiotherapistProfiles.id,
        name: users.name,
        email: users.email,
        qualification:
          physiotherapistProfiles.qualification,
        specialization:
          physiotherapistProfiles.specialization,
        clinicAddress:
          physiotherapistProfiles.clinicAddress,
        feesPerAppointment:
          physiotherapistProfiles.feesPerAppointment,
        contactNumber:
          physiotherapistProfiles.contactNumber,
      })
      .from(physiotherapistProfiles)
      .innerJoin(
        users,
        eq(
          physiotherapistProfiles.userId,
          users.id
        )
      )
      .where(
        eq(users.id, currentUser.userId)
      )
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Physiotherapist profile not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: profile[0],
    });
  } catch (error) {
    console.error(
      "Failed to fetch physiotherapist profile:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch physiotherapist profile",
      },
      { status: 500 }
    );
  }
}

/* =========================
   UPDATE FEES
========================= */

export async function PATCH(
  request: NextRequest
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (currentUser.role !== "PHYSIOTHERAPIST") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only physiotherapists can update fees",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const feesPerAppointment =
      body.feesPerAppointment;

    if (
      feesPerAppointment === undefined ||
      feesPerAppointment === null ||
      feesPerAppointment === ""
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "feesPerAppointment is required",
        },
        { status: 400 }
      );
    }

    const fee = Number(
      feesPerAppointment
    );

    if (!Number.isFinite(fee)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Fee must be a valid number",
        },
        { status: 400 }
      );
    }

    if (fee <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Fee must be greater than zero",
        },
        { status: 400 }
      );
    }

    if (fee > 100000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Fee cannot exceed 100000",
        },
        { status: 400 }
      );
    }

    const updatedProfile = await db
      .update(physiotherapistProfiles)
      .set({
        feesPerAppointment:
          fee.toFixed(2),
      })
      .where(
        eq(
          physiotherapistProfiles.userId,
          currentUser.userId
        )
      )
      .returning({
        id: physiotherapistProfiles.id,
        feesPerAppointment:
          physiotherapistProfiles
            .feesPerAppointment,
      });

    if (updatedProfile.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Physiotherapist profile not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Appointment fee updated successfully",
      profile: updatedProfile[0],
    });
  } catch (error) {
    console.error(
      "Failed to update appointment fee:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update appointment fee",
      },
      { status: 500 }
    );
  }
}