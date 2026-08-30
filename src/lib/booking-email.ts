import resend from "@/lib/resend";

type BookingEmailDetails = {
  patientName: string;
  patientEmail: string;
  physiotherapistName: string;
  physiotherapistEmail: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  amount: string;
};

export async function sendBookingConfirmationEmails(
  details: BookingEmailDetails
) {
  const {
    patientName,
    patientEmail,
    physiotherapistName,
    physiotherapistEmail,
    appointmentDate,
    startTime,
    endTime,
    amount,
  } = details;

  const formattedStartTime = startTime.slice(0, 5);
  const formattedEndTime = endTime.slice(0, 5);

  const patientEmailResult = await resend.emails.send({
    from: "PhysioCare <onboarding@resend.dev>",
    to: process.env.RESEND_TEST_EMAIL!,
    subject: "PhysioCare Appointment Confirmed",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
        <h2 style="color: #0284c7;">Appointment Confirmed</h2>

        <p>Hello ${patientName},</p>

        <p>
          Your physiotherapy appointment has been successfully confirmed.
        </p>

        <div style="background:#f0f9ff; padding:20px; border-radius:12px;">
          <p><strong>Physiotherapist:</strong> ${physiotherapistName}</p>
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${formattedStartTime} – ${formattedEndTime}</p>
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><strong>Status:</strong> CONFIRMED</p>
        </div>

        <p>
          Please arrive on time for your appointment.
        </p>

        <p>
          Thank you for using PhysioCare.
        </p>
      </div>
    `,
  });

  const physiotherapistEmailResult = await resend.emails.send({
    from: "PhysioCare <onboarding@resend.dev>",
    to: process.env.RESEND_TEST_EMAIL!,
    subject: "New PhysioCare Appointment",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
        <h2 style="color: #0284c7;">New Appointment Confirmed</h2>

        <p>Hello ${physiotherapistName},</p>

        <p>
          A new patient appointment has been confirmed.
        </p>

        <div style="background:#f0f9ff; padding:20px; border-radius:12px;">
          <p><strong>Patient:</strong> ${patientName}</p>
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${formattedStartTime} – ${formattedEndTime}</p>
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><strong>Status:</strong> CONFIRMED</p>
        </div>

        <p>
          Please check your PhysioCare dashboard for appointment details.
        </p>
      </div>
    `,
  });

  return {
    patientEmailResult,
    physiotherapistEmailResult,
  };
}