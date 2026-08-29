"use client";

import { useEffect, useState } from "react";

type DayOff = {
  id: string;
  date: string;
  reason: string | null;
};

export default function DaysOffPage() {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [daysOff, setDaysOff] = useState<DayOff[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadDaysOff() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/days-off");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load days off"
        );
      }

      setDaysOff(data.daysOff || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load days off"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDaysOff();
  }, []);

  async function handleSave() {
    if (!date) {
      setError("Please select a date.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/days-off", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          reason,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to create day off"
        );
      }

      setMessage("Day off marked successfully.");
      setDate("");
      setReason("");

      await loadDaysOff();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create day off"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      setDeleting(id);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/days-off?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to remove day off"
        );
      }

      setMessage("Day off removed successfully.");

      await loadDaysOff();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove day off"
      );
    } finally {
      setDeleting("");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <h1 className="text-2xl font-bold">
            PhysioCare
          </h1>

          <p className="text-sm text-slate-500">
            Days Off Management
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-3xl font-bold">
          Manage Days Off
        </h2>

        <p className="mt-2 text-slate-600">
          Mark dates when you are unavailable for appointments.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Create Day Off */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">
              Mark a Day Off
            </h3>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Date
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Reason
                </label>

                <input
                  type="text"
                  value={reason}
                  onChange={(e) =>
                    setReason(e.target.value)
                  }
                  placeholder="Optional"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : "Mark Day Off"}
              </button>

              {message && (
                <p className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                  {message}
                </p>
              )}

              {error && (
                <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Existing Days Off */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">
              Scheduled Days Off
            </h3>

            {loading && (
              <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                Loading days off...
              </div>
            )}

            {!loading && daysOff.length === 0 && (
              <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                No days off scheduled.
              </div>
            )}

            {!loading && daysOff.length > 0 && (
              <div className="mt-6 space-y-3">
                {daysOff.map((dayOff) => (
                  <div
                    key={dayOff.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {dayOff.date}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {dayOff.reason || "No reason provided"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(dayOff.id)
                      }
                      disabled={deleting === dayOff.id}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deleting === dayOff.id
                        ? "Removing..."
                        : "Remove"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}