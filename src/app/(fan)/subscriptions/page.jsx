"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Library, RefreshCw } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";
import { getSubscriptions } from "@/services/consumer-api";

const formatDate = (value) => {
  if (!value) return "Not provided";
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(parsed);
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getSubscriptions({ signal: controller.signal })
      .then((data) => setSubscriptions(Array.isArray(data?.items) ? data.items : []))
      .catch((loadError) => {
        if (loadError.name !== "AbortError") setError(loadError.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reloadKey]);

  const retry = () => {
    setLoading(true);
    setError("");
    setReloadKey((current) => current + 1);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-canvas px-6 py-6">
      <h1 className="flex items-center gap-2 text-[25px] font-extrabold tracking-tight">
        <Library className="text-brand-600" size={24} /> Subscriptions
      </h1>
      <p className="text-sm text-muted">Your current creator access, shown as recorded.</p>

      {error && (
        <div role="alert" className="mt-5 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <span>{error}</span>
          <button onClick={retry} className="inline-flex items-center gap-1 font-bold"><RefreshCw size={14} /> Try again</button>
        </div>
      )}

      {loading ? (
        <p className="mt-6 rounded-2xl border border-line bg-white p-12 text-center text-sm text-muted" role="status">Loading subscriptions…</p>
      ) : subscriptions.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-line bg-white p-12 text-center">
          <AlertCircle className="mx-auto text-muted" size={34} />
          <h2 className="mt-3 font-extrabold text-ink">No subscriptions found</h2>
          <p className="mt-1 text-sm text-muted">Active and past subscriptions will appear here when available.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/creator/${encodeURIComponent(subscription.creator.handle)}`} className="font-extrabold text-ink hover:underline">
                    {subscription.creator.name}
                  </Link>
                  {subscription.creator.roleTitle && <p className="mt-0.5 text-xs text-muted">{subscription.creator.roleTitle}</p>}
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{subscription.status}</span>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4 text-sm">
                <div>
                  <dt className="text-xs text-muted">Tier</dt>
                  <dd className="mt-1 font-bold text-ink">{subscription.tier}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Renewal or end date</dt>
                  <dd className="mt-1 font-bold text-ink">{formatDate(subscription.renewsOn)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-muted">Purchases and subscription changes are not available in this release.</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
