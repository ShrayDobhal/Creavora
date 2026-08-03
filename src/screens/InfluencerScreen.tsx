import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Star, 
  Share2, 
  Lock, 
  CheckCircle2, 
  Crown, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Play, 
  ExternalLink, 
  ArrowLeft 
} from 'lucide-react';
import { SAMPLE_IMAGES } from '../data/mockData';
import { ScreenId } from '../components/layout/Navbar';

interface InfluencerScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const InfluencerScreen: React.FC<InfluencerScreenProps> = ({ onSelectScreen }) => {
  const [activeTab, setActiveTab] = useState('Posts');

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Cover Image & Profile Header Header */}
      <div className="card p-0 rounded-3xl overflow-hidden shadow-md">
        {/* Cover Photo */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img src={SAMPLE_IMAGES.ananyaCover} alt="Cover" className="w-full h-full object-cover" />
          <button 
            onClick={() => onSelectScreen('explore')}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Identity Row */}
        <div className="p-6 pt-0 relative bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img 
                  src={SAMPLE_IMAGES.ananya} 
                  alt="Ananya Sharma" 
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white shadow-xl"
                />
                <span className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center border-2 border-white font-bold">
                  ✓
                </span>
              </div>
              <div className="pb-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">Ananya Sharma</h1>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-semibold text-emerald-600">Online</span>
                </div>
                <span className="text-xs font-medium text-slate-500">@ananyasharma</span>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                  <span>Fashion Creator 👗</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-purple-600" /> Mumbai, India</span>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex items-center gap-2 pb-2">
              <button 
                onClick={() => onSelectScreen('payment')}
                className="btn-primary px-6 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
              >
                <Crown className="w-4 h-4 fill-white/30" />
                <span>Subscribe</span>
              </button>
              <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200">
                <Star className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats Bar with Dividers */}
          <div className="flex items-center justify-around p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <div>
              <span className="text-base sm:text-lg font-black text-slate-900 block">124</span>
              <span className="text-[10px] text-slate-400 font-medium">Posts</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-base sm:text-lg font-black text-slate-900 block">21.3K</span>
              <span className="text-[10px] text-slate-400 font-medium">Followers</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-base sm:text-lg font-black text-slate-900 block">98</span>
              <span className="text-[10px] text-slate-400 font-medium">Following</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-base sm:text-lg font-black text-slate-900 block">4.8K</span>
              <span className="text-[10px] text-slate-400 font-medium">Subscribers</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-base sm:text-lg font-black text-amber-500 flex items-center justify-center gap-1">
                5.0 <Star className="w-3.5 h-3.5 fill-amber-400" />
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 8 Cols (Tabs & Posts), Right 4 Cols (Subscription Tier & Perks) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Content Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200">
            {['Posts', 'Reels', 'Live', 'Collections', 'Likes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 ${
                  activeTab === tab 
                    ? 'border-purple-600 text-purple-700 font-extrabold' 
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Unlocked Post 1 */}
            <div className="relative h-64 rounded-2xl overflow-hidden border border-slate-200 group">
              <img src={SAMPLE_IMAGES.post1} alt="Post 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-between">
                <span className="text-xs text-white font-semibold">My new café corner ☕✨</span>
                <div className="flex items-center gap-4 text-xs font-bold text-white">
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" /> 1.2K</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> 128</span>
                </div>
              </div>
            </div>

            {/* Unlocked Post 2 */}
            <div className="relative h-64 rounded-2xl overflow-hidden border border-slate-200 group">
              <img src={SAMPLE_IMAGES.post2} alt="Post 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-between">
                <span className="text-xs text-white font-semibold">Beach days are the best 🌊</span>
                <div className="flex items-center gap-4 text-xs font-bold text-white">
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" /> 2.3K</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> 210</span>
                </div>
              </div>
            </div>

            {/* Unlocked Post 3 */}
            <div className="relative h-64 rounded-2xl overflow-hidden border border-slate-200 group">
              <img src={SAMPLE_IMAGES.post3} alt="Post 3" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-between">
                <span className="text-xs text-white font-semibold">Sunday fit check 🤍</span>
                <div className="flex items-center gap-4 text-xs font-bold text-white">
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" /> 1.8K</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> 154</span>
                </div>
              </div>
            </div>

            {/* Locked Premium Posts Row */}
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="relative h-64 rounded-2xl overflow-hidden border border-slate-200">
                <img src={SAMPLE_IMAGES.ananyaCover} alt="Locked" className="w-full h-full object-cover filter blur-md scale-110" />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-white block">Premium Content</span>
                    <span className="text-[10px] text-purple-200">Subscribe to unlock</span>
                  </div>
                  <button 
                    onClick={() => onSelectScreen('payment')}
                    className="btn-primary py-1.5 px-4 text-xs font-bold rounded-xl"
                  >
                    Subscribe to View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Subscription Tier Card */}
          <div className="bg-white rounded-2xl border border-purple-200 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Subscription</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-700 block">Premium Monthly</span>
                <span className="text-2xl font-black text-slate-900">₹499 <em className="not-italic text-xs font-normal text-slate-400">/ month</em></span>
              </div>
              <Crown className="w-7 h-7 text-purple-600" />
            </div>

            <div className="space-y-2 text-xs font-medium text-slate-700 pt-2 border-t border-purple-100">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Access to exclusive posts</span></div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Behind the scenes content</span></div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Early access to new videos</span></div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Live chat & priority replies</span></div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Special subscriber badges</span></div>
            </div>

            <button 
              onClick={() => onSelectScreen('payment')}
              className="w-full btn-primary py-2.5 text-xs font-bold rounded-xl justify-center shadow-md shadow-purple-600/30"
            >
              Subscribe Now
            </button>
            <span className="text-[10px] text-center text-slate-400 font-semibold block">Cancel anytime • Secure payment</span>
          </div>

          {/* About Widget */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">About Ananya</h3>
            <div className="space-y-2 font-medium text-slate-700">
              <p>Fashion | Lifestyle | Travel</p>
              <p>Collab: ananya@crevora.com</p>
              <a href="#" className="text-purple-600 font-bold flex items-center gap-1 hover:underline">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>youtu.be/ananyasharma</span>
              </a>
              <span className="text-[10px] text-slate-400 block">Joined Jan 2023</span>
            </div>
          </div>

          {/* Top Supporters */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Top Supporters</h3>
              <button className="text-xs font-bold text-purple-600 hover:underline">View All</button>
            </div>
            <div className="space-y-2.5 text-xs">
              {[
                { name: 'Rohit Gamer', tier: 'Platinum 👑', avatar: SAMPLE_IMAGES.rohit },
                { name: 'Meera Singh', tier: 'Platinum 👑', avatar: SAMPLE_IMAGES.meera },
                { name: 'Wander With Karan', tier: 'Gold 👑', avatar: SAMPLE_IMAGES.karan },
                { name: 'Pooja Verma', tier: 'Gold 👑', avatar: SAMPLE_IMAGES.kavya },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400 text-xs w-3">{i + 1}</span>
                    <img src={s.avatar} className="w-8 h-8 rounded-full object-cover" />
                    <span className="font-bold text-slate-900">{s.name}</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">{s.tier}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Showcase Widget */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Achievements</h3>
              <button className="text-xs font-bold text-purple-600 hover:underline">View All</button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-lg shadow-2xs">
                ⭐
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-lg shadow-2xs">
                🔥
              </div>
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center text-lg shadow-2xs">
                💎
              </div>
              <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center text-lg shadow-2xs">
                👑
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center">
                +12
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
