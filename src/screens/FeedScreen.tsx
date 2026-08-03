import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Play, 
  MoreVertical, 
  SlidersHorizontal, 
  Lock, 
  Plus, 
  Sparkles, 
  Flame, 
  ChevronRight,
  Image
} from 'lucide-react';
import { CREATORS, SAMPLE_IMAGES } from '../data/mockData';
import { ScreenId } from '../components/layout/Navbar';

interface FeedScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const FeedScreen: React.FC<FeedScreenProps> = ({ onSelectScreen }) => {
  const [activeTab, setActiveTab] = useState('For You');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({ p1: true });

  const toggleLike = (id: string) => {
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto relative">
      {/* Top Filter Pills */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2">
          {['For You', 'Following', 'Trending', 'New', 'Nearby', 'Bookmarks'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {tab === 'Trending' && <span className="mr-1">🔥</span>}
              {tab}
            </button>
          ))}
        </div>
        <button className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 shrink-0 transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Posts Column */}
        <div className="lg:col-span-8 space-y-5">
          {/* Post 1 — Ananya Gallery */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow">
            {/* Author */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectScreen('influencer')}>
                <div className="relative">
                  <img src={SAMPLE_IMAGES.ananya} alt="Ananya" className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-200" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900">Ananya Sharma</span>
                    <span className="text-purple-600 text-xs">✓</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <span>2 hours ago</span>
                    <span className="text-purple-600 bg-purple-50 font-bold px-1.5 py-0.5 rounded text-[10px]">Premium</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onSelectScreen('payment')} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors">
                  Subscribe
                </button>
                <button className="text-slate-400 hover:text-slate-600 p-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Caption */}
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              Morning vibes ☀️<br />
              A little peek into my peaceful Sunday ✨<br />
              Full vlog dropping soon for my premium fam! 💜
            </p>

            {/* Gallery Grid */}
            <div className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden">
              <div className="relative h-64 overflow-hidden rounded-l-xl">
                <img src={SAMPLE_IMAGES.post1} alt="Post 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  📷 5 Photos
                </span>
              </div>
              <div className="relative h-64 overflow-hidden">
                <img src={SAMPLE_IMAGES.post2} alt="Post 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-white/25 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer">
                    <Play className="w-5 h-5 fill-white" />
                  </div>
                </div>
              </div>
              <div className="relative h-64 overflow-hidden rounded-r-xl">
                <img src={SAMPLE_IMAGES.post3} alt="Post 3" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  🎥 2 Videos
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => toggleLike('p1')}
                  className={`flex items-center gap-1.5 hover:text-pink-600 transition-colors ${likedPosts['p1'] ? 'text-pink-600' : ''}`}
                >
                  <Heart className={`w-4 h-4 ${likedPosts['p1'] ? 'fill-pink-600 text-pink-600' : ''}`} />
                  <span>1.2K</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-purple-600 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>128</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-purple-600 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>32</span>
                </button>
              </div>
              <button className="text-slate-400 hover:text-slate-800 transition-colors">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Post 2 — Rohit Video */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectScreen('influencer')}>
                <img src={SAMPLE_IMAGES.rohit} alt="Rohit" className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-200" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900">Rohit Gamer</span>
                    <span className="text-purple-600 text-xs">✓</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <span>4 hours ago</span>
                    <span className="text-purple-600 bg-purple-50 font-bold px-1.5 py-0.5 rounded text-[10px]">Premium</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onSelectScreen('payment')} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors">
                  Subscribe
                </button>
                <button className="text-slate-400 hover:text-slate-600 p-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              NEW GAMEPLAY ALERT! 🚀<br />
              This boss fight was INSANE! 😱<br />
              Exclusive full video for my subscribers only.
            </p>

            {/* Video Thumbnail with Premium Lock */}
            <div className="relative rounded-2xl overflow-hidden h-72 border border-slate-100">
              <img src={SAMPLE_IMAGES.gamingSetup} alt="Gaming" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 cursor-pointer hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-white translate-x-0.5" />
                </div>
                <div className="bg-black/60 backdrop-blur-sm text-purple-200 text-xs font-bold px-3 py-1.5 rounded-full border border-purple-400/20 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Premium Only</span>
                </div>
              </div>
              <span className="absolute bottom-3 left-3 bg-black/70 text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-md">
                18:45
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-1.5 hover:text-pink-600 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span>2.3K</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-purple-600 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>245</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-purple-600 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>56</span>
                </button>
              </div>
              <button className="text-slate-400 hover:text-slate-800 transition-colors">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Post 3 — Karan Travel */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectScreen('influencer')}>
                <img src={SAMPLE_IMAGES.karan} alt="Karan" className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-200" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900">Wander With Karan</span>
                    <span className="text-purple-600 text-xs">✓</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <span>6 hours ago</span>
                    <span className="text-purple-600 bg-purple-50 font-bold px-1.5 py-0.5 rounded text-[10px]">Premium</span>
                  </div>
                </div>
              </div>
              <button onClick={() => onSelectScreen('payment')} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors">
                Subscribe
              </button>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              Exploring the untouched beauty of Himachal! 🏔️ ✨
            </p>

            <div className="relative rounded-2xl overflow-hidden h-72 border border-slate-100">
              <img src={SAMPLE_IMAGES.travelBeach} alt="Travel" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-1.5 hover:text-pink-600 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span>950</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-purple-600 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>64</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-purple-600 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>18</span>
                </button>
              </div>
              <button className="text-slate-400 hover:text-slate-800 transition-colors">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          {/* Stories */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Stories</h3>
              <button className="text-xs font-bold text-purple-600 hover:underline">View All</button>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
              {/* Your Story */}
              <div className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
                <div className="relative w-14 h-14 rounded-full border-2 border-dashed border-purple-400 p-0.5 flex items-center justify-center">
                  <img src={SAMPLE_IMAGES.ananya} alt="You" className="w-full h-full rounded-full object-cover" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center border-2 border-white">
                    <Plus className="w-3 h-3" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-600">You</span>
              </div>

              {/* Creator Stories with gradient rings */}
              {CREATORS.slice(0, 4).map((c) => (
                <div key={c.id} onClick={() => onSelectScreen('influencer')} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
                  <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 group-hover:scale-105 transition-transform">
                    <img src={c.avatar} alt={c.name} className="w-full h-full rounded-full object-cover border-2 border-white" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 truncate w-14 text-center">{c.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Creators */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Trending Creators</h3>
              <button onClick={() => onSelectScreen('explore')} className="text-xs font-bold text-purple-600 hover:underline">View All</button>
            </div>

            <div className="space-y-2.5">
              {CREATORS.slice(0, 5).map((c, idx) => (
                <div key={c.id} className="flex items-center justify-between hover:bg-slate-50 rounded-xl p-1.5 transition-colors cursor-pointer" onClick={() => onSelectScreen('influencer')}>
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
                  <button onClick={(e) => { e.stopPropagation(); onSelectScreen('payment'); }} className="text-purple-600 border border-purple-200 text-[10px] px-2.5 py-1 font-bold rounded-lg hover:bg-purple-50 transition-colors shrink-0">
                    Subscribe
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* What's Hot */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">What's Hot 🔥</h3>
            <div className="space-y-2 text-xs">
              {[
                { tag: '#SundayVibes', posts: '12.5K posts', images: [SAMPLE_IMAGES.post1, SAMPLE_IMAGES.post2] },
                { tag: '#GamingReels', posts: '8.7K posts', images: [SAMPLE_IMAGES.gamingSetup, SAMPLE_IMAGES.rohit] },
                { tag: '#TravelDiaries', posts: '6.2K posts', images: [SAMPLE_IMAGES.travelBeach, SAMPLE_IMAGES.karan] },
              ].map((h, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3">
                    <span className="text-purple-600 font-bold text-sm">#</span>
                    <div>
                      <span className="font-bold text-slate-800 block">{h.tag.replace('#', '')}</span>
                      <span className="text-[10px] text-slate-400">{h.posts}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {h.images.map((img, j) => (
                      <img key={j} src={img} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ))}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite & Earn */}
          <div className="rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 p-4 text-white space-y-2 relative overflow-hidden shadow-md">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <span className="text-xs font-bold block">Invite & Earn 🎁</span>
            <p className="text-sm font-extrabold">Earn up to ₹500 for every friend you invite!</p>
            <button className="py-1.5 px-4 bg-white text-purple-700 font-extrabold text-xs rounded-xl shadow-md hover:bg-purple-50 transition-colors">
              Invite Now
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => onSelectScreen('dashboard')}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-purple-600 text-white shadow-xl shadow-purple-600/30 flex items-center justify-center hover:bg-purple-700 hover:scale-110 transition-all z-40"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
};
