import { Navigate, Route, Routes } from "react-router-dom";
import FanLayout from "./layouts/FanLayout.jsx";
import CreatorLayout from "./layouts/CreatorLayout.jsx";
import Landing from "./pages/Landing.jsx";
import Home from "./pages/Home.jsx";
import Feed from "./pages/Feed.jsx";
import Explore from "./pages/Explore.jsx";
import Profile from "./pages/Profile.jsx";
import CreatorProfile from "./pages/CreatorProfile.jsx";
import Messages from "./pages/Messages.jsx";
import Checkout from "./pages/Checkout.jsx";
import StudioContent from "./pages/StudioContent.jsx";
import StudioEarnings from "./pages/StudioEarnings.jsx";
import StudioCommunity from "./pages/StudioCommunity.jsx";
import Placeholder from "./pages/Placeholder.jsx";
import LiveNow from "./pages/LiveNow.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import Notifications from "./pages/Notifications.jsx";
import Collections from "./pages/Collections.jsx";
import Wallet from "./pages/Wallet.jsx";
import Rewards from "./pages/Rewards.jsx";
import SavedPosts from "./pages/SavedPosts.jsx";
import Settings from "./pages/Settings.jsx";


const fan = (element, topbar) => <FanLayout topbar={topbar}>{element}</FanLayout>;
const studio = (element, topbar) => (
  <CreatorLayout topbar={topbar}>{element}</CreatorLayout>
);

export default function App() {
  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />

      <Route path="/" element={fan(<Home />, { coins: null })} />
      <Route path="/feed" element={fan(<Feed />, { greeting: false })} />
      <Route
        path="/explore"
        element={fan(<Explore />, {
          placeholder: "Search creators, posts, categories, topics...",
        })}
      />
      <Route path="/profile" element={fan(<Profile />)} />
      <Route path="/creator/:handle" element={fan(<CreatorProfile />)} />
      <Route
        path="/messages"
        element={fan(<Messages />, { placeholder: "Search creators, posts, messages..." })}
      />

      <Route path="/checkout" element={<Checkout />} />

      <Route path="/studio" element={<Navigate to="/studio/content" replace />} />
      <Route path="/studio/content" element={studio(<StudioContent />)} />
      <Route
        path="/studio/earnings"
        element={studio(<StudioEarnings />, {
          title: "Earnings",
          subtitle: "Track your earnings, transactions and payouts",
          coins: null,
          right: (
            <button className="flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-[14px] font-bold text-white hover:bg-brand-700">
              Payout Settings
            </button>
          ),
        })}
      />
      <Route
        path="/studio/community"
        element={studio(<StudioCommunity />, {
          placeholder: "Search in community...",
          createLabel: "Create Post",
          coins: null,
        })}
      />

      {/* sidebar entries with their own custom pages */}
      <Route path="/live" element={fan(<LiveNow />)} />
      <Route path="/subscriptions" element={fan(<Subscriptions />)} />
      <Route path="/notifications" element={fan(<Notifications />)} />
      <Route path="/collections" element={fan(<Collections />)} />
      <Route path="/wallet" element={fan(<Wallet />)} />
      <Route path="/rewards" element={fan(<Rewards />)} />
      <Route path="/saved" element={fan(<SavedPosts />)} />
      <Route path="/settings" element={fan(<Settings />)} />
      {[
        "/studio/live",
        "/studio/messages",
        "/studio/subscribers",
        "/studio/analytics",
        "/studio/payouts",
        "/studio/promotions",
        "/studio/settings",
      ].map((path) => (
        <Route key={path} path={path} element={studio(<Placeholder />)} />
      ))}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
