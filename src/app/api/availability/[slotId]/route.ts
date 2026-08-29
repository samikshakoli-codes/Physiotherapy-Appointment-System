import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  availabilitySlots,
  physiotherapistProfiles,
  users,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/get-current-user";

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);

  return hours * 60 + minutes;
}

/* =========================
   UPDATE AVAILABILITY SLOT
========================= */

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      slotId: string;
    }>;
  }
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
            "Only physiotherapists can update availability",
        },
        { status: 403 }
      );
    }

    const { slotId } = await context.params;

    if (!slotId) {
      return NextResponse.json(
        {
          success: false,
          message: "Slot ID is required",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const startTime = body.startTime;
    const endTime = body.endTime;

    if (!startTime || !endTime) {
      return NextResponse.json(
        {
          success: false,
          message:
            "startTime and endTime are required",
        },
        { status: 400 }
      );
    }

    const normalizedStartTime =
      String(startTime).slice(0, 5);

    const normalizedEndTime =
      String(endTime).slice(0, 5);

    if (
      !isValidTime(normalizedStartTime) ||
      !isValidTime(normalizedEndTime)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid time format. Use HH:MM",
        },
        { status: 400 }
      );
    }

    if (
      timeToMinutes(normalizedStartTime) >=
      timeToMinutes(normalizedEndTime)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Slot end time must be after start time",
        },
        { status: 400 }
      );
    }

    /* =========================
       FIND PHYSIOTHERAPIST
    ========================= */

    const physiotherapist = await db
      .select({
        id: physiotherapistProfiles.id,
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

    if (physiotherapist.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Physiotherapist profile not found",
        },
        { status: 404 }
      );
    }

    const physiotherapistId =
      physiotherapist[0].id;

    /* =========================
       FIND SLOT
    ========================= */

    const existingSlot = await db
      .select({
        id: availabilitySlots.id,
        date: availabilitySlots.slotDate,
        status: availabilitySlots.status,
      })
      .from(availabilitySlots)
      .where(
        and(
          eq(
            availabilitySlots.id,
            slotId
          ),
          eq(
            availabilitySlots.physiotherapistId,
            physiotherapistId
          )
        )
      )
      .limit(1);

    if (existingSlot.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Availability slot not found",
        },
        { status: 404 }
      );
    }

    /* =========================
       DON'T MODIFY BOOKED SLOT
    ========================= */

    if (existingSlot[0].status === "BOOKED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Booked slots cannot be modified",
        },
        { status: 409 }
      );
    }

    /* =========================
       CHECK OVERLAPPING SLOTS
    ========================= */

    const otherSlots = await db
      .select({
        id: availabilitySlots.id,
        startTime:
          availabilitySlots.startTime,
        endTime:
          availabilitySlots.endTime,
      })
      .from(availabilitySlots)
      .where(
        and(
          eq(
            availabilitySlots.physiotherapistId,
            physiotherapistId
          ),
          eq(
            availabilitySlots.slotDate,
            existingSlot[0].date
          )
        )
      );

    const newStart =
      timeToMinutes(normalizedStartTime);

    const newEnd =
      timeToMinutes(normalizedEndTime);

    const overlaps = otherSlots.some(
      (slot) => {
        if (slot.id === slotId) {
          return false;
        }

        const existingStart =
          timeToMinutes(
            String(slot.startTime).slice(0, 5)
          );

        const existingEnd =
          timeToMinutes(
            String(slot.endTime).slice(0, 5)
          );

        return (
          newStart < existingEnd &&
          newEnd > existingStart
        );
      }
    );

    if (overlaps) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Updated slot overlaps with another slot",
        },
        { status: 400 }
      );
    }

    /* =========================
       UPDATE SLOT
    ========================= */

    const updatedSlot = await db
      .update(availabilitySlots)
      .set({
        startTime: normalizedStartTime,
        endTime: normalizedEndTime,
      })
      .where(
        and(
          eq(
            availabilitySlots.id,
            slotId
          ),
          eq(
            availabilitySlots.physiotherapistId,
            physiotherapistId
          )
        )
      )
      .returning({
        id: availabilitySlots.id,
        date: availabilitySlots.slotDate,
        startTime:
          availabilitySlots.startTime,
        endTime:
          availabilitySlots.endTime,
        status:
          availabilitySlots.status,
      });

    return NextResponse.json({
      success: true,
      message:
        "Availability slot updated successfully",
      slot: updatedSlot[0],
    });
  } catch (error) {
    console.error(
      "Failed to update availability slot:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update availability slot",
      },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE AVAILABILITY SLOT
========================= */

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      slotId: string;
    }>;
  }
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
            "Only physiotherapists can delete availability",
        },
        { status: 403 }
      );
    }

    const { slotId } = await context.params;

    if (!slotId) {
      return NextResponse.json(
        {
          success: false,
          message: "Slot ID is required",
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
        eq(
          physiotherapistProfiles.userId,
          users.id
        )
      )
      .where(
        eq(users.id, currentUser.userId)
      )
      .limit(1);

    if (physiotherapist.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Physiotherapist profile not found",
        },
        { status: 404 }
      );
    }

    const physiotherapistId =
      physiotherapist[0].id;

    const existingSlot = await db
      .select({
        id: availabilitySlots.id,
        status: availabilitySlots.status,
      })
      .from(availabilitySlots)
      .where(
        and(
          eq(
            availabilitySlots.id,
            slotId
          ),
          eq(
            availabilitySlots.physiotherapistId,
            physiotherapistId
          )
        )
      )
      .limit(1);

    if (existingSlot.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Availability slot not found",
        },
        { status: 404 }
      );
    }

    if (existingSlot[0].status === "BOOKED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Booked slots cannot be deleted",
        },
        { status: 409 }
      );
    }

    await db
      .delete(availabilitySlots)
      .where(
        and(
          eq(
            availabilitySlots.id,
            slotId
          ),
          eq(
            availabilitySlots.physiotherapistId,
            physiotherapistId
          )
        )
      );

    return NextResponse.json({
      success: true,
      message:
        "Availability slot deleted successfully",
    });
  } catch (error) {
    console.error(
      "Failed to delete availability slot:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete availability slot",
      },
      { status: 500 }
    );
  }
}