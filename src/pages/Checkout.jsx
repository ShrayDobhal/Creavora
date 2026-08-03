import { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/Bits.jsx";
import { Avatar, Photo, Verified } from "../ui/Media.jsx";

const plans = [
  {
    id: "monthly",
    icon: Crown,
    tone: "fill-brand-500 text-brand-500",
    title: "Premium Monthly",
    price: "₹499",
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
    price: "₹1,299",
    unit: "/ 3 months",
    note: "₹433 / month (billed every 3 months)",
    save: "Save ₹198",
  },
  {
    id: "yearly",
    icon: Crown,
    tone: "fill-amber-400 text-amber-400",
    title: "Premium Yearly",
    price: "₹4,999",
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

export default function Checkout() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState("monthly");
  const [method, setMethod] = useState("upi");

  return (
    <div className="min-h-full bg-canvas px-4 py-4">
      <div className="mx-auto max-w-[1360px] overflow-hidden rounded-3xl border border-line bg-white">
        <header className="flex h-[76px] items-center gap-6 border-b border-line px-6">
          <button
            onClick={() => (history.length > 1 ? navigate(-1) : navigate("/creator/ananya-sharma"))}
            className="flex items-center gap-2 text-[14.5px] font-bold"
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
              <Photo seed="ananya-neon-cover" className="h-[165px]" />
              <div className="relative px-5 pb-5 pt-4">
                <div className="absolute -top-[58px] left-5">
                  <div className="relative">
                    <Avatar name="Ananya Sharma" size={116} className="ring-4 ring-white" />
                    <span className="absolute bottom-2 right-1 grid h-7 w-7 place-items-center rounded-full border-[3px] border-white bg-brand-600">
                      <Verified size={13} className="fill-white text-brand-600" />
                    </span>
                  </div>
                </div>
                <div className="ml-[136px]">
                  <h1 className="flex items-center gap-2 text-[24px] font-extrabold tracking-tight">
                    Ananya Sharma <Verified size={18} />
                  </h1>
                  <p className="mt-1 flex items-center gap-3 text-[13px] text-muted">
                    @ananyasharma
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[12px] font-semibold text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
                    </span>
                  </p>
                </div>

                <p className="mt-3 text-[13px] text-muted">
                  Fashion Creator 👗 <span className="mx-1 text-line">|</span> 📍 Mumbai, India
                </p>
                <p className="mt-2 text-[13.5px]">
                  Creating fashion, lifestyle &amp; travel content that inspires ✨
                </p>
                <p className="text-[13.5px] font-semibold">
                  Exclusive content for my amazing fam! 💜
                </p>

                <div className="mt-4 grid grid-cols-4 rounded-2xl bg-brand-50/60 py-4">
                  {[
                    ["124", "Posts"],
                    ["21.3K", "Followers"],
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
                  Unlock exclusive content and connect more closely with Ananya.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {plans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={`relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border p-5 text-left transition ${
                    plan === p.id
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
                      plan === p.id ? "border-brand-600" : "border-neutral-300"
                    }`}
                  >
                    {plan === p.id && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}
                  </span>
                  <p.icon size={22} className={`shrink-0 ${p.tone}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold">{p.title}</p>
                    <p className="mt-1 text-[21px] font-extrabold tracking-tight">
                      {p.price}
                      <span className="text-[13px] font-medium text-muted"> {p.unit}</span>
                    </p>
                    <p className="mt-1 text-[12.5px] text-muted">{p.note}</p>
                  </div>
                  <span className="shrink-0 self-start rounded-md bg-emerald-50 px-2.5 py-1 text-[12px] font-bold text-emerald-600">
                    {p.save}
                  </span>
                </button>
              ))}
            </div>

            <h3 className="mt-7 text-[17px] font-extrabold">Payment method</h3>
            <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-muted">
              <Lock size={12} /> All payments are secure and encrypted.
            </p>

            <div className="mt-3.5 grid grid-cols-4 gap-3">
              {methods.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setMethod(id)}
                  className={`flex h-[54px] items-center justify-center gap-2.5 rounded-xl border text-[13.5px] font-bold transition ${
                    method === id
                      ? "border-brand-500 bg-brand-50/40 text-brand-700"
                      : "border-line bg-white hover:border-brand-200"
                  }`}
                >
                  <Icon size={17} /> {label}
                </button>
              ))}
            </div>

            <Card className="mt-4 p-5">
              <p className="text-[14px] font-bold">Pay with UPI</p>
              <div className="mt-3.5 grid grid-cols-5 gap-3">
                {upiApps.map((a) => (
                  <button
                    key={a}
                    className="flex h-[74px] flex-col items-center justify-center gap-2 rounded-xl border border-line text-[11.5px] font-semibold hover:border-brand-300"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-canvas">
                      {a === "Other UPI" ? (
                        <MoreHorizontal size={14} />
                      ) : (
                        <span className="text-[11px] font-extrabold">{a[0]}</span>
                      )}
                    </span>
                    {a}
                  </button>
                ))}
              </div>

              <p className="mt-4 text-[13px] font-semibold">UPI ID</p>
              <div className="mt-2 flex items-center gap-3">
                <input
                  placeholder="you@upi"
                  className="h-11 flex-1 rounded-xl border border-line px-4 text-[13.5px] outline-none placeholder:text-muted focus:border-brand-300"
                />
                <button className="h-11 rounded-xl border border-brand-200 px-5 text-[13.5px] font-bold text-brand-700 hover:bg-brand-50">
                  Verify
                </button>
              </div>
            </Card>

            <div className="mt-5 border-t border-line pt-4">
              <p className="flex items-center justify-between text-[14px] font-bold">
                Price Details <ChevronDown size={16} className="text-muted" />
              </p>
              <div className="mt-3 space-y-2.5 text-[13.5px]">
                <div className="flex justify-between">
                  <span className="text-muted">Premium Monthly</span>
                  <span className="font-semibold">₹499</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Platform Fee</span>
                  <span className="font-semibold">₹0</span>
                </div>
              </div>
              <div className="mt-3 flex justify-between border-t border-line pt-3 text-[16px] font-extrabold">
                <span>Total</span>
                <span>₹499</span>
              </div>
            </div>

            <button className="mt-5 flex h-[58px] w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 text-[16px] font-bold text-white hover:opacity-95">
              <Lock size={17} /> Pay ₹499 Securely
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
