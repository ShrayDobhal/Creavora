"use client";

import { useEffect, useState } from "react";
import { Wallet, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";

export default function StudioPayoutsPage() {
  const [balance, setBalance] = useState(0.00);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const fetchPayoutDetails = () => {
    setLoading(true);
    fetch("/api/studio/earnings")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setTransactions(data.recentTransactions);
        }
      })
      .catch((err) => console.error("Error fetching payouts data:", err));

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setBalance(data.walletBalance);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading user profile balance details:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPayoutDetails();
  }, []);

  const handleWithdrawal = () => {
    if (balance <= 0) return;
    setSubmitting(true);
    setMessage("");

    fetch("/api/studio/earnings", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setMessage("Payout request submitted successfully. Funding is under review.");
          fetchPayoutDetails();
        } else {
          setMessage(resData.error || "Payout request failed.");
        }
        setSubmitting(false);
      })
      .catch((err) => {
        console.error("Payout trigger error:", err);
        setMessage("Connection error. Try again later.");
        setSubmitting(false);
      });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  return (
    <div className="px-6 py-6 space-y-6 max-w-[800px]">
      <div>
        <h1 className="text-[25px] font-extrabold tracking-tight">Payouts &amp; Withdrawals 💰</h1>
        <p className="text-[14px] text-muted">Manage available balance, configure payment destinations, and request withdrawals.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Wallet Balance Card */}
        <Card className="p-5 flex flex-col justify-between space-y-4">
          <div>
            <p className="text-[12.5px] font-semibold text-muted">Withdrawable Balance</p>
            <h3 className="text-[32px] font-black tracking-tight mt-1">₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h3>
          </div>
          <button
            onClick={handleWithdrawal}
            disabled={submitting || balance <= 0}
            className="w-full flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 text-[14px] font-bold text-white hover:bg-brand-700 transition disabled:opacity-60 cursor-pointer"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <DollarSign size={16} />}
            Withdraw Available Funds
          </button>
        </Card>

        {/* Banking destinations placeholder */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="text-[14px] font-bold">Payout Destination</h4>
            <p className="text-[12px] text-muted">Setup how you want to be paid.</p>
          </div>

          <div className="border border-line rounded-xl p-3 bg-canvas flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-ink">State Bank of India</p>
              <p className="text-[11.5px] text-muted">Ending in ****4012</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Verified
            </span>
          </div>

          <button className="text-[12.5px] font-bold text-brand-600 hover:underline text-left mt-3">
            Change payout destination
          </button>
        </Card>
      </div>

      {message && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-[13px] font-semibold text-brand-700 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-brand-600" />
          {message}
        </div>
      )}

      {/* Recent payouts history */}
      <div className="space-y-3">
        <h3 className="text-[15px] font-bold">Transaction History</h3>
        {transactions.map((tx, idx) => (
          <Card key={idx} className="p-4 flex items-center justify-between">
            <div>
              <h4 className="text-[13.5px] font-bold">{tx.title}</h4>
              <p className="text-[11.5px] text-muted mt-0.5">{tx.when}</p>
            </div>
            <span className="text-[14px] font-black text-emerald-600">
              +{tx.amount}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
