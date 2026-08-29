import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";

import { getCurrentUser } from "@/lib/get-current-user";

type Physiotherapist = {
  id: string;
  name: string;
  specialization: string;
  feesPerAppointment: string;
};

type Appointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  amount: string;
  status: string;
  physiotherapistName: string;
  specialization: string;
};

async function getPhysiotherapists() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/physiotherapists`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return data.success
    ? data.physiotherapists
    : [];
}

async function getAppointments() {
  const cookieStore = await cookies();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/appointments`,
    {
      cache: "no-store",
      headers: {
        Cookie: cookieStore.toString(),
      },
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return data.success
    ? data.appointments
    : [];
}

export default async function PatientDashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  if (user.role !== "PATIENT") {
    redirect("/dashboard/physiotherapist");
  }

  const [
    physiotherapists,
    appointments,
  ] = await Promise.all([
    getPhysiotherapists(),
    getAppointments(),
  ]);

  return (
    <main className="min-h-screen bg-sky-50">
      {/* Header */}

      <header className="border-b border-sky-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-sky-700">
              PhysioCare
            </h1>

            <p className="text-sm text-slate-500">
              Patient Dashboard
            </p>
          </div>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Welcome */}

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-sky-600">
            Welcome back
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Find the right physiotherapist for you
          </h2>

          <p className="mt-3 max-w-2xl text-slate-500">
            Browse available physiotherapists,
            check their appointment slots, and
            book your next session.
          </p>
        </section>

        {/* Physiotherapists */}

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Available Physiotherapists
              </h2>

              <p className="mt-1 text-slate-500">
                Choose a specialist and view
                available appointments.
              </p>
            </div>
          </div>

          {physiotherapists.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-slate-500">
                No physiotherapists are currently
                available.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {physiotherapists.map(
                (
                  physiotherapist: Physiotherapist
                ) => (
                  <div
                    key={physiotherapist.id}
                    className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* Avatar */}

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-xl font-bold text-sky-700">
                      {physiotherapist.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <h3 className="mt-5 text-xl font-bold text-slate-900">
                      {physiotherapist.name}
                    </h3>

                    <p className="mt-2 text-sm font-medium text-sky-600">
                      {
                        physiotherapist.specialization
                      }
                    </p>

                    <div className="mt-5 border-t border-slate-100 pt-5">
                      <p className="text-sm text-slate-500">
                        Consultation Fee
                      </p>

                      <p className="mt-1 text-xl font-bold text-slate-900">
                        ₹
                        {
                          physiotherapist.feesPerAppointment
                        }
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/patient/book?physiotherapistId=${physiotherapist.id}`}
                      className="mt-5 block w-full rounded-xl bg-sky-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-sky-700"
                    >
                      View Available Appointments
                    </Link>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* Upcoming Appointments */}

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Upcoming Appointments
          </h2>

          <p className="mt-1 text-slate-500">
            Your confirmed physiotherapy sessions.
          </p>

          {appointments.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
              <p className="text-slate-500">
                You don't have any appointments
                yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {appointments.map(
                (appointment: Appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {
                            appointment.physiotherapistName
                          }
                        </h3>

                        <p className="mt-1 text-sm text-sky-600">
                          {
                            appointment.specialization
                          }
                        </p>

                        <p className="mt-3 text-sm text-slate-600">
                          📅{" "}
                          {appointment.date}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
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

                      <div className="text-left md:text-right">
                        <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                          {
                            appointment.status
                          }
                        </span>

                        <p className="mt-3 font-semibold text-slate-900">
                          ₹
                          {
                            appointment.amount
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}