import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  TrendingUp, 
  Dumbbell, 
  Gamepad2, 
  Shirt, 
  Plane, 
  Music, 
  Palette, 
  Camera, 
  Briefcase, 
  GraduationCap, 
  Smile, 
  Lock,
  MoreHorizontal
} from 'lucide-react';
import { CREATORS, SAMPLE_IMAGES } from '../data/mockData';
import { ScreenId } from '../components/layout/Navbar';

interface ExploreScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ onSelectScreen }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = [
    { id: 'All', label: 'All', icon: Sparkles },
    { id: 'Fitness', label: 'Fitness', icon: Dumbbell },
    { id: 'Gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'Fashion', label: 'Fashion', icon: Shirt },
    { id: 'Travel', label: 'Travel', icon: Plane },
    { id: 'Music', label: 'Music', icon: Music },
    { id: 'Art', label: 'Art', icon: Palette },
    { id: 'Lifestyle', label: 'Lifestyle', icon: Camera },
    { id: 'More', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Explore</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Discover amazing creators and exclusive content
        </p>
      </div>

      {/* Categories Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-purple-900/30">
        <div className="absolute top-0 right-1/4 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Discover. <br />
              <span className="text-purple-400">Connect.</span> <br />
              <span className="text-pink-400">Get Inspired.</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md">
              Explore top creators across categories and find your favorites.
            </p>
            <button 
              onClick={() => onSelectScreen('influencer')}
              className="bg-white text-purple-700 font-bold text-xs px-5 py-2.5 rounded-full hover:bg-purple-50 transition-colors flex items-center gap-1.5 shadow-md"
            >
              <span>Discover Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:col-span-7 flex justify-center lg:justify-end gap-3 items-center relative min-h-[200px]">
            {/* Floating creator cards */}
            <div className="w-40 h-52 rounded-2xl overflow-hidden border border-white/20 shadow-xl relative transform -rotate-2 hover:rotate-0 transition-transform duration-300">
              <img src={SAMPLE_IMAGES.ananya} alt="Ananya" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white">Ananya Sharma</span>
                  <span className="text-purple-400 text-[10px]">✓</span>
                </div>
                <span className="text-[10px] text-slate-300">Fashion Creator</span>
              </div>
            </div>
            <div className="w-40 h-52 rounded-2xl overflow-hidden border border-white/20 shadow-xl relative transform translate-y-4 hover:translate-y-2 transition-transform duration-300">
              <img src={SAMPLE_IMAGES.rohit} alt="Rohit" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white">Rohit Gamer</span>
                  <span className="text-purple-400 text-[10px]">✓</span>
                </div>
                <span className="text-[10px] text-slate-300">Gaming Creator</span>
              </div>
            </div>
            <div className="w-40 h-52 rounded-2xl overflow-hidden border border-white/20 shadow-xl relative transform rotate-2 hover:rotate-0 transition-transform duration-300 hidden md:block">
              <img src={SAMPLE_IMAGES.meera} alt="Meera" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white">Meera Art</span>
                  <span className="text-purple-400 text-[10px]">✓</span>
                </div>
                <span className="text-[10px] text-slate-300">Digital Artist</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recommended For You */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recommended For You</h2>
              <div className="flex items-center gap-2">
                <button className="text-xs font-bold text-purple-600 hover:underline">View All</button>
                <button className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {CREATORS.slice(0, 4).map((creator) => (
                <div 
                  key={creator.id}
                  onClick={() => onSelectScreen('influencer')}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group overflow-hidden"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <span className="absolute top-2 right-2 text-white/70">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-white">{creator.name}</span>
                        <span className="text-purple-400 text-xs">✓</span>
                      </div>
                      <span className="text-[10px] text-slate-300">{creator.category}</span>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex -space-x-1">
                          {[SAMPLE_IMAGES.ananya, SAMPLE_IMAGES.rohit, SAMPLE_IMAGES.meera].map((img, i) => (
                            <img key={i} src={img} className="w-4 h-4 rounded-full border border-white/50 object-cover" />
                          ))}
                        </div>
                        <span className="text-[9px] text-slate-300 ml-1">{creator.subscribers}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-3 py-2.5 border-t border-slate-100">
                    <div>
                      <span className="text-sm font-black text-slate-900">₹{creator.pricePerMonth}</span>
                      <span className="text-[10px] text-slate-400"> /month</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSelectScreen('payment'); }}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Subscribe
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending This Week */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Trending This Week</h2>
              <button className="text-xs font-bold text-purple-600 hover:underline">View All</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                { ...CREATORS[2], rank: 1, views: '55.1K' },
                { ...CREATORS[5], rank: 2, views: '18.7K' },
                { ...CREATORS[3], rank: 3, views: '16.2K' },
                { ...CREATORS[6], rank: 4, views: '14.8K' },
              ].map((c) => (
                <div 
                  key={c.id}
                  onClick={() => onSelectScreen('influencer')}
                  className="relative rounded-2xl overflow-hidden h-48 border border-slate-100 shadow-sm group cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <img src={c.avatar} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Rank Badge */}
                  <div className="absolute top-2.5 left-2.5 bg-purple-600 text-white font-black text-xs px-2 py-0.5 rounded-lg shadow-md">
                    #{c.rank}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white">{c.name}</span>
                      <span className="text-purple-400 text-[10px]">✓</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-300">{c.category}</span>
                      <span className="text-[10px] text-slate-400">☆ {c.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          {/* Search by Category */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Search by Category</h3>
              <button className="text-xs font-bold text-purple-600 hover:underline">View All</button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Fitness', icon: Dumbbell },
                { label: 'Gaming', icon: Gamepad2 },
                { label: 'Fashion', icon: Shirt },
                { label: 'Travel', icon: Plane },
                { label: 'Music', icon: Music },
                { label: 'Art', icon: Palette },
                { label: 'Lifestyle', icon: Camera },
                { label: 'Education', icon: GraduationCap },
                { label: 'Business', icon: Briefcase },
                { label: 'Comedy', icon: Smile },
                { label: 'Photography', icon: Camera },
                { label: 'More', icon: MoreHorizontal },
              ].map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-purple-50 hover:border-purple-200 cursor-pointer font-semibold text-slate-700 transition-all"
                  >
                    <Icon className="w-4 h-4 text-purple-600" />
                    <span>{cat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Creators Today */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Top Creators Today</h3>
              <button className="text-xs font-bold text-purple-600 hover:underline">View All</button>
            </div>

            <div className="space-y-2.5">
              {CREATORS.slice(0, 5).map((c, idx) => (
                <div key={c.id} onClick={() => onSelectScreen('influencer')} className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-slate-400 w-3 text-center">{idx + 1}</span>
                    <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900">{c.name}</span>
                        <span className="text-purple-600 text-[10px]">✓</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{c.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <span>{c.followers}</span>
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Hashtags */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Popular Hashtags</h3>
              <button className="text-xs font-bold text-purple-600 hover:underline">View All</button>
            </div>

            <div className="space-y-2">
              {[
                { tag: 'FitnessMotivation', posts: '12.5K posts', images: [SAMPLE_IMAGES.neha, SAMPLE_IMAGES.arjun] },
                { tag: 'TravelDiaries', posts: '8.7K posts', images: [SAMPLE_IMAGES.karan, SAMPLE_IMAGES.travelBeach] },
                { tag: 'GamingLife', posts: '7.2K posts', images: [SAMPLE_IMAGES.rohit, SAMPLE_IMAGES.gamingSetup] },
                { tag: 'FashionStyle', posts: '6.3K posts', images: [SAMPLE_IMAGES.ananya, SAMPLE_IMAGES.post1] },
                { tag: 'CreatorsLife', posts: '5.8K posts', images: [SAMPLE_IMAGES.meera, SAMPLE_IMAGES.post3] },
              ].map((h, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <span className="text-purple-600 font-bold text-base">#</span>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{h.tag}</span>
                      <span className="text-[10px] text-slate-400">{h.posts}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {h.images.map((img, j) => (
                      <img key={j} src={img} alt="" className="w-7 h-7 rounded-md object-cover" />
                    ))}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 ml-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
