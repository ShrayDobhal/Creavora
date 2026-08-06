"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Mail, RefreshCw, Search, Users } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";
import { Avatar } from "@/ui/Media.jsx";
import { getStudioSubscribers } from "@/services/consumer-api";

const formatPrice = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(Number(value) || 0);

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getStudioSubscribers({ signal: controller.signal })
      .then((data) => setSubscribers(Array.isArray(data?.items) ? data.items : []))
      .catch((loadError) => {
        if (loadError.name !== "AbortError") setError(loadError.message || "Unable to load subscribers");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return subscribers;
    return subscribers.filter((subscription) => {
      const subscriber = subscription.user;
      return `${subscriber?.name || ""} ${subscriber?.handle || ""}`.toLowerCase().includes(query);
    });
  }, [searchQuery, subscribers]);

  const activeCount = subscribers.filter((subscription) => subscription.status === "ACTIVE").length;
  const retry = () => {
    setLoading(true);
    setError("");
    setReloadKey((value) => value + 1);
  };

  return (
    <main className="min-w-0 space-y-6 overflow-x-hidden px-3 py-6 sm:px-6">
      <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-[25px] font-extrabold tracking-tight"><Users className="text-brand-600" size={24} /> Subscribers</h1>
          <p className="mt-1 text-[14px] text-muted">Real memberships recorded for your creator account</p>
        </div>
        <div className="flex gap-3 text-sm">
          <span className="rounded-xl border border-line bg-white px-4 py-2"><strong>{activeCount}</strong> active</span>
          <span className="rounded-xl border border-line bg-white px-4 py-2"><strong>{subscribers.length}</strong> total</span>
        </div>
      </header>

      <label className="relative flex w-full max-w-[420px] items-center">
        <Search size={16} className="absolute left-4 text-muted" />
        <span className="sr-only">Search subscribers</span>
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search subscriber name or handle"
          className="h-11 w-full rounded-xl border border-line bg-white pl-11 pr-4 text-[13.5px] outline-none focus:border-brand-400"
        />
      </label>

      {loading ? (
        <div className="rounded-2xl border border-line bg-white p-12 text-center text-sm text-muted" role="status">Loading subscribers</div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700" role="alert">
          <p>{error}</p>
          <button type="button" onClick={retry} className="mt-3 inline-flex items-center gap-2 font-bold"><RefreshCw size={14} /> Try again</button>
        </div>
      ) : filtered.length ? (
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((subscription) => {
            const subscriber = subscription.user;
            const active = subscription.status === "ACTIVE";
            return (
              <Card key={subscription.id} className="min-w-0 space-y-4 p-4 sm:p-5">
                <div className="flex min-w-0 items-start gap-3">
                  <Avatar name={subscriber?.name || "Subscriber"} src={subscriber?.avatar} size={46} />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[14.5px] font-bold">{subscriber?.name || "Subscriber"}</h2>
                    <p className="truncate text-[12px] text-muted">@{subscriber?.handle || "member"}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-muted"}`}>
                    {active ? <CheckCircle2 size={12} /> : null}{subscription.status}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-3 border-t border-line pt-4 text-[12.5px]">
                  <div className="min-w-0"><dt className="text-muted">Membership</dt><dd className="mt-1 truncate font-bold">{subscription.tier}</dd></div>
                  <div><dt className="text-muted">Price paid</dt><dd className="mt-1 font-bold">{formatPrice(subscription.price)}</dd></div>
                  <div className="col-span-2"><dt className="text-muted">Renewal or end date</dt><dd className="mt-1 font-semibold text-brand-700">{subscription.renewsOn || "Not provided"}</dd></div>
                </dl>

                {subscriber?.id ? (
                  <Link href={`/studio/messages?userId=${encodeURIComponent(subscriber.id)}`} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-line text-[12.5px] font-bold hover:bg-canvas">
                    <Mail size={14} /> Message subscriber
                  </Link>
                ) : null}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center text-sm text-muted">
          <Users size={36} className="mx-auto mb-3 text-neutral-300" />
          {searchQuery ? "No subscribers match your search" : "Subscribers will appear here when a real membership is recorded"}
        </div>
      )}
    </main>
  );
}
