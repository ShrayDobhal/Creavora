"use client";

import { useEffect, useState } from "react";
import { Settings, Shield, Bell, Check, Loader2 } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";

export default function StudioSettingsPage() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("Fashion");
  const [price, setPrice] = useState(499);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setName(data.name);
          setBio(data.bio || "");
          setPrice(data.creatorProfile?.monthlyRevenue ? Math.round(data.creatorProfile.monthlyRevenue / 10) : 499);
          setCategory(data.creatorProfile?.category || "Fashion");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading settings:", err);
        setLoading(false);
      });
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    // Dynamic creator update payload stub
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  return (
    <div className="px-6 py-6 space-y-6 max-w-[640px]">
      <div>
        <h1 className="text-[25px] font-extrabold tracking-tight">Creator Profile Settings ⚙️</h1>
        <p className="text-[14px] text-muted">Configure your creator details, default monthly tiers pricing, and metadata.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <Card className="p-5 space-y-4">
          <h3 className="text-[15px] font-bold border-b border-line pb-3">Creator Information</h3>
          
          <div>
            <label className="block text-[12.5px] font-semibold text-ink mb-1.5">Profile Display Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full border border-line rounded-xl px-4 text-[13.5px] outline-none focus:border-brand-400"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold text-ink mb-1.5">Category Designation</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-11 w-full border border-line rounded-xl px-4 text-[13.5px] outline-none focus:border-brand-400 bg-white"
            >
              <option value="Fashion">Fashion &amp; Style</option>
              <option value="Gaming">Gaming &amp; Esports</option>
              <option value="Art">Digital Art &amp; Design</option>
              <option value="Travel">Travel &amp; Vlog</option>
              <option value="Fitness">Fitness &amp; Coach</option>
            </select>
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold text-ink mb-1.5">Public Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full border border-line rounded-xl p-4 text-[13.5px] outline-none focus:border-brand-400 resize-none"
            />
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <h3 className="text-[15px] font-bold border-b border-line pb-3">Memberships &amp; Tier Pricing</h3>

          <div>
            <label className="block text-[12.5px] font-semibold text-ink mb-1.5">Monthly Subscription Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseInt(e.target.value))}
              className="h-11 w-full border border-line rounded-xl px-4 text-[13.5px] outline-none focus:border-brand-400"
            />
            <p className="text-[11px] text-muted mt-1.5">Configuring this updates your premium content lock default price threshold.</p>
          </div>
        </Card>

        <div className="flex items-center gap-4 justify-between">
          {success && (
            <span className="text-[12.5px] font-semibold text-emerald-600 flex items-center gap-1">
              <Check size={16} /> Changes saved successfully
            </span>
          )}
          {!success && <div />}
          <button
            type="submit"
            disabled={saving}
            className="flex h-11 items-center gap-1.5 rounded-xl bg-brand-600 px-6 text-[13.5px] font-bold text-white hover:bg-brand-700 transition disabled:opacity-60 cursor-pointer ml-auto"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
