import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Lock, 
  Filter, 
  ChevronDown, 
  Download, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpRight 
} from 'lucide-react';
import { MOCK_TRANSACTIONS } from '../data/mockData';
import { ScreenId } from '../components/layout/Navbar';

interface CreatorEarningScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const CreatorEarningScreen: React.FC<CreatorEarningScreenProps> = ({ onSelectScreen }) => {
  const [transactionFilter, setTransactionFilter] = useState('All Transactions');

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Earnings</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Track your earnings, transactions and payouts
          </p>
        </div>
        <button className="btn-primary py-2 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md">
          <span>Payout Settings</span>
        </button>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="card p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Earnings</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">₹2,48,760.50</h3>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 18.6% vs last month</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">This Month</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">₹78,540.30</h3>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 12.3% vs last month</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="card p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Last Month</span>
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">₹70,420.10</h3>
          <div className="flex items-center gap-1 text-[11px] font-bold text-rose-500">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>↓ 6.1% vs previous month</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="card p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">All Time Earnings</span>
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">₹5,62,310.80</h3>
          <span className="text-[11px] text-slate-400 font-semibold block">Cumulative lifetime revenue</span>
        </div>
      </div>

      {/* Main Grid: Left 8 Cols (Charts & Transactions), Right 4 Cols (Next Payout & Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Earnings Overview Chart */}
          <div className="card p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Earnings Overview</h3>
                <span className="text-2xl font-extrabold text-slate-900 block mt-1">₹78,540.30</span>
                <span className="text-xs text-emerald-600 font-bold">↑ 12.3% vs last month</span>
              </div>
              <button className="btn-secondary text-xs font-bold py-1 px-3 rounded-xl flex items-center gap-1">
                <span>This Month</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual SVG Wave Area Chart */}
            <div className="relative h-56 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="0" y1="110" x2="500" y2="110" stroke="#f1f5f9" strokeDasharray="3 3" />

                {/* Area & Wave Line */}
                <path 
                  d="M0,120 Q50,70 100,100 T200,60 T300,80 T400,30 L450,45 L500,40 L500,150 L0,150 Z" 
                  fill="url(#purpleGrad)" 
                />
                <path 
                  d="M0,120 Q50,70 100,100 T200,60 T300,80 T400,30 L450,45 L500,40" 
                  fill="none" 
                  stroke="#7c3aed" 
                  strokeWidth="3" 
                />

                {/* Tooltip Highlight Dot */}
                <circle cx="450" cy="45" r="5" fill="#7c3aed" stroke="#ffffff" strokeWidth="2" />
              </svg>

              {/* Tooltip Popup Badge */}
              <div className="absolute top-2 right-12 bg-slate-900 text-white p-2 rounded-xl text-center shadow-lg text-[10px]">
                <span className="text-slate-400 block font-medium">28 May 2024</span>
                <span className="font-extrabold text-xs text-purple-300">₹6,430.20</span>
              </div>
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 font-semibold pt-2 border-t border-slate-100">
              <span>1 May</span>
              <span>5 May</span>
              <span>10 May</span>
              <span>15 May</span>
              <span>20 May</span>
              <span>25 May</span>
              <span>30 May</span>
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="card p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
              <div className="flex items-center gap-2">
                <button className="btn-secondary text-xs font-semibold py-1 px-3 rounded-xl flex items-center gap-1">
                  <span>{transactionFilter}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Filter className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {MOCK_TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                      💳
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block leading-tight">{tx.type}</span>
                      <span className="text-[10px] text-slate-500">From {tx.from} • {tx.date}, {tx.time}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 block">{tx.amount}</span>
                    <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.2 rounded-md inline-block">
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <button className="text-xs font-bold text-purple-600 hover:underline">View All Transactions</button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Next Payout Card */}
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 space-y-4 bg-gradient-to-br from-purple-50/60 via-white to-indigo-50/40">
            <div>
              <span className="text-xs font-bold text-slate-500 block">Next Payout</span>
              <h3 className="text-2xl font-black text-purple-700 mt-1">₹32,840.25</h3>
              <span className="text-xs font-semibold text-slate-500">Will be paid on <strong className="text-slate-900">05 Jun 2024</strong></span>
            </div>

            <div className="space-y-2 text-xs font-medium text-slate-600 pt-2 border-t border-purple-100">
              <div className="flex justify-between">
                <span>Minimum Payout</span>
                <span className="font-bold text-slate-900">₹5,000</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span className="font-bold text-slate-900">Bank Transfer</span>
              </div>
              <div className="flex justify-between">
                <span>Account</span>
                <span className="font-bold text-slate-900">HDFC Bank •••• 4567</span>
              </div>
            </div>

            <button className="w-full btn-primary py-2.5 text-xs font-bold rounded-xl justify-center shadow-md">
              Request Early Payout
            </button>

            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Payouts are processed securely</span>
            </div>
          </div>

          {/* Earnings Breakdown Donut Chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Earnings Breakdown</h3>
              <span className="text-xs text-slate-400 font-semibold">This Month</span>
            </div>

            {/* Donut Graphic */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path stroke="#f1f5f9" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path stroke="#7c3aed" strokeWidth="4" strokeDasharray="54, 100" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path stroke="#ec4899" strokeWidth="4" strokeDasharray="23, 100" strokeDashoffset="-54" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path stroke="#3b82f6" strokeWidth="4" strokeDasharray="12, 100" strokeDashoffset="-77" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-black text-slate-900">₹78,540</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Total</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs font-semibold text-slate-700">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>Subscriptions</span>
                <strong className="text-slate-900">₹42,650.00 (54.3%)</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>Tips</span>
                <strong className="text-slate-900">₹18,450.30 (23.5%)</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>Paid Messages</span>
                <strong className="text-slate-900">₹9,820.00 (12.5%)</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>Live Streams</span>
                <strong className="text-slate-900">₹6,120.00 (7.7%)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
