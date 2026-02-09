"use client";

import { useState } from "react";

export default function ViewAppointmentPage() {
  const [activeTab, setActiveTab] = useState("pending");

  const pendingAppointments = [
    {
      id: 1,
      student: "Aarav Sharma",
      topic: "Project Discussion",
      date: "12 Feb 2026",
      time: "10:30 AM",
      mode: "Virtual",
    },
    {
      id: 2,
      student: "Nisha Patel",
      topic: "Exam Clarification",
      date: "13 Feb 2026",
      time: "2:00 PM",
      mode: "In-Person",
    },
  ];

  const scheduledAppointments = [
    {
      id: 3,
      student: "Rahul Mehta",
      topic: "Internship Guidance",
      date: "10 Feb 2026",
      time: "11:00 AM",
      mode: "Virtual",
    },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#F7F9FC] px-4 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#4A6FA5]/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#2A4A75]/20 rounded-full blur-3xl" />

      {/* Main Card */}
      <div className="relative w-full max-w-[650px] bg-white border border-[#E0E0E0] rounded-2xl shadow-sm p-6 md:p-8">
        {/* Header */}
        <h1 className="text-3xl font-semibold text-[#1F3A5F]">
          View Appointments
        </h1>
        <p className="text-base text-[#2A4A75] mt-1">
          Faculty can review pending requests and scheduled meetings
        </p>

        {/* Tabs */}
        <div className="mt-6 flex border-b border-[#E0E0E0]">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 text-base font-medium transition ${
              activeTab === "pending"
                ? "text-[#1F3A5F] border-b-2 border-[#1F3A5F]"
                : "text-[#4A6FA5] hover:text-[#1F3A5F]"
            }`}
          >
            Pending Requests
          </button>

          <button
            onClick={() => setActiveTab("scheduled")}
            className={`ml-4 px-4 py-2 text-base font-medium transition ${
              activeTab === "scheduled"
                ? "text-[#1F3A5F] border-b-2 border-[#1F3A5F]"
                : "text-[#4A6FA5] hover:text-[#1F3A5F]"
            }`}
          >
            Scheduled Appointments
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-4">
          {activeTab === "pending" &&
            (pendingAppointments.length ? (
              pendingAppointments.map((appt) => (
                <AppointmentCard key={appt.id} data={appt} />
              ))
            ) : (
              <EmptyState text="No pending appointment requests." />
            ))}

          {activeTab === "scheduled" &&
            (scheduledAppointments.length ? (
              scheduledAppointments.map((appt) => (
                <AppointmentCard key={appt.id} data={appt} />
              ))
            ) : (
              <EmptyState text="No scheduled appointments." />
            ))}
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({ data }) {
  return (
    <div className="border border-[#E0E0E0] rounded-xl p-5 bg-white hover:shadow-sm transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-[#1F3A5F]">
            {data.student}
          </h3>
          <p className="text-base text-[#4A6FA5] mt-0.5">
            {data.topic}
          </p>
        </div>

        <span className="text-sm px-3 py-1 rounded-full bg-[#4A6FA5]/10 text-[#2A4A75]">
          {data.mode}
        </span>
      </div>

      <div className="mt-4 text-base text-[#2A4A75] flex justify-between">
        <span>{data.date}</span>
        <span>{data.time}</span>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-center text-base text-[#4A6FA5] py-8">
      {text}
    </div>
  );
}