"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CreditCard,
  ChevronDown,
  Crown,
  Images,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/ui/Bits.jsx";
import { Avatar, Photo, Verified } from "@/ui/Media.jsx";
import { creators, slug } from "@/data.js";

const plans = [
  {
    id: "monthly",
    icon: Crown,
    tone: "fill-brand-500 text-brand-500",
    title: "Premium Monthly",
    price: 499,
    unit: "/ month",
    note: "Billed monthly. Cancel anytime.",
    save: "Save ₹100",
    popular: true,
  },
  {
    id: "quarterly",
    icon: Crown,
    tone: "fill-neutral-700 text-neutral-700",
    title: "Premium 3 Months",
    price: 1299,
    unit: "/ 3 months",
    note: "₹433 / month (billed every 3 months)",
    save: "Save ₹198",
  },
  {
    id: "yearly",
    icon: Crown,
    tone: "fill-amber-400 text-amber-400",
    title: "Premium Yearly",
    price: 4999,
    unit: "/ year",
    note: "₹416 / month (billed yearly)",
    save: "Save ₹989",
  },
];

const perks = [
  { icon: Images, title: "Exclusive Posts", sub: "Access photos, videos & reels that I don't share anywhere else." },
  { icon: Sparkles, title: "Behind the Scenes", sub: "Get a peek into my daily life and creative process." },
  { icon: MessageCircle, title: "Live Chats", sub: "Join live chats & priority replies from me." },
  { icon: Rocket, title: "Early Access", sub: "Be the first to watch my new videos and updates." },
  { icon: Crown, title: "Special Badges", sub: "Get a special badge next to your name in comments." },
];

const methods = [
  { id: "upi", label: "UPI", icon: Zap },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Building2 },
  { id: "wallets", label: "Wallets", icon: Wallet },
];

const upiApps = ["GPay", "PhonePe", "Paytm", "BHIM", "Other UPI"];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const creatorHandle = searchParams.get("creator") || "ananyasharma";

  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Error loading user state in checkout:", err));
  }, []);

  const creator = creators.find((c) => slug(c.name) === creatorHandle || c.handle.replace("@", "") === creatorHandle) || creators[0];

  const planDetails = plans.find((p) => p.id === selectedPlan);
  // Allow adjusting price based on creator settings (e.g. scale standard price by their custom profile scale)
  const finalPrice = creator.price ? Math.round((planDetails.price / 499) * creator.price) : planDetails.price;

  const handlePay = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorHandle: creator.handle.replace("@", ""),
          tier: planDetails.title,
          price: finalPrice,
          method: "Wallet Balance",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          if (confirm(`${result.error}\n\nWould you like to go to your wallet to deposit coins?`)) {
            router.push("/wallet");
          }
        } else {
          alert(result.error || "Subscription failed.");
        }
        setLoading(false);
        return;
      }

      alert(`Successfully subscribed to ${creator.name}! 150 XP rewarded.`);

      // Sync and update components
      window.dispatchEvent(new Event("user-update"));
      window.dispatchEvent(new Event("notifications-update"));

      router.push(`/creator/${slug(creator.name)}`);
    } catch (error) {
      console.error("Payment Process Error:", error);
      alert("Something went wrong during payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas px-4 py-4">
      <div className="mx-auto max-w-[1360px] overflow-hidden rounded-3xl border border-line bg-white">
        <header className="flex h-[76px] items-center gap-6 border-b border-line px-6">
          <button
            onClick={() => router.push(`/creator/${slug(creator.name)}`)}
            className="flex items-center gap-2 text-[14.5px] font-bold cursor-pointer"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <span className="h-8 w-px bg-line" />
          <div className="flex items-center gap-2.5">
            <Sparkles size={24} className="fill-brand-500 text-brand-500" />
            <span className="text-[21px] font-extrabold tracking-tight">Crevora</span>
          </div>
          <span className="ml-auto flex items-center gap-2 rounded-lg bg-brand-50 px-3.5 py-2 text-[13px] font-bold text-brand-700">
            <Lock size={14} /> Secure Checkout
          </span>
        </header>

        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,540px)_minmax(0,1fr)]">
          {/* creator summary */}
          <div>
            <Card className="overflow-hidden">
              <Photo seed={creator.name} className="h-[165px]" />
              <div className="relative px-5 pb-5 pt-4">
                <div className="absolute -top-[58px] left-5">
                  <div className="relative">
                    <Avatar name={creator.name} size={116} className="ring-4 ring-white" />
                    <span className="absolute bottom-2 right-1 grid h-7 w-7 place-items-center rounded-full border-[3px] border-white bg-brand-600">
                      <Verified size={13} className="fill-white text-brand-600" />
                    </span>
                  </div>
                </div>
                <div className="ml-[136px]">
                  <h1 className="flex items-center gap-2 text-[24px] font-extrabold tracking-tight">
                    {creator.name} <Verified size={18} />
                  </h1>
                  <p className="mt-1 flex items-center gap-3 text-[13px] text-muted">
                    {creator.handle}
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[12px] font-semibold text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                    </span>
                  </p>
                </div>

                <p className="mt-3 text-[13px] text-muted">
                  {creator.role} 👗 <span className="mx-1 text-line">|</span> 📍 India Centric
                </p>
                <p className="mt-2 text-[13.5px]">
                  Creating amazing digital media and community threads that inspire ✨
                </p>
                <p className="text-[13.5px] font-semibold text-brand-600">
                  Exclusive content for my premium subscribers! 💜
                </p>

                <div className="mt-4 grid grid-cols-4 rounded-2xl bg-brand-50/60 py-4">
                  {[
                    [creator.posts || "45", "Posts"],
                    [creator.fans || "21.3K", "Followers"],
                    ["4.8K", "Subscribers"],
                    ["5.0", "Rating"],
                  ].map(([v, l], i) => (
                    <div key={l} className={`text-center ${i ? "border-l border-white" : ""}`}>
                      <p className="flex items-center justify-center gap-1 text-[18px] font-extrabold">
                        {v}
                        {l === "Rating" && <Star size={14} className="fill-amber-400 text-amber-400" />}
                      </p>
                      <p className="text-[12px] text-muted">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <h2 className="mt-6 text-[17px] font-extrabold">What you'll get</h2>
            <div className="mt-3.5 space-y-3.5">
              {perks.map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="text-[14px] font-bold">{title}</p>
                    <p className="mt-0.5 text-[12.5px] text-muted">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3.5 text-[12.5px] font-semibold text-emerald-700">
              <ShieldCheck size={16} />
              Cancel anytime • No hidden charges • Secure &amp; private
            </div>
          </div>

          {/* plan + payment */}
          <div>
            <div className="flex items-start gap-3">
              <Crown size={24} className="mt-0.5 shrink-0 fill-brand-500 text-brand-500" />
              <div>
                <h2 className="text-[21px] font-extrabold tracking-tight">
                  Choose your subscription
                </h2>
                <p className="mt-1 text-[13.5px] text-muted">
                  Unlock exclusive content and connect more closely with {creator.name}.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {plans.map((p) => {
                const calculatedPrice = creator.price ? Math.round((p.price / 499) * creator.price) : p.price;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border p-5 text-left transition cursor-pointer ${
                      selectedPlan === p.id
                        ? "border-brand-500 bg-brand-50/40 ring-1 ring-brand-500"
                        : "border-line bg-white hover:border-brand-200"
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute right-0 top-0 rounded-bl-xl bg-brand-600 px-3 py-1.5 text-[11.5px] font-bold text-white">
                        Most Popular
                      </span>
                    )}
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                        selectedPlan === p.id ? "border-brand-600" : "border-neutral-300"
                      }`}
                    >
                      {selectedPlan === p.id && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}
                    </span>
                    <p.icon size={22} className={`shrink-0 ${p.tone}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-bold">{p.title}</p>
                      <p className="mt-1 text-[21px] font-extrabold tracking-tight">
                        ₹{calculatedPrice}
                        <span className="text-[13px] font-medium text-muted"> {p.unit}</span>
                      </p>
                      <p className="mt-1 text-[12.5px] text-muted">{p.note}</p>
                    </div>
                    <span className="shrink-0 self-start rounded-md bg-emerald-50 px-2.5 py-1 text-[12px] font-bold text-emerald-600">
                      {p.save}
                    </span>
                  </button>
                );
              })}
            </div>

            <h3 className="mt-7 text-[17px] font-extrabold">Payment method</h3>
            <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-muted">
              <Lock size={12} /> Billed directly using Crevora Coins Wallet.
            </p>

            <Card className="mt-4 p-5 bg-brand-50/20 border border-brand-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet size={19} className="text-brand-600" />
                  <div>
                    <p className="text-[14px] font-bold text-ink">Crevora Coins Wallet</p>
                    <p className="text-[12px] text-muted">Available balance: ₹{user ? user.walletBalance.toFixed(2) : "0.00"}</p>
                  </div>
                </div>
                <Link href="/wallet" className="text-[12px] font-bold text-brand-600 hover:underline">
                  Deposit Coins
                </Link>
              </div>
            </Card>

            <div className="mt-5 border-t border-line pt-4">
              <p className="flex items-center justify-between text-[14px] font-bold">
                Price Details <ChevronDown size={16} className="text-muted" />
              </p>
              <div className="mt-3 space-y-2.5 text-[13.5px]">
                <div className="flex justify-between">
                  <span className="text-muted">{planDetails.title}</span>
                  <span className="font-semibold">₹{finalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Platform Fee</span>
                  <span className="font-semibold">₹0</span>
                </div>
              </div>
              <div className="mt-3 flex justify-between border-t border-line pt-3 text-[16px] font-extrabold">
                <span>Total</span>
                <span>₹{finalPrice}</span>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={loading}
              className="mt-5 flex h-[58px] w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 text-[16px] font-bold text-white hover:opacity-95 cursor-pointer disabled:opacity-50"
            >
              <Lock size={17} /> {loading ? "Paying..." : `Pay ₹${finalPrice} Securely`}
            </button>

            <p className="mt-3.5 text-center text-[12px] text-muted">
              By proceeding, you agree to Crevora's{" "}
              <a href="#" className="font-semibold text-brand-600">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="font-semibold text-brand-600">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from "react";

export default function Checkout() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas p-8 text-center text-[15px] font-semibold text-muted">Loading secure checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
