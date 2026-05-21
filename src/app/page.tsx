import { MessageTable } from "@/components/MessageTable";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F7F5]">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#0A1F16]">Tin nhắn</h2>
          <p className="mt-0.5 text-sm text-[#5A7A6A]">
            Real-time inbox · Hot / Warm / Cold lead scoring
          </p>
        </div>
        <MessageTable />
      </main>
    </div>
  );
}
