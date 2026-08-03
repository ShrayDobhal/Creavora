import React, { useState } from 'react';
import { 
  Radio, 
  Users, 
  Play, 
  Heart, 
  MessageSquare, 
  Send, 
  Gift, 
  Share2, 
  Volume2, 
  Maximize2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { CREATORS, SAMPLE_IMAGES } from '../data/mockData';
import { ScreenId } from '../components/layout/Navbar';

interface LiveNowScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const LiveNowScreen: React.FC<LiveNowScreenProps> = ({ onSelectScreen }) => {
  const [chatMessages, setChatMessages] = useState([
    { user: 'Rohan_M', text: 'Ananya you look so amazing! 🔥', time: '10:32' },
    { user: 'Sneha_I', text: 'Loved the dress from yesterday vlog!! 👗', time: '10:33' },
    { user: 'Priya_P', text: 'Sent 100 Gems! 💎', isGift: true, time: '10:34' },
    { user: 'Arjun_V', text: 'When is the next Q&A? 🚀', time: '10:35' },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleSendChat = () => {
    if (!inputMsg.trim()) return;
    setChatMessages(prev => [...prev, { user: 'You', text: inputMsg, time: 'Just now' }]);
    setInputMsg('');
  };

  const featuredStreamer = CREATORS[0]; // Ananya Sharma

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Live Now Hub</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Watch live streams, chat with creators in real-time, and send rewards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-live text-xs py-1 px-3">
            <span className="badge-live-pulse"></span>
            24 LIVE STREAMS
          </span>
        </div>
      </div>

      {/* Main Featured Live Stream Player Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Featured Live Video Player Column (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl h-[420px] sm:h-[480px]">
            {/* Background Stream Video / Photo */}
            <img src={SAMPLE_IMAGES.ananyaCover} alt="Live Stream" className="w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40"></div>

            {/* Top Bar Overlays */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <img src={featuredStreamer.avatar} alt="Ananya" className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">{featuredStreamer.name}</span>
                    <span className="text-purple-400 text-xs">✓</span>
                  </div>
                  <span className="text-[10px] text-purple-200 font-medium">Fashion & Lifestyle Q&A</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  LIVE
                </span>
                <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-300" />
                  1,248 Viewers
                </span>
              </div>
            </div>

            {/* Center Play Pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-xl shadow-purple-600/50 cursor-pointer hover:scale-110 transition-transform">
                <Play className="w-7 h-7 fill-white translate-x-0.5" />
              </div>
            </div>

            {/* Bottom Controls Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10 text-white">
              <div className="flex items-center gap-4 text-xs font-bold">
                <button className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl hover:bg-black/80">
                  <Volume2 className="w-4 h-4" />
                  <span>Audio On</span>
                </button>
                <span className="text-slate-300 font-mono">01:42:15</span>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => onSelectScreen('payment')} className="btn-primary py-1.5 px-4 text-xs font-bold rounded-full">
                  Send Tip 💖
                </button>
                <button className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Live Chat Panel Column (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between h-[420px] sm:h-[480px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Live Chat</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400">Stream #104</span>
            </div>

            {/* Messages Scroll Area */}
            <div className="space-y-3 py-3 overflow-y-auto max-h-[340px] scrollbar-none">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`p-2 rounded-xl text-xs ${msg.isGift ? 'bg-purple-50 border border-purple-100' : 'bg-slate-50'}`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-slate-900 text-[11px]">{msg.user}</span>
                    <span className="text-[9px] text-slate-400">{msg.time}</span>
                  </div>
                  <p className={`font-medium ${msg.isGift ? 'text-purple-700 font-bold' : 'text-slate-700'}`}>
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <input 
              type="text" 
              value={inputMsg} 
              onChange={(e) => setInputMsg(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Say something live..." 
              className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
            <button onClick={handleSendChat} className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Other Active Streams Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Explore Active Live Streams</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CREATORS.map((creator) => (
            <div 
              key={creator.id}
              onClick={() => onSelectScreen('influencer')}
              className="relative rounded-2xl overflow-hidden h-48 border border-slate-200 shadow-sm cursor-pointer group hover:shadow-lg transition-all"
            >
              <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="bg-red-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  LIVE
                </span>
                <span className="bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  👁 {creator.liveViewers || '450'}
                </span>
              </div>

              <div className="absolute bottom-2 left-2 right-2 text-white">
                <span className="text-xs font-bold block truncate">{creator.name}</span>
                <span className="text-[10px] text-slate-300 font-medium">{creator.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
