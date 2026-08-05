import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";

export const metadata = {
  title: "Checkout unavailable | Blindly",
};

export default function CheckoutPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4 py-10">
      <section className="w-full max-w-xl rounded-3xl border border-line bg-white p-8 text-center shadow-sm sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <CreditCard aria-hidden="true" size={26} />
        </span>
        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-600">
          Blindly
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">
          Checkout is not available yet
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted">
          Blindly subscriptions and payments are unavailable in this release. No payment will be
          requested or processed here.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/subscriptions"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-bold text-white"
          >
            View subscriptions
          </Link>
          <Link
            href="/home"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line px-5 text-sm font-bold text-ink"
          >
            <ArrowLeft aria-hidden="true" size={16} /> Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
