import React from 'react';
import { Settings, User, Bell, Lock, ShieldCheck, CreditCard } from 'lucide-react';
import { ScreenId } from '../components/layout/Navbar';

interface SettingsScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onSelectScreen }) => {
  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1000px] mx-auto">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
          <Settings className="w-4 h-4" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Settings</h1>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4 text-xs font-semibold text-slate-700">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 cursor-pointer">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-purple-600" />
            <span>Account & Profile Settings</span>
          </div>
          <span>→</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 cursor-pointer">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-purple-600" />
            <span>Notification Preferences</span>
          </div>
          <span>→</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 cursor-pointer">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-purple-600" />
            <span>Privacy & Security</span>
          </div>
          <span>→</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 cursor-pointer" onClick={() => onSelectScreen('payment')}>
          <div className="flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span>Billing & Subscriptions</span>
          </div>
          <span>→</span>
        </div>
      </div>
    </div>
  );
};
