"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const fragmentToken = params.get("token") || "";
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname);
    queueMicrotask(() => setToken(fragmentToken));
  }, []);

  async function submit(event) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) setError(data.error || "Unable to reset password");
      else setMessage(data.message);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-line bg-white p-7 shadow-sm sm:p-10">
        <Link href="/landing" className="mb-8 flex items-center gap-2 font-extrabold"><Sparkles className="text-brand-600" />Blindly</Link>
        <h1 className="text-3xl font-extrabold tracking-tight">Choose a new password</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Use at least eight characters with uppercase, lowercase, and a number.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block text-sm font-semibold" htmlFor="new-password">New password</label>
          <input id="new-password" type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-xl border border-line px-4 outline-none focus:border-brand-500" />
          {!token && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Open the complete reset link from your email.</p>}
          {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message} <Link className="font-bold underline" href="/login">Sign in</Link></p>}
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <button disabled={loading || !token} className="flex h-12 w-full items-center justify-center rounded-xl bg-brand-600 font-bold text-white disabled:opacity-60">{loading ? <Loader2 className="animate-spin" /> : "Save new password"}</button>
        </form>
      </section>
    </main>
  );
}
