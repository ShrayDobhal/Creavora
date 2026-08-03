import React from 'react';
import { FolderHeart, Image, Video, Lock, Plus } from 'lucide-react';
import { SAMPLE_IMAGES } from '../data/mockData';
import { ScreenId } from '../components/layout/Navbar';

interface CollectionsScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const CollectionsScreen: React.FC<CollectionsScreenProps> = ({ onSelectScreen }) => {
  const collections = [
    { title: 'Fashion Inspo 👗', items: 24, cover: SAMPLE_IMAGES.post1 },
    { title: 'Gaming Setups 🎮', items: 12, cover: SAMPLE_IMAGES.gamingSetup },
    { title: 'Travel Destinations 🏔️', items: 18, cover: SAMPLE_IMAGES.travelBeach },
    { title: 'Digital Artwork 🎨', items: 15, cover: SAMPLE_IMAGES.post3 },
  ];

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <FolderHeart className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Saved Collections</h1>
        </div>
        <button className="btn-primary py-2 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md">
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {collections.map((col, i) => (
          <div key={i} onClick={() => onSelectScreen('feed')} className="bg-white rounded-3xl border border-slate-100 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <div className="h-44 rounded-2xl overflow-hidden relative">
              <img src={col.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <span className="absolute bottom-2 left-2 text-xs font-bold text-white">{col.items} Items</span>
            </div>
            <div className="pt-2 px-1">
              <h3 className="text-sm font-bold text-slate-900">{col.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
