import React from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  SlidersHorizontal, 
  Bell, 
  Radio, 
  Flame, 
  UserPlus, 
  Trophy, 
  Users, 
  CheckCircle2, 
  Play,
  Crown,
  Star
} from 'lucide-react';
import { CREATORS, SAMPLE_IMAGES } from '../data/mockData';
import { ScreenId } from '../components/layout/Navbar';

interface HomeScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectScreen }) => {
  return (
    <div className="flex-1 p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Top Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            Good morning, Arjun! 👋
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Ready to discover something amazing today?
          </p>
        </div>
        <button className="self-start sm:self-auto bg-white border border-slate-200 text-xs px-4 py-2 flex items-center gap-1.5 rounded-full font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Customize</span>
        </button>
      </div>

      {/* Hero Banner Section */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-slate-800/50">
        {/* Purple Glowing Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Where creators <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
                come closer.
              </span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-md">
              Exclusive content, real connections, unforgettable experiences.
            </p>
            <button 
              onClick={() => onSelectScreen('explore')}
              className="btn-primary px-6 py-2.5 text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 rounded-full"
            >
              <span>Explore Creators</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Floating Creator Cards — Large Overlapping Cluster */}
          <div className="lg:col-span-7 relative min-h-[280px] hidden lg:flex items-center justify-center">
            {/* Decorative sparkle */}
            <div className="absolute top-4 right-8 text-purple-400/60 animate-pulse z-30">
              <Sparkles className="w-5 h-5" />
            </div>

            {/* Card: Rohit Gamer — top left */}
            <div className="absolute left-4 top-2 w-36 h-44 rounded-2xl overflow-hidden border border-white/20 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300 z-10">
              <img src={SAMPLE_IMAGES.rohit} alt="Rohit Gamer" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2.5 flex flex-col justify-end">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-white">Rohit Gamer</span>
                  <span className="text-purple-400 text-[8px]">✓</span>
                </div>
                <span className="text-[8px] text-slate-300">Gaming Creator</span>
              </div>
            </div>

            {/* Card: Meera Art — bottom left */}
            <div className="absolute left-8 bottom-2 w-36 h-40 rounded-2xl overflow-hidden border border-white/20 shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300 z-10">
              <img src={SAMPLE_IMAGES.meera} alt="Meera Art" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2.5 flex flex-col justify-end">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-white">Meera Art</span>
                  <span className="text-purple-400 text-[8px]">✓</span>
                </div>
                <span className="text-[8px] text-slate-300">Digital Artist</span>
              </div>
            </div>

            {/* Center Main Card — Ananya Sharma */}
            <div className="relative w-48 h-64 rounded-3xl overflow-hidden border-2 border-purple-500/60 shadow-2xl z-20 transform hover:scale-[1.03] transition-transform duration-300">
              <img src={SAMPLE_IMAGES.ananya} alt="Ananya Sharma" className="w-full h-full object-cover" />
              {/* Crown Badge */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-purple-600 flex items-center justify-center shadow-md">
                <Crown className="w-4 h-4 fill-purple-600 text-purple-600" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent p-3 flex flex-col justify-end">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white">Ananya Sharma</span>
                  <span className="text-purple-400 text-[10px]">✓</span>
                </div>
                <span className="text-[10px] text-slate-300">Fashion Creator</span>
              </div>
            </div>

            {/* Card: Wander With Karan — top right */}
            <div className="absolute right-8 top-0 w-36 h-40 rounded-2xl overflow-hidden border border-white/20 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300 z-10">
              <img src={SAMPLE_IMAGES.karan} alt="Karan" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2.5 flex flex-col justify-end">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-white truncate">Wander With Karan</span>
                  <span className="text-purple-400 text-[8px]">✓</span>
                </div>
                <span className="text-[8px] text-slate-300">Travel Creator</span>
              </div>
            </div>

            {/* Card: Fit With Neha — bottom right */}
            <div className="absolute right-4 bottom-4 w-36 h-40 rounded-2xl overflow-hidden border border-white/20 shadow-lg transform -rotate-2 hover:rotate-0 transition-transform duration-300 z-10">
              <img src={SAMPLE_IMAGES.neha} alt="Neha" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2.5 flex flex-col justify-end">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-white">Fit With Neha</span>
                  <span className="text-purple-400 text-[8px]">✓</span>
                </div>
                <span className="text-[8px] text-slate-300">Fitness Coach</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Quick-Access Pills — Compact horizontal row */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
        {[
          { label: 'Live Now', icon: Radio, sub: '24 Live', color: 'text-red-500 bg-red-50' },
          { label: 'Top Creators', icon: Flame, sub: 'Most Popular', color: 'text-amber-600 bg-amber-50' },
          { label: 'New Creators', icon: UserPlus, sub: 'Just Joined', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Trending', icon: Sparkles, sub: 'This Week', color: 'text-purple-600 bg-purple-50' },
          { label: 'Challenges', icon: Trophy, sub: 'Join & Win', color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Communities', icon: Users, sub: 'Connect', color: 'text-blue-600 bg-blue-50' },
        ].map((cat, idx) => {
          const Icon = cat.icon;
          const colors = cat.color.split(' ');
          return (
            <div 
              key={idx}
              onClick={() => onSelectScreen('explore')}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-200 cursor-pointer min-w-max transition-all group"
            >
              <div className={`w-8 h-8 rounded-lg ${colors[1]} ${colors[0]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block leading-tight">{cat.label}</span>
                <span className="text-[10px] font-medium text-slate-400">{cat.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Left 8 Cols, Right 4 Cols */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recommended For You */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recommended For You</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => onSelectScreen('explore')} className="text-xs font-bold text-purple-600 hover:underline">View All</button>
                <div className="flex gap-1">
                  <button className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Creator Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {CREATORS.slice(0, 5).map((creator) => (
                <div 
                  key={creator.id} 
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer overflow-hidden"
                  onClick={() => onSelectScreen('influencer')}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Trending Badge */}
                    {creator.trendingRank === 1 && (
                      <span className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-900 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                        🔥 Trending
                      </span>
                    )}

                    {/* Bottom Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-white">{creator.name}</span>
                        <span className="text-purple-400 text-xs">✓</span>
                      </div>
                      <span className="text-[10px] text-slate-300 font-medium">{creator.postsCount} Posts</span>
                    </div>
                  </div>

                  {/* Footer: Price + Subscribe */}
                  <div className="flex items-center justify-between px-3 py-2.5 border-t border-slate-100/80">
                    <div className="leading-none">
                      <span className="text-sm font-black text-slate-900">₹{creator.pricePerMonth}</span>
                      <span className="text-[10px] text-slate-400 font-medium"> /month</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectScreen('payment');
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Subscribe
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Right Now */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Live Right Now</h2>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onSelectScreen('explore')} className="text-xs font-bold text-purple-600 hover:underline">View All</button>
                <div className="flex gap-1">
                  <button className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {CREATORS.filter(c => c.isLive).map((creator) => (
                <div 
                  key={creator.id}
                  onClick={() => onSelectScreen('influencer')}
                  className="relative rounded-2xl overflow-hidden h-40 border border-slate-100 shadow-sm group cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/60 transition-colors" />

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-white" />
                    </div>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                      LIVE
                    </span>
                    <span className="bg-black/50 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {creator.liveViewers}
                    </span>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <span className="text-xs font-bold block truncate">{creator.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-5">
          {/* Your Subscriptions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Your Subscriptions</h3>
              <button onClick={() => onSelectScreen('influencer')} className="text-xs font-bold text-purple-600 hover:underline">View All</button>
            </div>

            <div className="space-y-2.5">
              {CREATORS.slice(0, 4).map((creator) => (
                <div 
                  key={creator.id}
                  onClick={() => onSelectScreen('influencer')}
                  className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img src={creator.avatar} alt={creator.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">{creator.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{creator.category}</span>
                    </div>
                  </div>
                  <button className="text-slate-300 hover:text-purple-600 transition-colors">
                    <Bell className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Live Sessions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Upcoming Live Sessions</h3>
              <button onClick={() => onSelectScreen('community')} className="text-xs font-bold text-purple-600 hover:underline">View All</button>
            </div>

            <div className="space-y-2.5">
              {[
                { date: '24', month: 'MAY', title: 'Live Q&A Session', host: 'Ananya Sharma', time: 'Today, 7:00 PM', avatar: SAMPLE_IMAGES.ananya },
                { date: '24', month: 'MAY', title: 'Gaming Stream', host: 'Rohit Gamer', time: 'Today, 8:30 PM', avatar: SAMPLE_IMAGES.rohit },
                { date: '25', month: 'MAY', title: 'Art Workshop', host: 'Meera Art', time: 'Tomorrow, 5:00 PM', avatar: SAMPLE_IMAGES.meera },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100/80 hover:bg-slate-100/60 transition-colors">
                  <div className="flex items-center gap-3">
                    {/* Date Badge */}
                    <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 font-black text-center flex flex-col justify-center leading-none shrink-0">
                      <span className="text-xs">{item.date}</span>
                      <span className="text-[8px] uppercase font-bold">{item.month}</span>
                    </div>
                    {/* Avatar */}
                    <img src={item.avatar} alt={item.host} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block leading-tight truncate">{item.title}</span>
                      <span className="text-[10px] text-slate-500 font-medium truncate block">{item.host} • {item.time}</span>
                    </div>
                  </div>
                  <button className="text-purple-600 border border-purple-200 text-[10px] px-2.5 py-1 font-bold rounded-lg hover:bg-purple-50 transition-colors shrink-0 ml-2">
                    Remind Me
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Fan Rewards */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Fan Rewards</h3>
              <button onClick={() => onSelectScreen('profile')} className="text-xs font-bold text-purple-600 hover:underline">View All</button>
            </div>

            {/* Level Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-800">Level 3 – Super Fan</span>
                <span className="text-purple-600">650 / 1000 XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500" style={{ width: '65%' }}></div>
              </div>
            </div>

            {/* Quest Items */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-slate-800">Daily Login</span>
                </div>
                <span className="font-extrabold text-purple-700 text-[11px]">+50 XP</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-slate-800">Watch 3 Live Streams</span>
                </div>
                <span className="font-extrabold text-purple-700 text-[11px]">+100 XP <em className="not-italic text-slate-400 font-normal">2 / 3</em></span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-slate-800">Refer a Friend</span>
                </div>
                <span className="font-extrabold text-purple-700 text-[11px]">+200 XP <em className="not-italic text-slate-400 font-normal">0 / 1</em></span>
              </div>
            </div>
          </div>

          {/* Invite & Earn Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white p-4 space-y-2 relative overflow-hidden shadow-md">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div>
              <span className="text-xs font-bold text-purple-200 block">Invite & Earn 🎁</span>
              <h4 className="text-sm font-extrabold text-white">Earn up to ₹500</h4>
              <p className="text-[11px] text-purple-100">for every friend you invite!</p>
            </div>
            <button className="py-1.5 px-4 bg-white text-purple-700 font-extrabold text-xs rounded-xl shadow-md hover:bg-purple-50 transition-colors">
              Invite Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
