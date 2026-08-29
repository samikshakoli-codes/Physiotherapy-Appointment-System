"use client";

import { useEffect, useState } from "react";

type Slot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "BOOKED" | "BLOCKED";
};

export default function AvailabilityPage() {
  const [date, setDate] = useState(
  new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadAvailability(selectedDate: string) {
    if (!selectedDate) return;

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/availability?date=${encodeURIComponent(selectedDate)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load availability"
        );
      }

      setSlots(data.slots || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load availability"
      );

      setSlots([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  const savedDate = localStorage.getItem("physioAvailabilityDate");

  if (savedDate) {
    setDate(savedDate);
  }
}, []);

  useEffect(() => {
    if (date) {
      loadAvailability(date);
    }
  }, [date]);

  async function handleSave() {
    if (!date) {
      setError("Please select a date.");
      return;
    }

    if (!startTime || !endTime) {
      setError("Please enter both start and end time.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          slots: [
            {
              startTime,
              endTime,
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to create availability"
        );
      }

      setMessage("Appointment slot created successfully.");

      setStartTime("");
      setEndTime("");

      await loadAvailability(date);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create availability"
      );
    } finally {
      setSaving(false);
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
            Availability Management
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-3xl font-bold">
          Manage Availability
        </h2>

        <p className="mt-2 text-slate-600">
          Create appointment slots that patients can book.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Create Slot */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">
              Create Appointment Slot
            </h3>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Date
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
  const selectedDate = e.target.value;

  setDate(selectedDate);
  localStorage.setItem(
    "physioAvailabilityDate",
    selectedDate
  );
}}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Start Time
                </label>

                <input
                  type="time"
                  value={startTime}
                  onChange={(e) =>
                    setStartTime(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  End Time
                </label>

                <input
                  type="time"
                  value={endTime}
                  onChange={(e) =>
                    setEndTime(e.target.value)
                  }
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
                  : "Create Appointment Slot"}
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

          {/* Existing Slots */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">
              Scheduled Slots
            </h3>

            {!date && (
              <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                Select a date to view your appointment slots.
              </div>
            )}

            {date && loading && (
              <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                Loading availability...
              </div>
            )}

            {date && !loading && slots.length === 0 && (
              <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                No appointment slots created for this date.
              </div>
            )}

            {date && !loading && slots.length > 0 && (
              <div className="mt-6 space-y-3">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {slot.startTime} – {slot.endTime}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Status: {slot.status}
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {slot.status}
                    </span>
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
