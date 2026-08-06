"use client";

import { useEffect, useState } from "react";
import { Check, IndianRupee, Loader2 } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";
import { ProfileEditor } from "@/components/consumer/ProfileEditor";
import { CATEGORY_OPTIONS } from "@/lib/consumer/constants";
import { getProfile } from "@/services/consumer-api";

const parseResponse = async (response) => {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Request failed");
  return body;
};

export default function StudioSettingsPage() {
  const [profile, setProfile] = useState(null);
  const [category, setCategory] = useState("Lifestyle");
  const [price, setPrice] = useState("0");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch("/api/studio/settings", { signal: controller.signal }).then(parseResponse),
      getProfile({ signal: controller.signal }),
    ])
      .then(([settings, currentProfile]) => {
        setProfile(currentProfile);
        setCategory(settings.category || "Lifestyle");
        setPrice(String(settings.subscriptionPrice ?? 0));
      })
      .catch((loadError) => {
        if (loadError.name !== "AbortError") setError(loadError.message || "Unable to load creator settings");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const handleSubscriptionSave = async (event) => {
    event.preventDefault();
    if (!profile || saving) return;
    setSaving(true);
    setSuccess(false);
    setError("");
    try {
      const saved = await fetch("/api/studio/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          bio: profile.bio || "",
          category,
          subscriptionPrice: Number(price),
        }),
      }).then(parseResponse);
      setCategory(saved.category);
      setPrice(String(saved.subscriptionPrice));
      setSuccess(true);
    } catch (saveError) {
      setError(saveError.message || "Unable to save subscription settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[400px] items-center justify-center" role="status"><Loader2 className="animate-spin text-brand-600" size={32} /><span className="sr-only">Loading creator settings</span></div>;
  }

  if (!profile) {
    return <main className="max-w-[920px] px-3 py-6 sm:px-6"><div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-700">{error || "Creator profile is unavailable"}</div></main>;
  }

  return (
    <main className="min-w-0 max-w-[920px] space-y-6 px-3 py-6 sm:px-6">
      <header>
        <h1 className="text-[25px] font-extrabold tracking-tight">Creator settings</h1>
        <p className="text-[14px] text-muted">Manage your public profile, images and monthly subscription charge</p>
      </header>

      <Card className="min-w-0 p-4 sm:p-6">
        <div className="mb-5 border-b border-line pb-4">
          <h2 className="text-[17px] font-extrabold">Profile and images</h2>
          <p className="mt-1 text-sm text-muted">Upload your avatar and cover using the same secure image flow available to users</p>
        </div>
        <ProfileEditor
          profile={profile}
          onSaved={(savedProfile) => {
            setProfile(savedProfile);
            setError("");
          }}
        />
      </Card>

      <form onSubmit={handleSubscriptionSave} aria-label="Creator subscription settings">
        <Card className="space-y-4 p-4 sm:p-6">
          <div className="border-b border-line pb-3">
            <h2 className="text-[17px] font-extrabold">Monthly subscription</h2>
            <p className="mt-1 text-xs leading-5 text-muted">Choose your creator category and the monthly price shown to fans</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="creator-category" className="mb-1.5 block text-[12.5px] font-semibold text-ink">Category</label>
              <select id="creator-category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 w-full rounded-xl border border-line bg-white px-4 text-[13.5px] outline-none focus:border-brand-400">
                {CATEGORY_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="subscription-price" className="mb-1.5 block text-[12.5px] font-semibold text-ink">Monthly price in INR</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} aria-hidden="true" />
                <input id="subscription-price" type="number" inputMode="numeric" required min="0" max="100000" step="1" value={price} onChange={(event) => setPrice(event.target.value)} className="h-11 w-full rounded-xl border border-line pl-10 pr-4 text-[13.5px] font-bold outline-none focus:border-brand-400" />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted">Use ₹0 for free community access or set any whole-rupee amount up to ₹1,00,000 per month</p>
          {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700" role="alert">{error}</p> : null}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
            {success ? <span className="flex items-center gap-1 text-[12.5px] font-semibold text-emerald-700" role="status"><Check size={16} /> Subscription settings saved</span> : <span />}
            <button type="submit" disabled={saving} className="ml-auto flex min-h-11 items-center gap-1.5 rounded-xl bg-brand-600 px-6 text-[13.5px] font-bold text-white transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60">
              {saving ? <><Loader2 size={16} className="animate-spin" /> Saving</> : "Save subscription"}
            </button>
          </div>
        </Card>
      </form>
    </main>
  );
}
