import React from 'react';
import { Gift, Trophy, CheckCircle2, Play, Users, Sparkles } from 'lucide-react';
import { ScreenId } from '../components/layout/Navbar';

interface RewardsScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({ onSelectScreen }) => {
  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Gift className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Fan Rewards & XP</h1>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs text-purple-200 font-bold uppercase">Current Level</span>
            <h2 className="text-2xl font-black">Level 3 – Super Fan 👑</h2>
          </div>
          <span className="text-xl font-extrabold bg-white/20 px-4 py-1.5 rounded-full">650 / 1000 XP</span>
        </div>
        <div className="w-full h-3 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full bg-white rounded-full" style={{ width: '65%' }}></div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">Daily Fan Quests</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <span className="font-bold text-slate-900 block">Daily Login</span>
                <span className="text-[10px] text-slate-500 font-medium">Logged in today</span>
              </div>
            </div>
            <span className="font-black text-purple-700">+50 XP</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div className="flex items-center gap-3">
              <Play className="w-5 h-5 text-purple-600" />
              <div>
                <span className="font-bold text-slate-900 block">Watch 3 Live Streams</span>
                <span className="text-[10px] text-slate-500 font-medium">2 / 3 watched</span>
              </div>
            </div>
            <span className="font-black text-purple-700">+100 XP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
