import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  physiotherapistDaysOff,
  physiotherapistProfiles,
  users,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/get-current-user";

/* =========================
   GET DAYS OFF
========================= */

export async function GET(request: NextRequest) {
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
          message: "Only physiotherapists can view days off",
        },
        { status: 403 }
      );
    }

    const physiotherapist = await db
      .select({
        id: physiotherapistProfiles.id,
      })
      .from(physiotherapistProfiles)
      .innerJoin(
        users,
        eq(physiotherapistProfiles.userId, users.id)
      )
      .where(eq(users.id, currentUser.userId))
      .limit(1);

    if (physiotherapist.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Physiotherapist profile not found",
        },
        { status: 404 }
      );
    }

    const daysOff = await db
      .select({
        id: physiotherapistDaysOff.id,
        date: physiotherapistDaysOff.offDate,
        reason: physiotherapistDaysOff.reason,
      })
      .from(physiotherapistDaysOff)
      .where(
        eq(
          physiotherapistDaysOff.physiotherapistId,
          physiotherapist[0].id
        )
      );

    return NextResponse.json({
      success: true,
      daysOff,
    });
  } catch (error) {
    console.error("Failed to fetch days off:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch days off",
      },
      { status: 500 }
    );
  }
}

/* =========================
   CREATE DAY OFF
========================= */

export async function POST(request: NextRequest) {
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
          message: "Only physiotherapists can mark days off",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      date,
      reason,
    }: {
      date?: string;
      reason?: string;
    } = body;

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          message: "Date is required",
        },
        { status: 400 }
      );
    }

    const physiotherapist = await db
      .select({
        id: physiotherapistProfiles.id,
      })
      .from(physiotherapistProfiles)
      .innerJoin(
        users,
        eq(physiotherapistProfiles.userId, users.id)
      )
      .where(eq(users.id, currentUser.userId))
      .limit(1);

    if (physiotherapist.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Physiotherapist profile not found",
        },
        { status: 404 }
      );
    }

    const physiotherapistId = physiotherapist[0].id;

    const existingDayOff = await db
      .select({
        id: physiotherapistDaysOff.id,
      })
      .from(physiotherapistDaysOff)
      .where(
        and(
          eq(
            physiotherapistDaysOff.physiotherapistId,
            physiotherapistId
          ),
          eq(
            physiotherapistDaysOff.offDate,
            date
          )
        )
      )
      .limit(1);

    if (existingDayOff.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "This date is already marked as a day off",
        },
        { status: 409 }
      );
    }

    const createdDayOff = await db
      .insert(physiotherapistDaysOff)
      .values({
        physiotherapistId,
        offDate: date,
        reason: reason?.trim() || null,
      })
      .returning({
        id: physiotherapistDaysOff.id,
        date: physiotherapistDaysOff.offDate,
        reason: physiotherapistDaysOff.reason,
      });

    return NextResponse.json(
      {
        success: true,
        message: "Day off created successfully",
        dayOff: createdDayOff[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create day off:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create day off",
      },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE DAY OFF
========================= */

export async function DELETE(request: NextRequest) {
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
          message: "Only physiotherapists can remove days off",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dayOffId = searchParams.get("id");

    if (!dayOffId) {
      return NextResponse.json(
        {
          success: false,
          message: "Day-off ID is required",
        },
        { status: 400 }
      );
    }

    const physiotherapist = await db
      .select({
        id: physiotherapistProfiles.id,
      })
      .from(physiotherapistProfiles)
      .innerJoin(
        users,
        eq(physiotherapistProfiles.userId, users.id)
      )
      .where(eq(users.id, currentUser.userId))
      .limit(1);

    if (physiotherapist.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Physiotherapist profile not found",
        },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(physiotherapistDaysOff)
      .where(
        and(
          eq(
            physiotherapistDaysOff.id,
            dayOffId
          ),
          eq(
            physiotherapistDaysOff.physiotherapistId,
            physiotherapist[0].id
          )
        )
      )
      .returning({
        id: physiotherapistDaysOff.id,
      });

    if (deleted.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Day off not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Day off removed successfully",
    });
  } catch (error) {
    console.error("Failed to delete day off:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove day off",
      },
      { status: 500 }
    );
  }
}