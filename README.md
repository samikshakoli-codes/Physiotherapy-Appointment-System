# PhysioCare — Physiotherapy Appointment System

[![Release](https://img.shields.io/github/v/release/samikshakoli-codes/Physiotherapy-Appointment-System)](https://github.com/samikshakoli-codes/Physiotherapy-Appointment-System/releases)
[![Live Demo](https://img.shields.io/badge/Live-Demo-success)](https://physiotherapy-appointment-system-neon.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle-orange)](https://orm.drizzle.team/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://vercel.com/)

**PhysioCare** is a full-stack web application for managing physiotherapy appointments between patients and physiotherapists.

The system provides separate role-based workflows for **Patients** and **Physiotherapists**, including authentication, email verification, physiotherapist availability management, appointment booking, payment processing, appointment sequencing, profile management, and transactional email notifications.

**Live Application:** [https://physiotherapy-appointment-system-neon.vercel.app](https://physiotherapy-appointment-system-neon.vercel.app/)

**GitHub Repository:** https://github.com/samikshakoli-codes/Physiotherapy-Appointment-System

---

## 📌 Project Overview

PhysioCare was developed as a production-style appointment management system rather than a simple CRUD application.

The application has two primary roles:

* **Patient** — searches for physiotherapists, checks available slots, books appointments, completes the payment workflow, and receives confirmation.
* **Physiotherapist** — manages availability, days off, appointment sequence, appointment fees, profile information, and receives notifications for new bookings.

The application is deployed as a **single Next.js full-stack application**, with Next.js handling both the frontend and backend API routes.

---

# 👥 User Roles

## 👤 Patient

A patient can:

* Create an account
* Verify their email address
* Sign in securely
* Browse available physiotherapists
* View physiotherapist details
* View appointment fees
* Select an available date
* View available appointment slots
* Book an appointment
* Complete the payment workflow
* View confirmed appointments
* Receive appointment confirmation emails
* Sign out securely

### Patient Workflow

```text
Register
   ↓
Email Verification
   ↓
Sign In
   ↓
Patient Dashboard
   ↓
Browse Physiotherapists
   ↓
Select Physiotherapist
   ↓
Select Date
   ↓
View Available Slots
   ↓
Select Appointment
   ↓
Payment
   ↓
Appointment Confirmed
   ↓
Confirmation Email
```

---

# 🩺 Physiotherapist

A physiotherapist has a dedicated dashboard and management workflow.

A physiotherapist can:

* Create an account
* Verify their email
* Sign in securely
* Access a protected physiotherapist dashboard
* View today's appointments
* View appointment details
* Manage appointment sequence
* Reorder appointments
* Create availability slots
* Manage availability
* Add and manage days off
* View their profile
* Update appointment fees
* Receive notification emails when a patient books an appointment
* Sign out securely

### Physiotherapist Workflow

```text
Register
   ↓
Email Verification
   ↓
Sign In
   ↓
Physiotherapist Dashboard
   ↓
       ┌──────────────────────────────┐
       │                              │
       ▼                              ▼
Manage Availability             Manage Days Off
       │                              │
       └──────────────┬───────────────┘
                      ↓
              Receive Appointments
                      ↓
             View Today's Schedule
                      ↓
             Manage Appointment Order
                      ↓
             Manage Profile / Fees
                      ↓
             Receive Booking Email
```

---

# 🔐 Authentication & Authorization

Authentication was implemented without relying on a third-party authentication framework.

The application uses:

* **JWT** for authentication
* **bcryptjs** for password hashing
* **HTTP-only cookies** for storing the authentication token
* Role-based authorization
* Email verification
* Protected server-side dashboard access

### Authentication Flow

```text
User Registration
       ↓
Password Hashing
       ↓
User Stored in PostgreSQL
       ↓
Verification Email
       ↓
User Verifies Email
       ↓
Login
       ↓
Credentials Validated
       ↓
JWT Generated
       ↓
HTTP-only Cookie
       ↓
Protected Dashboard
```

The server checks the authenticated user and their role before allowing access to protected functionality.

```text
PATIENT
   → Patient Dashboard

PHYSIOTHERAPIST
   → Physiotherapist Dashboard
```

A user cannot simply access the other role's protected functionality by changing the URL.

---

# 📧 Email System

The project uses **Resend** for transactional email delivery.

Email functionality includes:

### Account Verification

After registration, the user receives an email containing a verification link.

```text
Signup
  ↓
Verification Token
  ↓
Resend
  ↓
Verification Email
  ↓
User Opens Link
  ↓
/api/auth/verify
  ↓
Email Verified
```

### Appointment Emails

After a successful appointment booking:

* The patient receives an appointment confirmation email.
* The physiotherapist receives a new appointment notification.

The emails contain information such as:

* Patient / physiotherapist name
* Appointment date
* Start time
* End time
* Appointment amount
* Confirmation status

The email functionality is separated into reusable server-side modules under `src/lib/`.

---

# 📅 Appointment Management

The appointment system connects patients with physiotherapists through available time slots.

The booking process checks the selected physiotherapist and availability before creating an appointment.

Appointments contain information including:

* Patient
* Physiotherapist
* Appointment date
* Start time
* End time
* Amount
* Status
* Sequence

Example appointment status:

```text
CONFIRMED
```

---

# 🕐 Availability Management

Physiotherapists can manage their available appointment slots.

The availability system allows the physiotherapist to define when appointments can be booked.

Patients can request availability for a specific physiotherapist and date.

Example API request:

```text
GET /api/availability?physiotherapistId=...&date=2026-08-30
```

The booking interface uses the returned availability to present selectable appointment slots to the patient.

---

# 🚫 Days-Off Management

Physiotherapists can specify days when they are unavailable.

This allows the system to distinguish between:

```text
Normal Working Day
        ↓
Available Appointment Slots

Day Off
        ↓
No Appointment Availability
```

This prevents patients from selecting appointment times on physiotherapist days off.

---

# 🔢 Appointment Sequencing

PhysioCare includes appointment sequencing for physiotherapists.

Appointments have a sequence value that determines their order in the physiotherapist's schedule.

The system includes a dedicated reorder API:

```text
POST /api/appointments/reorder
```

This allows the physiotherapist to manage the order of appointments rather than relying only on appointment creation order.

---

# 💳 Payment Workflow

The patient booking process includes a payment step before the appointment is considered successfully completed.

```text
Select Slot
   ↓
Payment Page
   ↓
Payment Successful
   ↓
Appointment Created
   ↓
Confirmation
   ↓
Email Notifications
```

The application records the appointment through the booking/payment flow and redirects the patient back to the dashboard with the successful payment state.

---

# 👨‍⚕️ Physiotherapist Profile

Physiotherapists have a dedicated profile section.

Profile information includes:

* Name
* Email
* Qualification
* Specialization
* Clinic address
* Contact number
* Appointment fee

The appointment fee can be updated through the profile API.

The API validates the submitted fee before updating the database.

Validation includes:

* Required value
* Numeric value
* Greater than zero
* Maximum allowed fee

---

# 🏗️ System Architecture

PhysioCare uses a **Next.js full-stack architecture**.

```text
                         ┌─────────────────┐
                         │     Patient     │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   Next.js UI    │
                         │ React + Tailwind│
                         └────────┬────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │     Next.js API Routes   │
                    │                          │
                    │ Authentication           │
                    │ Appointments             │
                    │ Availability             │
                    │ Days Off                 │
                    │ Physiotherapist Profile  │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────┴─────────────┐
                    ▼                          ▼
             ┌──────────────┐           ┌─────────────┐
             │ PostgreSQL   │           │   Resend    │
             │    Neon      │           │   Emails    │
             └──────────────┘           └─────────────┘
```

The same Next.js application handles:

* User interface
* Server-rendered pages
* API routes
* Authentication logic
* Database operations
* External service integration

This architecture also made the application suitable for deployment on Vercel without maintaining a separate backend server.

---

# 🧰 Technology Stack

## Frontend

* Next.js 16.3.3
* React 19
* TypeScript
* Tailwind CSS

## Backend

* Next.js App Router
* Next.js API Routes
* TypeScript

## Database

* PostgreSQL
* Neon
* Drizzle ORM
* Drizzle Kit

## Authentication & Security

* JSON Web Tokens (JWT)
* bcryptjs
* HTTP-only cookies
* Role-based authorization
* Zod validation

## Email

* Resend

## Deployment

* Vercel

## Development

* Git
* GitHub
* VS Code
* npm

---

# 🗄️ Database

The application uses **PostgreSQL hosted on Neon**.

Drizzle ORM is used to interact with the database.

The database schema contains the core entities required by the appointment system, including:

```text
Users
  │
  ├── Patient Profile
  │
  └── Physiotherapist Profile
          │
          ├── Availability Slots
          ├── Days Off
          └── Appointments
```

The database is accessed from the server-side application rather than directly from the browser.

---

# 🔌 API Structure

The application exposes API routes through the Next.js App Router.

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/verify
POST /api/auth/resend-verification
```

### Appointments

```text
GET  /api/appointments
POST /api/appointments
POST /api/appointments/reorder
```

### Availability

```text
GET    /api/availability
DELETE /api/availability/[slotId]
```

### Days Off

```text
GET  /api/days-off
POST /api/days-off
...
```

### Physiotherapists

```text
GET   /api/physiotherapists
GET   /api/physiotherapists/profile
PATCH /api/physiotherapists/profile
```

---

# 📂 Project Structure

```text
src/
│
├── app/
│   │
│   ├── api/
│   │   ├── appointments/
│   │   │   └── reorder/
│   │   │
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   ├── signup/
│   │   │   ├── verify/
│   │   │   └── resend-verification/
│   │   │
│   │   ├── availability/
│   │   │   └── [slotId]/
│   │   │
│   │   ├── days-off/
│   │   │
│   │   └── physiotherapists/
│   │       └── profile/
│   │
│   ├── dashboard/
│   │   ├── patient/
│   │   │   ├── book/
│   │   │   └── payment/
│   │   │
│   │   └── physiotherapist/
│   │       ├── availability/
│   │       ├── days-off/
│   │       └── profile/
│   │
│   ├── signin/
│   ├── signup/
│   └── ...
│
├── db/
│   └── schema.ts
│
├── lib/
│   ├── booking-email.ts
│   ├── send-appointment-confirmation.ts
│   ├── get-current-user.ts
│   └── ...
│
└── ...
```

---

# 🚀 Getting Started

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

Install:

* Node.js
* npm
* Git

You also need access to a PostgreSQL database.

---

## Clone the Repository

```bash
git clone https://github.com/samikshakoli-codes/Physiotherapy-Appointment-System.git

cd Physiotherapy-Appointment-System
```

---

## Install Dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env.local` file in the project root.

```env
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Use your own values for all environment variables.

**Never commit `.env.local` or API keys to GitHub.**

For production, environment variables are configured through the Vercel project settings.

---

## Database Setup

The project uses Drizzle for database schema management.

Available scripts include:

```bash
npm run db:generate
npm run db:migrate
npm run db:push
```

---

## Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 with your browser to see the result.

You can start editing the application by modifying files inside the `src/app` directory. The development server automatically updates the application during development.

---

# 🧪 Production Build

Before deployment, the application can be checked using:

```bash
npm run build
```

A successful production build confirms that Next.js can compile and optimize the application for deployment.

---

# ☁️ Deployment

PhysioCare is deployed on **Vercel**.

The project was initially considered with a separate Spring Boot backend, but the architecture was changed to a **Next.js full-stack application** so that the frontend and backend API routes could be deployed together on Vercel.

### Production Architecture

```text
GitHub
   ↓
Vercel
   ↓
Next.js Application
   ├── Frontend
   ├── Server Components
   └── API Routes
          │
          ├── Neon PostgreSQL
          └── Resend
```

Production environment variables are configured through Vercel rather than committed to the repository.

---

# 🛠️ Deployment Challenges Solved

During deployment, several real-world issues were identified and resolved.

### PostgreSQL Connection

The production build initially failed because the database connection string was not correctly available to the deployed application.

The production environment was configured with the correct database connection through Vercel environment variables.

### Localhost API URL

The deployed application initially attempted to make server-side requests to:

```text
127.0.0.1:3000
```

This works locally but does not represent the deployed Vercel application environment.

The application was updated to use the appropriate application URL configuration instead of depending on the local development server.

### Resend Testing Restrictions

Resend's testing environment restricts recipients when using the default testing sender.

For production email delivery to arbitrary recipients, a verified sending domain is required.

The project separates application email logic from the email provider configuration so the sender/domain can be configured appropriately for production.

### Logout Redirect

The logout endpoint was implemented as a POST endpoint.

The application uses:

```text
POST /api/auth/logout
```

The endpoint clears the HTTP-only authentication cookie before redirecting the user to the sign-in page.

---

# 🔒 Security Considerations

The application includes several basic security practices:

* Passwords are hashed using bcryptjs.
* Authentication tokens are stored in HTTP-only cookies.
* Authentication is checked server-side.
* Role-based authorization protects patient and physiotherapist functionality.
* Sensitive environment variables are kept outside the repository.
* API input is validated before database updates.
* Users must verify their email before signing in.

---

# 🎯 Technical Concepts Demonstrated

This project demonstrates practical experience with:

* Full-stack Next.js development
* TypeScript
* React
* Server-side rendering
* Next.js API routes
* REST-style API design
* PostgreSQL
* Database schema design
* Drizzle ORM
* Database migrations and schema pushing
* JWT authentication
* Password hashing
* HTTP-only cookies
* Role-based authorization
* Email verification
* Transactional email integration
* Appointment scheduling
* Availability management
* External service integration
* Payment workflow integration
* Environment variable management
* Git/GitHub
* Vercel deployment
* Production debugging

---

# 📸 Screenshots

Screenshots of the application can be added here to demonstrate the major workflows.

Recommended screenshots:

### Patient

1. Landing page
2. Patient sign-in
3. Patient dashboard
4. Physiotherapist selection
5. Appointment slot selection
6. Payment page
7. Confirmed appointment

### Physiotherapist

1. Physiotherapist dashboard
2. Today's appointments
3. Availability management
4. Days-off management
5. Physiotherapist profile
6. Appointment fee update
7. Appointment sequence management

---

# 🔮 Future Improvements

Potential improvements include:

* Appointment cancellation
* Appointment rescheduling
* Automated appointment reminders
* Dedicated administrator dashboard
* Enhanced payment integration
* Calendar integration
* Appointment history
* Analytics for physiotherapists
* Custom production email domain
* Custom domain for the application

---

# 👩‍💻 Author

**Samiksha Koli**

GitHub: [samikshakoli-codes](https://github.com/samikshakoli-codes)

---


