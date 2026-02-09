import Link from "next/link";
import {
  Users,
  LifeBuoy,
  CalendarClock,
  Database,
  UserPlus,
} from "lucide-react";
import BackArrowButton from "@/components/BackArrowButton";

const features = [
  {
    title: "Manage User Accounts",
    desc: "Create, update, or remove Student and Faculty accounts with role control.",
    icon: Users,
    action: "Manage",
  },
  {
    title: "Support Tickets",
    desc: "Review, prioritize, and resolve issues raised by users.",
    icon: LifeBuoy,
    action: "View Tickets",
    href: "/admin/tickets",
  },
  {
    title: "Faculty Timetable",
    desc: "Assign courses, time slots, and rooms without conflicts.",
    icon: CalendarClock,
    action: "Set Timetable",
  },
  {
    title: "System Maintenance",
    desc: "Perform backups to ensure system reliability.",
    icon: Database,
    action: "Run Backup",
  },
];

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-[#F7F9FC] px-4 py-10">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-4">
          <BackArrowButton />
        </div>

        <header className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1F3A5F] text-white font-semibold">
            FS
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1F3A5F]">
              Admin Dashboard
            </h1>
            <p className="text-sm text-[#5A6C7D]">
              Manage users, support operations, and scheduling infrastructure.
            </p>
          </div>
        </header>

        {/* Stats */}
        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-[#DCE3ED] bg-white px-4 py-3 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.1em] text-[#6E8196]">
              Active Faculty
            </p>
            <p className="mt-1 text-lg font-semibold text-[#1F3A5F]">42</p>
          </div>
          <div className="rounded-lg border border-[#DCE3ED] bg-white px-4 py-3 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.1em] text-[#6E8196]">
              Open Tickets
            </p>
            <p className="mt-1 text-lg font-semibold text-[#1F3A5F]">7</p>
          </div>
          <div className="rounded-lg border border-[#DCE3ED] bg-white px-4 py-3 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.1em] text-[#6E8196]">
              Pending Requests
            </p>
            <p className="mt-1 text-lg font-semibold text-[#1F3A5F]">12</p>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((f) => (
            <article
              key={f.title}
              className="rounded-lg border border-[#DCE3ED] bg-white p-5 shadow-sm"
            >
              <f.icon className="mb-3 h-6 w-6 text-[#2A4A75]" />
              <h2 className="mb-1 text-base font-semibold text-[#1F3A5F]">
                {f.title}
              </h2>
              <p className="mb-4 text-sm text-[#5A6C7D]">{f.desc}</p>

              {f.href ? (
                <Link
                  href={f.href}
                  className="inline-block rounded-md border border-[#4A6FA5] px-4 py-2 text-sm text-[#4A6FA5] transition hover:bg-[#4A6FA5]/10 cursor-pointer"
                >
                  {f.action}
                </Link>
              ) : (
                <button className="rounded-md border border-[#4A6FA5] px-4 py-2 text-sm text-[#4A6FA5] transition hover:bg-[#4A6FA5]/10 cursor-pointer">
                  {f.action}
                </button>
              )}
            </article>
          ))}
        </section>

        {/* Add Faculty */}
        <section className="rounded-lg border border-[#DCE3ED] bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[#4A6FA5]/10 p-2">
              <UserPlus className="h-6 w-6 text-[#4A6FA5]" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-semibold text-[#1F3A5F]">
                Add Faculty
              </h3>
              <p className="mb-4 text-sm text-[#5A6C7D]">
                Create a new faculty profile and assign role-specific details for
                scheduling.
              </p>
              <button className="rounded-md bg-[#1F3A5F] px-4 py-2 text-sm text-white transition hover:bg-[#2A4A75] cursor-pointer">
                Add Faculty
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
