"use client";

import { useState } from "react";

export default function ViewFacultyAppointments() {
  const [comment, setComment] = useState("");
  const [showBanner, setShowBanner] = useState(false);
  const [meetingLink, setMeetingLink] = useState(null);

  // Hardcoded for now (as per current UI)
  const appointmentMode = "Virtual Meeting";

  const generateMeetLink = () => {
    const randomCode = Math.random().toString(36).substring(2, 12);
    return `https://meet.google.com/${randomCode}`;
  };

  const handleApprove = () => {
    setShowBanner(true);

    if (appointmentMode === "Virtual Meeting") {
      const link = generateMeetLink();
      setMeetingLink(link);
    }

    setTimeout(() => setShowBanner(false), 3000);
  };

  const handleReject = () => {
    setShowBanner(true);
    setMeetingLink(null);
    setTimeout(() => setShowBanner(false), 3000);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#F7F9FC] overflow-hidden font-[Calibri,Arial,sans-serif] px-4 text-[16px]">
      {/* Background blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#4A6FA5]/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#2A4A75]/20 rounded-full blur-3xl animate-pulse" />

      {/* Side Banner */}
      {showBanner && (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 animate-slide-in">
          <div className="w-72 rounded-xl border border-[#E0E0E0] bg-white px-6 py-4 shadow-md">
            <p className="text-lg font-semibold text-[#1F3A5F]">
              Student Notified
            </p>
            <p className="text-[15px] text-[#4A6FA5] mt-1">
              The student has been informed of the appointment update.
            </p>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="relative w-full max-w-xl bg-white border border-[#E0E0E0] rounded-2xl shadow-sm p-6 sm:p-8 animate-fade-in">
        <h1 className="text-[28px] font-semibold text-[#1F3A5F] mb-2">
          Appointment Request
        </h1>
        <p className="text-[16px] text-[#2A4A75] mb-6">
          Review and manage incoming appointment requests
        </p>

        {/* Appointment Details */}
        <div className="space-y-3 mb-6">
          <Detail label="Student" value="Ananya Sharma" />
          <Detail label="Date & Time" value="12 Feb 2026 · 10:30 AM" />
          <Detail label="Mode" value={appointmentMode} />

          <div className="flex justify-between text-[16px]">
            <span className="text-gray-500">Status</span>
            <span className="px-2 py-0.5 rounded-full bg-[#4A6FA5]/10 text-[#4A6FA5] text-sm font-medium">
              Pending
            </span>
          </div>
        </div>

        {/* Comment Box */}
        <div className="mb-6">
          <label className="block text-[16px] font-medium text-[#1F3A5F] mb-1">
            Faculty Comments
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add comments for approval, rejection, or cancellation..."
            className="w-full min-h-[110px] rounded-lg border border-[#E0E0E0] p-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/40 resize-none"
          />
        </div>

        {/* Meeting Link Generated */}
        {meetingLink && (
          <div className="mb-6 rounded-lg border border-[#E0E0E0] bg-[#F7F9FC] p-4">
            <p className="font-semibold text-[#1F3A5F] mb-1">
              Meeting Link Generated
            </p>
            <a
              href={meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2A4A75] text-[15px] underline break-all"
            >
              {meetingLink}
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleReject}
            className="flex-1 rounded-lg border border-[#E0E0E0] py-3 text-[16px] font-medium text-[#1F3A5F] hover:bg-gray-50 transition"
          >
            Reject
          </button>

          <button className="flex-1 rounded-lg border border-[#E0E0E0] py-3 text-[16px] font-medium text-[#1F3A5F] hover:bg-gray-50 transition">
            Cancel
          </button>

          <button
            onClick={handleApprove}
            className="flex-1 rounded-lg bg-[#1F3A5F] py-3 text-[16px] font-medium text-white hover:bg-[#2A4A75] transition"
          >
            Approve
          </button>
        </div>
      </div>

      {/* Animations */}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex justify-between text-[16px]">
      <span className="text-gray-500">{label}</span>
      <span className="text-[#1F3A5F] font-medium">{value}</span>
    </div>
  );
}
