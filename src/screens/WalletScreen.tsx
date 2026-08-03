import React from 'react';
import { Wallet, Plus, ArrowUpRight, ShieldCheck, CreditCard } from 'lucide-react';
import { MOCK_TRANSACTIONS } from '../data/mockData';
import { ScreenId } from '../components/layout/Navbar';

interface WalletScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({ onSelectScreen }) => {
  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">My Wallet</h1>
        </div>
        <button onClick={() => onSelectScreen('payment')} className="btn-primary py-2 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md">
          <Plus className="w-4 h-4" />
          <span>Add Money</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-xs text-purple-300 font-semibold">Available Balance</span>
            <Wallet className="w-5 h-5 text-purple-300" />
          </div>
          <h2 className="text-3xl font-black">₹1,250.00</h2>
          <div className="flex gap-2">
            <button onClick={() => onSelectScreen('payment')} className="btn-primary py-1.5 px-4 text-xs font-bold rounded-full">
              Top Up
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-2 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500">Total Spent</span>
          <h3 className="text-2xl font-black text-slate-900">₹4,890.00</h3>
          <span className="text-[10px] text-slate-400 font-semibold">Across 12 subscriptions & tips</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-2 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500">Creavora Gems</span>
          <h3 className="text-2xl font-black text-purple-600">120 💎</h3>
          <span className="text-[10px] text-slate-400 font-semibold">Earned from engagement & rewards</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Wallet History</h3>
        <div className="space-y-3">
          {MOCK_TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="font-bold text-slate-900 block">{tx.type}</span>
                <span className="text-[10px] text-slate-400">{tx.date} • {tx.from}</span>
              </div>
              <span className="font-extrabold text-slate-900">{tx.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
