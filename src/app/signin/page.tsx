"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SigninPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Login failed");
        return;
      }

      if (data.role === "PATIENT") {
        router.push("/dashboard/patient");
      } else {
        router.push("/dashboard/physiotherapist");
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-blue-400">
          ← PhysioCare
        </Link>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h1 className="text-3xl font-bold">Welcome back</h1>

          <p className="mt-2 text-slate-400">
            Sign in to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              placeholder="Password"
              required
              className="w-full rounded-lg bg-slate-800 p-3 outline-none"
            />

            {error && (
              <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 p-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-400">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}