"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Library, Search, SlidersHorizontal, AlertCircle, RefreshCw, XCircle, ShieldCheck } from "lucide-react";
import { Card, SectionHead } from "@/ui/Bits.jsx";
import { Avatar, Photo, Verified } from "@/ui/Media.jsx";
import { creators, slug, inr } from "@/data.js";

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [filter, setFilter] = useState("active");
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = () => {
    fetch("/api/subscriptions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSubs(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading subscriptions:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleCancelSub = async (creatorName) => {
    if (!window.confirm(`Are you sure you want to cancel your subscription to ${creatorName}?`)) {
      return;
    }

    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorName }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      alert(`Successfully cancelled your subscription to ${creatorName}.`);

      // Refetch page state and update layout balance/count
      fetchSubscriptions();
      window.dispatchEvent(new Event("user-update"));
      window.dispatchEvent(new Event("notifications-update"));
    } catch (error) {
      console.error("Cancellation Error:", error);
      alert("Failed to cancel subscription. Please try again.");
    }
  };

  const activeSubs = subs.filter((s) => s.status === "ACTIVE");
  const cancelledSubs = subs.filter((s) => s.status === "CANCELLED");
  const expiredSubs = subs.filter((s) => s.status === "EXPIRED");

  const displaySubs = filter === "active" ? [...activeSubs, ...cancelledSubs] : expiredSubs;

  return (
    <div className="flex flex-col xl:flex-row gap-6 px-6 py-6 min-h-[calc(100vh-72px)] bg-canvas">
      <div className="flex-1 min-w-0">
        <div>
          <h1 className="text-[25px] font-extrabold tracking-tight flex items-center gap-2">
            <Library className="text-brand-600" size={24} /> Subscriptions
          </h1>
          <p className="text-[14px] text-muted">Manage your premium creator subscriptions and settings</p>
        </div>

        {/* filter tabs */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-2 text-[13.5px] font-bold rounded-xl transition cursor-pointer ${
              filter === "active" ? "bg-brand-600 text-white" : "bg-white border border-line text-ink"
            }`}
          >
            Active &amp; Pending ({activeSubs.length + cancelledSubs.length})
          </button>
          <button
            onClick={() => setFilter("expired")}
            className={`px-4 py-2 text-[13.5px] font-bold rounded-xl transition cursor-pointer ${
              filter === "expired" ? "bg-brand-600 text-white" : "bg-white border border-line text-ink"
            }`}
          >
            Expired ({expiredSubs.length})
          </button>
        </div>

        {/* subscriptions list */}
        <div className="mt-5 space-y-4">
          {loading ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-line">
              <p className="text-[14.5px] font-bold text-ink">Retrieving subscriptions...</p>
            </div>
          ) : displaySubs.length > 0 ? (
            displaySubs.map((s) => (
              <Card key={s.id} className="p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <Photo seed={s.creator.name} className="h-16 w-16 shrink-0 rounded-xl" />
                  <div className="leading-tight">
                    <div className="flex items-center gap-1">
                      <Link href={`/creator/${slug(s.creator.name)}`} className="text-[15.5px] font-black hover:underline text-ink">
                        {s.creator.name}
                      </Link>
                      <Verified size={13} />
                    </div>
                    <p className="text-[12.5px] text-muted">{s.creator.role || "Creator"}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[11px] font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                        {s.tier}
                      </span>
                      {s.status === "CANCELLED" && (
                        <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          Cancelling
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 xl:gap-8 border-t border-b xl:border-t-0 xl:border-b-0 border-line py-4 xl:py-0 w-full xl:w-auto">
                  <div className="leading-tight">
                    <p className="text-[11.5px] text-muted font-medium">Price</p>
                    <p className="mt-0.5 text-[15px] font-black text-ink">{inr(s.price)}/mo</p>
                  </div>
                  <div className="leading-tight">
                    <p className="text-[11.5px] text-muted font-medium">{s.status === "CANCELLED" ? "Ends On" : "Renews On"}</p>
                    <p className="mt-0.5 text-[13.5px] font-bold text-ink">{s.renewsOn}</p>
                  </div>
                  <div className="leading-tight">
                    <p className="text-[11.5px] text-muted font-medium">Payment Mode</p>
                    <p className="mt-0.5 text-[13.5px] font-bold text-ink truncate">{s.method}</p>
                  </div>
                </div>

                <div className="flex gap-2.5 w-full xl:w-auto mt-1 xl:mt-0">
                  {s.status === "ACTIVE" && (
                    <button
                      onClick={() => handleCancelSub(s.creator.name)}
                      className="flex-1 xl:flex-none flex h-9 items-center justify-center gap-1.5 rounded-xl border border-rose-200 px-4 text-[12.5px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <XCircle size={14} /> Cancel
                    </button>
                  )}
                  <Link href={`/creator/${slug(s.creator.name)}`}
                    className="flex-1 xl:flex-none flex h-9 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 text-[12.5px] font-bold text-white hover:bg-brand-700"
                  >
                    View Exclusive
                  </Link>
                </div>
              </Card>
            ))
          ) : (
            <div className="py-12 text-center bg-white rounded-2xl border border-line">
              <AlertCircle className="mx-auto text-muted mb-3" size={32} />
              <p className="text-[14.5px] font-bold text-ink">No subscriptions found</p>
              <p className="text-[13px] text-muted mt-1">Explore and subscribe to active creators to unlock premium content</p>
            </div>
          )}
        </div>

        {/* recommendations */}
        <section className="mt-8">
          <SectionHead title="Recommended Creators for You" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {creators
              .filter((c) => !subs.some((s) => s.creator.name === c.name && s.status === "ACTIVE"))
              .map((c) => (
                <Card key={c.name} className="overflow-hidden flex flex-col justify-between">
                  <Photo seed={c.name} className="h-[120px] relative">
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3">
                      <p className="text-[14px] font-bold text-white flex items-center gap-1">
                        {c.name} <Verified size={12} />
                      </p>
                      <p className="text-[11px] text-white/70">{c.role}</p>
                    </div>
                  </Photo>
                  <div className="p-4 flex items-center justify-between">
                    <div className="leading-tight">
                      <p className="text-[11.5px] text-muted">Subscription</p>
                      <p className="text-[14.5px] font-extrabold text-ink">{inr(c.price)}/mo</p>
                    </div>
                    <Link href={`/creator/${slug(c.name)}`}
                      className="flex h-9 items-center rounded-xl bg-brand-600 px-4 text-[12.5px] font-bold text-white hover:bg-brand-700"
                    >
                      Subscribe
                    </Link>
                  </div>
                </Card>
              ))}
          </div>
        </section>
      </div>

      {/* sidebar info */}
      <aside className="w-full xl:w-[320px] shrink-0 space-y-4">
        <Card className="p-5">
          <h2 className="text-[15.5px] font-extrabold flex items-center gap-2 mb-3">
            <ShieldCheck className="text-emerald-500" size={18} /> Safe &amp; Secure
          </h2>
          <p className="text-[13px] leading-relaxed text-muted">
            All payments are encrypted and secured. Subscriptions renew automatically, but you can cancel anytime with a single click.
          </p>
          <div className="mt-4 border-t border-line pt-4 space-y-2.5">
            <div className="flex items-center gap-2 text-[12.5px] text-ink font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Instant cancellations
            </div>
            <div className="flex items-center gap-2 text-[12.5px] text-ink font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Encrypted transaction details
            </div>
            <div className="flex items-center gap-2 text-[12.5px] text-ink font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Auto-refund on billing errors
            </div>
          </div>
        </Card>
      </aside>
    </div>
  );
}
