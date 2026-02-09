"use client";

import { useState } from "react";

// Standalone admin page.
// Will be wrapped by app/admin/layout.js later.

export default function ResolveTicketsPage() {
  const [openTicketId, setOpenTicketId] = useState(null);

  const tickets = [
    {
      id: 1,
      title: "Unable to reschedule appointment",
      raisedBy: "Student",
      name: "Muhammed Nubaise",
      status: "Open",
      description:
        "The student is unable to reschedule an already approved appointment. The system throws an error while saving changes.",
    },
    {
      id: 2,
      title: "Calendar sync not updating",
      raisedBy: "Faculty",
      name: "Dr. Anil Kumar",
      status: "Open",
      description:
        "Faculty calendar is not syncing with the system. Newly added slots are not visible to students.",
    },
    {
      id: 3,
      title: "Duplicate appointment created",
      raisedBy: "Student",
      name: "Ayesha Rahman",
      status: "Pending",
      description:
        "Two appointments were created for the same time slot due to multiple submission attempts.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F7F9FC] px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#1F3A5F]">
          Support Tickets
        </h1>
        <p className="text-sm text-[#4A6FA5]">
          Review and resolve issues raised by students and faculty.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Open Tickets" value="7" />
        <StatCard label="Pending Review" value="3" />
        <StatCard label="Resolved Today" value="4" />
      </div>

      {/* Tickets */}
      <section className="bg-white border border-[#E0E0E0] rounded-xl">
        <div className="px-6 py-4 border-b border-[#E0E0E0]">
          <h2 className="text-sm font-medium text-[#1F3A5F]">
            Active Tickets
          </h2>
        </div>

        <div className="divide-y divide-[#E0E0E0]">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="px-6 py-4">
              {/* Row */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1F3A5F]">
                    {ticket.title}
                  </p>
                  <p className="text-xs text-[#4A6FA5] mt-0.5">
                    Raised by {ticket.raisedBy} · {ticket.name}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs px-2 py-1 rounded-full border border-[#E0E0E0] text-[#2A4A75]">
                    {ticket.status}
                  </span>

                  <button
                    className="text-xs font-medium text-[#1F3A5F] hover:underline cursor-pointer"
                    onClick={() =>
                      setOpenTicketId(
                        openTicketId === ticket.id ? null : ticket.id
                      )
                    }
                  >
                    View
                  </button>
                </div>
              </div>

              {/* Expanded View */}
              {openTicketId === ticket.id && (
                <div className="mt-4 p-4 bg-[#F7F9FC] border border-[#E0E0E0] rounded-lg">
                  <p className="text-xs text-[#4A6FA5]">
                    <span className="font-medium text-[#1F3A5F]">
                      Description:
                    </span>{" "}
                    {ticket.description}
                  </p>

                  <div className="mt-4 flex gap-3">
                    <button
                      className="px-3 py-1.5 text-xs rounded-md bg-[#1F3A5F] text-white hover:bg-[#2A4A75] cursor-pointer"
                      onClick={() => {
                        // TODO: connect to backend resolve logic
                      }}
                    >
                      Mark as Resolved
                    </button>

                    <button
                      className="px-3 py-1.5 text-xs rounded-md border border-[#E0E0E0] text-[#1F3A5F] hover:bg-white cursor-pointer"
                      onClick={() => {
                        // TODO:
                        // 1. Capture admin question
                        // 2. Mark ticket as Pending
                        // 3. Trigger external notification with message
                      }}
                    >
                      Request Info
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}


function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-[#E0E0E0] rounded-lg px-5 py-4">
      <p className="text-xs text-[#4A6FA5] uppercase tracking-wide">
        {label}
      </p>
      <p className="text-xl font-semibold text-[#1F3A5F] mt-1">
        {value}
      </p>
    </div>
  );
}
