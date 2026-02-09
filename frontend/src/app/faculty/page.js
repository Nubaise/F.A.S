"use client";

import { useMemo, useState } from "react";
import BackArrowButton from "@/components/BackArrowButton";

const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const quickSlotTemplates = [
  "9:00 AM - 9:30 AM",
  "10:00 AM - 10:30 AM",
  "11:30 AM - 12:00 PM",
  "2:00 PM - 2:30 PM",
  "3:00 PM - 3:30 PM",
  "4:30 PM - 5:00 PM",
];
const timeOptions = [
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
];

const departmentAssignedByWeekday = {
  Mon: [
    { title: "CS201 - Algorithms", kind: "Class", time: "9:00 AM - 10:00 AM", place: "Block A · 201" },
    { title: "CS390 - Project Lab", kind: "Lab", time: "2:00 PM - 4:00 PM", place: "Lab 3" },
  ],
  Tue: [
    { title: "CS307 - OS", kind: "Class", time: "11:00 AM - 12:00 PM", place: "Block B · 118" },
    { title: "Department Coordination", kind: "Meeting", time: "4:00 PM - 5:00 PM", place: "Dean Office" },
  ],
  Wed: [
    { title: "CS201 - Algorithms", kind: "Class", time: "9:00 AM - 10:00 AM", place: "Block A · 201" },
    { title: "CS455 - Seminar", kind: "Meeting", time: "3:00 PM - 4:00 PM", place: "Seminar Hall" },
  ],
  Thu: [{ title: "CS307 - OS", kind: "Class", time: "11:00 AM - 12:00 PM", place: "Block B · 118" }],
  Fri: [{ title: "CS390 - Project Lab", kind: "Lab", time: "2:00 PM - 4:00 PM", place: "Lab 3" }],
  Sat: [],
  Sun: [],
};

const relativeAppointments = [
  { id: "A-301", dayOffset: -1, student: "Neha S", title: "Course Advising", time: "1:30 PM - 2:00 PM" },
  { id: "A-302", dayOffset: 0, student: "Arun K", title: "Project Review", time: "10:00 AM - 10:30 AM" },
  { id: "A-303", dayOffset: 1, student: "Group (3 students)", title: "Lab Clarification", time: "3:00 PM - 3:30 PM" },
  { id: "A-304", dayOffset: 2, student: "Sonia P", title: "Thesis Check-in", time: "4:30 PM - 5:00 PM" },
  { id: "A-305", dayOffset: 4, student: "Akhil R", title: "Internship Guidance", time: "2:00 PM - 2:30 PM" },
  { id: "A-306", dayOffset: 6, student: "Group (2 students)", title: "Project Milestone", time: "11:30 AM - 12:00 PM" },
];

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function fromDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateLong(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function buildMonthCells(visibleMonth) {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const cells = [];
  for (let i = 0; i < first.getDay(); i += 1) cells.push(null);

  for (let day = 1; day <= last.getDate(); day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toMinutes(timeLabel) {
  const [time, period] = timeLabel.split(" ");
  const [hourRaw, minuteRaw] = time.split(":").map(Number);
  let hour = hourRaw % 12;
  if (period === "PM") hour += 12;
  return hour * 60 + minuteRaw;
}

function parseRange(rangeLabel) {
  const [startRaw, endRaw] = rangeLabel.split("-").map((part) => part.trim());
  return [toMinutes(startRaw), toMinutes(endRaw)];
}

function rangesOverlap(firstRange, secondRange) {
  const [firstStart, firstEnd] = parseRange(firstRange);
  const [secondStart, secondEnd] = parseRange(secondRange);
  return firstStart < secondEnd && secondStart < firstEnd;
}

export default function FacultyScheduleViewPage() {
  const [today] = useState(() => new Date());
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey(today));
  const [customStart, setCustomStart] = useState("5:00 PM");
  const [customEnd, setCustomEnd] = useState("5:30 PM");
  const [availabilityTab, setAvailabilityTab] = useState("set");
  const [draftAvailabilityByDate, setDraftAvailabilityByDate] = useState({});
  const [saveNote, setSaveNote] = useState("");
  const [busyStart, setBusyStart] = useState("1:00 PM");
  const [busyEnd, setBusyEnd] = useState("5:00 PM");
  const [busyAction, setBusyAction] = useState("reschedule");

  const [availabilityByDate, setAvailabilityByDate] = useState(() => ({
    [toDateKey(today)]: ["10:00 AM - 10:30 AM", "2:00 PM - 2:30 PM"],
    [toDateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1))]: [
      "11:30 AM - 12:00 PM",
    ],
  }));

  const appointments = useMemo(
    () =>
      relativeAppointments.map((item) => {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + item.dayOffset);
        return { ...item, dateKey: toDateKey(date) };
      }),
    [today],
  );

  const selectedDate = fromDateKey(selectedDateKey);
  const selectedWeekday = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(selectedDate);
  const monthCells = useMemo(() => buildMonthCells(visibleMonth), [visibleMonth]);

  const todayStart = startOfDay(today);
  const selectedStart = startOfDay(selectedDate);
  const dayOffset = Math.floor((selectedStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
  const isPastDate = dayOffset < 0;
  const isBeyondWindow = dayOffset > 7;
  const canEditAvailability = dayOffset >= 0 && dayOffset <= 7;

  const busyRange = `${busyStart} - ${busyEnd}`;
  const isBusyRangeValid = toMinutes(busyEnd) > toMinutes(busyStart);

  const departmentItemsForDay = departmentAssignedByWeekday[selectedWeekday] ?? [];
  const appointmentsForDay = appointments.filter((item) => item.dateKey === selectedDateKey);
  const bookedSlotsForDay = appointmentsForDay.map((item) => item.time);
  const departmentBlockedRanges = departmentItemsForDay.map((item) => item.time);
  const blockedRangesForDay = [...bookedSlotsForDay, ...departmentBlockedRanges];
  const isSlotBlocked = (slot) => blockedRangesForDay.some((blockedRange) => rangesOverlap(slot, blockedRange));
  const availabilityForDay = availabilityByDate[selectedDateKey] ?? [];
  const draftSlotsBase = draftAvailabilityByDate[selectedDateKey] ?? availabilityForDay;
  const draftSlots = draftSlotsBase.filter((slot) => !isSlotBlocked(slot));

  const toggleSlot = (slot) => {
    if (!canEditAvailability) return;
    if (isSlotBlocked(slot)) return;
    setDraftAvailabilityByDate((prev) => {
      const current = prev[selectedDateKey] ?? availabilityForDay;
      const next = current.includes(slot) ? current.filter((s) => s !== slot) : [...current, slot];
      return { ...prev, [selectedDateKey]: next };
    });
  };

  const addCustomSlot = () => {
    if (!canEditAvailability) return;
    if (toMinutes(customEnd) <= toMinutes(customStart)) {
      setSaveNote("End time must be after start time.");
      return;
    }
    const value = `${customStart} - ${customEnd}`;
    if (isSlotBlocked(value)) {
      setSaveNote("This slot conflicts with booked/department-assigned time and cannot be added.");
      return;
    }
    setDraftAvailabilityByDate((prev) => {
      const current = prev[selectedDateKey] ?? availabilityForDay;
      if (current.includes(value)) return prev;
      return { ...prev, [selectedDateKey]: [...current, value] };
    });
    setSaveNote("");
  };

  const saveAvailability = () => {
    if (!canEditAvailability) return;
    setAvailabilityByDate((prev) => ({ ...prev, [selectedDateKey]: draftSlots }));
    setDraftAvailabilityByDate((prev) => ({ ...prev, [selectedDateKey]: draftSlots }));
    setSaveNote(`Availability set for ${formatDateLong(selectedDate)}.`);
  };

  return (
    <main className="min-h-screen bg-[#F7F9FC] px-4 py-10">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <div className="mb-4">
          <BackArrowButton />
        </div>

        <header className="rounded-lg border border-[#DCE3ED] bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#6C8096]">Faculty Function</p>
          <h1 className="mt-1 text-2xl font-bold text-[#1F3A5F]">View Schedule</h1>
          <p className="mt-2 text-sm text-[#5A6C7D]">
            Click a day to view appointments and department-assigned items. Availability can be set
            only for today and the next 7 days.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className="rounded-lg border border-[#DCE3ED] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1F3A5F]">Calendar</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleMonth(
                      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1),
                    )
                  }
                  className="rounded-md border border-[#C8D3E0] bg-white px-3 py-1.5 text-sm text-[#2A4A75]"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setVisibleMonth(
                      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1),
                    )
                  }
                  className="rounded-md border border-[#C8D3E0] bg-white px-3 py-1.5 text-sm text-[#2A4A75]"
                >
                  Next
                </button>
              </div>
            </div>

            <p className="mb-3 text-sm text-[#5A6C7D]">
              {visibleMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}
            </p>

            <div className="grid grid-cols-7 gap-2 text-center text-xs text-[#6E8196]">
              {dayHeaders.map((day) => (
                <p key={day} className="py-1 font-medium">
                  {day}
                </p>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-2">
              {monthCells.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="h-11 rounded-md bg-transparent" />;
                }

                const dateKey = toDateKey(date);
                const isSelected = dateKey === selectedDateKey;
                const dayAppointments = appointments.filter((item) => item.dateKey === dateKey).length;
                const dayAssignments =
                  departmentAssignedByWeekday[
                    new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date)
                  ]?.length ?? 0;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => setSelectedDateKey(dateKey)}
                    className={`relative h-11 rounded-md border text-sm transition ${
                      isSelected
                        ? "border-[#1F3A5F] bg-[#1F3A5F] text-white"
                        : "border-[#DCE3ED] bg-white text-[#1F3A5F] hover:bg-[#F3F6FA]"
                    }`}
                  >
                    {date.getDate()}
                    {(dayAppointments > 0 || dayAssignments > 0) && (
                      <span
                        className={`absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full ${
                          isSelected ? "bg-white" : "bg-[#4A6FA5]"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </article>

          <article className="rounded-lg border border-[#DCE3ED] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1F3A5F]">{formatDateLong(selectedDate)}</h2>
            <p className="mt-1 text-sm text-[#5A6C7D]">Appointments and department-assigned schedule.</p>

            <div className="mt-4 rounded-md border border-[#DCE3ED] bg-[#FBFCFE] p-4">
              <h3 className="text-sm font-semibold text-[#1F3A5F]">Appointments</h3>
              {isBeyondWindow ? (
                <p className="mt-2 text-sm text-[#5A6C7D]">
                  Outside 7-day window: appointment slots are not open yet.
                </p>
              ) : appointmentsForDay.length === 0 ? (
                <p className="mt-2 text-sm text-[#5A6C7D]">No appointments for this day.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {appointmentsForDay.map((item) => (
                    <div key={item.id} className="rounded-md border border-[#DCE3ED] bg-white p-3 text-sm">
                      <p className="font-semibold text-[#1F3A5F]">{item.title}</p>
                      <p className="text-[#5A6C7D]">{item.time} · {item.student}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 rounded-md border border-[#DCE3ED] bg-[#FBFCFE] p-4">
              <h3 className="text-sm font-semibold text-[#1F3A5F]">Department Assigned Schedule</h3>
              {departmentItemsForDay.length === 0 ? (
                <p className="mt-2 text-sm text-[#5A6C7D]">No department assignments for this day.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {departmentItemsForDay.map((item) => (
                    <div key={`${item.title}-${item.time}`} className="rounded-md border border-[#DCE3ED] bg-white p-3 text-sm">
                      <p className="font-semibold text-[#1F3A5F]">{item.title}</p>
                      <p className="text-[#5A6C7D]">{item.kind} · {item.time} · {item.place}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className="rounded-lg border border-[#DCE3ED] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1F3A5F]">Set Availability</h2>
            <p className="mt-1 text-sm text-[#5A6C7D]">
              Faculty can set or remove slots only for today and next 7 days.
            </p>
            <p className="mt-1 text-xs text-[#6E8196]">
              {canEditAvailability
                ? "Editing enabled for this date."
                : isPastDate
                  ? "Past date: read-only."
                  : "Beyond 7 days: read-only (department assignments only)."}
            </p>

            <div className="mt-4 flex overflow-hidden rounded-md border border-[#C8D3E0]">
              <button
                type="button"
                onClick={() => setAvailabilityTab("set")}
                className={`flex-1 px-4 py-2 text-sm ${availabilityTab === "set" ? "bg-[#1F3A5F] text-white" : "bg-white text-[#1F3A5F]"}`}
              >
                Set Availability
              </button>
              <button
                type="button"
                onClick={() => setAvailabilityTab("overview")}
                className={`flex-1 px-4 py-2 text-sm ${availabilityTab === "overview" ? "bg-[#1F3A5F] text-white" : "bg-white text-[#1F3A5F]"}`}
              >
                Available and Booked
              </button>
            </div>

            {availabilityTab === "set" && (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  {quickSlotTemplates.map((slot) => {
                    const selected = draftSlots.includes(slot);
                    const isBlocked = isSlotBlocked(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => toggleSlot(slot)}
                        disabled={!canEditAvailability || isBlocked}
                        className={`rounded-full border px-3 py-1.5 text-sm transition ${
                          isBlocked
                            ? "border-[#E4B8B8] bg-[#FDECEC] text-[#B05555]"
                            : selected
                              ? "border-[#1F3A5F] bg-[#1F3A5F] text-white"
                              : "border-[#C8D3E0] bg-white text-[#2A4A75]"
                        } ${!canEditAvailability || isBlocked ? "opacity-70" : "hover:bg-[#F3F6FA]"}`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <select
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="rounded-md border border-[#D4DDE8] bg-white px-3 py-2 text-sm text-[#1F3A5F] outline-none"
                    disabled={!canEditAvailability}
                  >
                    {timeOptions.map((time) => (
                      <option key={`start-${time}`}>{time}</option>
                    ))}
                  </select>
                  <select
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="rounded-md border border-[#D4DDE8] bg-white px-3 py-2 text-sm text-[#1F3A5F] outline-none"
                    disabled={!canEditAvailability}
                  >
                    {timeOptions.map((time) => (
                      <option key={`end-${time}`}>{time}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addCustomSlot}
                    disabled={!canEditAvailability}
                    className={`rounded-md px-4 py-2 text-sm text-white ${
                      canEditAvailability ? "bg-[#1F3A5F] hover:bg-[#2A4A75]" : "bg-[#9AAABC]"
                    }`}
                  >
                    Add
                  </button>
                </div>

                <div className="mt-4 rounded-md border border-[#DCE3ED] bg-[#FBFCFE] p-3">
                  <p className="text-sm font-semibold text-[#1F3A5F]">Selected Day Slots</p>
                  {draftSlots.length === 0 ? (
                    <p className="mt-2 text-sm text-[#5A6C7D]">No slots selected.</p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {draftSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => canEditAvailability && toggleSlot(slot)}
                          className="rounded-full border border-[#C8D3E0] bg-white px-3 py-1.5 text-sm text-[#2A4A75]"
                        >
                          {slot}
                          {canEditAvailability ? " ×" : ""}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={saveAvailability}
                    disabled={!canEditAvailability}
                    className={`rounded-md px-4 py-2 text-sm text-white ${
                      canEditAvailability ? "bg-[#1F3A5F] hover:bg-[#2A4A75]" : "bg-[#9AAABC]"
                    }`}
                  >
                    Set Availability
                  </button>
                  {saveNote && <p className="text-sm text-[#2E7D42]">{saveNote}</p>}
                </div>
              </>
            )}

            {availabilityTab === "overview" && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="min-h-[150px] rounded-md border border-[#DCE3ED] bg-[#FBFCFE] p-3">
                  <p className="text-sm font-semibold text-[#1F3A5F]">Available Slots</p>
                  {availabilityForDay.length === 0 ? (
                    <p className="mt-2 text-sm text-[#5A6C7D]">No available slots set.</p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {availabilityForDay.map((slot) => (
                        <span
                          key={slot}
                          className="rounded-full border border-[#C8D3E0] bg-white px-3 py-1.5 text-sm text-[#2A4A75]"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="min-h-[150px] rounded-md border border-[#E9C5C5] bg-[#FFF7F7] p-3">
                  <p className="text-sm font-semibold text-[#9A3E3E]">Blocked Slots</p>
                  {blockedRangesForDay.length === 0 ? (
                    <p className="mt-2 text-sm text-[#7B5A5A]">No blocked slots for this day.</p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {blockedRangesForDay.map((slot) => (
                        <span
                          key={`blocked-${slot}`}
                          className="rounded-full border border-[#E4B8B8] bg-white px-3 py-1.5 text-sm text-[#B05555]"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </article>

          <article className="rounded-lg border border-[#DCE3ED] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1F3A5F]">Busy Status</h2>
            <p className="mt-1 text-sm text-[#5A6C7D]">
              Set busy status for this date. This action will trigger conflict handling in workflow.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <select
                value={busyStart}
                onChange={(e) => setBusyStart(e.target.value)}
                className="rounded-md border border-[#D4DDE8] bg-white px-3 py-2 text-sm text-[#1F3A5F] outline-none"
                disabled={!canEditAvailability}
              >
                {timeOptions.map((time) => (
                  <option key={`busy-start-${time}`}>{time}</option>
                ))}
              </select>
              <select
                value={busyEnd}
                onChange={(e) => setBusyEnd(e.target.value)}
                className="rounded-md border border-[#D4DDE8] bg-white px-3 py-2 text-sm text-[#1F3A5F] outline-none"
                disabled={!canEditAvailability}
              >
                {timeOptions.map((time) => (
                  <option key={`busy-end-${time}`}>{time}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className={`mt-3 rounded-md px-4 py-2 text-sm text-white ${
                canEditAvailability && isBusyRangeValid
                  ? "bg-[#1F3A5F] hover:bg-[#2A4A75]"
                  : "bg-[#9AAABC]"
              }`}
              disabled={!canEditAvailability || !isBusyRangeValid}
              onClick={() => {}}
            >
              Set Busy Status
            </button>

            <div className="mt-3 rounded-md border border-[#DCE3ED] bg-[#FBFCFE] p-3 text-sm text-[#5A6C7D]">
              {canEditAvailability && isBusyRangeValid
                ? `Selected busy window: ${busyRange}.`
                : canEditAvailability
                  ? "Choose a valid busy time range."
                : "Busy status is read-only for this day."}
            </div>

            <div className="mt-4 rounded-md border border-[#DCE3ED] bg-[#FBFCFE] p-3">
              <p className="text-sm font-semibold text-[#1F3A5F]">Conflict Handling Options</p>
              <p className="mt-1 text-xs text-[#6E8196]">
                Choose how to handle requests affected by this busy period.
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setBusyAction("cancel")}
                  className={`rounded-md border px-3 py-2 text-sm transition ${
                    busyAction === "cancel"
                      ? "border-[#B05555] bg-[#B05555] text-white"
                      : "border-[#E4B8B8] bg-white text-[#B05555]"
                  }`}
                >
                  Cancel All Requests
                </button>
                <button
                  type="button"
                  onClick={() => setBusyAction("reschedule")}
                  className={`rounded-md border px-3 py-2 text-sm transition ${
                    busyAction === "reschedule"
                      ? "border-[#1F3A5F] bg-[#1F3A5F] text-white"
                      : "border-[#C8D3E0] bg-white text-[#2A4A75]"
                  }`}
                >
                  Send Reschedule Requests
                </button>
                <button
                  type="button"
                  onClick={() => setBusyAction("manual")}
                  className={`rounded-md border px-3 py-2 text-sm transition ${
                    busyAction === "manual"
                      ? "border-[#1F3A5F] bg-[#1F3A5F] text-white"
                      : "border-[#C8D3E0] bg-white text-[#2A4A75]"
                  }`}
                >
                  Manually Manage Each Request
                </button>
              </div>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
