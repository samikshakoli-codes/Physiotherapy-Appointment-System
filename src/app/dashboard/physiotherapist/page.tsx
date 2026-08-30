import { redirect } from "next/navigation";
import Link from "next/link";
import { and, asc, eq, gte } from "drizzle-orm";

import { getCurrentUser } from "@/lib/get-current-user";
import { db } from "@/db";
import {
  appointments,
  availabilitySlots,
  patientProfiles,
  physiotherapistProfiles,
  users,
} from "@/db/schema";

type Appointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  amount: string;
  status: string;
  patientName: string;
  patientContact: string;
};

export default async function PhysiotherapistDashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  if (user.role !== "PHYSIOTHERAPIST") {
    redirect("/dashboard/patient");
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
        user.userId
      )
    )
    .limit(1);

  if (physiotherapist.length === 0) {
    redirect("/signin");
  }

  const physiotherapistId =
    physiotherapist[0].id;

  /* =========================
     TODAY'S DATE
  ========================= */

  const now = new Date();

const today = `${now.getFullYear()}-${String(
  now.getMonth() + 1
).padStart(2, "0")}-${String(
  now.getDate()
).padStart(2, "0")}`;

console.log("SERVER DATE:", today);
console.log("SERVER TIME:", new Date().toString());

  /* =========================
     APPOINTMENTS
  ========================= */

  const allAppointments =
    await db
      .select({
        id: appointments.id,
        date: appointments.appointmentDate,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        amount: appointments.amount,
        status: appointments.status,
        patientName: users.name,
        patientContact:
          patientProfiles.contactNumber,
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
          physiotherapistId
        )
      )
      .orderBy(
        asc(appointments.appointmentDate),
        asc(appointments.startTime)
      );

  /* =========================
     TODAY'S APPOINTMENTS
  ========================= */

  const todaysAppointments =
    allAppointments.filter(
      (appointment) =>
        appointment.date === today &&
        appointment.status === "CONFIRMED"
    );

    console.log("TODAY:", today);
console.log("ALL APPOINTMENTS:", allAppointments);
console.log("TODAY'S APPOINTMENTS:", todaysAppointments);

  /* =========================
     UPCOMING APPOINTMENTS
  ========================= */

  const upcomingAppointments =
    allAppointments.filter(
      (appointment) =>
        appointment.date >= today &&
        appointment.status === "CONFIRMED"
    );

  /* =========================
     AVAILABLE SLOTS
  ========================= */

  const availableSlots =
    await db
      .select({
        id: availabilitySlots.id,
      })
      .from(availabilitySlots)
      .where(
        and(
          eq(
            availabilitySlots.physiotherapistId,
            physiotherapistId
          ),
          eq(
            availabilitySlots.status,
            "AVAILABLE"
          ),
          gte(
            availabilitySlots.slotDate,
            today
          )
        )
      );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              PhysioCare
            </h1>

            <p className="text-sm text-slate-500">
              Physiotherapist Portal
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 sm:block">
              Physiotherapist
            </div>

            <form
              action="/api/auth/logout"
              method="POST"
            >
              <button
                type="submit"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-sky-600">
            Welcome back
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Physiotherapist Dashboard
          </h2>

          <p className="mt-2 text-slate-600">
            Manage your appointments and availability.
          </p>
        </div>

        {/* Statistics */}

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Today's Appointments
            </p>

            <p className="mt-2 text-3xl font-bold">
              {todaysAppointments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Available Slots
            </p>

            <p className="mt-2 text-3xl font-bold text-sky-600">
              {availableSlots.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Upcoming
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {upcomingAppointments.length}
            </p>
          </div>
        </div>

        {/* Today's Appointments */}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">
  Today's Appointments
</h3>

<p className="mt-1 text-sm text-slate-500">
  {new Date(`${today}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })}
</p>

<p className="mt-1 text-sm text-slate-500">
  View and manage your appointments for today.
</p>

          {todaysAppointments.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-xl">
                🩺
              </div>

              <h4 className="mt-4 font-semibold text-slate-800">
                No appointments today
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Appointments booked by patients will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {todaysAppointments.map(
                (appointment: Appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {appointment.patientName}
                        </h4>

                        <p className="mt-1 text-sm text-slate-500">
                          📞 {appointment.patientContact}
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          🕐{" "}
                          {appointment.startTime.slice(
                            0,
                            5
                          )}{" "}
                          –{" "}
                          {appointment.endTime.slice(
                            0,
                            5
                          )}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                          {appointment.status}
                        </span>

                        <p className="mt-2 font-semibold text-slate-900">
                          ₹{appointment.amount}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">
            Upcoming Appointments
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Your upcoming confirmed patient appointments.
          </p>

          {upcomingAppointments.length === 0 ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              No upcoming appointments.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {upcomingAppointments.map(
                (appointment: Appointment) => (
                  <div
                    key={appointment.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {appointment.patientName}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        📅 {appointment.date}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        🕐{" "}
                        {appointment.startTime.slice(
                          0,
                          5
                        )}{" "}
                        –{" "}
                        {appointment.endTime.slice(
                          0,
                          5
                        )}
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                      {appointment.status}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Availability Management */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">
            Availability Management
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Create appointment slots, manage your schedule, and mark
            days off.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/dashboard/physiotherapist/availability"
              className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Manage Availability
            </Link>

            <Link
              href="/dashboard/physiotherapist/days-off"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Manage Days Off
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}