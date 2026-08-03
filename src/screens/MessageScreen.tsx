import React, { useState } from 'react';
import { 
  Search, 
  SquarePen, 
  Phone, 
  Video, 
  Star, 
  Info, 
  Paperclip, 
  Smile, 
  Mic, 
  Send, 
  Play, 
  Pause, 
  Bell, 
  VolumeX, 
  Trash2, 
  Ban, 
  CheckCheck, 
  Heart,
  ChevronRight
} from 'lucide-react';
import { CHAT_CONTACTS, DIRECT_MESSAGES, SAMPLE_IMAGES } from '../data/mockData';
import { ScreenId } from '../components/layout/Navbar';

interface MessageScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const MessageScreen: React.FC<MessageScreenProps> = ({ onSelectScreen }) => {
  const [activeContactId, setActiveContactId] = useState('ch1');
  const [chatFilter, setChatFilter] = useState('All');
  const [messages, setMessages] = useState(DIRECT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const activeContact = CHAT_CONTACTS.find(c => c.id === activeContactId) || CHAT_CONTACTS[0];

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg = {
      id: `m_${Date.now()}`,
      senderId: 'user',
      text: inputText,
      timestamp: 'Just now',
      isMe: true,
      isRead: false
    };
    setMessages([...messages, newMsg]);
    setInputText('');
  };

  return (
    <div className="flex-1 p-4 lg:p-6 max-w-[1600px] mx-auto">
      <div className="card p-0 rounded-3xl overflow-hidden shadow-md flex h-[calc(100vh-120px)] border border-slate-200">
        
        {/* Left Column: Conversations List */}
        <div className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Messages</h2>
            <button className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-100">
              <SquarePen className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-slate-100">
            <div className="flex items-center bg-slate-100 rounded-full px-3 py-2 text-xs">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="bg-transparent w-full focus:outline-none text-slate-800"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 p-3 border-b border-slate-100 text-xs font-bold">
            {['All', 'Unread', 'Groups'].map((tab) => (
              <button
                key={tab}
                onClick={() => setChatFilter(tab)}
                className={`px-3 py-1 rounded-full transition-colors ${
                  chatFilter === tab 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab} {tab === 'Unread' && <span className="bg-white text-purple-600 text-[10px] px-1 rounded-full ml-1">2</span>}
              </button>
            ))}
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {CHAT_CONTACTS.map((contact) => {
              const isActive = contact.id === activeContactId;
              return (
                <div
                  key={contact.id}
                  onClick={() => setActiveContactId(contact.id)}
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isActive ? 'bg-purple-50/70 border-l-4 border-purple-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="relative shrink-0">
                      <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full object-cover" />
                      {contact.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">{contact.name}</span>
                        {contact.verified && <span className="text-purple-600 text-[10px]">✓</span>}
                      </div>
                      <span className="text-[11px] text-slate-500 truncate block">{contact.lastMessage}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                    <span className="text-[10px] text-slate-400 font-semibold">{contact.lastTime}</span>
                    {contact.unreadCount > 0 && (
                      <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle Column: Active Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50/50">
          {/* Chat Header */}
          <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={activeContact.avatar} alt={activeContact.name} className="w-10 h-10 rounded-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-slate-900">{activeContact.name}</span>
                  <span className="text-purple-600 text-xs">✓</span>
                </div>
                <span className="text-[10px] font-medium text-emerald-600">Online</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-500">
              <button className="p-2 hover:bg-slate-100 rounded-full"><Phone className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-slate-100 rounded-full"><Video className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-slate-100 rounded-full"><Star className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-slate-100 rounded-full"><Info className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-200/60 px-3 py-1 rounded-full">
                Today
              </span>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-md ${msg.isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {!msg.isMe && (
                  <img src={activeContact.avatar} className="w-8 h-8 rounded-full object-cover shrink-0" />
                )}

                <div className="space-y-1">
                  {msg.text && (
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-medium ${
                      msg.isMe 
                        ? 'bg-purple-600 text-white rounded-br-2xs shadow-md' 
                        : 'bg-white text-slate-800 rounded-bl-2xs border border-slate-200/80 shadow-2xs'
                    }`}>
                      {msg.text}
                    </div>
                  )}

                  {/* Audio Voice Note Bubble */}
                  {msg.audioDuration && (
                    <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3 w-64">
                      <button 
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0"
                      >
                        {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
                      </button>

                      {/* Visual Waveform Representation */}
                      <div className="flex-1 flex items-center gap-0.5 h-6">
                        {[40, 70, 30, 90, 50, 80, 100, 40, 60, 80, 50, 30, 70, 90, 40].map((h, idx) => (
                          <span key={idx} className="w-1 bg-purple-300 rounded-full" style={{ height: `${h}%` }}></span>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{msg.audioDuration}</span>
                    </div>
                  )}

                  <div className={`flex items-center gap-1 text-[10px] text-slate-400 font-semibold ${msg.isMe ? 'justify-end' : ''}`}>
                    <span>{msg.timestamp}</span>
                    {msg.isMe && <CheckCheck className="w-3.5 h-3.5 text-purple-600" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-purple-600"><Paperclip className="w-4 h-4" /></button>
            <button className="p-2 text-slate-400 hover:text-purple-600"><Smile className="w-4 h-4" /></button>
            <button className="p-2 text-slate-400 hover:text-purple-600"><Mic className="w-4 h-4" /></button>
            
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..." 
              className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
            
            <button 
              onClick={handleSend}
              className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/30 hover:bg-purple-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Contact Info Drawer */}
        <div className="w-72 border-l border-slate-200 bg-white p-4 space-y-6 shrink-0 hidden xl:block overflow-y-auto">
          {/* User Preview Card */}
          <div className="flex flex-col items-center text-center space-y-2">
            <img src={activeContact.avatar} className="w-20 h-20 rounded-full object-cover border-2 border-purple-300" />
            <div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-sm font-bold text-slate-900">{activeContact.name}</span>
                <span className="text-purple-600 text-xs">✓</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">{activeContact.handle}</span>
            </div>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
              {activeContact.category}
            </span>

            <div className="flex justify-around w-full pt-2 border-t border-slate-100 text-center">
              <div>
                <span className="text-xs font-bold text-slate-900 block">{activeContact.posts}</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">Posts</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">{activeContact.followers}</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">Followers</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">{activeContact.following}</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">Following</span>
              </div>
            </div>

            <button onClick={() => onSelectScreen('influencer')} className="w-full btn-secondary text-xs font-bold py-1.5 rounded-xl justify-center mt-2">
              View Profile
            </button>
          </div>

          {/* Shared Media */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-900">Media, Links & Files</span>
              <button className="text-purple-600 hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
              <img src={SAMPLE_IMAGES.post1} className="h-16 w-full object-cover" />
              <img src={SAMPLE_IMAGES.post2} className="h-16 w-full object-cover" />
              <img src={SAMPLE_IMAGES.post3} className="h-16 w-full object-cover" />
              <img src={SAMPLE_IMAGES.gamingSetup} className="h-16 w-full object-cover" />
              <img src={SAMPLE_IMAGES.travelBeach} className="h-16 w-full object-cover" />
              <img src={SAMPLE_IMAGES.ananyaCover} className="h-16 w-full object-cover" />
            </div>
          </div>

          {/* Action List */}
          <div className="space-y-2 text-xs font-semibold text-slate-700">
            <button className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50">
              <span className="flex items-center gap-2"><Search className="w-4 h-4 text-slate-400" /> Search in Conversation</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </button>
            <button className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50">
              <span className="flex items-center gap-2"><Bell className="w-4 h-4 text-slate-400" /> Notifications</span>
              <span className="w-8 h-4 rounded-full bg-purple-600 flex items-center px-0.5 justify-end"><span className="w-3 h-3 rounded-full bg-white"></span></span>
            </button>
            <button className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50">
              <span className="flex items-center gap-2"><VolumeX className="w-4 h-4 text-slate-400" /> Mute Conversation</span>
              <span className="w-8 h-4 rounded-full bg-slate-300 flex items-center px-0.5 justify-start"><span className="w-3 h-3 rounded-full bg-white"></span></span>
            </button>
            <button className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-rose-600">
              <span className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> Clear Chat</span>
            </button>
            <button className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-rose-600">
              <span className="flex items-center gap-2"><Ban className="w-4 h-4" /> Block User</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
