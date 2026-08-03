import React from 'react';
import { 
  Bookmark, 
  Bell, 
  CheckCircle2, 
  Crown, 
  ChevronRight, 
  Lock, 
  Heart, 
  MessageCircle, 
  Share2 
} from 'lucide-react';
import { CREATORS, SAMPLE_IMAGES } from '../data/mockData';
import { ScreenId } from '../components/layout/Navbar';

interface SubscriptionsScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const SubscriptionsScreen: React.FC<SubscriptionsScreenProps> = ({ onSelectScreen }) => {
  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Your Subscriptions</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Manage your active creator subscriptions, renewal dates, and exclusive member perks.
          </p>
        </div>
        <button onClick={() => onSelectScreen('explore')} className="btn-primary py-2 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md">
          <span>Explore More Creators</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Active Subscribed Creators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CREATORS.slice(0, 4).map((creator) => (
          <div 
            key={creator.id} 
            className="bg-white rounded-3xl border border-purple-100 p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none"></div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={creator.avatar} alt={creator.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-400" />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-slate-900">{creator.name}</span>
                    <span className="text-purple-600 text-xs">✓</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{creator.category}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100/80 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Plan:</span>
                <span className="font-extrabold text-purple-700">VIP Premium (₹{creator.pricePerMonth}/mo)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Renews:</span>
                <span className="font-bold text-slate-800">28 May 2024</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button 
                onClick={() => onSelectScreen('influencer')} 
                className="btn-secondary py-1.5 px-3 text-xs font-bold rounded-xl"
              >
                View Exclusive Content
              </button>
              <button className="text-slate-400 hover:text-purple-600 p-1">
                <Bell className="w-4 h-4 text-purple-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Subscribers Feed */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Latest Subscriber-Only Posts</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Post 1 */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-3">
              <img src={SAMPLE_IMAGES.ananya} className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Ananya Sharma ✓</span>
                <span className="text-[10px] text-slate-400 font-medium">2 hours ago • VIP Exclusive</span>
              </div>
            </div>
            <p className="text-xs text-slate-800 font-medium">
              Sneak peek photoshoot for my VIP subscribers! Thank you for all the love and support 💕
            </p>
            <div className="h-56 rounded-2xl overflow-hidden">
              <img src={SAMPLE_IMAGES.post1} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Post 2 */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-3">
              <img src={SAMPLE_IMAGES.rohit} className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Rohit Gamer ✓</span>
                <span className="text-[10px] text-slate-400 font-medium">4 hours ago • Subscriber Video</span>
              </div>
            </div>
            <p className="text-xs text-slate-800 font-medium">
              Private custom strategy session video is ready for you guys! Enjoy the walkthrough 🎮
            </p>
            <div className="h-56 rounded-2xl overflow-hidden relative">
              <img src={SAMPLE_IMAGES.gamingSetup} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
