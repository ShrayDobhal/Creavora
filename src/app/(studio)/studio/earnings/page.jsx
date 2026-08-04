"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  Crown,
  FileText,
  Filter,
  HelpCircle,
  Info,
  Layers,
  Lock,
  MessageSquare,
  Radio,
  Settings,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  Calendar,
  Wallet,
} from "lucide-react";
import { Card, SectionHead } from "@/ui/Bits.jsx";

const initialKpis = [
  { icon: Wallet, tint: "bg-brand-50 text-brand-600", label: "Total Earnings", value: "₹2,48,760.50", delta: "18.6%", up: true, note: "vs last month" },
  { icon: Calendar, tint: "bg-sky-50 text-sky-600", label: "This Month", value: "₹78,540.30", delta: "12.3%", up: true, note: "vs last month" },
  { icon: Calendar, tint: "bg-amber-50 text-amber-500", label: "Last Month", value: "₹70,420.10", delta: "6.1%", up: false, note: "vs previous month" },
  { icon: Layers, tint: "bg-violet-50 text-violet-600", label: "All Time Earnings", value: "₹5,62,310.80" },
];

const series = [
  2100, 3800, 2900, 2600, 4300, 3100, 3400, 4600, 6100, 6600, 6300, 6500, 5900,
  5400, 5000, 5600, 6200, 5300, 5100, 6000, 5900, 7100, 8400, 8900, 8100,
];

const initialTransactions = [
  { title: "Subscription – VIP", who: "From Rohan Mehta", when: "28 May 2024, 10:30 AM", amount: "₹499.00" },
  { title: "Tip", who: "From Neha Verma", when: "28 May 2024, 09:15 AM", amount: "₹1,000.00" },
  { title: "Paid Message", who: "From Arjun Singh", when: "28 May 2024, 08:45 AM", amount: "₹250.00" },
  { title: "Live Stream", who: "May 27, 2024", when: "27 May 2024, 11:30 PM", amount: "₹2,840.00" },
  { title: "Subscription – Monthly", who: "From Priya Patel", when: "27 May 2024, 10:10 PM", amount: "₹299.00" },
];

const breakdown = [
  { label: "Subscriptions", value: "₹42,650.00 (54.3%)", pct: 54.3, color: "#6b3fef" },
  { label: "Tips", value: "₹18,450.30 (23.5%)", pct: 23.5, color: "#e0459c" },
  { label: "Paid Messages", value: "₹9,820.00 (12.5%)", pct: 12.5, color: "#3b9dff" },
  { label: "Live Streams", value: "₹6,120.00 (7.7%)", pct: 7.7, color: "#f59e0b" },
  { label: "Others", value: "₹1,500.00 (1.9%)", pct: 1.9, color: "#10b981" },
];

const quickLinks = [
  { icon: Settings, title: "Payout Settings", sub: "Manage your payout methods" },
  { icon: TrendingUp, title: "Earnings Analytics", sub: "Detailed earnings insights" },
  { icon: FileText, title: "Tax Documents", sub: "Download tax reports" },
  { icon: HelpCircle, title: "Help & Support", sub: "Get help with payouts" },
];

function AreaChart() {
  const w = 660;
  const h = 175;
  const max = 10000;
  const pts = series.map((v, i) => [
    (i / (series.length - 1)) * w,
    h - (v / max) * h,
  ]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;

  return (
    <div className="mt-4 flex gap-3">
      <div className="flex w-9 shrink-0 flex-col justify-between py-0.5 text-right text-[10.5px] text-muted">
        {["₹10K", "₹8K", "₹6K", "₹4K", "₹2K", "₹0"].map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <svg viewBox={`0 0 ${w} ${h}`} className="h-[175px] w-full overflow-visible">
          <defs>
            <linearGradient id="earn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6b3fef" stopOpacity=".22" />
              <stop offset="100%" stopColor="#6b3fef" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={i}
              x1="0"
              x2={w}
              y1={(h / 5) * i}
              y2={(h / 5) * i}
              stroke="#f0f0f5"
              strokeWidth="1"
            />
          ))}
          <path d={area} fill="url(#earn)" />
          <path d={line} fill="none" stroke="#6b3fef" strokeWidth="2.2" strokeLinejoin="round" />
          <line
            x1={pts[23][0]}
            x2={pts[23][0]}
            y1="0"
            y2={h}
            stroke="#c4b5fd"
            strokeDasharray="4 4"
          />
          <circle cx={pts[23][0]} cy={pts[23][1]} r="4.5" fill="#6b3fef" stroke="#fff" strokeWidth="2" />
          <circle cx={pts[24][0]} cy={pts[24][1]} r="4.5" fill="#6b3fef" stroke="#fff" strokeWidth="2" />
        </svg>
        <div className="mt-2 flex justify-between text-[11px] text-muted">
          {["1 May", "5 May", "10 May", "15 May", "20 May", "25 May", "30 May"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Donut() {
  const r = 54;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 140 140" className="h-[140px] w-[140px] -rotate-90">
      {breakdown.map((b, index) => {
        const len = (b.pct / 100) * c;
        const offset = breakdown.slice(0, index).reduce((total, segment) => total + (segment.pct / 100) * c, 0);
        return <circle key={b.label} cx="70" cy="70" r={r} fill="none" stroke={b.color} strokeWidth="26" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
      })}
    </svg>
  );
}

export default function StudioEarnings() {
  const [kpis, setKpis] = useState(initialKpis);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [requesting, setRequesting] = useState(false);

  const fetchEarningsData = () => {
    fetch("/api/studio/earnings")
      .then((res) => res.json())
      .then((data) => {
        if (data.kpis) {
          // Merge dynamic styles (icon/tint) back into dynamic kpi list
          const merged = initialKpis.map((ik, i) => ({
            ...ik,
            value: data.kpis[i]?.value || ik.value,
          }));
          setKpis(merged);
        }
        if (data.recentTransactions && data.recentTransactions.length > 0) {
          setTransactions(data.recentTransactions);
        }
      })
      .catch((err) => console.error("Error loading studio earnings:", err));
  };

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const handleRequestPayout = async () => {
    setRequesting(true);
    try {
      const response = await fetch("/api/studio/earnings", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Payout request failed");
      }

      alert("Payout request submitted successfully! Received notification request.");
      fetchEarningsData();
    } catch (error) {
      console.error("Payout error:", error);
      alert("Failed to submit payout request. Please try again.");
    } finally {
      setRequesting(false);
    }
  };

  const getTxIcon = (title) => {
    if (title.includes("Tip")) return ThumbsUp;
    if (title.includes("Message")) return MessageSquare;
    if (title.includes("Live")) return Radio;
    return Crown;
  };

  const getTxTint = (title) => {
    if (title.includes("Tip")) return "bg-sky-50 text-sky-600";
    if (title.includes("Message")) return "bg-rose-50 text-rose-500";
    if (title.includes("Live")) return "bg-orange-50 text-orange-500";
    return "bg-brand-50 text-brand-600";
  };

  return (
    <div className="flex gap-5 px-6 py-6 min-h-[calc(100vh-76px)] bg-canvas/30">
      <div className="min-w-0 flex-1 space-y-5">
        <div className="grid gap-4 grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
          {kpis.map(({ icon: Icon, tint, label, value, delta, up, note }) => (
            <Card key={label} className="p-4 overflow-hidden bg-white">
              <div className="flex items-center gap-2.5">
                <span className={`grid h-9 w-9 place-items-center rounded-lg ${tint}`}>
                  <Icon size={17} />
                </span>
                <span className="text-[13px] font-semibold text-muted truncate">{label}</span>
              </div>
              <p className="mt-3 text-[19px] sm:text-[21px] font-black tracking-tighter truncate" title={value}>{value}</p>
              {delta && (
                <p className="mt-2 flex items-center gap-1.5 text-[12.5px] truncate">
                  <span
                    className={`flex items-center gap-0.5 font-bold shrink-0 ${
                      up ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {delta}
                  </span>
                  <span className="text-muted truncate">{note}</span>
                </p>
              )}
            </Card>
          ))}
        </div>

        <Card className="p-5 bg-white">
          <div className="flex items-start justify-between">
            <h2 className="text-[17px] font-extrabold">Earnings Overview</h2>
            <button className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold cursor-pointer">
              This Month <ChevronDown size={14} className="text-muted" />
            </button>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-[13px] text-muted">Total Earnings</p>
              <p className="mt-1 text-[25px] font-extrabold tracking-tight">₹78,540.30</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[12px] font-bold text-emerald-600">
                <ArrowUp size={12} /> 12.3%
              </span>
              <p className="mt-1 text-[12px] text-muted">vs last month</p>
            </div>
          </div>
          <div className="relative">
            <AreaChart />
            <div className="pointer-events-none absolute right-[16%] top-[42%] rounded-lg bg-white px-3 py-2 text-center shadow-[0_8px_22px_-8px_rgba(15,15,20,.45)]">
              <p className="text-[11px] text-muted">28 May 2024</p>
              <p className="text-[13px] font-extrabold">₹6,430.20</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-extrabold">Recent Transactions</h2>
            <div className="flex items-center gap-2.5">
              <button className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold cursor-pointer">
                All Transactions <ChevronDown size={14} className="text-muted" />
              </button>
            </div>
          </div>

          <div className="mt-2 divide-y divide-line">
            {transactions.map((t, i) => {
              const TxIcon = getTxIcon(t.title);
              const txTint = getTxTint(t.title);
              return (
                <div key={i} className="flex items-center gap-3.5 py-3.5">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${txTint}`}>
                    <TxIcon size={18} />
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate text-[14px] font-bold">{t.title}</p>
                    <p className="mt-1 truncate text-[12.5px] text-muted">{t.who}</p>
                  </div>
                  <p className="shrink-0 text-[12.5px] text-muted">{t.when}</p>
                  <div className="w-[110px] shrink-0 text-right">
                    <p className="text-[14px] font-extrabold">{t.amount}</p>
                    <span className="mt-1 inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                      Completed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <aside className="hidden w-[400px] shrink-0 space-y-4 xl:block">
        <Card className="p-5 bg-white">
          <h3 className="flex items-center gap-1.5 text-[15px] font-bold">
            Next Payout <Info size={14} className="text-muted" />
          </h3>
          <p className="mt-3 text-[27px] font-extrabold tracking-tight text-brand-600">
            ₹32,840.25
          </p>
          <p className="mt-1 text-[13px] text-muted">Will be paid on 05 Jun 2024</p>

          <div className="mt-4 space-y-2.5 border-t border-line pt-4 text-[13px]">
            {[
              ["Minimum Payout", "₹5,000"],
              ["Payment Method", "Bank Transfer"],
              ["Account", "HDFC Bank •••• 4567"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-muted">{k}</span>
                <span className="font-bold">{v}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleRequestPayout}
            disabled={requesting}
            className="mt-4 h-11 w-full rounded-xl bg-brand-600 text-[14px] font-bold text-white hover:bg-brand-700 cursor-pointer disabled:opacity-50"
          >
            {requesting ? "Submitting Request..." : "Request Early Payout"}
          </button>
          <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[12px] text-muted">
            <Lock size={12} /> Payouts are processed securely
          </p>
        </Card>

        <Card className="p-5 bg-white">
          <SectionHead
            title="Earnings Breakdown"
            right={
              <button className="flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[12.5px] font-semibold cursor-pointer">
                This Month <ChevronDown size={13} />
              </button>
            }
          />
          <div className="mt-4 flex items-center gap-5">
            <div className="relative shrink-0">
              <Donut />
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="text-[14px] font-extrabold">₹78,540.30</p>
                  <p className="text-[11px] text-muted">Total</p>
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-2.5">
              {breakdown.map((b) => (
                <div key={b.label} className="leading-tight">
                  <p className="flex items-center gap-2 text-[12.5px] text-muted">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: b.color }}
                    />
                    {b.label}
                  </p>
                  <p className="ml-4 text-[13px] font-bold">{b.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </aside>
    </div>
  );
}
