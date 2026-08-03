import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  ChevronRight, 
  Play, 
  Star, 
  Lock, 
  Users, 
  Dumbbell, 
  Shirt, 
  Gamepad2, 
  Plane, 
  Music, 
  Palette, 
  GraduationCap, 
  Briefcase, 
  Camera, 
  MoreHorizontal,
  Bell,
  Heart,
  Globe
} from 'lucide-react';
import { CREATORS, SAMPLE_IMAGES } from '../data/mockData';
import { ScreenId } from '../components/layout/Navbar';

interface OnboardingScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onSelectScreen }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = [
    { id: 'All', label: 'All', icon: Sparkles },
    { id: 'Fitness', label: 'Fitness', icon: Dumbbell },
    { id: 'Fashion', label: 'Fashion', icon: Shirt },
    { id: 'Gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'Travel', label: 'Travel', icon: Plane },
    { id: 'Music', label: 'Music', icon: Music },
    { id: 'Art', label: 'Art', icon: Palette },
    { id: 'Education', label: 'Education', icon: GraduationCap },
    { id: 'Business', label: 'Business', icon: Briefcase },
    { id: 'Lifestyle', label: 'Lifestyle', icon: Camera },
    { id: 'More', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navbar matching onboarding.png */}
      <header className="bg-white border-b border-slate-200/80 px-6 lg:px-12 py-3 flex items-center justify-between gap-6 sticky top-0 z-40 shadow-2xs">
        {/* Logo Left */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectScreen('home')}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-800 flex items-center justify-center text-white font-extrabold shadow-md shadow-purple-600/30">
            ✦
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">Creavora</span>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
          <button onClick={() => onSelectScreen('home')} className="text-purple-600 font-extrabold relative py-1">
            Home
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full"></span>
          </button>
          <button onClick={() => onSelectScreen('explore')} className="hover:text-purple-600 transition-colors">Creators</button>
          <button onClick={() => onSelectScreen('explore')} className="hover:text-purple-600 transition-colors">Categories</button>
          <button onClick={() => onSelectScreen('live')} className="hover:text-purple-600 transition-colors">Live</button>
          <button onClick={() => onSelectScreen('community')} className="hover:text-purple-600 transition-colors">Community</button>
          <button onClick={() => onSelectScreen('home')} className="hover:text-purple-600 transition-colors">Blog</button>
        </nav>

        {/* Search & Right Section */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-3.5 py-1.5 text-xs text-slate-500 w-64 border border-slate-200/80">
            <Search className="w-3.5 h-3.5 mr-2 text-slate-400" />
            <input type="text" placeholder="Search creators, topics..." className="bg-transparent focus:outline-none w-full text-slate-800 font-medium" />
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-600 cursor-pointer hover:text-purple-600">
            <span>EN</span>
            <span className="text-[10px]">▼</span>
          </div>

          <button onClick={() => onSelectScreen('dashboard')} className="text-xs font-bold text-slate-700 hover:text-purple-600 transition-colors hidden sm:block">
            Become a Creator
          </button>

          <button className="relative w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-extrabold flex items-center justify-center">3</span>
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSelectScreen('profile')}>
            <img src={SAMPLE_IMAGES.ananya} alt="User" className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/50" />
          </div>
        </div>
      </header>

      {/* Main Hero Section matching onboarding.png */}
      <section className="py-10 lg:py-14 px-6 lg:px-12 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 font-extrabold text-xs px-3.5 py-1.5 rounded-full border border-purple-200/80 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>The Premium Creator Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Support Your <br />
              Favorite Creators. <br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-sky-500 bg-clip-text text-transparent">
                Connect. Enjoy. Belong.
              </span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base font-medium max-w-md leading-relaxed">
              Subscribe to exclusive content, live streams, and private communities from creators you love.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-3 pt-1">
              <button 
                onClick={() => onSelectScreen('explore')}
                className="btn-primary px-7 py-3 text-sm font-extrabold rounded-full shadow-lg shadow-purple-600/30 flex items-center gap-2"
              >
                <span>Explore Creators</span>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </button>

              <button 
                onClick={() => onSelectScreen('explore')}
                className="btn-secondary px-6 py-3 text-sm font-bold rounded-full flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-800" />
                <span>How It Works</span>
              </button>
            </div>

            {/* 4 Stat Mini-Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mt-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-sm font-black text-slate-900 block leading-none">10K+</span>
                  <span className="text-[10px] text-slate-400 font-bold">Creators</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-sm font-black text-slate-900 block leading-none">500K+</span>
                  <span className="text-[10px] text-slate-400 font-bold">Active Fans</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-sm font-black text-slate-900 block leading-none">2M+</span>
                  <span className="text-[10px] text-slate-400 font-bold">Exclusive Posts</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                  <Heart className="w-4.5 h-4.5 fill-pink-500 text-pink-500" />
                </div>
                <div>
                  <span className="text-sm font-black text-slate-900 flex items-center gap-1 leading-none">
                    4.9 <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">User Rating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Asymmetric 5-card Creator Photo Collage matching onboarding.png */}
          <div className="lg:col-span-6 relative min-h-[380px] sm:min-h-[440px] flex items-center justify-center">
            {/* Background Decorative Sparkles & Hand-drawn arrow */}
            <div className="absolute top-2 left-6 text-purple-400/70 animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="absolute bottom-6 right-2 text-purple-400 hidden sm:block">
              <svg className="w-20 h-20 text-purple-500 stroke-current transform rotate-12 opacity-75" fill="none" viewBox="0 0 100 100">
                <path d="M 10,80 Q 50,10 90,60 M 75,50 L 90,60 L 80,75" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Top-Left Card: Rohit Gamer */}
            <div className="absolute left-2 top-0 w-36 sm:w-44 h-48 rounded-2xl overflow-hidden border border-white/40 shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-300 z-10">
              <img src={SAMPLE_IMAGES.rohit} alt="Rohit Gamer" className="w-full h-full object-cover" />
              <span className="absolute top-2 right-2 text-white/80"><Lock className="w-3.5 h-3.5" /></span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white">Rohit Gamer</span>
                  <span className="text-purple-400 text-[10px]">✓</span>
                </div>
                <span className="text-[10px] text-slate-300 font-medium">Gaming</span>
              </div>
            </div>

            {/* Bottom-Left Card: Meera Art */}
            <div className="absolute left-4 bottom-2 w-36 sm:w-44 h-44 rounded-2xl overflow-hidden border border-white/40 shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-300 z-10">
              <img src={SAMPLE_IMAGES.meera} alt="Meera Art" className="w-full h-full object-cover" />
              <span className="absolute top-2 right-2 text-white/80"><Lock className="w-3.5 h-3.5" /></span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white">Meera Art</span>
                  <span className="text-purple-400 text-[10px]">✓</span>
                </div>
                <span className="text-[10px] text-slate-300 font-medium">Artist</span>
              </div>
            </div>

            {/* Center Main Tall Card: Ananya Sharma */}
            <div className="relative w-48 sm:w-56 h-72 sm:h-80 rounded-3xl overflow-hidden border-2 border-purple-400/80 shadow-2xl z-20 transform hover:scale-[1.02] transition-transform duration-300">
              <img src={SAMPLE_IMAGES.ananya} alt="Ananya Sharma" className="w-full h-full object-cover" />
              
              {/* Floating ⭐ Top Creator badge */}
              <div className="absolute top-3 right-3 bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md border border-purple-300/40">
                <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                <span>Top Creator</span>
              </div>

              <span className="absolute bottom-16 right-3 text-white/80"><Lock className="w-4 h-4" /></span>

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent p-4 flex flex-col justify-end">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">Ananya Sharma</span>
                  <span className="text-purple-400 text-xs">✓</span>
                </div>
                <span className="text-xs text-slate-300 font-medium">Fashion & Lifestyle</span>
              </div>
            </div>

            {/* Top-Right Card: Arjun Fitness */}
            <div className="absolute right-4 top-2 w-36 sm:w-44 h-44 rounded-2xl overflow-hidden border border-white/40 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300 z-10">
              <img src={SAMPLE_IMAGES.arjun} alt="Arjun Fitness" className="w-full h-full object-cover" />
              <span className="absolute top-2 right-2 text-white/80"><Lock className="w-3.5 h-3.5" /></span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white">Arjun Fitness</span>
                  <span className="text-purple-400 text-[10px]">✓</span>
                </div>
                <span className="text-[10px] text-slate-300 font-medium">Fitness Coach</span>
              </div>
            </div>

            {/* Bottom-Right Card: Wander With Karan */}
            <div className="absolute right-2 bottom-4 w-36 sm:w-44 h-44 rounded-2xl overflow-hidden border border-white/40 shadow-xl transform -rotate-2 hover:rotate-0 transition-transform duration-300 z-10">
              <img src={SAMPLE_IMAGES.karan} alt="Wander With Karan" className="w-full h-full object-cover" />
              <span className="absolute top-2 right-2 text-white/80"><Lock className="w-3.5 h-3.5" /></span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white truncate">Wander With Karan</span>
                  <span className="text-purple-400 text-[10px]">✓</span>
                </div>
                <span className="text-[10px] text-slate-300 font-medium">Travel Creator</span>
              </div>
            </div>

            {/* Floating Join 500K+ Happy Fans pill bottom */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-purple-200 flex items-center gap-2 z-30">
              <div className="flex -space-x-2">
                <img src={SAMPLE_IMAGES.ananya} className="w-5 h-5 rounded-full object-cover border border-white" />
                <img src={SAMPLE_IMAGES.rohit} className="w-5 h-5 rounded-full object-cover border border-white" />
                <img src={SAMPLE_IMAGES.meera} className="w-5 h-5 rounded-full object-cover border border-white" />
              </div>
              <span className="text-[11px] font-bold text-slate-800">
                Join <strong className="text-purple-700 font-black">500K+</strong> Happy Fans
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Row matching onboarding.png */}
      <section className="px-6 lg:px-12 max-w-[1600px] mx-auto w-full mb-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center gap-1 px-5 py-2.5 rounded-xl font-bold text-xs transition-all relative ${
                  isActive 
                    ? 'text-purple-700 bg-purple-50' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
                {isActive && <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-purple-600 rounded-full"></span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Top Creators Section matching onboarding.png */}
      <section className="px-6 lg:px-12 max-w-[1600px] mx-auto w-full pb-16 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              Top Creators <Star className="w-4 h-4 fill-purple-600 text-purple-600" />
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Discover the most loved creators on Creavora this week.
            </p>
          </div>

          <button onClick={() => onSelectScreen('explore')} className="btn-secondary py-1.5 px-4 text-xs font-bold rounded-full flex items-center gap-1">
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Creator Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {CREATORS.slice(0, 5).map((creator) => (
            <div 
              key={creator.id} 
              onClick={() => onSelectScreen('influencer')}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group"
            >
              <div className="relative h-52 overflow-hidden">
                <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                <span className="absolute top-2 right-2 text-white/80"><Lock className="w-3.5 h-3.5" /></span>

                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold truncate">{creator.name}</span>
                    <span className="text-purple-400 text-[10px]">✓</span>
                  </div>
                  <span className="text-[10px] text-slate-300 block font-medium">{creator.category}</span>
                </div>
              </div>

              <div className="p-3 flex items-center justify-between border-t border-slate-100">
                <div>
                  <span className="text-xs font-black text-slate-900">₹{creator.pricePerMonth}</span>
                  <span className="text-[10px] text-slate-400">/mo</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onSelectScreen('payment'); }}
                  className="btn-primary py-1 px-3 text-[10px] font-bold rounded-lg"
                >
                  Subscribe
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
