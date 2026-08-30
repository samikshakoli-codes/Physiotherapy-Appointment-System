import resend from "@/lib/resend";

type AppointmentConfirmationData = {
  patientName: string;
  patientEmail: string;
  physiotherapistName: string;
  physiotherapistEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  amount: string;
};

export async function sendAppointmentConfirmation({
  patientName,
  patientEmail,
  physiotherapistName,
  physiotherapistEmail,
  date,
  startTime,
  endTime,
  amount,
}: AppointmentConfirmationData) {
  const from = process.env.RESEND_FROM_EMAIL;

  if (!from) {
    throw new Error("RESEND_FROM_EMAIL is not configured.");
  }

  const results = await Promise.allSettled([
    resend.emails.send({
      from,
      to: patientEmail,
      subject: "PhysioCare Appointment Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Appointment Confirmed 🎉</h2>

          <p>Hello ${patientName},</p>

          <p>
            Your physiotherapy appointment has been successfully confirmed.
          </p>

          <h3>Appointment Details</h3>

          <p>
            <strong>Physiotherapist:</strong> ${physiotherapistName}<br>
            <strong>Date:</strong> ${date}<br>
            <strong>Time:</strong> ${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}<br>
            <strong>Amount:</strong> ₹${amount}
          </p>

          <p>
            Please arrive on time for your appointment.
          </p>

          <p>
            Regards,<br>
            <strong>PhysioCare</strong>
          </p>
        </div>
      `,
    }),

    resend.emails.send({
      from,
      to: physiotherapistEmail,
      subject: "New PhysioCare Appointment Booked",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Appointment Booked 📅</h2>

          <p>Hello ${physiotherapistName},</p>

          <p>
            A patient has successfully booked an appointment with you.
          </p>

          <h3>Appointment Details</h3>

          <p>
            <strong>Patient:</strong> ${patientName}<br>
            <strong>Date:</strong> ${date}<br>
            <strong>Time:</strong> ${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}<br>
            <strong>Amount:</strong> ₹${amount}
          </p>

          <p>
            Please check your PhysioCare dashboard for more details.
          </p>

          <p>
            Regards,<br>
            <strong>PhysioCare</strong>
          </p>
        </div>
      `,
    }),
  ]);

  const patientEmailResult = results[0];
  const physiotherapistEmailResult = results[1];

  if (patientEmailResult.status === "rejected") {
    console.error(
      "Failed to send patient confirmation email:",
      patientEmailResult.reason
    );
  }

  if (physiotherapistEmailResult.status === "rejected") {
    console.error(
      "Failed to send physiotherapist confirmation email:",
      physiotherapistEmailResult.reason
    );
  }

  return {
    patientEmailSent:
      patientEmailResult.status === "fulfilled",
    physiotherapistEmailSent:
      physiotherapistEmailResult.status === "fulfilled",
  };
}