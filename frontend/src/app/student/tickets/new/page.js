import RaiseTicketForm from "@/components/RaiseTicketForm";
import BackArrowButton from "@/components/BackArrowButton";

export default function StudentRaiseTicketPage() {
  return (
    <main className="min-h-screen bg-[#F7F9FC] px-4 py-8">
      <div className="mx-auto max-w-xl rounded-lg border border-[#E0E0E0] bg-white p-6">

        <h1 className="mt-4 text-xl font-semibold text-[#1F3A5F]">
          Raise Support Ticket
        </h1>
        <p className="mb-6 text-sm text-[#4A6FA5]">
          Report issues related to appointments or system usage.
        </p>

        <RaiseTicketForm role="Student" />
      </div>
    </main>
  );
}
