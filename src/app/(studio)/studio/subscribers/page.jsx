"use client";

import { useEffect, useState } from "react";
import { Users, Search, Mail, Ban, ChevronDown, CheckCircle2, ShieldAlert } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";
import { Avatar } from "@/ui/Media.jsx";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/subscriptions")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          // Map subscriptions to creator subscribers view
          setSubscribers(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading subscribers:", err);
        setLoading(false);
      });
  }, []);

  const filtered = subscribers.filter((sub) =>
    sub.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.user?.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[25px] font-extrabold tracking-tight">Subscribers 👥</h1>
          <p className="text-[14px] text-muted">Manage memberships, verify statuses, and monitor retention rates.</p>
        </div>
      </div>

      {/* Search Filter Strip */}
      <div className="flex items-center gap-3">
        <label className="relative flex-1 max-w-[360px] flex items-center">
          <Search size={16} className="absolute left-4 text-muted" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subscriber name or handle..."
            className="h-11 w-full rounded-xl border border-line bg-white pl-11 pr-4 text-[13.5px] outline-none focus:border-brand-400"
          />
        </label>
      </div>

      {/* Grid of Subscribers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((sub) => (
          <Card key={sub.id} className="p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={sub.user?.name || "Fan"} size={44} />
                <div>
                  <h4 className="text-[14.5px] font-bold">{sub.user?.name || "Premium Supporter"}</h4>
                  <p className="text-[12px] text-muted">@{sub.user?.handle || "fan"}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 size={12} /> Active
              </span>
            </div>

            <div className="border-t border-line pt-3.5 space-y-2 text-[12.5px]">
              <div className="flex justify-between">
                <span className="text-muted">Membership Tier</span>
                <span className="font-bold text-ink">{sub.tier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Price Paid</span>
                <span className="font-bold text-ink">₹{sub.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Renews On</span>
                <span className="font-semibold text-brand-600">{sub.renewsOn}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-line text-[12.5px] font-bold hover:bg-canvas">
                <Mail size={14} /> Message
              </button>
              <button className="flex items-center justify-center h-9 w-9 rounded-xl border border-line text-rose-600 hover:bg-rose-50">
                <Ban size={14} />
              </button>
            </div>
          </Card>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted">
            <Users size={36} className="mx-auto text-neutral-300 mb-2" />
            No subscribers found matching query.
          </div>
        )}
      </div>
    </div>
  );
}
