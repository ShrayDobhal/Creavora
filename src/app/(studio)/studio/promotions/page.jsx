"use client";

import { useState } from "react";
import { Megaphone, Plus, Percent, Calendar, CheckCircle2, MoreVertical, Loader2 } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";

const mockCampaigns = [
  { id: "1", title: "Summer discount promo", code: "SUMMER20", discount: "20% Off", status: "ACTIVE", usage: "12 / 100 uses" },
  { id: "2", title: "Standard launch promo", code: "LAUNCH10", discount: "10% Off", status: "ACTIVE", usage: "48 / Unlimited" }
];

export default function StudioPromotionsPage() {
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title || !code || !discount) return;

    const newCampaign = {
      id: String(campaigns.length + 1),
      title,
      code: code.toUpperCase(),
      discount: `${discount}% Off`,
      status: "ACTIVE",
      usage: "0 / Unlimited"
    };

    setCampaigns([newCampaign, ...campaigns]);
    setTitle("");
    setCode("");
    setDiscount("");
    setCreating(false);
  };

  return (
    <div className="px-6 py-6 space-y-6 max-w-[800px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[25px] font-extrabold tracking-tight">Promotions &amp; Campaigns 📢</h1>
          <p className="text-[14px] text-muted">Create subscription discount coupons, manage active promotions, and track usage.</p>
        </div>
        <button
          onClick={() => setCreating(!creating)}
          className="flex h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-[13px] font-bold text-white hover:bg-brand-700 transition"
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {creating && (
        <Card className="p-5">
          <h3 className="text-[15px] font-bold mb-4">New Promo Campaign</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-[12.5px] font-semibold text-ink mb-1.5">Campaign Name</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Eid Mubarak Special"
                  className="h-11 w-full border border-line rounded-xl px-4 text-[13.5px] outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-ink mb-1.5">Discount Percentage (%)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="e.g. 15"
                  className="h-11 w-full border border-line rounded-xl px-4 text-[13.5px] outline-none focus:border-brand-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-ink mb-1.5">Promo Coupon Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. EID15"
                className="h-11 w-full border border-line rounded-xl px-4 text-[13.5px] outline-none focus:border-brand-400 uppercase"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="h-10 rounded-xl px-4 text-[13px] font-bold border border-line hover:bg-canvas"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 rounded-xl px-4 text-[13px] font-bold bg-brand-600 hover:bg-brand-700 text-white"
              >
                Launch Campaign
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Active list */}
      <div className="space-y-3">
        <h3 className="text-[15px] font-bold">Active Coupons</h3>
        {campaigns.map((camp) => (
          <Card key={camp.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <Percent size={18} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-[14px] font-bold">{camp.title}</h4>
                  <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[10.5px] font-bold text-brand-700">
                    {camp.code}
                  </span>
                </div>
                <p className="text-[12px] text-muted mt-0.5">{camp.usage}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[14px] font-extrabold text-emerald-600">{camp.discount}</span>
              <button className="h-9 px-4 rounded-xl border border-line text-[12.5px] font-bold hover:bg-canvas">
                Pause
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
