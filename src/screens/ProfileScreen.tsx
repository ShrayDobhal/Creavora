import React, { useState } from 'react';
import { 
  Camera, 
  SquarePen, 
  Share2, 
  MoreVertical, 
  MapPin, 
  Star, 
  Trophy, 
  CheckCircle2, 
  ExternalLink, 
  Lock, 
  Pin, 
  Heart, 
  MessageCircle 
} from 'lucide-react';
import { SAMPLE_IMAGES } from '../data/mockData';
import { ScreenId } from '../components/layout/Navbar';

interface ProfileScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onSelectScreen }) => {
  const [activeTab, setActiveTab] = useState('Posts');
  const [filterType, setFilterType] = useState('All');

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Cover & Profile Header */}
      <div className="card p-0 rounded-3xl overflow-hidden shadow-md">
        <div className="relative h-64 sm:h-72 w-full overflow-hidden">
          <img src={SAMPLE_IMAGES.ananyaCover} className="w-full h-full object-cover" />
          <button className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-black/80">
            <Camera className="w-3.5 h-3.5" />
            <span>Edit Cover</span>
          </button>
        </div>

        <div className="p-6 pt-0 relative bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img src={SAMPLE_IMAGES.ananya} className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-xl" />
                <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">✓</span>
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900">Ananya Sharma</h1>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-semibold text-emerald-600">Online</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">@ananyasharma</span>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                  <span>Fashion Creator 👗</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-purple-600" /> Mumbai, India</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pb-1">
              <button className="btn-primary px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5">
                <SquarePen className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
              <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600"><Share2 className="w-4 h-4" /></button>
              <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600"><MoreVertical className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex items-center justify-around p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs">
            <div><span className="text-sm font-black text-slate-900 block">124</span><span className="text-[9px] text-slate-400 font-medium">Posts</span></div>
            <div className="w-px h-7 bg-slate-200"></div>
            <div><span className="text-sm font-black text-slate-900 block">21.3K</span><span className="text-[9px] text-slate-400 font-medium">Followers</span></div>
            <div className="w-px h-7 bg-slate-200"></div>
            <div><span className="text-sm font-black text-slate-900 block">98</span><span className="text-[9px] text-slate-400 font-medium">Following</span></div>
            <div className="w-px h-7 bg-slate-200"></div>
            <div><span className="text-sm font-black text-slate-900 block">4.8K</span><span className="text-[9px] text-slate-400 font-medium">Subscribers</span></div>
            <div className="w-px h-7 bg-slate-200"></div>
            <div><span className="text-sm font-black text-amber-500 flex items-center justify-center gap-0.5">5.0 ⭐</span><span className="text-[9px] text-slate-400 font-medium">Rating</span></div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 8 Cols (Posts Grid), Right 4 Cols (Level & Subscriptions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Sub Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200">
            {['Posts', 'Reels', 'Videos', 'Live', 'Collections', 'Likes', 'About'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === t ? 'border-purple-600 text-purple-700 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Filters Bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {['All', 'Public', 'Premium'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`pill text-xs ${filterType === f ? 'pill-active' : 'pill-inactive'}`}
                >
                  {f === 'Premium' && <Lock className="w-3 h-3" />}
                  {f}
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-400">Latest ▾</span>
          </div>

          {/* Posts Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'My morning routine ☀️', image: SAMPLE_IMAGES.post1, likes: '1.2K', comments: '128', pinned: true },
              { title: 'Goa diaries 🌴', image: SAMPLE_IMAGES.post2, likes: '2.3K', comments: '210', pinned: true },
              { title: 'Date night look 💕', image: SAMPLE_IMAGES.post3, likes: '2.3K', comments: '154' },
              { title: 'GRWM for a party ✨', image: SAMPLE_IMAGES.ananya, likes: '3.1K', comments: '276' },
            ].map((p, i) => (
              <div key={i} className="relative h-60 rounded-2xl overflow-hidden border border-slate-200 group">
                <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  {p.pinned && <span className="bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Pin className="w-2.5 h-2.5" /> Pinned</span>}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end text-white">
                  <span className="text-xs font-bold">{p.title}</span>
                  <div className="flex items-center gap-3 text-[11px] font-bold pt-1">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3 fill-pink-500 text-pink-500" /> {p.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {p.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Creator Level Widget */}
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 space-y-3 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Creator Level</span>
              <span className="bg-purple-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">Platinum</span>
            </div>

            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-md mb-2">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">Level 12</h3>
              <span className="text-xs font-bold text-purple-700">8,450 / 10,000 XP</span>
            </div>

            <div className="w-full h-2 rounded-full bg-purple-100 overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full" style={{ width: '84.5%' }}></div>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold text-center block">Keep engaging to level up! ✨</span>
          </div>

          {/* Active Subscription Widget */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Subscription</h3>
              <button onClick={() => onSelectScreen('payment')} className="text-xs font-bold text-purple-600 hover:underline">Manage</button>
            </div>
            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Premium Monthly</span>
                <span className="text-xs font-extrabold text-purple-700">₹499 <em className="not-italic font-normal text-slate-400 text-[10px]">/ month</em></span>
                <span className="text-[10px] text-slate-400 block font-medium">Renews on 25 May 2024</span>
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">Active</span>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Achievements</h3>
              <button className="text-xs font-bold text-purple-600 hover:underline">View All</button>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-lg">🏆</div>
              <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-lg">👑</div>
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-lg">🔥</div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-lg">🌟</div>
              <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center text-lg">💎</div>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center">+12</div>
            </div>
          </div>

          {/* Top Fans Leaderboard */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Top Fans</h3>
              <button className="text-xs font-bold text-purple-600 hover:underline">View All</button>
            </div>
            <div className="space-y-2.5 text-xs">
              {[
                { name: 'Rohit Gamer', xp: '12.5K XP', avatar: SAMPLE_IMAGES.rohit },
                { name: 'Meera Singh', xp: '9.8K XP', avatar: SAMPLE_IMAGES.meera },
                { name: 'Wander With Karan', xp: '7.2K XP', avatar: SAMPLE_IMAGES.karan },
              ].map((f, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-600 text-xs w-3">{i + 1}</span>
                    <img src={f.avatar} className="w-7 h-7 rounded-full object-cover" />
                    <span className="font-bold text-slate-900">{f.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-700">{f.xp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links Widget */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Social Links</h3>
              <button className="text-xs font-bold text-purple-600 hover:underline">Edit</button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold hover:bg-pink-100 cursor-pointer">
                📷 Instagram
              </div>
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold hover:bg-red-100 cursor-pointer">
                ▶️ YouTube
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold hover:bg-sky-100 cursor-pointer">
                🐦 Twitter
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold hover:bg-slate-200 cursor-pointer">
                🎵 TikTok
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
