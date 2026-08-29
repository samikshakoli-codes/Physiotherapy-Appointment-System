import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  date,
  time,
  decimal,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";

/* =========================
   ENUMS
========================= */

export const userRoleEnum = pgEnum("user_role", [
  "PATIENT",
  "PHYSIOTHERAPIST",
]);

export const genderEnum = pgEnum("gender", [
  "MALE",
  "FEMALE",
  "OTHER",
]);

export const slotStatusEnum = pgEnum("slot_status", [
  "AVAILABLE",
  "BOOKED",
  "BLOCKED",
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "SUCCESS",
  "FAILED",
]);

/* =========================
   USERS
========================= */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),

  email: varchar("email", { length: 255 }).notNull().unique(),

  passwordHash: varchar("password_hash", { length: 255 }).notNull(),

  role: userRoleEnum("role").notNull(),

  emailVerified: boolean("email_verified").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* =========================
   PATIENT PROFILES
========================= */

export const patientProfiles = pgTable("patient_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .unique(),

  age: integer("age").notNull(),

  gender: genderEnum("gender").notNull(),

  contactNumber: varchar("contact_number", { length: 20 }).notNull(),
});

/* =========================
   PHYSIOTHERAPIST PROFILES
========================= */

export const physiotherapistProfiles = pgTable(
  "physiotherapist_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .unique(),

    qualification: varchar("qualification", { length: 200 }).notNull(),

    specialization: varchar("specialization", { length: 200 }).notNull(),

    clinicAddress: varchar("clinic_address", { length: 500 }).notNull(),

    feesPerAppointment: decimal("fees_per_appointment", {
      precision: 10,
      scale: 2,
    }).notNull(),

    contactNumber: varchar("contact_number", { length: 20 }).notNull(),
  }
);

/* =========================
   EMAIL VERIFICATION
========================= */

export const verificationTokens = pgTable("verification_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  token: varchar("token", { length: 255 }).notNull().unique(),

  expiresAt: timestamp("expires_at").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* =========================
   PHYSIOTHERAPIST AVAILABILITY
========================= */

export const availabilitySlots = pgTable(
  "availability_slots",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    physiotherapistId: uuid("physiotherapist_id")
      .notNull()
      .references(() => physiotherapistProfiles.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    slotDate: date("slot_date").notNull(),

    startTime: time("start_time").notNull(),

    endTime: time("end_time").notNull(),

    status: slotStatusEnum("status")
      .default("AVAILABLE")
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("unique_physio_slot").on(
      table.physiotherapistId,
      table.slotDate,
      table.startTime,
      table.endTime
    ),
  ]
);

/* =========================
   PHYSIOTHERAPIST DAYS OFF
========================= */

export const physiotherapistDaysOff = pgTable(
  "physiotherapist_days_off",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    physiotherapistId: uuid("physiotherapist_id")
      .notNull()
      .references(() => physiotherapistProfiles.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    offDate: date("off_date").notNull(),

    reason: varchar("reason", { length: 255 }),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("unique_physio_day_off").on(
      table.physiotherapistId,
      table.offDate
    ),
  ]
);

/* =========================
   APPOINTMENTS
========================= */

export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),

  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientProfiles.id),

  physiotherapistId: uuid("physiotherapist_id")
    .notNull()
    .references(() => physiotherapistProfiles.id),

  slotId: uuid("slot_id")
    .notNull()
    .references(() => availabilitySlots.id)
    .unique(),

  appointmentDate: date("appointment_date").notNull(),

  startTime: time("start_time").notNull(),

  endTime: time("end_time").notNull(),

  /*
    Snapshot of the fee at booking time.
    If the physiotherapist later changes their fee,
    old appointments keep their original amount.
  */
  amount: decimal("amount", {
    precision: 10,
    scale: 2,
  }).notNull(),

  /*
    Determines the order in which appointments
    appear on the physiotherapist dashboard.
  */
  sequence: integer("sequence")
    .default(1)
    .notNull(),

  status: appointmentStatusEnum("status")
    .default("CONFIRMED")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

/* =========================
   PAYMENTS
========================= */

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),

  appointmentId: uuid("appointment_id")
    .notNull()
    .references(() => appointments.id, {
      onDelete: "cascade",
    })
    .unique(),

  amount: decimal("amount", {
    precision: 10,
    scale: 2,
  }).notNull(),

  paymentStatus: paymentStatusEnum("payment_status")
    .default("PENDING")
    .notNull(),

  transactionReference: varchar("transaction_reference", {
    length: 255,
  }),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});