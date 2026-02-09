"use client"
import Link from "next/link";
import { useState } from "react";
import { getFacultyById, getFacultySlotsForNextDays } from "../../../search/facultyData";
import { useParams } from "next/navigation";
import BackArrowButton from "@/components/BackArrowButton";

export default function RequestFacultyPage({ params }) {
  const { id } = useParams();
  const [selectedSlot, setSelectedSlot] = useState("");
  const [isGroupMeeting, setIsGroupMeeting] = useState(false);
  const [isRecurringMeeting, setIsRecurringMeeting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requestId, setRequestId] = useState("");
  const faculty = getFacultyById(id);

  if (!faculty) {
    return (
      <main className="min-h-screen bg-[#F7F9FC] px-4 py-10">
        <section className="mx-auto w-full max-w-3xl rounded-lg border border-[#E0E0E0] bg-white p-8 shadow-sm">
          <div className="mb-4">
            <BackArrowButton />
          </div>
          <h1 className="text-2xl font-bold text-[#1F3A5F]">Faculty Not Found</h1>
          <p className="mt-2 text-sm text-[#5A6C7D]">
            The selected faculty ID does not exist in the demo data.
          </p>
          <Link
            href="/student/req"
            className="mt-5 inline-flex rounded-md bg-[#1F3A5F] px-4 py-2 text-sm font-medium text-white"
          >
            Back to Faculty Profiles
          </Link>
        </section>
      </main>
    );
  }

  const slots = getFacultySlotsForNextDays(faculty, 5);
  const groupedSlots = slots.reduce((acc, slot) => {
    const [dateLabel, timeRange] = slot.split(" | ");

    if (!acc[dateLabel]) {
      acc[dateLabel] = [];
    }

    acc[dateLabel].push(timeRange || slot);
    return acc;
  }, {});

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-[#F7F9FC] px-4 py-10">
        <section className="mx-auto w-full max-w-2xl rounded-lg border border-[#E0E0E0] bg-white p-8 shadow-sm">
          <div className="mb-4">
            <BackArrowButton />
          </div>
          <p className="text-xs uppercase tracking-[0.12em] text-[#6C8096]">Request Submitted</p>
          <h1 className="mt-2 text-2xl font-bold text-[#1F3A5F]">Appointment Request Sent</h1>
          <p className="mt-2 text-sm text-[#5A6C7D]">
            Your request has been shared with {faculty.name}. You will be notified once the faculty reviews it.
          </p>

          <div className="mt-5 rounded-md border border-[#DCE3ED] bg-[#F4F7FB] p-4 text-sm text-[#415A75]">
            <p>
              <span className="font-semibold text-[#1F3A5F]">Request ID:</span> {requestId}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-[#1F3A5F]">Faculty:</span> {faculty.name}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-[#1F3A5F]">Selected Slot:</span> {selectedSlot}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-[#1F3A5F]">Group Meeting:</span>{" "}
              {isGroupMeeting ? "Yes" : "No"}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-[#1F3A5F]">Recurring Meeting:</span>{" "}
              {isRecurringMeeting ? "Yes" : "No"}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setSelectedSlot("");
                setIsGroupMeeting(false);
                setIsRecurringMeeting(false);
                setRequestId("");
              }}
              className="rounded-md bg-[#1F3A5F] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#2A4A75]"
            >
              Request Another Slot
            </button>
            <Link
              href="/student/req"
              className="rounded-md border border-[#C5D1E0] bg-white px-5 py-2.5 text-sm font-medium text-[#2A4A75]"
            >
              Back to Faculty List
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F9FC] px-4 py-10">
      <section className="mx-auto w-full max-w-3xl rounded-lg border border-[#E0E0E0] bg-white p-8 shadow-sm">
        <div className="mb-4">
          <BackArrowButton />
        </div>
        <p className="text-xs uppercase tracking-[0.12em] text-[#6C8096]">Request Faculty</p>
        <h1 className="mt-2 text-2xl font-bold text-[#1F3A5F]">{faculty.name}</h1>
        <p className="mt-1 text-sm text-[#5A6C7D]">{faculty.department}</p>

        <div className="mt-6 rounded-md bg-[#F4F7FB] p-4">
          <p className="text-sm text-[#415A75]">
            <span className="font-semibold text-[#1F3A5F]">Focus:</span> {faculty.focus}
          </p>
          <p className="mt-1 text-sm text-[#415A75]">
            <span className="font-semibold text-[#1F3A5F]">Location:</span> {faculty.location}
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-[#1F3A5F]">Open Appointment Slots (Next 5 Days)</h2>
            <p className="mt-1 text-sm text-[#5A6C7D]">Pick a date first, then choose a time slot.</p>
            <div className="mt-4 space-y-3">
              {Object.entries(groupedSlots).map(([dateLabel, dateSlots]) => (
                <section key={dateLabel} className="rounded-md border border-[#DCE3ED] bg-[#FBFCFE] p-3">
                  <p className="text-sm font-semibold text-[#1F3A5F]">{dateLabel}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {dateSlots.map((timeRange) => {
                      const slotValue = `${dateLabel} | ${timeRange}`;
                      const inputId = `slot-${dateLabel}-${timeRange}`
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-");

                      return (
                        <label key={slotValue} htmlFor={inputId} className="cursor-pointer">
                          <input
                            id={inputId}
                            type="radio"
                            name="slot"
                            value={slotValue}
                            onChange={() => setSelectedSlot(slotValue)}
                            className="peer sr-only"
                          />
                          <span className="inline-flex rounded-full border border-[#C6D3E2] bg-white px-3 py-1.5 text-sm text-[#425A73] transition peer-checked:border-[#1F3A5F] peer-checked:bg-[#1F3A5F] peer-checked:text-white hover:border-[#9CB3CC]">
                            {timeRange}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#1F3A5F]">Meeting Options</h2>
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-3 text-sm text-[#425A73]">
                <input
                  type="checkbox"
                  name="groupMeeting"
                  checked={isGroupMeeting}
                  onChange={(event) => setIsGroupMeeting(event.target.checked)}
                  className="accent-[#1F3A5F]"
                />
                <span>Group meeting</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-[#425A73]">
                <input
                  type="checkbox"
                  name="recurringMeeting"
                  checked={isRecurringMeeting}
                  onChange={(event) => setIsRecurringMeeting(event.target.checked)}
                  className="accent-[#1F3A5F]"
                />
                <span>Recurring meeting</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-[#1F3A5F]">
              Purpose / Notes
            </label>
            <textarea
              id="note"
              name="note"
              rows={4}
              placeholder="Add a short note for the faculty member..."
              className="mt-2 w-full rounded-md border border-[#D4DDE8] bg-white px-3 py-2 text-sm text-[#1F3A5F] outline-none ring-[#A8BCD6] transition focus:ring-2"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!selectedSlot}
              className={`rounded-md px-5 py-2.5 text-sm font-medium text-white transition ${
                selectedSlot
                  ? "bg-[#1F3A5F] hover:bg-[#2A4A75]"
                  : "cursor-not-allowed bg-[#9AAABC]"
              }`}
              onClick={() => {
                if (!selectedSlot) return;
                const generatedId = `REQ-${Date.now().toString().slice(-6)}`;
                setRequestId(generatedId);
                setIsSubmitted(true);
              }}
            >
              Submit Request
            </button>
            <Link
              href="/student/req"
              className="rounded-md border border-[#C5D1E0] bg-white px-5 py-2.5 text-sm font-medium text-[#2A4A75]"
            >
              Back
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
