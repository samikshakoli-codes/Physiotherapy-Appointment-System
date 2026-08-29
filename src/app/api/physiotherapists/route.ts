import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { physiotherapistProfiles, users } from "@/db/schema";

export async function GET() {
  try {
    const physiotherapists = await db
      .select({
        id: physiotherapistProfiles.id,
        name: users.name,
        email: users.email,
        qualification: physiotherapistProfiles.qualification,
        specialization: physiotherapistProfiles.specialization,
        clinicAddress: physiotherapistProfiles.clinicAddress,
        feesPerAppointment: physiotherapistProfiles.feesPerAppointment,
        contactNumber: physiotherapistProfiles.contactNumber,
      })
      .from(physiotherapistProfiles)
      .innerJoin(
        users,
        eq(physiotherapistProfiles.userId, users.id)
      )
      .where(eq(users.role, "PHYSIOTHERAPIST"));

    return NextResponse.json(
      {
        success: true,
        physiotherapists,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch physiotherapists:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch physiotherapists",
      },
      { status: 500 }
    );
  }
}