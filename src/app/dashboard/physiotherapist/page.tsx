import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";

export default async function PhysiotherapistDashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  if (user.role !== "PHYSIOTHERAPIST") {
    redirect("/dashboard/patient");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="text-3xl font-bold">
        Physiotherapist Dashboard
      </h1>

      <p className="mt-3 text-slate-400">
        Manage your appointments and availability.
      </p>

      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">
          Today's Appointments
        </h2>

        <p className="mt-3 text-slate-400">
          Your appointments will appear here.
        </p>
      </div>
    </main>
  );
}