import React, { useState } from 'react';
import { Navbar, ScreenId } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { HomeScreen } from './screens/HomeScreen';
import { FeedScreen } from './screens/FeedScreen';
import { ExploreScreen } from './screens/ExploreScreen';
import { CreatorDashboardScreen } from './screens/CreatorDashboardScreen';
import { CreatorCommunityScreen } from './screens/CreatorCommunityScreen';
import { CreatorEarningScreen } from './screens/CreatorEarningScreen';
import { InfluencerScreen } from './screens/InfluencerScreen';
import { MessageScreen } from './screens/MessageScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { PaymentScreen } from './screens/PaymentScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { X, Image, Video, Radio, BarChart2 } from 'lucide-react';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isCreatorView = ['dashboard', 'earnings'].includes(currentScreen);
  const isFullStandalonePage = ['onboarding', 'payment'].includes(currentScreen);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onSelectScreen={setCurrentScreen} />;
      case 'feed':
        return <FeedScreen onSelectScreen={setCurrentScreen} />;
      case 'explore':
        return <ExploreScreen onSelectScreen={setCurrentScreen} />;
      case 'dashboard':
        return <CreatorDashboardScreen onSelectScreen={setCurrentScreen} />;
      case 'community':
        return <CreatorCommunityScreen onSelectScreen={setCurrentScreen} />;
      case 'earnings':
        return <CreatorEarningScreen onSelectScreen={setCurrentScreen} />;
      case 'influencer':
        return <InfluencerScreen onSelectScreen={setCurrentScreen} />;
      case 'messages':
        return <MessageScreen onSelectScreen={setCurrentScreen} />;
      case 'onboarding':
        return <OnboardingScreen onSelectScreen={setCurrentScreen} />;
      case 'payment':
        return <PaymentScreen onSelectScreen={setCurrentScreen} />;
      case 'profile':
        return <ProfileScreen onSelectScreen={setCurrentScreen} />;
      default:
        return <HomeScreen onSelectScreen={setCurrentScreen} />;
    }
  };

  if (isFullStandalonePage) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        {/* Floating Demo Screen Switcher Bar for standalone pages */}
        <div className="bg-slate-900 text-white text-xs py-2 px-4 flex items-center justify-between shadow-md sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span className="font-extrabold text-purple-300 uppercase tracking-wider text-[10px]">Creavora Demo Navigation</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-semibold hidden sm:inline">Switch View:</span>
            <select
              value={currentScreen}
              onChange={(e) => setCurrentScreen(e.target.value as ScreenId)}
              className="bg-slate-800 text-purple-300 font-bold px-3 py-1 rounded-lg border border-slate-700 text-xs focus:outline-none cursor-pointer"
            >
              <option value="home">1. Home Screen</option>
              <option value="feed">2. Feed Screen</option>
              <option value="explore">3. Explore Screen</option>
              <option value="dashboard">4. Creator Dashboard</option>
              <option value="community">5. Creator Community</option>
              <option value="earnings">6. Creator Earnings</option>
              <option value="influencer">7. Influencer Profile</option>
              <option value="messages">8. Messages Screen</option>
              <option value="onboarding">9. Onboarding / Landing</option>
              <option value="payment">10. Payment & Checkout</option>
              <option value="profile">11. User Profile</option>
            </select>
          </div>
        </div>

        {renderScreen()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans antialiased">
      {/* Navbar */}
      <Navbar 
        currentScreen={currentScreen} 
        onSelectScreen={setCurrentScreen}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex items-start">
        {/* Left Sidebar - Sticky Pinned */}
        <Sidebar 
          currentScreen={currentScreen} 
          onSelectScreen={setCurrentScreen}
          isCreatorMode={isCreatorView}
        />

        {/* Content Area - Smooth Scroll */}
        <main className="flex-1 min-w-0 pb-16">
          {renderScreen()}
        </main>
      </div>

      {/* Global Quick Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card w-full max-w-lg p-6 rounded-3xl space-y-4 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Create New Post / Content</h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={4}
              placeholder="What exclusive content are you sharing today?"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-medium"
            />

            <div className="grid grid-cols-4 gap-2 text-xs font-bold">
              <button className="p-3 rounded-xl bg-purple-50 text-purple-700 flex flex-col items-center gap-1 hover:bg-purple-100">
                <Image className="w-5 h-5" /> Photo
              </button>
              <button className="p-3 rounded-xl bg-indigo-50 text-indigo-700 flex flex-col items-center gap-1 hover:bg-indigo-100">
                <Video className="w-5 h-5" /> Video
              </button>
              <button className="p-3 rounded-xl bg-pink-50 text-pink-700 flex flex-col items-center gap-1 hover:bg-pink-100">
                <Radio className="w-5 h-5" /> Go Live
              </button>
              <button className="p-3 rounded-xl bg-emerald-50 text-emerald-700 flex flex-col items-center gap-1 hover:bg-emerald-100">
                <BarChart2 className="w-5 h-5" /> Poll
              </button>
            </div>

            <button 
              onClick={() => {
                setIsCreateModalOpen(false);
                setCurrentScreen('feed');
              }}
              className="w-full btn-primary py-2.5 text-xs font-extrabold rounded-xl justify-center"
            >
              Publish Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
