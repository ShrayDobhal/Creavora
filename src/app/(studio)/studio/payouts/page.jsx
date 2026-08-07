"use client";

import Link from "next/link";
import { CheckCircle2, Landmark, Loader2, RefreshCw, Wallet } from "lucide-react";
import { useState } from "react";
import { Card } from "@/ui/Bits.jsx";
import { formatInr, formatStudioDate, useStudioPerformance } from "@/components/studio/useStudioPerformance";

export default function StudioPayoutsPage() {
  const { data, status, error, refresh } = useStudioPerformance();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  if (status === "loading") return <div className="grid min-h-[420px] place-items-center" role="status"><Loader2 className="animate-spin text-brand-600" /><span className="sr-only">Loading payouts</span></div>;
  if (status === "error") return <div className="m-6 rounded-2xl border border-rose-200 bg-white p-8 text-center"><p role="alert" className="text-sm font-semibold text-rose-700">{error}</p><button type="button" onClick={refresh} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-bold"><RefreshCw size={15} /> Try again</button></div>;

  const { payoutAccount, payouts } = data;
  const canRequest = payoutAccount.availableBalance > 0 && payoutAccount.method && payoutAccount.details && !payouts.some((item) => ["PENDING", "PROCESSING"].includes(item.status));
  async function requestPayout() {
    setSubmitting(true); setMessage(""); setActionError("");
    try { const response = await fetch("/api/studio/earnings", { method: "POST" }); const body = await response.json(); if (!response.ok) throw new Error(body.error || "Unable to request payout"); setMessage("Payout request recorded and sent for review"); await refresh(); }
    catch (requestError) { setActionError(requestError.message || "Unable to request payout"); }
    finally { setSubmitting(false); }
  }

  return <main className="max-w-5xl space-y-6 px-3 py-6 sm:px-6"><header><h1 className="text-[25px] font-extrabold tracking-tight">Payouts</h1><p className="mt-1 text-sm text-muted">Request available earnings and track every payout status</p></header><section className="grid gap-5 md:grid-cols-2"><Card className="p-6"><Wallet className="text-brand-600" /><p className="mt-5 text-xs font-bold text-muted">Available balance</p><p className="mt-1 text-3xl font-black">{formatInr(payoutAccount.availableBalance)}</p><button type="button" onClick={requestPayout} disabled={!canRequest || submitting} className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{submitting ? <Loader2 size={16} className="animate-spin" /> : null} Request payout</button>{!canRequest && payoutAccount.availableBalance <= 0 ? <p className="mt-3 text-xs text-muted">Completed creator earnings will become available here</p> : null}</Card><Card className="p-6"><Landmark className="text-brand-600" /><p className="mt-5 text-xs font-bold text-muted">Payout destination</p>{payoutAccount.method && payoutAccount.details ? <><p className="mt-1 text-lg font-black">{payoutAccount.method.replaceAll("_", " ")}</p><p className="mt-1 text-sm text-muted">{payoutAccount.details}</p></> : <p className="mt-2 text-sm text-muted">No payout destination configured</p>}<Link href="/studio/settings" className="mt-6 inline-flex min-h-10 items-center rounded-xl border border-line px-4 text-sm font-bold hover:bg-canvas">Manage payout destination</Link></Card></section>{message ? <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"><CheckCircle2 size={16} />{message}</p> : null}{actionError ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{actionError}</p> : null}<Card className="overflow-hidden"><div className="border-b border-line p-5"><h2 className="font-black">Payout history</h2><p className="mt-1 text-xs text-muted">Real withdrawal requests from this account</p></div>{payouts.length ? <div className="divide-y divide-line">{payouts.map((payout) => <div key={payout.id} className="grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-5"><div><p className="text-sm font-black">{payout.method.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-muted">{payout.accountDetails}</p></div><p className="text-xs text-muted">{formatStudioDate(payout.createdAt)}</p><div className="sm:text-right"><p className="font-black">{formatInr(payout.amount)}</p><p className="mt-1 text-[11px] font-bold uppercase text-muted">{payout.status}</p></div></div>)}</div> : <p className="p-8 text-center text-sm text-muted">No payout requests yet</p>}</Card></main>;
}
