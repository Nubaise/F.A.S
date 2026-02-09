"use client";

import { useState } from "react";

export default function RaiseTicketForm({ role }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();

    // UI-only placeholder
    console.log({
      role,
      title,
      description,
      attachment,
    });

    alert(`Ticket raised successfully by ${role}`);
    setTitle("");
    setDescription("");
    setAttachment(null);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-[#1F3A5F]">
          Issue Title
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief summary of the issue"
          className="mt-1 w-full rounded-md border border-[#E0E0E0] px-3 py-2 text-sm"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-[#1F3A5F]">
          Description
        </label>
        <textarea
          rows={4}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain the issue in detail"
          className="mt-1 w-full rounded-md border border-[#E0E0E0] px-3 py-2 text-sm"
        />
      </div>

      {/* Optional Attachment */}
      <div>
        <label className="block text-sm font-medium text-[#1F3A5F] mb-1">
            Attach Screenshot / File (optional)
        </label>

      <div className="flex items-center gap-3">
        <label
        htmlFor="attachment"
        className="cursor-pointer rounded-md border border-[#4A6FA5] px-4 py-2 text-sm text-[#4A6FA5] transition hover:bg-[#4A6FA5]/10"
        >
            Choose File
        </label>

        <span className="text-xs text-[#6E8196]">
          {attachment ? attachment.name : "No file selected"}
        </span>
      </div>

      <input
        id="attachment"
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => setAttachment(e.target.files?.[0] || null)}
        className="hidden"
      />

      <p className="mt-1 text-xs text-[#6E8196]">
        Upload screenshots or documents to help explain the issue.
      </p>
    </div>


      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-md bg-[#1F3A5F] px-4 py-2 text-sm text-white hover:bg-[#2A4A75] cursor-pointer"
        >
          Submit Ticket
        </button>

        <button
          type="reset"
          className="rounded-md border border-[#E0E0E0] px-4 py-2 text-sm cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
