"use client";

import { useEffect, useState } from "react";
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Landmark, CreditCard, ShieldCheck } from "lucide-react";
import { Card, SectionHead } from "@/ui/Bits.jsx";
import { inr } from "@/data.js";

export default function Wallet() {
  const [balance, setBalance] = useState(120);
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [selectedUpiApp, setSelectedUpiApp] = useState("paytm");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWalletState = () => {
    // 1. Fetch user auth balance
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.walletBalance !== undefined) {
          setBalance(data.walletBalance);
        }
      })
      .catch((err) => console.error("Error loading user profile:", err));

    // 2. Fetch transaction logs
    fetch("/api/wallet/deposit")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTransactions(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading transactions:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWalletState();
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    const depAmt = parseFloat(amount);
    if (isNaN(depAmt) || depAmt <= 0) return;

    try {
      const response = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: depAmt,
          method: selectedMethod === "upi" ? `UPI (${selectedUpiApp.toUpperCase()})` : "Card",
          reference: `TXN${Math.floor(100000 + Math.random() * 900000)}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process payment deposit");
      }

      const result = await response.json();

      // Clear input fields
      setAmount("");
      setUpiId("");

      // Trigger state updates
      fetchWalletState();
      
      // Update global layout layout coins immediately
      window.dispatchEvent(new Event("user-update"));
      window.dispatchEvent(new Event("notifications-update"));

      alert(`Successfully deposited ₹${depAmt.toLocaleString("en-IN")} into your wallet! Received 50 XP!`);
    } catch (error) {
      console.error("Deposit Error:", error);
      alert("Something went wrong while executing deposit. Please try again.");
    }
  };

  const totalSpent = transactions
    .filter((t) => t.type === "SUBSCRIPTION" || t.type === "TIP" || t.type === "UNLOCK")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex flex-col xl:flex-row gap-6 px-6 py-6 min-h-[calc(100vh-72px)] bg-canvas">
      <div className="flex-1 min-w-0">
        <div>
          <h1 className="text-[25px] font-extrabold tracking-tight flex items-center gap-2">
            <WalletIcon className="text-brand-600" size={24} /> My Wallet
          </h1>
          <p className="text-[14px] text-muted">Deposit coins and view your full transaction history</p>
        </div>

        {/* balance cards overview */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Card className="p-6 bg-gradient-to-br from-brand-600 via-[#8b5cf6] to-[#e05fd6] text-white flex flex-col justify-between h-[160px]">
            <div>
              <p className="text-[13px] font-bold text-white/80 uppercase tracking-wider">Total Wallet Balance</p>
              <h2 className="mt-2 text-[36px] font-black tracking-tight">{inr(balance)}</h2>
            </div>
            <div className="flex items-center gap-2 text-[12.5px] text-white/90">
              <ShieldCheck size={16} className="text-emerald-300" /> Secure wallet connection active
            </div>
          </Card>

          <Card className="p-6 flex items-center justify-around text-center h-[160px]">
            <div>
              <p className="text-[12.5px] font-bold text-muted uppercase">Money Spent</p>
              <h3 className="mt-2 text-[26px] font-black text-ink">{inr(totalSpent)}</h3>
            </div>
            <div className="h-10 w-px bg-line" />
            <div>
              <p className="text-[12.5px] font-bold text-muted uppercase">Transactions</p>
              <h3 className="mt-2 text-[26px] font-black text-ink">{transactions.length}</h3>
            </div>
          </Card>
        </div>

        {/* transactions history */}
        <section className="mt-8">
          <SectionHead title="Transaction Ledger" />
          <Card className="mt-4 overflow-hidden border border-line bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13.5px]">
                <thead>
                  <tr className="bg-canvas border-b border-line text-muted font-bold text-[12px] uppercase">
                    <th className="py-3.5 px-4">Transaction</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-muted font-semibold">
                        Retrieving logs...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-muted font-semibold">
                        No transactions registered yet. Deposit money to get started!
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => {
                      const isDeposit = tx.type === "DEPOSIT" || tx.type === "REFUND";
                      const description = tx.type === "DEPOSIT"
                        ? `Loaded funds via ${tx.method}`
                        : tx.type === "SUBSCRIPTION"
                        ? `Subscribed to Creator`
                        : `${tx.type} payment`;

                      return (
                        <tr key={tx.id} className="hover:bg-canvas/35 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <span className={`grid h-8 w-8 place-items-center rounded-lg ${
                                isDeposit ? "bg-emerald-50 text-emerald-600" : "bg-neutral-50 text-muted"
                              }`}>
                                {isDeposit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                              </span>
                              <span className="font-semibold text-ink">{description}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-muted font-medium">
                            {new Date(tx.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              tx.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className={`py-3.5 px-4 text-right font-black ${
                            isDeposit ? "text-emerald-600" : "text-ink"
                          }`}>
                            {isDeposit ? "+" : "-"}{inr(tx.amount)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>

      {/* right deposit builder panel */}
      <aside className="w-full xl:w-[350px] shrink-0">
        <Card className="p-5">
          <h2 className="text-[17px] font-black text-ink flex items-center gap-2 mb-4">
            <Plus size={18} className="text-brand-600" /> Add Money to Wallet
          </h2>

          <form onSubmit={handleDeposit} className="space-y-4">
            {/* presets */}
            <div>
              <label className="block text-[12.5px] font-bold text-muted mb-2">Select Amount</label>
              <div className="grid grid-cols-4 gap-2">
                {[100, 500, 1000, 2000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className={`h-9 rounded-xl border text-[13px] font-bold transition cursor-pointer ${
                      amount === preset.toString() ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-white border-line text-ink hover:bg-canvas"
                    }`}
                  >
                    +₹{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* custom amount */}
            <div>
              <label className="block text-[12.5px] font-bold text-muted mb-1.5">Or Enter Amount (₹)</label>
              <input
                type="number"
                min="10"
                required
                placeholder="Enter custom amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-11 px-3.5 text-[13.5px] border border-line rounded-xl bg-canvas focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            {/* payment mode tabs */}
            <div>
              <label className="block text-[12.5px] font-bold text-muted mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "upi", label: "UPI", icon: Landmark },
                  { id: "card", label: "Card", icon: CreditCard },
                  { id: "net", label: "NetBanking", icon: Landmark },
                ].map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setSelectedMethod(mode.id)}
                      className={`flex flex-col items-center justify-center py-2 rounded-xl border text-[11.5px] font-bold transition cursor-pointer ${
                        selectedMethod === mode.id ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-white border-line text-ink hover:bg-canvas"
                      }`}
                    >
                      <Icon size={16} className="mb-1" />
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* UPI App selector if UPI selected */}
            {selectedMethod === "upi" && (
              <div className="space-y-3.5 border-t border-line pt-3.5">
                <div>
                  <label className="block text-[12.5px] font-bold text-muted mb-2">UPI App</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["paytm", "gpay", "phonepe", "bhim"].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setSelectedUpiApp(app)}
                        className={`h-8 rounded-lg border text-[11px] font-bold capitalize transition cursor-pointer ${
                          selectedUpiApp === app ? "bg-brand-600 border-brand-600 text-white" : "bg-white border-line text-ink hover:bg-canvas"
                        }`}
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[12.5px] font-bold text-muted mb-1.5">UPI ID (VPA)</label>
                  <input
                    type="text"
                    required
                    placeholder="username@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full h-11 px-3.5 text-[13.5px] border border-line rounded-xl bg-canvas focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {/* Card selector if Card selected */}
            {selectedMethod === "card" && (
              <div className="space-y-3 border-t border-line pt-3.5">
                <div>
                  <label className="block text-[12.5px] font-bold text-muted mb-1.5">Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="4353 XXXX XXXX XXXX"
                    className="w-full h-11 px-3.5 text-[13.5px] border border-line rounded-xl bg-canvas focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12.5px] font-bold text-muted mb-1.5">Expiry</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      className="w-full h-11 px-3.5 text-[13.5px] border border-line rounded-xl bg-canvas focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-bold text-muted mb-1.5">CVV</label>
                    <input
                      type="password"
                      maxLength="3"
                      required
                      placeholder="123"
                      className="w-full h-11 px-3.5 text-[13.5px] border border-line rounded-xl bg-canvas focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-700 text-[14px] font-bold text-white shadow-lg pt-0.5 cursor-pointer"
            >
              Pay Securely
            </button>
          </form>
        </Card>
      </aside>
    </div>
  );
}
