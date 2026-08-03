import React, { useState } from 'react';
import { 
  Upload, 
  Image, 
  Video, 
  Film, 
  Radio, 
  Mic, 
  FileText, 
  BarChart2, 
  Clock, 
  Filter, 
  ChevronDown, 
  Heart, 
  MessageCircle, 
  CheckCircle2, 
  Calendar, 
  FolderPlus, 
  Sparkles 
} from 'lucide-react';
import { SAMPLE_IMAGES } from '../data/mockData';
import { ScreenId } from '../components/layout/Navbar';

interface CreatorDashboardScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const CreatorDashboardScreen: React.FC<CreatorDashboardScreenProps> = ({ onSelectScreen }) => {
  const [activeTab, setActiveTab] = useState('My Content');
  const [contentFilter, setContentFilter] = useState('All');

  const uploadTypes = [
    { title: 'Photo', subtitle: 'JPG, PNG, HEIC', icon: Image, color: 'bg-purple-100 text-purple-600' },
    { title: 'Video', subtitle: 'MP4, MOV, AVI', icon: Video, color: 'bg-indigo-100 text-indigo-600' },
    { title: 'Reel / Short', subtitle: '15s - 60s videos', icon: Film, color: 'bg-pink-100 text-pink-600' },
    { title: 'Live Stream', subtitle: 'Go live with fans', icon: Radio, color: 'bg-red-100 text-red-600' },
    { title: 'Audio', subtitle: 'MP3, WAV, M4A', icon: Mic, color: 'bg-amber-100 text-amber-600' },
    { title: 'Document', subtitle: 'PDF, DOC, PPT', icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { title: 'Poll', subtitle: 'Ask your audience', icon: BarChart2, color: 'bg-emerald-100 text-emerald-600' },
    { title: 'Story', subtitle: '24h disappearing', icon: Clock, color: 'bg-violet-100 text-violet-600' },
  ];

  const contentItems = [
    {
      id: '1',
      title: 'Behind the scenes from today\'s photoshoot 📸',
      type: 'Photo',
      typeBadge: 'bg-purple-100 text-purple-700',
      date: 'May 16, 2024 • 10:30 AM',
      status: 'Published',
      visibility: 'Visible to Subscribers',
      likes: '1.2K',
      comments: '128',
      image: SAMPLE_IMAGES.post1
    },
    {
      id: '2',
      title: 'GRWM for a party 💄✨',
      type: 'Video',
      typeBadge: 'bg-indigo-100 text-indigo-700',
      duration: '08:45',
      date: 'May 15, 2024 • 08:15 PM',
      status: 'Published',
      visibility: 'Visible to Subscribers',
      likes: '2.4K',
      comments: '210',
      image: SAMPLE_IMAGES.post2
    },
    {
      id: '3',
      title: 'Quick beach look reel ☀️',
      type: 'Reel',
      typeBadge: 'bg-pink-100 text-pink-700',
      duration: '01:02',
      date: 'May 14, 2024 • 05:45 PM',
      status: 'Published',
      visibility: 'Public',
      likes: '3.1K',
      comments: '156',
      image: SAMPLE_IMAGES.post3
    },
    {
      id: '4',
      title: 'My Sunday playlist 🎵',
      type: 'Audio',
      typeBadge: 'bg-amber-100 text-amber-700',
      duration: '12:36',
      date: 'May 13, 2024 • 11:20 AM',
      status: 'Published',
      visibility: 'Visible to Subscribers',
      likes: '842',
      comments: '72',
      image: SAMPLE_IMAGES.ananyaCover
    },
    {
      id: '5',
      title: 'What content do you want next?',
      type: 'Poll',
      typeBadge: 'bg-emerald-100 text-emerald-700',
      date: 'May 12, 2024 • 09:00 PM',
      status: 'Published',
      visibility: 'Visible to Subscribers',
      likes: '1.8K votes',
      comments: '0',
      image: SAMPLE_IMAGES.artStudio
    },
  ];

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Content</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Upload and manage your content for your amazing subscribers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-primary py-2 px-5 text-xs font-bold rounded-xl flex items-center gap-2 shadow-md">
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 text-xs font-bold">
        {['My Content', 'Collections', 'Scheduled', 'Drafts'].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === t
                ? 'border-purple-600 text-purple-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Upload New Content Grid */}
      <div className="card p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Upload New Content</h3>
            <p className="text-xs text-slate-400">Choose the type of content you want to upload</p>
          </div>
          <button className="btn-secondary text-xs font-semibold py-1.5 px-3 rounded-xl flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk Upload</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {uploadTypes.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="flex flex-col items-center justify-center text-center p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 cursor-pointer transition-all group"
              >
                <div className={`w-10 h-10 rounded-2xl ${item.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">{item.title}</span>
                <span className="text-[9px] font-medium text-slate-400 mt-0.5">{item.subtitle}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left 8 Cols (Your Content Table), Right 4 Cols (Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Your Content Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900">Your Content</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {['All', 'Photos', 'Videos', 'Audios', 'Documents', 'Polls', 'Live'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setContentFilter(f)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                      contentFilter === f
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content List Items */}
          <div className="space-y-3">
            {contentItems.map((item) => (
              <div key={item.id} className="card p-3 rounded-2xl flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="relative w-20 h-14 rounded-xl overflow-hidden shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    {item.duration && (
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1 rounded">
                        {item.duration}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 leading-tight">{item.title}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${item.typeBadge}`}>
                        {item.type}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{item.date}</span>
                    <div className="flex items-center gap-3 text-[10px] text-emerald-600 font-bold mt-1">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {item.status}
                      </span>
                      <span className="text-slate-400 font-normal">• {item.visibility}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs font-bold text-slate-600 shrink-0">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-pink-500" />
                    {item.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-purple-500" />
                    {item.comments}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Overview & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Content Overview Widget */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Content Overview</h3>
              <span className="text-xs text-slate-400 font-semibold">This Month</span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { label: 'Total Posts', count: 48, icon: FileText },
                { label: 'Photos', count: 22, icon: Image },
                { label: 'Videos', count: 16, icon: Video },
                { label: 'Audios', count: 5, icon: Mic },
                { label: 'Documents', count: 3, icon: FileText },
                { label: 'Live Streams', count: 2, icon: Radio },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold text-slate-700">{stat.label}</span>
                    </div>
                    <span className="font-extrabold text-slate-900">{stat.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Widget */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Schedule Post', desc: 'Plan your content', icon: Calendar },
                { label: 'Create Collection', desc: 'Organize your content', icon: FolderPlus },
                { label: 'Go Live', desc: 'Connect with fans', icon: Radio },
                { label: 'Post a Story', desc: 'Share a quick update', icon: Clock },
              ].map((act, i) => {
                const Icon = act.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{act.label}</span>
                      <span className="text-[10px] text-slate-400">{act.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Growth Checklist Widget */}
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4 space-y-3 bg-purple-50/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Tips to Grow</h3>
            </div>
            <div className="space-y-2.5 text-xs font-semibold text-slate-700">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Post regularly</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Keep your audience engaged</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Go live more often</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Live sessions get more love</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Use polls & stories</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Increase interaction</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Engage in DMs</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Build stronger relationships</span>
              </div>
            </div>
            <div className="pt-2 border-t border-purple-100">
              <button className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1">
                <span>View All Tips</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
