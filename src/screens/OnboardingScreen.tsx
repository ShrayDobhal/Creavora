import React from 'react';
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
  MoreHorizontal 
} from 'lucide-react';
import { CREATORS, SAMPLE_IMAGES } from '../data/mockData';
import { ScreenId } from '../components/layout/Navbar';

interface OnboardingScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onSelectScreen }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 px-6 lg:px-12 py-3 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md">
            ✦
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">Creavora</span>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
          <a href="#" onClick={() => onSelectScreen('home')} className="text-purple-600 font-extrabold">Home</a>
          <a href="#" onClick={() => onSelectScreen('explore')} className="hover:text-purple-600">Creators</a>
          <a href="#" onClick={() => onSelectScreen('explore')} className="hover:text-purple-600">Categories</a>
          <a href="#" onClick={() => onSelectScreen('home')} className="hover:text-purple-600">Live</a>
          <a href="#" onClick={() => onSelectScreen('community')} className="hover:text-purple-600">Community</a>
          <a href="#" className="hover:text-purple-600">Blog</a>
        </nav>

        {/* Search & CTAs */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-3 py-1.5 text-xs text-slate-500 w-52 border border-slate-200">
            <Search className="w-3.5 h-3.5 mr-2" />
            <input type="text" placeholder="Search creators..." className="bg-transparent focus:outline-none w-full text-slate-800" />
          </div>

          <button onClick={() => onSelectScreen('dashboard')} className="btn-secondary text-xs font-bold py-1.5 px-3 rounded-full">
            Become a Creator
          </button>
          
          <button onClick={() => onSelectScreen('home')} className="btn-primary py-1.5 px-4 text-xs font-bold rounded-full">
            Get Started
          </button>
        </div>
      </header>

      {/* Main Hero Banner */}
      <section className="py-12 lg:py-16 px-6 lg:px-12 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 bg-purple-100/80 text-purple-700 font-extrabold text-xs px-3 py-1 rounded-full border border-purple-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Premium Creator Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">
              Support Your <br />
              Favorite Creators. <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent">
                Connect. Enjoy. Belong.
              </span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base font-medium max-w-lg leading-relaxed">
              Subscribe to exclusive content, live streams, and private communities from creators you love.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => onSelectScreen('explore')}
                className="btn-primary px-7 py-3 text-sm font-bold rounded-full shadow-lg shadow-purple-600/30 flex items-center gap-2"
              >
                <span>Explore Creators</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="btn-secondary px-6 py-3 text-sm font-bold rounded-full flex items-center gap-2">
                <Play className="w-4 h-4 fill-slate-800" />
                <span>How It Works</span>
              </button>
            </div>

            {/* Stats Pills Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm max-w-xl">
              <div>
                <span className="text-lg font-black text-slate-900 block">10K+</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Creators</span>
              </div>
              <div>
                <span className="text-lg font-black text-slate-900 block">500K+</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Active Fans</span>
              </div>
              <div>
                <span className="text-lg font-black text-slate-900 block">2M+</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Exclusive Posts</span>
              </div>
              <div>
                <span className="text-lg font-black text-amber-500 flex items-center gap-1">
                  4.9 <Star className="w-3.5 h-3.5 fill-amber-400" />
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">User Rating</span>
              </div>
            </div>
          </div>

          {/* Right Floating 3D Cards Stack */}
          <div className="lg:col-span-6 relative min-h-[420px] flex items-center justify-center">
            {/* Center Main Creator Card */}
            <div 
              onClick={() => onSelectScreen('influencer')}
              className="relative w-64 sm:w-72 h-96 rounded-3xl overflow-hidden border-4 border-white shadow-2xl z-20 cursor-pointer transform hover:scale-105 transition-transform"
            >
              <img src={SAMPLE_IMAGES.ananya} alt="Ananya" className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-purple-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Star className="w-3 h-3 fill-white" /> Top Creator
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold">Ananya Sharma</span>
                      <span className="text-purple-400 text-xs">✓</span>
                    </div>
                    <span className="text-xs text-slate-300">Fashion & Lifestyle</span>
                  </div>
                  <Lock className="w-4 h-4 text-white/80" />
                </div>
              </div>
            </div>

            {/* Top Left Card */}
            <div className="absolute top-2 left-6 w-48 h-60 rounded-2xl overflow-hidden border-2 border-white shadow-xl transform -rotate-12 z-10 hidden sm:block">
              <img src={SAMPLE_IMAGES.rohit} alt="Rohit" className="w-full h-full object-cover" />
            </div>

            {/* Top Right Card */}
            <div className="absolute top-6 right-6 w-48 h-60 rounded-2xl overflow-hidden border-2 border-white shadow-xl transform rotate-12 z-10 hidden sm:block">
              <img src={SAMPLE_IMAGES.arjun} alt="Arjun" className="w-full h-full object-cover" />
            </div>

            {/* Join Fans Avatar Pill */}
            <div className="absolute bottom-4 z-30 bg-white/90 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-full shadow-lg flex items-center gap-3">
              <div className="flex -space-x-2">
                <img src={SAMPLE_IMAGES.ananya} className="w-6 h-6 rounded-full border border-white" />
                <img src={SAMPLE_IMAGES.meera} className="w-6 h-6 rounded-full border border-white" />
                <img src={SAMPLE_IMAGES.karan} className="w-6 h-6 rounded-full border border-white" />
              </div>
              <div className="text-xs font-bold text-slate-900">
                Join <strong className="text-purple-600">500K+</strong> Happy Fans
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Icons Selector Bar */}
      <section className="bg-white border-y border-slate-200/80 py-4 px-6 lg:px-12">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          {[
            { label: 'All', icon: Sparkles, active: true },
            { label: 'Fitness', icon: Dumbbell },
            { label: 'Fashion', icon: Shirt },
            { label: 'Gaming', icon: Gamepad2 },
            { label: 'Travel', icon: Plane },
            { label: 'Music', icon: Music },
            { label: 'Art', icon: Palette },
            { label: 'Education', icon: GraduationCap },
            { label: 'Business', icon: Briefcase },
            { label: 'Lifestyle', icon: Camera },
            { label: 'More', icon: MoreHorizontal },
          ].map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectScreen('explore')}
                className={`flex flex-col items-center gap-1.5 min-w-[70px] py-2 px-3 rounded-2xl transition-all ${
                  cat.active 
                    ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-500/20' 
                    : 'text-slate-600 hover:bg-slate-100 font-semibold'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Top Creators Showcase Section */}
      <section className="py-12 px-6 lg:px-12 max-w-[1600px] mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              Top Creators <Star className="w-5 h-5 text-purple-600 fill-purple-600" />
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Discover the most loved creators on Creavora this week.
            </p>
          </div>
          <button onClick={() => onSelectScreen('explore')} className="btn-secondary text-xs font-bold py-1.5 px-4 rounded-full flex items-center gap-1">
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {CREATORS.slice(0, 4).map((c) => (
            <div 
              key={c.id} 
              onClick={() => onSelectScreen('influencer')}
              className="card p-4 rounded-3xl space-y-3 hover:shadow-xl transition-all cursor-pointer group bg-white border border-slate-200/80"
            >
              <div className="relative h-56 rounded-2xl overflow-hidden">
                <img src={c.avatar} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-between">
                  <span className="self-end bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {c.subscribers} Subscribers
                  </span>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-extrabold text-white">{c.name}</span>
                      <span className="text-purple-400 text-xs">✓</span>
                    </div>
                    <span className="text-xs text-slate-300 font-medium">{c.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-black text-slate-900">₹{c.pricePerMonth}/mo</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onSelectScreen('payment'); }}
                  className="btn-primary py-1.5 px-4 text-xs font-bold rounded-xl"
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
