"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  name: string;
  email: string;
  qualification: string;
  specialization: string;
  clinicAddress: string;
  feesPerAppointment: string;
  contactNumber: string;
};

export default function PhysiotherapistProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [fee, setFee] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/physiotherapists/profile"
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load profile."
          );
        }

        setProfile(data.profile);
        setFee(data.profile.feesPerAppointment);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleUpdateFee() {
    setError("");
    setSuccess("");

    const numericFee = Number(fee);

    if (!fee || !Number.isFinite(numericFee)) {
      setError("Please enter a valid fee.");
      return;
    }

    if (numericFee <= 0) {
      setError("Fee must be greater than zero.");
      return;
    }

    if (numericFee > 100000) {
      setError("Fee cannot exceed ₹100,000.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/physiotherapists/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            feesPerAppointment: numericFee,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update fee."
        );
      }

      setFee(data.profile.feesPerAppointment);

      setProfile((current) =>
        current
          ? {
              ...current,
              feesPerAppointment:
                data.profile.feesPerAppointment,
            }
          : current
      );

      setSuccess(
        "Appointment fee updated successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update fee."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-sky-50 px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-slate-500">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-sky-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">

        <button
          type="button"
          onClick={() =>
            router.push("/dashboard/physiotherapist")
          }
          className="mb-6 text-sm font-medium text-sky-700 hover:text-sky-900"
        >
          ← Back to Dashboard
        </button>

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <p className="text-sm font-medium text-sky-600">
            Physiotherapist Profile
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Profile & Appointment Fee
          </h1>

          <p className="mt-2 text-slate-500">
            View your professional information and update
            the fee charged for each appointment.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {profile && (
            <>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">
                    Name
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {profile.name}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">
                    Email
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {profile.email}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">
                    Qualification
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {profile.qualification}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">
                    Specialization
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {profile.specialization}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">
                    Contact Number
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {profile.contactNumber}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">
                    Clinic Address
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {profile.clinicAddress}
                  </p>
                </div>

              </div>

              <div className="mt-8 rounded-2xl border border-sky-100 bg-sky-50 p-6">

                <h2 className="text-xl font-bold text-slate-900">
                  Appointment Fee
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Patients will see this fee when booking
                  an appointment with you.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">

                  <div className="w-full sm:max-w-xs">
                    <label
                      htmlFor="fee"
                      className="text-sm font-medium text-slate-700"
                    >
                      Fee per appointment
                    </label>

                    <div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-white px-4">
                      <span className="text-lg font-semibold text-slate-500">
                        ₹
                      </span>

                      <input
                        id="fee"
                        type="number"
                        min="1"
                        max="100000"
                        step="0.01"
                        value={fee}
                        onChange={(event) =>
                          setFee(event.target.value)
                        }
                        className="w-full border-0 bg-transparent px-3 py-3 text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleUpdateFee}
                    disabled={saving}
                    className="rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Updating..."
                      : "Update Fee"}
                  </button>

                </div>

                <div className="mt-5 rounded-xl bg-white p-4">
                  <p className="text-sm text-slate-500">
                    Current appointment fee
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    ₹{profile.feesPerAppointment}
                  </p>
                </div>

              </div>
            </>
          )}

        </div>
      </div>
    </main>
  );
}

