import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  availabilitySlots,
  physiotherapistDaysOff,
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
   GET AVAILABILITY
========================= */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const requestedPhysiotherapistId =
      searchParams.get("physiotherapistId");

    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          message: "date is required",
        },
        { status: 400 }
      );
    }

    let physiotherapistId =
      requestedPhysiotherapistId;

    /*
     * If physiotherapistId is not provided,
     * use the currently logged-in physiotherapist.
     *
     * This is used by:
     * /dashboard/physiotherapist/availability
     */

    if (!physiotherapistId) {
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

      if (
        currentUser.role !== "PHYSIOTHERAPIST"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Physiotherapist access required",
          },
          { status: 403 }
        );
      }

      const physiotherapist =
        await db
          .select({
            id: physiotherapistProfiles.id,
          })
          .from(physiotherapistProfiles)
          .where(
            eq(
              physiotherapistProfiles.userId,
              currentUser.userId
            )
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

      physiotherapistId =
        physiotherapist[0].id;
    }

    /* =========================
       CHECK DAY OFF
    ========================= */

    const dayOff = await db
      .select({
        id: physiotherapistDaysOff.id,
        reason: physiotherapistDaysOff.reason,
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

    if (dayOff.length > 0) {
      return NextResponse.json({
        success: true,
        date,
        dayOff: true,
        reason: dayOff[0].reason,
        slots: [],
      });
    }

    /* =========================
       GET SLOTS
    ========================= */

    const slots = await db
      .select({
        id: availabilitySlots.id,
        date: availabilitySlots.slotDate,
        startTime: availabilitySlots.startTime,
        endTime: availabilitySlots.endTime,
        status: availabilitySlots.status,
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
            date
          )
        )
      )
      .orderBy(
        asc(availabilitySlots.startTime)
      );

    return NextResponse.json({
      success: true,
      date,
      dayOff: false,
      slots,
    });
  } catch (error) {
    console.error(
      "Failed to fetch availability:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch availability",
      },
      { status: 500 }
    );
  }
}

/* =========================
   CREATE AVAILABILITY
========================= */

export async function POST(
  request: NextRequest
) {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (
      currentUser.role !==
      "PHYSIOTHERAPIST"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only physiotherapists can create availability",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      date,
      slots,
    }: {
      date?: string;
      slots?: {
        startTime: string;
        endTime: string;
      }[];
    } = body;

    if (!date || !Array.isArray(slots)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "date and slots are required",
        },
        { status: 400 }
      );
    }

    if (slots.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "At least one slot is required",
        },
        { status: 400 }
      );
    }

    /* =========================
       FIND PHYSIOTHERAPIST
    ========================= */

    const physiotherapist =
      await db
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
          eq(
            users.id,
            currentUser.userId
          )
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
       CHECK DAY OFF
    ========================= */

    const dayOff = await db
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

    if (dayOff.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This date is marked as a day off",
        },
        { status: 400 }
      );
    }

    /* =========================
       NORMALIZE SLOTS
    ========================= */

    const normalizedSlots =
      slots.map((slot) => ({
        startTime:
          slot.startTime?.slice(0, 5),
        endTime:
          slot.endTime?.slice(0, 5),
      }));

    /* =========================
       VALIDATE TIMES
    ========================= */

    for (const slot of normalizedSlots) {
      if (
        !isValidTime(slot.startTime) ||
        !isValidTime(slot.endTime)
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
        timeToMinutes(
          slot.startTime
        ) >=
        timeToMinutes(
          slot.endTime
        )
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
    }

    /* =========================
       CHECK OVERLAPPING SUBMITTED SLOTS
    ========================= */

    const sortedSlots = [
      ...normalizedSlots,
    ].sort(
      (a, b) =>
        timeToMinutes(
          a.startTime
        ) -
        timeToMinutes(
          b.startTime
        )
    );

    for (
      let i = 1;
      i < sortedSlots.length;
      i++
    ) {
      if (
        timeToMinutes(
          sortedSlots[i].startTime
        ) <
        timeToMinutes(
          sortedSlots[i - 1].endTime
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Appointment slots cannot overlap",
          },
          { status: 400 }
        );
      }
    }

    /* =========================
       GET EXISTING SLOTS
    ========================= */

    const existingSlots =
      await db
        .select({
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
              date
            )
          )
        );

    const existingKeys =
      new Set(
        existingSlots.map(
          (slot) =>
            `${String(
              slot.startTime
            ).slice(0, 5)}-${String(
              slot.endTime
            ).slice(0, 5)}`
        )
      );

    /* =========================
       REMOVE DUPLICATES
    ========================= */

    const newSlots =
      normalizedSlots.filter(
        (slot) =>
          !existingKeys.has(
            `${slot.startTime}-${slot.endTime}`
          )
      );

    if (newSlots.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "All submitted slots already exist",
        },
        { status: 409 }
      );
    }

    /* =========================
       CREATE SLOTS
    ========================= */

    const createdSlots =
      await db
        .insert(availabilitySlots)
        .values(
          newSlots.map((slot) => ({
            physiotherapistId,
            slotDate: date,
            startTime:
              slot.startTime,
            endTime:
              slot.endTime,
            status:
              "AVAILABLE" as const,
          }))
        )
        .returning({
          id: availabilitySlots.id,
          date:
            availabilitySlots.slotDate,
          startTime:
            availabilitySlots.startTime,
          endTime:
            availabilitySlots.endTime,
          status:
            availabilitySlots.status,
        });

    return NextResponse.json(
      {
        success: true,
        message:
          "Availability created successfully",
        slots: createdSlots,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Failed to create availability:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create availability",
      },
      { status: 500 }
    );
  }
}