"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) setError(data.error || "Password recovery is unavailable");
      else setMessage(data.message);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-line bg-white p-7 shadow-sm sm:p-10">
        <Link href="/landing" className="mb-8 flex items-center gap-2 font-extrabold"><Sparkles className="text-brand-600" />Blindly</Link>
        <h1 className="text-3xl font-extrabold tracking-tight">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Enter the email connected to your account. If recovery is configured, we will send a secure link.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block text-sm font-semibold" htmlFor="recovery-email">Email</label>
          <input id="recovery-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 w-full rounded-xl border border-line px-4 outline-none focus:border-brand-500" />
          {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <button disabled={loading} className="flex h-12 w-full items-center justify-center rounded-xl bg-brand-600 font-bold text-white disabled:opacity-60">{loading ? <Loader2 className="animate-spin" /> : "Send reset link"}</button>
        </form>
        <Link href="/login" className="mt-6 block text-center text-sm font-bold text-brand-600">Back to login</Link>
      </section>
    </main>
  );
}
