"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type AppointmentDetails = {
  physiotherapistName: string;
  specialization: string;
  date: string;
  startTime: string;
  endTime: string;
  amount: string;
};

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const slotId = searchParams.get("slotId");
  const physiotherapistId = searchParams.get("physiotherapistId");
  const date = searchParams.get("date");

  const [details, setDetails] =
    useState<AppointmentDetails | null>(null);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDetails() {
      if (!slotId || !physiotherapistId || !date) {
        setError("Appointment details are missing.");
        return;
      }

      try {
        const response = await fetch(
          `/api/availability?physiotherapistId=${encodeURIComponent(
            physiotherapistId
          )}&date=${encodeURIComponent(date)}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load appointment details."
          );
        }

        const slot = data.slots?.find(
          (item: {
            id: string;
            startTime: string;
            endTime: string;
          }) => item.id === slotId
        );

        if (!slot) {
          throw new Error("Selected appointment slot was not found.");
        }

        const physioResponse = await fetch("/api/physiotherapists");

        const physioData = await physioResponse.json();

        if (!physioResponse.ok || !physioData.success) {
          throw new Error(
            physioData.message ||
              "Failed to load physiotherapist details."
          );
        }

        const physiotherapist =
          physioData.physiotherapists.find(
            (item: {
              id: string;
              name: string;
              specialization: string;
              feesPerAppointment: string;
            }) => item.id === physiotherapistId
          );

        if (!physiotherapist) {
          throw new Error("Physiotherapist not found.");
        }

        setDetails({
          physiotherapistName: physiotherapist.name,
          specialization: physiotherapist.specialization,
          date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          amount: physiotherapist.feesPerAppointment,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load appointment details."
        );
      }
    }

    loadDetails();
  }, [slotId, physiotherapistId, date]);

  async function handlePayment() {
    if (!slotId) {
      setError("Appointment slot is missing.");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slotId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Payment failed."
        );
      }

      router.push("/dashboard/patient?payment=success");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Payment failed."
      );
      setProcessing(false);
    }
  }

  return (
    <main className="min-h-screen bg-sky-50 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 text-sm font-medium text-sky-700 hover:text-sky-900"
        >
          ← Back to Appointment
        </button>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-2xl">
              💳
            </div>

            <h1 className="mt-5 text-3xl font-bold text-slate-900">
              Confirm Payment
            </h1>

            <p className="mt-2 text-slate-500">
              Review your appointment details and complete
              the demo payment.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {details ? (
            <div className="space-y-4 rounded-2xl bg-slate-50 p-5">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Physiotherapist
                </span>

                <span className="text-right font-semibold text-slate-900">
                  {details.physiotherapistName}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Specialization
                </span>

                <span className="text-right font-semibold text-slate-900">
                  {details.specialization}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Date
                </span>

                <span className="font-semibold text-slate-900">
                  {details.date}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Time
                </span>

                <span className="font-semibold text-slate-900">
                  {details.startTime.slice(0, 5)} –{" "}
                  {details.endTime.slice(0, 5)}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-t border-slate-200 pt-4">
                <span className="font-medium text-slate-600">
                  Amount
                </span>

                <span className="text-xl font-bold text-slate-900">
                  ₹{details.amount}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Payment Method
                </span>

                <span className="font-semibold text-slate-900">
                  Mock Payment
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-slate-500">
                Loading appointment details...
              </p>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="font-semibold text-emerald-800">
              Demo Payment
            </p>

            <p className="mt-1 text-sm text-emerald-700">
              This project uses a mock payment flow for
              demonstration purposes. No real money is charged.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePayment}
            disabled={
              processing ||
              !slotId ||
              !physiotherapistId ||
              !details
            }
            className="mt-6 w-full rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {processing
              ? "Processing Payment..."
              : "Pay & Confirm Appointment"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-sky-50 px-6 py-10">
          <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
            <p className="text-slate-500">
              Loading payment...
            </p>
          </div>
        </main>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}