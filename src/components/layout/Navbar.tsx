import React from 'react';
import { 
  Sparkles, 
  Search, 
  Plus, 
  Gem, 
  Bell, 
  MessageSquare, 
  ChevronDown
} from 'lucide-react';

export type ScreenId = 
  | 'home'
  | 'feed'
  | 'explore'
  | 'subscriptions'
  | 'messages'
  | 'notifications'
  | 'live'
  | 'collections'
  | 'wallet'
  | 'rewards'
  | 'saved'
  | 'dashboard'
  | 'community'
  | 'earnings'
  | 'influencer'
  | 'onboarding'
  | 'payment'
  | 'profile'
  | 'settings';

interface NavbarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  onOpenCreateModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentScreen, 
  onSelectScreen,
  onOpenCreateModal 
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-6 lg:px-8 py-3 flex items-center justify-between gap-6 shadow-2xs">
      {/* Brand Logo */}
      <div 
        onClick={() => onSelectScreen('home')} 
        className="flex items-center gap-2.5 cursor-pointer group shrink-0"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
          <Sparkles className="w-4 h-4 fill-white" />
        </div>
        <span className="text-xl font-extrabold tracking-tight text-slate-900">
          Creavora
        </span>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-xl hidden md:flex items-center bg-slate-100/70 rounded-full px-4 py-2 border border-slate-200/60 focus-within:border-purple-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-100 transition-all">
        <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
        <input 
          type="text" 
          placeholder="Search creators, posts, topics..." 
          className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        <div className="hidden lg:flex items-center gap-0.5 bg-white border border-slate-200 text-[10px] font-bold text-slate-400 rounded-md px-1.5 py-0.5 shadow-2xs shrink-0">
          <span>⌘</span>
          <span>K</span>
        </div>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Create Button */}
        <button 
          onClick={onOpenCreateModal}
          className="btn-primary py-2 px-5 text-xs font-bold rounded-full shadow-purple-500/25 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create</span>
        </button>

        {/* Gem Balance */}
        <div className="hidden sm:flex items-center gap-1.5 bg-purple-50 text-purple-700 font-extrabold text-xs rounded-full px-3 py-1.5 border border-purple-100">
          <Gem className="w-4 h-4 text-purple-600 fill-purple-600/30" />
          <span>120</span>
        </div>

        {/* Notifications */}
        <div 
          onClick={() => onSelectScreen('home')}
          className="relative w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-slate-600 cursor-pointer transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white">
            3
          </span>
        </div>

        {/* Messages */}
        <div 
          onClick={() => onSelectScreen('messages')}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-slate-600 cursor-pointer transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
        </div>

        {/* User Pill Dropdown */}
        <div 
          onClick={() => onSelectScreen('profile')}
          className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
        >
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
              alt="User" 
              className="w-8 h-8 rounded-full object-cover border border-purple-200"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <div className="flex items-center gap-1">
              <span className="text-xs font-extrabold text-slate-800 leading-tight">Hey, Arjun</span>
            </div>
            <span className="text-[10px] font-semibold text-purple-600 leading-tight">Premium Fan</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
        </div>
      </div>
    </header>
  );
};
