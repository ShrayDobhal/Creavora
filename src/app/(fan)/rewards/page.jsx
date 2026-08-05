import { Award } from "lucide-react";

export default function RewardsPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-3xl items-center px-4 py-10 sm:px-6">
      <section className="w-full rounded-3xl border border-line bg-white p-8 text-center sm:p-12" aria-labelledby="rewards-title">
        <Award className="mx-auto text-brand-600" size={32} aria-hidden="true" />
        <h1 id="rewards-title" className="mt-4 text-2xl font-black tracking-tight">Rewards unavailable</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
          Rewards will appear here when the program has verified account data.
        </p>
      </section>
    </main>
  );
}
