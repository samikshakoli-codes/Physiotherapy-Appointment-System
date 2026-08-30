import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq, gte } from "drizzle-orm";

import { db } from "@/db";
import {
  appointments,
  availabilitySlots,
  patientProfiles,
  physiotherapistProfiles,
  users,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/get-current-user";

/* =========================
   GET PATIENT APPOINTMENTS
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

    const now = new Date();

const today = `${now.getFullYear()}-${String(
  now.getMonth() + 1
).padStart(2, "0")}-${String(
  now.getDate()
).padStart(2, "0")}`;

    if (currentUser.role === "PATIENT") {
      const patient = await db
        .select({
          id: patientProfiles.id,
        })
        .from(patientProfiles)
        .where(
          eq(
            patientProfiles.userId,
            currentUser.userId
          )
        )
        .limit(1);

      if (patient.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Patient profile not found",
          },
          { status: 404 }
        );
      }

      const patientAppointments = await db
        .select({
          id: appointments.id,
          date: appointments.appointmentDate,
          startTime: appointments.startTime,
          endTime: appointments.endTime,
          amount: appointments.amount,
          status: appointments.status,
          physiotherapistName: users.name,
          specialization:
            physiotherapistProfiles.specialization,
        })
        .from(appointments)
        .innerJoin(
          physiotherapistProfiles,
          eq(
            appointments.physiotherapistId,
            physiotherapistProfiles.id
          )
        )
        .innerJoin(
          users,
          eq(
            physiotherapistProfiles.userId,
            users.id
          )
        )
        .where(
  and(
    eq(
      appointments.patientId,
      patient[0].id
    ),
    gte(
      appointments.appointmentDate,
      today
    )
  )
)
.orderBy(
  asc(appointments.appointmentDate),
  asc(appointments.startTime)
);

      return NextResponse.json({
        success: true,
        appointments: patientAppointments,
      });
    }

    if (
      currentUser.role ===
      "PHYSIOTHERAPIST"
    ) {
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

      const physiotherapistAppointments =
  await db
    .select({
      id: appointments.id,
      date: appointments.appointmentDate,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      amount: appointments.amount,
      status: appointments.status,
      sequence: appointments.sequence,
      patientName: users.name,
      patientContact: patientProfiles.contactNumber,
    })
          .from(appointments)
          .innerJoin(
            patientProfiles,
            eq(
              appointments.patientId,
              patientProfiles.id
            )
          )
          .innerJoin(
            users,
            eq(
              patientProfiles.userId,
              users.id
            )
          )
          .where(
  eq(
    appointments.physiotherapistId,
    physiotherapist[0].id
  )
)
.orderBy(asc(appointments.sequence));

      return NextResponse.json({
        success: true,
        appointments:
          physiotherapistAppointments,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid user role",
      },
      { status: 403 }
    );
  } catch (error) {
    console.error(
      "Failed to fetch appointments:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch appointments",
      },
      { status: 500 }
    );
  }
}

/* =========================
   CREATE APPOINTMENT
========================= */

export async function POST(
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

    if (currentUser.role !== "PATIENT") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only patients can book appointments",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const slotId = body.slotId;

    if (!slotId) {
      return NextResponse.json(
        {
          success: false,
          message: "slotId is required",
        },
        { status: 400 }
      );
    }

    /* =========================
       FIND PATIENT
    ========================= */

    const patient = await db
      .select({
        id: patientProfiles.id,
      })
      .from(patientProfiles)
      .where(
        eq(
          patientProfiles.userId,
          currentUser.userId
        )
      )
      .limit(1);

    if (patient.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient profile not found",
        },
        { status: 404 }
      );
    }

    /* =========================
       FIND AVAILABLE SLOT
    ========================= */

    const slot = await db
      .select({
        id: availabilitySlots.id,
        physiotherapistId:
          availabilitySlots.physiotherapistId,
        date:
          availabilitySlots.slotDate,
        startTime:
          availabilitySlots.startTime,
        endTime:
          availabilitySlots.endTime,
        status:
          availabilitySlots.status,
        fees:
          physiotherapistProfiles.feesPerAppointment,
      })
      .from(availabilitySlots)
      .innerJoin(
        physiotherapistProfiles,
        eq(
          availabilitySlots.physiotherapistId,
          physiotherapistProfiles.id
        )
      )
      .where(
        eq(
          availabilitySlots.id,
          slotId
        )
      )
      .limit(1);

    if (slot.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Appointment slot not found",
        },
        { status: 404 }
      );
    }

    const selectedSlot = slot[0];

    /* =========================
       CHECK SLOT STATUS
    ========================= */

    if (
      selectedSlot.status !==
      "AVAILABLE"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This appointment slot is no longer available",
        },
        { status: 409 }
      );
    }

    /* =========================
       CREATE APPOINTMENT
    ========================= */

    const createdAppointment =
      await db.transaction(
        async (transaction) => {
          const lockedSlot =
            await transaction
              .select({
                id: availabilitySlots.id,
                physiotherapistId:
                  availabilitySlots.physiotherapistId,
                date:
                  availabilitySlots.slotDate,
                startTime:
                  availabilitySlots.startTime,
                endTime:
                  availabilitySlots.endTime,
                status:
                  availabilitySlots.status,
              })
              .from(availabilitySlots)
              .where(
                eq(
                  availabilitySlots.id,
                  slotId
                )
              )
              .limit(1);

          if (
            lockedSlot.length === 0 ||
            lockedSlot[0].status !==
              "AVAILABLE"
          ) {
            throw new Error(
              "SLOT_UNAVAILABLE"
            );
          }

          const appointment =
            await transaction
              .insert(appointments)
              .values({
                patientId:
                  patient[0].id,

                physiotherapistId:
                  lockedSlot[0]
                    .physiotherapistId,

                slotId:
                  lockedSlot[0].id,

                appointmentDate:
                  lockedSlot[0].date,

                startTime:
                  lockedSlot[0]
                    .startTime,

                endTime:
                  lockedSlot[0]
                    .endTime,

                amount:
                  selectedSlot.fees,

                status: "CONFIRMED",
              })
              .returning({
                id: appointments.id,
                date:
                  appointments.appointmentDate,
                startTime:
                  appointments.startTime,
                endTime:
                  appointments.endTime,
                amount:
                  appointments.amount,
                status:
                  appointments.status,
              });

          await transaction
            .update(availabilitySlots)
            .set({
              status: "BOOKED",
            })
            .where(
              and(
                eq(
                  availabilitySlots.id,
                  slotId
                ),
                eq(
                  availabilitySlots.status,
                  "AVAILABLE"
                )
              )
            );

          return appointment[0];
        }
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Appointment booked successfully",
        appointment:
          createdAppointment,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "SLOT_UNAVAILABLE"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This appointment slot has already been booked",
        },
        { status: 409 }
      );
    }

    console.error(
      "Failed to create appointment:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create appointment",
      },
      { status: 500 }
    );
  }
}