import React from 'react';
import { 
  Home, 
  Rss, 
  Compass, 
  Radio, 
  Bookmark, 
  MessageSquare, 
  Bell, 
  Heart, 
  Settings, 
  Crown, 
  Plus, 
  LayoutDashboard, 
  FileText, 
  DollarSign, 
  Users, 
  PieChart, 
  Megaphone,
  LayoutGrid
} from 'lucide-react';
import { ScreenId } from './Navbar';

interface SidebarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  isCreatorMode?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  screen?: ScreenId;
  badge?: string;
  count?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentScreen, 
  onSelectScreen,
  isCreatorMode = false 
}) => {
  const fanNavItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'feed', label: 'Feed', icon: Rss },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'live', label: 'Live Now', icon: Radio, badge: 'LIVE' },
    { id: 'subscriptions', label: 'Subscriptions', icon: Bookmark },
    { id: 'messages', label: 'Messages', icon: MessageSquare, count: 2 },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: 3 },
    { id: 'saved', label: 'Saved Posts', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const creatorNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'content', label: 'Content', icon: FileText, screen: 'dashboard' },
    { id: 'live', label: 'Live & Events', icon: Radio },
    { id: 'messages', label: 'Messages', icon: MessageSquare, count: 23 },
    { id: 'subscribers', label: 'Subscribers', icon: Users, screen: 'influencer' },
    { id: 'earnings', label: 'Earnings', icon: DollarSign, screen: 'earnings' },
    { id: 'analytics', label: 'Analytics', icon: PieChart, screen: 'earnings' },
    { id: 'promotions', label: 'Promotions', icon: Megaphone, screen: 'dashboard' },
    { id: 'community', label: 'Community', icon: Users, screen: 'community' },
    { id: 'settings', label: 'Settings', icon: Settings, screen: 'profile' },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200/80 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto p-4 flex flex-col justify-between hidden md:flex scrollbar-none z-30">
      <div className="space-y-6">
        {/* Creator Account Switcher Header if viewing dashboard / creator views */}
        {isCreatorMode && (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-purple-50/50 border border-purple-100">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
              alt="Ananya Sharma" 
              className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
            />
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-900 truncate">Ananya Sharma</span>
                <span className="text-[10px] text-purple-600">✓</span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 truncate">@ananyasharma</span>
              <span className="text-[9px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full w-max mt-0.5">
                Creator Account
              </span>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="space-y-1">
          {(isCreatorMode ? creatorNavItems : fanNavItems).map((item) => {
            const Icon = item.icon;
            const targetScreen = (item as any).screen || item.id;
            const isActive = currentScreen === targetScreen;

            return (
              <button
                key={item.id}
                onClick={() => onSelectScreen(targetScreen as ScreenId)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="badge-live">
                    <span className="badge-live-pulse"></span>
                    {item.badge}
                  </span>
                )}

                {item.count !== undefined && item.count > 0 && (
                  <span className="bg-purple-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-4 text-center">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo & Wallet Widgets */}
      <div className="space-y-4 pt-4 border-t border-slate-100 shrink-0">
        {/* Go Premium Widget */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-md">
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-purple-500/20 rounded-full blur-xl"></div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-purple-500/30 flex items-center justify-center">
              <Crown className="w-3.5 h-3.5 text-purple-300" />
            </div>
            <span className="text-xs font-bold text-purple-200">Go Premium</span>
          </div>
          <p className="text-[10px] text-slate-300 mb-3 leading-snug">
            Unlock exclusive content, early access, and private communities.
          </p>
          <button 
            onClick={() => onSelectScreen('payment')}
            className="w-full py-1.5 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Upgrade Now →
          </button>
        </div>

        {/* Wallet Balance Widget */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block">Wallet Balance</span>
              <span className="text-sm font-extrabold text-slate-900">₹1,250.00</span>
            </div>
            <button 
              onClick={() => onSelectScreen('payment')}
              className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 font-semibold">
            <span>Following: <strong className="text-slate-800">128</strong></span>
            <span>Followers: <strong className="text-slate-800">2.4K</strong></span>
          </div>
        </div>

        {/* Demo Screen Switcher */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <LayoutGrid className="w-3 h-3 text-slate-400" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Demo Nav</span>
          </div>
          <select
            value={currentScreen}
            onChange={(e) => onSelectScreen(e.target.value as ScreenId)}
            className="w-full bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-600 rounded-lg px-2 py-1.5 focus:outline-none focus:border-purple-400 cursor-pointer"
          >
            <option value="home">Home</option>
            <option value="feed">Feed</option>
            <option value="explore">Explore</option>
            <option value="dashboard">Creator Dashboard</option>
            <option value="community">Community</option>
            <option value="earnings">Earnings</option>
            <option value="influencer">Influencer Profile</option>
            <option value="messages">Messages</option>
            <option value="onboarding">Onboarding</option>
            <option value="payment">Payment</option>
            <option value="profile">Profile</option>
          </select>
        </div>
      </div>
    </aside>
  );
};
