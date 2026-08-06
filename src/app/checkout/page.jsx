"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Building2, CheckCircle2, CreditCard, LoaderCircle, LockKeyhole, ShieldCheck, Smartphone, WalletCards } from "lucide-react";
import { ConsumerAvatar } from "@/components/consumer/CreatorCard";
import { AsyncState } from "@/components/consumer/AsyncState";
import { createPaymentOrder, getCreator, verifyPayment } from "@/services/consumer-api";

const loadCheckoutScript = () => new Promise((resolve, reject) => {
  if (window.Razorpay) return resolve();
  const existing = document.getElementById("razorpay-checkout-script");
  if (existing) {
    existing.addEventListener("load", resolve, { once: true });
    existing.addEventListener("error", () => reject(new Error("Razorpay Checkout could not be loaded")), { once: true });
    return;
  }
  const script = document.createElement("script");
  script.id = "razorpay-checkout-script";
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  script.addEventListener("load", resolve, { once: true });
  script.addEventListener("error", () => reject(new Error("Razorpay Checkout could not be loaded")), { once: true });
  document.body.appendChild(script);
});

const methods = [
  { icon: Smartphone, title: "UPI", detail: "Google Pay, PhonePe, Paytm and other UPI apps" },
  { icon: CreditCard, title: "Cards", detail: "Visa, Mastercard and RuPay" },
  { icon: Building2, title: "Net banking", detail: "Major Indian banks" },
  { icon: WalletCards, title: "Wallets", detail: "Available wallets from your Razorpay account" },
];

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();
  const handle = params.get("creator")?.trim() || "";
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState(handle ? "loading" : "empty");
  const [error, setError] = useState("");
  const [paymentState, setPaymentState] = useState("idle");
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    if (!handle) return undefined;
    const controller = new AbortController();
    getCreator({ handle, signal: controller.signal })
      .then((result) => { setProfile(result); setStatus("success"); })
      .catch((loadError) => {
        if (loadError.name === "AbortError") return;
        setError(loadError.message);
        setStatus("error");
      });
    return () => controller.abort();
  }, [handle]);

  const startPayment = async () => {
    if (!profile?.creator || paymentState === "opening" || paymentState === "verifying") return;
    setPaymentState("opening");
    setPaymentError("");
    try {
      const [order] = await Promise.all([
        createPaymentOrder(profile.creator.id),
        loadCheckoutScript(),
      ]);
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Blindly",
        description: `Monthly subscription to ${order.creator.name}`,
        prefill: { name: order.customer?.name || "", email: order.customer?.email || "" },
        notes: { creator: order.creator.handle },
        theme: { color: "#6d3df5" },
        modal: { ondismiss: () => setPaymentState("idle") },
        handler: async (response) => {
          setPaymentState("verifying");
          try {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setPaymentState("success");
            window.setTimeout(() => router.push("/subscriptions"), 900);
          } catch (verificationError) {
            setPaymentState("failed");
            setPaymentError(verificationError.message);
          }
        },
      });
      checkout.on("payment.failed", (response) => {
        setPaymentState("failed");
        setPaymentError(response.error?.description || "The payment was not completed");
      });
      checkout.open();
    } catch (checkoutError) {
      setPaymentState("failed");
      setPaymentError(checkoutError.message);
    }
  };

  if (status !== "success" || !profile) {
    return <main className="grid min-h-screen place-items-center bg-canvas p-6"><div className="w-full max-w-xl"><AsyncState status={status} error={error} emptyTitle="Choose a creator plan" emptyMessage="Open checkout from a creator profile" /></div></main>;
  }

  const creator = profile.creator;
  const price = Number(creator.subscriptionPrice || 0);
  return (
    <main className="min-h-screen bg-canvas px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link href={`/creator/${encodeURIComponent(creator.handle)}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-bold text-ink"><ArrowLeft size={17} /> Back to profile</Link>
          <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700"><LockKeyhole size={15} /> Secure Razorpay checkout</span>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(420px,1.2fr)]">
          <section className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-4">
              <ConsumerAvatar creator={creator} size="h-20 w-20" />
              <div className="min-w-0"><p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Creator membership</p><h1 className="mt-1 truncate text-2xl font-black">{creator.name}</h1><p className="truncate text-sm text-muted">@{creator.handle}</p></div>
            </div>
            <div className="mt-7 rounded-2xl bg-brand-50 p-5">
              <p className="text-sm font-bold text-brand-800">Premium Monthly</p>
              <p className="mt-2 text-4xl font-black text-ink">₹{price.toLocaleString("en-IN")}<span className="text-sm font-semibold text-muted"> / month</span></p>
              <p className="mt-2 text-xs leading-5 text-muted">One-month access recorded in Blindly after Razorpay confirms the captured payment</p>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-ink/80">
              {["Unlock all premium posts and videos", "Join the creator community", "Premium access appears in Subscriptions", "Cancel future access from your account"].map((benefit) => <li key={benefit} className="flex gap-2.5"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />{benefit}</li>)}
            </ul>
          </section>

          <section className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Payment options</p><h2 className="mt-1 text-2xl font-black">Choose inside Razorpay</h2></div><ShieldCheck size={28} className="text-emerald-600" /></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {methods.map(({ icon: Icon, title, detail }) => <div key={title} className="rounded-2xl border border-line p-4"><Icon size={20} className="text-brand-600" /><p className="mt-3 text-sm font-black">{title}</p><p className="mt-1 text-xs leading-5 text-muted">{detail}</p></div>)}
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <div className="flex items-center justify-between text-sm"><span className="text-muted">Premium Monthly</span><span className="font-bold">₹{price.toLocaleString("en-IN")}</span></div>
              <div className="mt-2 flex items-center justify-between text-lg font-black"><span>Total</span><span>₹{price.toLocaleString("en-IN")}</span></div>
            </div>
            {paymentError ? <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{paymentError}</p> : null}
            {paymentState === "success" ? <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">Payment confirmed. Your premium access is active</p> : null}
            <button type="button" disabled={price < 1 || ["opening", "verifying", "success"].includes(paymentState)} onClick={startPayment} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-black text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
              {["opening", "verifying"].includes(paymentState) ? <LoaderCircle size={18} className="animate-spin" /> : <LockKeyhole size={17} />}
              {paymentState === "opening" ? "Opening Razorpay" : paymentState === "verifying" ? "Confirming payment" : paymentState === "success" ? "Access activated" : `Pay ₹${price.toLocaleString("en-IN")} securely`}
            </button>
            <p className="mt-3 text-center text-xs leading-5 text-muted">Payment methods shown depend on the methods enabled in your Razorpay account</p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-canvas"><LoaderCircle className="animate-spin text-brand-600" /></main>}><CheckoutContent /></Suspense>;
}
