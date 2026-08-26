import { z } from "zod";

export const patientSignupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  age: z.coerce.number().int().min(1).max(120),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  contactNumber: z.string().min(7).max(20),
});

export const physiotherapistSignupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  qualification: z.string().min(2).max(200),
  specialization: z.string().min(2).max(200),
  clinicAddress: z.string().min(5).max(500),
  feesPerAppointment: z.coerce.number().positive(),
  contactNumber: z.string().min(7).max(20),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});