"use client";

import { Suspense, useEffect, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

type Physiotherapist = {
  id: string;
  name: string;
  specialization: string;
  feesPerAppointment: string;
};

type Slot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "BOOKED" | "BLOCKED";
};

function BookAppointmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const physiotherapistId =
    searchParams.get("physiotherapistId");

  const [physiotherapist, setPhysiotherapist] =
    useState<Physiotherapist | null>(null);

  const [selectedDate, setSelectedDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [slots, setSlots] =
    useState<Slot[]>([]);

  const [selectedSlot, setSelectedSlot] =
    useState<Slot | null>(null);

  const [loadingPhysio, setLoadingPhysio] =
    useState(true);

  const [loadingSlots, setLoadingSlots] =
    useState(false);

  const [booking, setBooking] =
    useState(false);

  const [error, setError] =
    useState("");

  const [dayOff, setDayOff] =
    useState(false);

  const [dayOffReason, setDayOffReason] =
    useState("");

  useEffect(() => {
    async function loadPhysiotherapist() {
      if (!physiotherapistId) {
        setError(
          "Physiotherapist was not selected."
        );
        setLoadingPhysio(false);
        return;
      }

      try {
        const response = await fetch(
          "/api/physiotherapists"
        );

        const data = await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to load physiotherapists."
          );
        }

        const found =
          data.physiotherapists.find(
            (item: Physiotherapist) =>
              item.id ===
              physiotherapistId
          );

        if (!found) {
          throw new Error(
            "Physiotherapist not found."
          );
        }

        setPhysiotherapist(found);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load physiotherapist."
        );
      } finally {
        setLoadingPhysio(false);
      }
    }

    loadPhysiotherapist();
  }, [physiotherapistId]);

  useEffect(() => {
    async function loadAvailability() {
      if (!physiotherapistId || !selectedDate) {
        return;
      }

      try {
        setLoadingSlots(true);
        setError("");
        setSelectedSlot(null);

        const response = await fetch(
          `/api/availability?physiotherapistId=${encodeURIComponent(
            physiotherapistId
          )}&date=${encodeURIComponent(
            selectedDate
          )}`
        );

        const data = await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to load availability."
          );
        }

        setDayOff(
          Boolean(data.dayOff)
        );

        setDayOffReason(
          data.reason || ""
        );

        setSlots(
          data.dayOff
            ? []
            : data.slots || []
        );
      } catch (err) {
        setSlots([]);
        setDayOff(false);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load availability."
        );
      } finally {
        setLoadingSlots(false);
      }
    }

    loadAvailability();
  }, [physiotherapistId, selectedDate]);

  function handleBooking() {
    if (!selectedSlot) {
      setError(
        "Please select an appointment slot."
      );
      return;
    }

    if (!physiotherapistId) {
      setError(
        "Physiotherapist was not selected."
      );
      return;
    }

    setBooking(true);
    setError("");

    router.push(
      `/dashboard/patient/payment?slotId=${encodeURIComponent(
        selectedSlot.id
      )}&physiotherapistId=${encodeURIComponent(
        physiotherapistId
      )}&date=${encodeURIComponent(
        selectedDate
      )}`
    );
  }

  if (loadingPhysio) {
    return (
      <main className="min-h-screen bg-sky-50 px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-slate-500">
            Loading physiotherapist...
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
          onClick={() => router.back()}
          className="mb-6 text-sm font-medium text-sky-700 hover:text-sky-900"
        >
          ← Back to Dashboard
        </button>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {physiotherapist && (
          <>
            {/* Physiotherapist */}

            <section className="rounded-3xl bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-2xl font-bold text-sky-700">
                  {physiotherapist.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <p className="text-sm font-medium text-sky-600">
                    Physiotherapist
                  </p>

                  <h1 className="mt-1 text-3xl font-bold text-slate-900">
                    {physiotherapist.name}
                  </h1>

                  <p className="mt-2 text-slate-500">
                    {
                      physiotherapist.specialization
                    }
                  </p>
                </div>

                <div className="sm:ml-auto">
                  <p className="text-sm text-slate-500">
                    Consultation Fee
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    ₹
                    {
                      physiotherapist.feesPerAppointment
                    }
                  </p>
                </div>
              </div>
            </section>

            {/* Date */}

            <section className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Choose Appointment Date
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Select a date to view available
                appointment slots.
              </p>

              <input
                type="date"
                value={selectedDate}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                onChange={(event) => {
                  setSelectedDate(
                    event.target.value
                  );
                }}
                className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 sm:max-w-xs"
              />
            </section>

            {/* Slots */}

            <section className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Available Appointment Slots
              </h2>

              {loadingSlots ? (
                <p className="mt-5 text-slate-500">
                  Loading available slots...
                </p>
              ) : dayOff ? (
                <div className="mt-5 rounded-2xl bg-amber-50 p-5">
                  <p className="font-semibold text-amber-800">
                    Physiotherapist is
                    unavailable on this date.
                  </p>

                  {dayOffReason && (
                    <p className="mt-1 text-sm text-amber-700">
                      {dayOffReason}
                    </p>
                  )}
                </div>
              ) : slots.length === 0 ? (
                <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                  <p className="text-slate-500">
                    No appointment slots are
                    available for this date.
                  </p>
                </div>
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {slots.map((slot) => {
                    const available =
                      slot.status ===
                      "AVAILABLE";

                    const selected =
                      selectedSlot?.id ===
                      slot.id;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!available}
                        onClick={() =>
                          setSelectedSlot(
                            slot
                          )
                        }
                        className={`rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100"
                            : available
                              ? "border-slate-200 bg-white hover:border-sky-400 hover:bg-sky-50"
                              : "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50"
                        }`}
                      >
                        <p className="font-semibold text-slate-900">
                          {slot.startTime.slice(
                            0,
                            5
                          )}{" "}
                          –{" "}
                          {slot.endTime.slice(
                            0,
                            5
                          )}
                        </p>

                        <p
                          className={`mt-1 text-sm ${
                            available
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }`}
                        >
                          {available
                            ? "Available"
                            : slot.status}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Continue */}

              {!dayOff &&
                slots.length > 0 && (
                  <div className="mt-8 border-t border-slate-100 pt-6">
                    {selectedSlot && (
                      <div className="rounded-2xl bg-sky-50 p-5">
                        <p className="text-sm text-slate-500">
                          Selected Appointment
                        </p>

                        <p className="mt-1 font-bold text-slate-900">
                          {selectedDate}
                        </p>

                        <p className="mt-1 text-slate-600">
                          {selectedSlot.startTime.slice(
                            0,
                            5
                          )}{" "}
                          –{" "}
                          {selectedSlot.endTime.slice(
                            0,
                            5
                          )}
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={
                        handleBooking
                      }
                      disabled={
                        booking ||
                        !selectedSlot
                      }
                      className="mt-5 w-full rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {booking
                        ? "Opening Payment..."
                        : "Continue to Payment"}
                    </button>
                  </div>
                )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default function BookAppointmentPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-sky-50 px-6 py-10">
          <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm">
            <p className="text-slate-500">
              Loading appointment booking...
            </p>
          </div>
        </main>
      }
    >
      <BookAppointmentContent />
    </Suspense>
  );
}