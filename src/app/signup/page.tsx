"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type Role = "PATIENT" | "PHYSIOTHERAPIST";

export default function SignupPage() {
  const [role, setRole] = useState<Role>("PATIENT");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const form = new FormData(event.currentTarget);

    const body: Record<string, string> = {
      role,
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      contactNumber: String(form.get("contactNumber") ?? ""),
    };

    if (role === "PATIENT") {
      body.age = String(form.get("age") ?? "");
      body.gender = String(form.get("gender") ?? "");
    } else {
      body.qualification = String(form.get("qualification") ?? "");
      body.specialization = String(form.get("specialization") ?? "");
      body.clinicAddress = String(form.get("clinicAddress") ?? "");
      body.feesPerAppointment = String(
        form.get("feesPerAppointment") ?? ""
      );
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Registration failed");
        return;
      }

      setMessage(
        `Account created. Verification token: ${data.verificationToken}`
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="text-blue-400">
          ← PhysioCare
        </Link>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h1 className="text-3xl font-bold">Create your account</h1>

          <p className="mt-2 text-slate-400">
            Choose your account type to get started.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("PATIENT")}
              className={`rounded-lg border p-3 ${
                role === "PATIENT"
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-700"
              }`}
            >
              Patient
            </button>

            <button
              type="button"
              onClick={() => setRole("PHYSIOTHERAPIST")}
              className={`rounded-lg border p-3 ${
                role === "PHYSIOTHERAPIST"
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-700"
              }`}
            >
              Physiotherapist
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              name="name"
              placeholder="Full name"
              required
              className="w-full rounded-lg bg-slate-800 p-3 outline-none"
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full rounded-lg bg-slate-800 p-3 outline-none"
            />

            <input
              name="password"
              type="password"
              placeholder="Password (minimum 8 characters)"
              required
              minLength={8}
              className="w-full rounded-lg bg-slate-800 p-3 outline-none"
            />

            {role === "PATIENT" ? (
              <>
                <input
                  name="age"
                  type="number"
                  placeholder="Age"
                  min="1"
                  max="120"
                  required
                  className="w-full rounded-lg bg-slate-800 p-3 outline-none"
                />

                <select
                  name="gender"
                  required
                  className="w-full rounded-lg bg-slate-800 p-3 outline-none"
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </>
            ) : (
              <>
                <input
                  name="qualification"
                  placeholder="Qualification"
                  required
                  className="w-full rounded-lg bg-slate-800 p-3 outline-none"
                />

                <input
                  name="specialization"
                  placeholder="Specialization"
                  required
                  className="w-full rounded-lg bg-slate-800 p-3 outline-none"
                />

                <textarea
                  name="clinicAddress"
                  placeholder="Clinic address"
                  required
                  className="w-full rounded-lg bg-slate-800 p-3 outline-none"
                />

                <input
                  name="feesPerAppointment"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Fees per appointment"
                  required
                  className="w-full rounded-lg bg-slate-800 p-3 outline-none"
                />
              </>
            )}

            <input
              name="contactNumber"
              placeholder="Contact number"
              required
              className="w-full rounded-lg bg-slate-800 p-3 outline-none"
            />

            {error && (
              <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </p>
            )}

            {message && (
              <p className="rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
                {message}
              </p>
            )}

            <button
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 p-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/signin" className="text-blue-400">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}