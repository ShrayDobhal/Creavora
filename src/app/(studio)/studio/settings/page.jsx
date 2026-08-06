"use client";

import { useEffect, useState } from "react";
import { Check, IndianRupee, Loader2 } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";
import { CATEGORY_OPTIONS } from "@/lib/consumer/constants";

const parseResponse = async (response) => {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Request failed");
  return body;
};

export default function StudioSettingsPage() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("Lifestyle");
  const [price, setPrice] = useState("0");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/studio/settings", { signal: controller.signal })
      .then(parseResponse)
      .then((data) => {
        setName(data.name || "");
        setBio(data.bio || "");
        setCategory(data.category || "Lifestyle");
        setPrice(String(data.subscriptionPrice ?? 0));
      })
      .catch((loadError) => {
        if (loadError.name !== "AbortError") setError(loadError.message || "Unable to load creator settings");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError("");
    try {
      const saved = await fetch("/api/studio/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          category,
          subscriptionPrice: Number(price),
        }),
      }).then(parseResponse);
      setName(saved.name);
      setBio(saved.bio || "");
      setCategory(saved.category);
      setPrice(String(saved.subscriptionPrice));
      setSuccess(true);
      window.dispatchEvent(new Event("user-update"));
    } catch (saveError) {
      setError(saveError.message || "Unable to save creator settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[400px] items-center justify-center" role="status"><Loader2 className="animate-spin text-brand-600" size={32} /><span className="sr-only">Loading creator settings</span></div>;
  }

  return (
    <main className="min-w-0 max-w-[720px] space-y-6 px-3 py-6 sm:px-6">
      <div>
        <h1 className="text-[25px] font-extrabold tracking-tight">Creator settings</h1>
        <p className="text-[14px] text-muted">Manage your public profile and monthly subscription charge</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5" aria-label="Creator settings">
        <Card className="space-y-4 p-5">
          <h2 className="border-b border-line pb-3 text-[15px] font-bold">Creator information</h2>
          <div>
            <label htmlFor="creator-name" className="mb-1.5 block text-[12.5px] font-semibold text-ink">Display name</label>
            <input id="creator-name" required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="h-11 w-full rounded-xl border border-line px-4 text-[13.5px] outline-none focus:border-brand-400" />
          </div>
          <div>
            <label htmlFor="creator-category" className="mb-1.5 block text-[12.5px] font-semibold text-ink">Category</label>
            <select id="creator-category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 w-full rounded-xl border border-line bg-white px-4 text-[13.5px] outline-none focus:border-brand-400">
              {CATEGORY_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="creator-bio" className="mb-1.5 block text-[12.5px] font-semibold text-ink">Public bio</label>
            <textarea id="creator-bio" maxLength={500} value={bio} onChange={(event) => setBio(event.target.value)} rows={4} className="w-full resize-y rounded-xl border border-line p-4 text-[13.5px] outline-none focus:border-brand-400" />
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <div className="border-b border-line pb-3">
            <h2 className="text-[15px] font-bold">Monthly subscription</h2>
            <p className="mt-1 text-xs leading-5 text-muted">Set the monthly price shown to fans. Use ₹0 to keep community access free</p>
          </div>
          <div>
            <label htmlFor="subscription-price" className="mb-1.5 block text-[12.5px] font-semibold text-ink">Monthly price in INR</label>
            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} aria-hidden="true" />
              <input id="subscription-price" type="number" inputMode="numeric" required min="0" max="100000" step="1" value={price} onChange={(event) => setPrice(event.target.value)} className="h-11 w-full rounded-xl border border-line pl-10 pr-4 text-[13.5px] font-bold outline-none focus:border-brand-400" />
            </div>
            <p className="mt-2 text-xs text-muted">Allowed range ₹0 to ₹1,00,000 per month</p>
          </div>
        </Card>

        {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700" role="alert">{error}</p> : null}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {success ? <span className="flex items-center gap-1 text-[12.5px] font-semibold text-emerald-700" role="status"><Check size={16} /> Changes saved</span> : <span />}
          <button type="submit" disabled={saving} className="ml-auto flex min-h-11 items-center gap-1.5 rounded-xl bg-brand-600 px-6 text-[13.5px] font-bold text-white transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving</> : "Save changes"}
          </button>
        </div>
      </form>
    </main>
  );
}
