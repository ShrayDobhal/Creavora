import React from 'react';
import { Bell, Heart, MessageSquare, Radio, Sparkles, Check } from 'lucide-react';
import { SAMPLE_IMAGES } from '../data/mockData';
import { ScreenId } from '../components/layout/Navbar';

interface NotificationsScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onSelectScreen }) => {
  const notifications = [
    { id: 1, type: 'live', user: 'Ananya Sharma', text: 'is live now: "Sunday Fashion & Lifestyle Q&A!"', time: '5m ago', avatar: SAMPLE_IMAGES.ananya },
    { id: 2, type: 'like', user: 'Rohit Gamer', text: 'liked your comment on "Boss Fight Walkthrough"', time: '1h ago', avatar: SAMPLE_IMAGES.rohit },
    { id: 3, type: 'post', user: 'Meera Art', text: 'published new exclusive content for subscribers', time: '3h ago', avatar: SAMPLE_IMAGES.meera },
    { id: 4, type: 'comment', user: 'Wander With Karan', text: 'replied to your question: "Loved Himachal recommendation!"', time: '5h ago', avatar: SAMPLE_IMAGES.karan },
  ];

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Notifications</h1>
        </div>
        <button className="text-xs font-bold text-purple-600 hover:underline">Mark all as read</button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between shadow-2xs hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <img src={n.avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100" />
              <div>
                <span className="text-xs font-bold text-slate-900">{n.user} </span>
                <span className="text-xs text-slate-600 font-medium">{n.text}</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{n.time}</span>
              </div>
            </div>
            <button onClick={() => onSelectScreen('influencer')} className="btn-secondary py-1 px-3 text-xs font-bold rounded-xl">
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
