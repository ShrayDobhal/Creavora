import { useState } from "react";
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Landmark, CreditCard, ShieldCheck } from "lucide-react";
import { Card, SectionHead } from "../ui/Bits.jsx";
import { inr } from "../data.js";

const initialTransactions = [
  { id: 1, type: "out", desc: "Subscribed to Ananya Sharma", date: "28 May 2026, 10:30 AM", amount: 499, status: "Completed" },
  { id: 2, type: "in", desc: "Loaded funds via UPI (GPay)", date: "25 May 2026, 08:45 PM", amount: 1000, status: "Completed" },
  { id: 3, type: "out", desc: "Tipped Rohit Gamer", date: "24 May 2026, 09:15 PM", amount: 100, status: "Completed" },
  { id: 4, type: "out", desc: "Unlocked post from Meera Art", date: "20 May 2026, 06:12 PM", amount: 150, status: "Completed" },
  { id: 5, type: "in", desc: "Refund for failed payment", date: "15 May 2026, 11:20 AM", amount: 299, status: "Completed" },
];

export default function Wallet() {
  const [balance, setBalance] = useState(1250);
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [selectedUpiApp, setSelectedUpiApp] = useState("paytm");
  const [transactions, setTransactions] = useState(initialTransactions);

  const handleDeposit = (e) => {
    e.preventDefault();
    const depAmt = parseFloat(amount);
    if (isNaN(depAmt) || depAmt <= 0) return;

    setBalance(balance + depAmt);
    const newTx = {
      id: Date.now(),
      type: "in",
      desc: `Loaded funds via ${selectedMethod === "upi" ? `UPI (${selectedUpiApp})` : "Card"}`,
      date: new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      amount: depAmt,
      status: "Completed",
    };
    setTransactions([newTx, ...transactions]);
    setAmount("");
    setUpiId("");
    alert(`Successfully deposited ₹${depAmt.toLocaleString("en-IN")} into your wallet!`);
  };

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
              <h3 className="mt-2 text-[26px] font-black text-ink">₹749</h3>
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
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-canvas/35 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <span className={`grid h-8 w-8 place-items-center rounded-lg ${
                            tx.type === "in" ? "bg-emerald-50 text-emerald-600" : "bg-neutral-50 text-muted"
                          }`}>
                            {tx.type === "in" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                          </span>
                          <span className="font-semibold text-ink">{tx.desc}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted font-medium">{tx.date}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                          {tx.status}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-black ${
                        tx.type === "in" ? "text-emerald-600" : "text-ink"
                      }`}>
                        {tx.type === "in" ? "+" : "-"}{inr(tx.amount)}
                      </td>
                    </tr>
                  ))}
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
                    className={`h-9 rounded-xl border text-[13px] font-bold transition ${
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
                      className={`flex flex-col items-center justify-center py-2 rounded-xl border text-[11.5px] font-bold transition ${
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
                        className={`h-8 rounded-lg border text-[11px] font-bold capitalize transition ${
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
              className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-700 text-[14px] font-bold text-white shadow-lg pt-0.5"
            >
              Pay Securely
            </button>
          </form>
        </Card>
      </aside>
    </div>
  );
}
