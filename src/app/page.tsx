import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fbff] text-[#17324d]">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dff4ff] text-xl">
            🩺
          </div>

          <div>
            <p className="text-lg font-bold">PhysioCare</p>
            <p className="text-xs text-[#6d8295]">
              Your recovery partner
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/signin"
            className="hidden rounded-xl px-5 py-2.5 font-semibold text-[#31516b] transition hover:bg-white sm:block"
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            className="rounded-xl bg-[#2788c7] px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-[#1e75ad]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cdebf9] bg-white px-4 py-2 text-sm font-medium text-[#2788c7] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#43b982]" />
              Trusted physiotherapy care
            </div>

            <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
              Your journey to
              <span className="block text-[#2788c7]">
                better movement.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#6d8295]">
              Find qualified physiotherapists, choose a convenient
              appointment, and take the next step toward a healthier,
              more active you.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-xl bg-[#2788c7] px-7 py-3.5 text-center font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#1e75ad]"
              >
                Book an Appointment →
              </Link>

              <Link
                href="/signin"
                className="rounded-xl border border-[#d8e6ef] bg-white px-7 py-3.5 text-center font-semibold text-[#31516b] transition hover:bg-[#f1f8fc]"
              >
                I already have an account
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-7 text-sm text-[#6d8295]">
              <span>✓ Qualified professionals</span>
              <span>✓ Easy scheduling</span>
              <span>✓ Secure booking</span>
            </div>
          </div>

          {/* Healthcare visual */}
          <div className="relative">
            <div className="absolute -left-8 top-10 h-40 w-40 rounded-full bg-[#dff4ff] blur-3xl" />
            <div className="absolute -right-8 bottom-0 h-48 w-48 rounded-full bg-[#dff7ed] blur-3xl" />

            <div className="relative rounded-[2rem] border border-white bg-white p-5 shadow-[0_25px_70px_rgba(39,136,199,0.12)]">
              <div className="rounded-[1.5rem] bg-[#edf8fd] p-8">
                <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-full bg-white shadow-sm">
                  <div className="text-8xl">🧑‍⚕️</div>
                </div>

                <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">Your next appointment</p>
                      <p className="mt-1 text-sm text-[#7890a3]">
                        Physiotherapy session
                      </p>
                    </div>

                    <span className="rounded-full bg-[#e2f8ed] px-3 py-1 text-xs font-semibold text-[#299565]">
                      Confirmed
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#f7fafc] p-3">
                      <p className="text-xs text-[#7890a3]">Date</p>
                      <p className="mt-1 font-semibold">31 Aug 2026</p>
                    </div>

                    <div className="rounded-xl bg-[#f7fafc] p-3">
                      <p className="text-xs text-[#7890a3]">Time</p>
                      <p className="mt-1 font-semibold">10:30 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-[#e6eff5] bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-14 sm:grid-cols-3 lg:px-8">
          <Feature
            icon="🧑‍⚕️"
            title="Qualified Professionals"
            description="Connect with physiotherapists based on their specialization and expertise."
          />

          <Feature
            icon="📅"
            title="Simple Scheduling"
            description="View available slots and choose an appointment time that works for you."
          />

          <Feature
            icon="💙"
            title="Care That Fits You"
            description="A simple platform designed around your recovery and convenience."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="rounded-3xl bg-[#e8f6fc] px-8 py-12 text-center sm:px-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#2788c7]">
            Start your recovery journey
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Better care starts with one appointment.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-[#6d8295]">
            Create your account and find the right physiotherapy care
            for you.
          </p>

          <Link
            href="/signup"
            className="mt-7 inline-block rounded-xl bg-[#2788c7] px-7 py-3.5 font-semibold text-white shadow-sm hover:bg-[#1e75ad]"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#e6eff5] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-sm text-[#7890a3] sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© 2026 PhysioCare</p>
          <p>Healthcare made simpler.</p>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e7eff4] bg-[#fbfdff] p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5f5fc] text-xl">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold">{title}</h3>

      <p className="mt-2 leading-6 text-[#7890a3]">{description}</p>
    </div>
  );
}