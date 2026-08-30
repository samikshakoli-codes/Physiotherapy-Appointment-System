"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  appointmentId: string;
  sequence: number;
  isFirst: boolean;
  isLast: boolean;
};

export default function AppointmentSequenceControls({
  appointmentId,
  sequence,
  isFirst,
  isLast,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function reorder(direction: "UP" | "DOWN") {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        "/api/appointments/reorder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentId,
            direction,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to reorder appointment"
        );
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong while reordering"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
        #{sequence}
      </div>

      <button
        type="button"
        disabled={isFirst || loading}
        onClick={() => reorder("UP")}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ↑ Up
      </button>

      <button
        type="button"
        disabled={isLast || loading}
        onClick={() => reorder("DOWN")}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ↓ Down
      </button>
    </div>
  );
}