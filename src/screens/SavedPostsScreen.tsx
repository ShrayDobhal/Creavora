import React from 'react';
import { Heart, Bookmark, MessageCircle } from 'lucide-react';
import { SAMPLE_IMAGES } from '../data/mockData';
import { ScreenId } from '../components/layout/Navbar';

interface SavedPostsScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const SavedPostsScreen: React.FC<SavedPostsScreenProps> = ({ onSelectScreen }) => {
  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
          <Heart className="w-4 h-4" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Saved Posts</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { title: 'Morning vibes ☀️', image: SAMPLE_IMAGES.post1, likes: '1.2K' },
          { title: 'NEW GAMEPLAY ALERT! 🚀', image: SAMPLE_IMAGES.gamingSetup, likes: '2.3K' },
          { title: 'Himachal diaries 🏔️', image: SAMPLE_IMAGES.travelBeach, likes: '950' },
        ].map((p, i) => (
          <div key={i} onClick={() => onSelectScreen('feed')} className="bg-white rounded-3xl border border-slate-100 p-3 shadow-sm hover:shadow-md cursor-pointer">
            <div className="h-52 rounded-2xl overflow-hidden relative">
              <img src={p.image} className="w-full h-full object-cover" />
            </div>
            <div className="p-2">
              <h3 className="text-xs font-bold text-slate-900">{p.title}</h3>
              <span className="text-[10px] text-slate-400 font-semibold">{p.likes} Likes</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
