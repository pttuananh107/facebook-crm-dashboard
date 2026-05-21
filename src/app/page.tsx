import { MessageTable } from "@/components/MessageTable";

export default function Home() {
  return (
    <div className="min-h-screen bg-night">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Tin nhắn</h2>
          <p className="mt-0.5 text-sm text-white/35">
            Real-time inbox · Hot / Warm / Cold lead scoring
          </p>
        </div>
        <MessageTable />
      </main>
    </div>
  );
}
