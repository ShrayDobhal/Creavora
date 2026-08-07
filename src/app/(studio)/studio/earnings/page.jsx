"use client";

import { ArrowDownRight, ArrowUpRight, IndianRupee, Loader2, ReceiptText, RefreshCw, Users } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";
import { formatInr, formatStudioDate, useStudioPerformance } from "@/components/studio/useStudioPerformance";

export default function StudioEarnings() {
  const { data, status, error, refresh } = useStudioPerformance();
  if (status === "loading") return <div className="grid min-h-[420px] place-items-center" role="status"><Loader2 className="animate-spin text-brand-600" /><span className="sr-only">Loading earnings</span></div>;
  if (status === "error") return <div className="m-6 rounded-2xl border border-rose-200 bg-white p-8 text-center"><p role="alert" className="text-sm font-semibold text-rose-700">{error}</p><button type="button" onClick={refresh} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-bold"><RefreshCw size={15} /> Try again</button></div>;

  const { earnings, recentTransactions, analytics, payoutAccount } = data;
  const maxSeries = Math.max(1, ...earnings.series.map((item) => item.amount));
  const changeUp = earnings.changePercent >= 0;
  return (
    <main className="space-y-6 px-3 py-6 sm:px-6">
      <header><h1 className="text-[25px] font-extrabold tracking-tight">Earnings</h1><p className="mt-1 text-sm text-muted">Revenue recorded from completed creator transactions</p></header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Earnings summary">
        {[
          ["All-time earnings", formatInr(earnings.total), IndianRupee],
          ["This month", formatInr(earnings.thisMonth), ReceiptText],
          ["Last month", formatInr(earnings.lastMonth), ReceiptText],
          ["Active subscribers", analytics.activeSubscribers.toLocaleString("en-IN"), Users],
        ].map(([label, value, Icon]) => <Card key={label} className="p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon size={18} /></span><p className="mt-4 text-xs font-bold text-muted">{label}</p><p className="mt-1 truncate text-2xl font-black" title={value}>{value}</p></Card>)}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-black">Last 30 days</h2><p className="mt-1 text-xs text-muted">Daily completed earnings</p></div><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${changeUp ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{changeUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{Math.abs(earnings.changePercent).toFixed(1)}% month over month</span></div>
          <div className="mt-7 flex h-56 items-end gap-1.5 rounded-2xl bg-canvas p-4" aria-label="Daily earnings chart">
            {earnings.series.map((item) => <div key={item.date} className="group relative flex h-full flex-1 items-end"><div className="w-full rounded-t bg-brand-500 transition-colors group-hover:bg-brand-700" style={{ height: `${Math.max(item.amount > 0 ? 5 : 1, (item.amount / maxSeries) * 100)}%` }} title={`${formatStudioDate(item.date)}: ${formatInr(item.amount)}`} /></div>)}
          </div>
        </Card>
        <Card className="p-5"><h2 className="font-black">This month by source</h2>{earnings.breakdown.length ? <div className="mt-5 space-y-4">{earnings.breakdown.map((item) => <div key={item.label}><div className="flex justify-between gap-3 text-sm"><span className="capitalize text-muted">{item.label}</span><span className="font-black">{formatInr(item.amount)}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-canvas"><div className="h-full rounded-full bg-brand-600" style={{ width: `${earnings.thisMonth ? Math.max(2, item.amount / earnings.thisMonth * 100) : 0}%` }} /></div></div>)}</div> : <p className="mt-5 rounded-xl border border-dashed border-line p-5 text-sm text-muted">No completed earnings this month</p>}<div className="mt-5 border-t border-line pt-4"><p className="text-xs font-bold text-muted">Available for payout</p><p className="mt-1 text-xl font-black">{formatInr(payoutAccount.availableBalance)}</p></div></Card>
      </section>

      <Card className="overflow-hidden"><div className="border-b border-line p-5"><h2 className="font-black">Recorded transactions</h2><p className="mt-1 text-xs text-muted">The latest database entries for this creator account</p></div>{recentTransactions.length ? <div className="divide-y divide-line">{recentTransactions.map((transaction) => <div key={transaction.id} className="grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-5"><div><p className="text-sm font-black">{transaction.method || transaction.type.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-muted">{transaction.reference || transaction.type}</p></div><p className="text-xs text-muted">{formatStudioDate(transaction.createdAt)}</p><div className="sm:text-right"><p className="text-sm font-black">{formatInr(transaction.amount)}</p><p className="mt-1 text-[11px] font-bold uppercase text-muted">{transaction.status}</p></div></div>)}</div> : <p className="p-8 text-center text-sm text-muted">No financial transactions have been recorded yet</p>}</Card>
    </main>
  );
}
