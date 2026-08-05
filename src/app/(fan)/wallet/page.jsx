import { WalletCards } from "lucide-react";

export default function WalletPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-3xl items-center px-4 py-10 sm:px-6">
      <section className="w-full rounded-3xl border border-line bg-white p-8 text-center sm:p-12" aria-labelledby="wallet-title">
        <WalletCards className="mx-auto text-brand-600" size={32} aria-hidden="true" />
        <h1 id="wallet-title" className="mt-4 text-2xl font-black tracking-tight">Wallet unavailable</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
          Wallet tools will be available once account data is ready.
        </p>
      </section>
    </main>
  );
}
