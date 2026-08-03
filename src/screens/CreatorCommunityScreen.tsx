import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Megaphone, 
  Calendar, 
  Trophy, 
  Image, 
  BarChart2, 
  Radio, 
  MoreVertical, 
  Heart, 
  Share2, 
  CheckCircle2, 
  Pin, 
  Plus,
  Filter
} from 'lucide-react';
import { COMMUNITY_THREADS, SAMPLE_IMAGES } from '../data/mockData';
import { ScreenId } from '../components/layout/Navbar';

interface CreatorCommunityScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const CreatorCommunityScreen: React.FC<CreatorCommunityScreenProps> = ({ onSelectScreen }) => {
  const [activeTab, setActiveTab] = useState('Feed');
  const [pollVotes, setPollVotes] = useState<number | null>(0);

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Creator Community</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            A place for creators to connect, share, learn and grow together.
          </p>
        </div>
        <button className="btn-primary py-2 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md">
          <Plus className="w-4 h-4" />
          <span>Create Post</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        {['Feed', 'Discussions', 'Announcements', 'Rooms', 'Events', 'Members', 'Leaderboard'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pill ${activeTab === tab ? 'pill-active' : 'pill-inactive'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Grid: 8 Cols (Composer & Threads), 4 Cols (Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Post Composer Widget */}
          <div className="card p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <img src={SAMPLE_IMAGES.ananya} alt="Ananya" className="w-10 h-10 rounded-full object-cover border border-purple-200" />
              <input 
                type="text" 
                placeholder="What's on your mind, Ananya?" 
                className="w-full bg-slate-50 rounded-full px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-200 border border-slate-100 font-medium"
              />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-slate-600">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 hover:text-purple-600">
                  <Image className="w-4 h-4 text-purple-500" />
                  <span>Photo / Video</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-purple-600">
                  <BarChart2 className="w-4 h-4 text-emerald-500" />
                  <span>Poll</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-purple-600">
                  <Radio className="w-4 h-4 text-pink-500" />
                  <span>Live Room</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-purple-600">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Event</span>
                </button>
              </div>
              <button className="btn-primary py-1.5 px-4 text-xs font-bold rounded-xl">
                Post
              </button>
            </div>
          </div>

          {/* Featured Pinned Announcement Card */}
          <div className="card p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/40 to-white border-purple-200/70 space-y-3 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">Featured Announcement</span>
                  <span className="text-[10px] text-slate-500">By Ananya Sharma • 2 days ago</span>
                </div>
              </div>
              <span className="bg-purple-100 text-purple-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Pin className="w-3 h-3" />
                Pinned
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900">Welcome to the Crevora Creator Community! 🎉</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              This is our space to support, collaborate and grow together. Feel free to introduce yourself and share your journey!
            </p>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-2 border-t border-purple-100">
              <div className="flex items-center gap-1">
                <img src={SAMPLE_IMAGES.ananya} className="w-5 h-5 rounded-full" />
                <img src={SAMPLE_IMAGES.rohit} className="w-5 h-5 rounded-full -ml-2 border border-white" />
                <img src={SAMPLE_IMAGES.meera} className="w-5 h-5 rounded-full -ml-2 border border-white" />
                <span className="text-[11px] text-slate-700 ml-1">128</span>
              </div>
              <span className="text-purple-700 font-bold hover:underline cursor-pointer">56 Comments</span>
            </div>
          </div>

          {/* All Posts Header */}
          <div className="flex items-center justify-between text-xs pt-2">
            <span className="text-sm font-black text-slate-900">All Posts</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-2xs">
                <span>Latest</span>
                <span className="text-[10px]">▾</span>
              </span>
              <button className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs">
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Community Thread 1 (Photos & Discussion) */}
          <div className="card p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={SAMPLE_IMAGES.nehaVerma} alt="Neha" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Neha Verma</span>
                    <span className="bg-purple-100 text-purple-700 text-[9px] font-extrabold px-1.5 py-0.2 rounded">Top Creator</span>
                  </div>
                  <span className="text-[10px] text-slate-400">1h ago</span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
            </div>

            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              Just finished my new photoshoot! 📸 Behind the scenes will be up on my exclusive soon. What type of content do you guys love the most?
            </p>

            <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden">
              <img src={SAMPLE_IMAGES.post1} className="h-44 w-full object-cover" />
              <img src={SAMPLE_IMAGES.post2} className="h-44 w-full object-cover" />
              <img src={SAMPLE_IMAGES.post3} className="h-44 w-full object-cover" />
            </div>

            <div className="flex items-center gap-6 text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
              <button className="flex items-center gap-1.5 hover:text-pink-600">
                <Heart className="w-4 h-4" />
                <span>45</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-purple-600">
                <MessageSquare className="w-4 h-4" />
                <span>32</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-purple-600">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Community Thread 2 (Interactive Poll) */}
          <div className="card p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={SAMPLE_IMAGES.riya} alt="Riya" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-tight">Riya Malhotra</span>
                  <span className="text-[10px] text-slate-400">3h ago</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              Let's talk about creator burnout. How do you stay consistent and take care of your mental health?
            </p>

            {/* Poll Options Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
              <span className="text-xs font-bold text-slate-900 block mb-1">How do you manage burnout?</span>
              {[
                { label: 'Take Breaks', pct: 60 },
                { label: 'Plan & Schedule', pct: 25 },
                { label: 'Meditation / Exercise', pct: 15 },
              ].map((opt, i) => (
                <div 
                  key={i}
                  onClick={() => setPollVotes(i)}
                  className="relative rounded-xl overflow-hidden bg-white border border-slate-200 p-2.5 cursor-pointer hover:border-purple-300 transition-colors"
                >
                  <div 
                    className="absolute top-0 bottom-0 left-0 bg-purple-100 transition-all duration-500" 
                    style={{ width: `${opt.pct}%` }}
                  ></div>
                  <div className="relative flex justify-between text-xs font-bold text-slate-800">
                    <span>{opt.label}</span>
                    <span className="text-purple-700">{opt.pct}%</span>
                  </div>
                </div>
              ))}
              <span className="text-[10px] text-slate-400 font-semibold block pt-1">120 votes</span>
            </div>

            <div className="flex items-center gap-6 text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
              <button className="flex items-center gap-1.5 hover:text-pink-600">
                <Heart className="w-4 h-4" />
                <span>38</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-purple-600">
                <MessageSquare className="w-4 h-4" />
                <span>27</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-purple-600">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Community Thread 3 (Kavya Intro) */}
          <div className="card p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={SAMPLE_IMAGES.kavya} alt="Kavya" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Kavya Singh</span>
                    <span className="bg-blue-100 text-blue-700 text-[9px] font-extrabold px-1.5 py-0.2 rounded">New Member</span>
                  </div>
                  <span className="text-[10px] text-slate-400">5h ago</span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
            </div>

            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              Hey everyone! I'm Kavya, a lifestyle creator from Jaipur. Excited to be here and learn from all of you! ✨
            </p>

            <div className="flex items-center gap-6 text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
              <button className="flex items-center gap-1.5 hover:text-pink-600">
                <Heart className="w-4 h-4" />
                <span>22</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-purple-600">
                <MessageSquare className="w-4 h-4" />
                <span>18</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-purple-600">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Community Thread 4 (Ananya Live Session Promo) */}
          <div className="card p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={SAMPLE_IMAGES.ananya} alt="Ananya" className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Ananya Sharma</span>
                    <span className="bg-purple-100 text-purple-700 text-[9px] font-extrabold px-1.5 py-0.2 rounded">Creator</span>
                  </div>
                  <span className="text-[10px] text-slate-400">1d ago</span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
            </div>

            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              We're going LIVE this Saturday at 7 PM IST 🎥 Topic: How I plan my content & stay productive. Don't miss it! 💜
            </p>

            {/* Event Promo Box matching Page 1 PDF */}
            <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-4 flex items-center justify-between shadow-lg">
              <div className="space-y-1">
                <span className="bg-purple-600/80 text-purple-200 text-[9px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  Live Session
                </span>
                <h4 className="text-sm font-bold text-white leading-tight">How I plan my content & stay productive</h4>
                <span className="text-[10px] text-slate-300 font-medium block">25 May, 7:00 PM IST</span>
              </div>

              <button className="btn-primary py-1.5 px-3 text-[10px] font-extrabold rounded-xl shrink-0 shadow-md">
                🔔 Remind Me
              </button>
            </div>

            <div className="flex items-center gap-6 text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
              <button className="flex items-center gap-1.5 hover:text-pink-600">
                <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                <span>89</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-purple-600">
                <MessageSquare className="w-4 h-4" />
                <span>61</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-purple-600">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Community Overview */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Community Overview</h3>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Total Members', count: '2,458', icon: Users },
                { label: 'Online Now', count: '124', icon: Users },
                { label: 'Posts Today', count: '87', icon: MessageSquare },
                { label: 'Total Discussions', count: '1,245', icon: MessageSquare },
              ].map((m, i) => {
                const Icon = m.icon;
                return (
                  <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold text-slate-700">{m.label}</span>
                    </div>
                    <span className="font-extrabold text-slate-900">{m.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Upcoming Events</h3>
              <button className="text-xs font-bold text-purple-600 hover:underline">View All</button>
            </div>
            <div className="space-y-2.5">
              {[
                { title: 'Live Q&A with Ananya', time: '25 May • 7:00 PM', status: 'Live' },
                { title: 'Content Planning Workshop', time: '28 May • 5:00 PM', status: 'Upcoming' },
                { title: 'Creator Networking Room', time: '29 May • 8:00 PM', status: 'Upcoming' },
              ].map((ev, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">{ev.title}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{ev.time}</span>
                  </div>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                    ev.status === 'Live' ? 'bg-purple-600 text-white' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {ev.status === 'Live' ? '• Live' : 'Upcoming'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Contributors Leaderboard */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Top Contributors</h3>
              <span className="text-xs font-semibold text-slate-400">This Month</span>
            </div>
            <div className="space-y-2.5">
              {[
                { name: 'Neha Verma', pts: '320 pts', avatar: SAMPLE_IMAGES.nehaVerma },
                { name: 'Riya Malhotra', pts: '280 pts', avatar: SAMPLE_IMAGES.riya },
                { name: 'Kavya Singh', pts: '210 pts', avatar: SAMPLE_IMAGES.kavya },
                { name: 'Sneha Iyer', pts: '150 pts', avatar: SAMPLE_IMAGES.neha },
                { name: 'Mehak Arora', pts: '120 pts', avatar: SAMPLE_IMAGES.sangeetika },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-amber-500 text-xs w-3">{i + 1}</span>
                    <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" />
                    <span className="font-bold text-slate-900">{user.name}</span>
                  </div>
                  <span className="font-extrabold text-purple-700">{user.pts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-2 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Community Guidelines</h3>
            <div className="space-y-1.5 text-slate-600 font-medium">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /><span>Be kind and respectful</span></div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /><span>No self-promotion or spam</span></div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /><span>Share value and support others</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
