import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  appointments,
  patientProfiles,
  physiotherapistProfiles,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/get-current-user";

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
          message:
            "Only physiotherapists can reorder appointments",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      appointmentId,
      direction,
    }: {
      appointmentId?: string;
      direction?: "UP" | "DOWN";
    } = body;

    if (!appointmentId || !direction) {
      return NextResponse.json(
        {
          success: false,
          message:
            "appointmentId and direction are required",
        },
        { status: 400 }
      );
    }

    if (direction !== "UP" && direction !== "DOWN") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Direction must be UP or DOWN",
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

    const physiotherapistId =
      physiotherapist[0].id;

    /* =========================
       FIND SELECTED APPOINTMENT
    ========================= */

    const selected = await db
      .select({
        id: appointments.id,
        date: appointments.appointmentDate,
        sequence: appointments.sequence,
      })
      .from(appointments)
      .where(
        and(
          eq(
            appointments.id,
            appointmentId
          ),
          eq(
            appointments.physiotherapistId,
            physiotherapistId
          )
        )
      )
      .limit(1);

    if (selected.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Appointment not found",
        },
        { status: 404 }
      );
    }

    const selectedAppointment =
      selected[0];

    /* =========================
       GET SAME-DAY APPOINTMENTS
    ========================= */

    const sameDayAppointments =
      await db
        .select({
          id: appointments.id,
          sequence: appointments.sequence,
          startTime:
            appointments.startTime,
        })
        .from(appointments)
        .where(
          and(
            eq(
              appointments.physiotherapistId,
              physiotherapistId
            ),
            eq(
              appointments.appointmentDate,
              selectedAppointment.date
            )
          )
        )
        .orderBy(
  asc(appointments.sequence),
  asc(appointments.id)
);

    if (sameDayAppointments.length <= 1) {
      return NextResponse.json({
        success: true,
        message:
          "No other appointments to reorder",
      });
    }

    /* =========================
       NORMALIZE SEQUENCE
    ========================= */

    const normalized =
      sameDayAppointments.map(
        (appointment, index) => ({
          ...appointment,
          sequence: index + 1,
        })
      );

    const currentIndex =
      normalized.findIndex(
        (appointment) =>
          appointment.id ===
          appointmentId
      );

    if (currentIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Appointment not found",
        },
        { status: 404 }
      );
    }

    const targetIndex =
      direction === "UP"
        ? currentIndex - 1
        : currentIndex + 1;

    /* =========================
       ALREADY AT EDGE
    ========================= */

    if (
      targetIndex < 0 ||
      targetIndex >= normalized.length
    ) {
      return NextResponse.json({
        success: true,
        message:
          direction === "UP"
            ? "Appointment is already first"
            : "Appointment is already last",
      });
    }

    /* =========================
       SWAP SEQUENCE
    ========================= */

    const currentAppointment =
      normalized[currentIndex];

    const targetAppointment =
      normalized[targetIndex];

    await db.transaction(
      async (transaction) => {
        /*
         * Temporarily use negative values
         * to avoid sequence conflicts.
         */

        await transaction
          .update(appointments)
          .set({
            sequence:
              -currentAppointment.sequence,
          })
          .where(
            eq(
              appointments.id,
              currentAppointment.id
            )
          );

        await transaction
          .update(appointments)
          .set({
            sequence:
              currentAppointment.sequence,
          })
          .where(
            eq(
              appointments.id,
              targetAppointment.id
            )
          );

        await transaction
          .update(appointments)
          .set({
            sequence:
              targetAppointment.sequence,
          })
          .where(
            eq(
              appointments.id,
              currentAppointment.id
            )
          );
      }
    );

    return NextResponse.json({
      success: true,
      message:
        "Appointment order updated successfully",
    });
  } catch (error) {
    console.error(
      "Failed to reorder appointments:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to reorder appointments",
      },
      { status: 500 }
    );
  }
}