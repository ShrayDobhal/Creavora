import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Heart, MessageSquare, Sparkles, CheckCheck, Trash2, Coins, UserPlus } from "lucide-react";
import { Card } from "../ui/Bits.jsx";
import { Avatar, Verified } from "../ui/Media.jsx";

const initialNotifications = [
  {
    id: 1,
    type: "live",
    user: "Ananya Sharma",
    text: "went live: 'Sunday Morning Styling Q&A! ✨'",
    time: "5 minutes ago",
    unread: true,
    link: "/live",
  },
  {
    id: 2,
    type: "coin",
    user: "System",
    text: "You earned 50 XP for Daily Login!",
    time: "2 hours ago",
    unread: true,
    link: "/rewards",
  },
  {
    id: 3,
    type: "like",
    user: "Rohit Gamer",
    text: "liked your comment on his post.",
    time: "4 hours ago",
    unread: false,
    link: "/feed",
  },
  {
    id: 4,
    type: "comment",
    user: "Meera Art",
    text: "replied to your comment: 'Thank you for supporting!'",
    time: "1 day ago",
    unread: false,
    link: "/feed",
  },
  {
    id: 5,
    type: "subscription",
    user: "Fit With Neha",
    text: "posted a new exclusive video: 'Quick abs workout!'",
    time: "2 days ago",
    unread: false,
    link: "/creator/fit-with-neha",
  },
];

export default function Notifications() {
  const [items, setItems] = useState(initialNotifications);

  const handleMarkAllRead = () => {
    setItems(items.map((i) => ({ ...i, unread: false })));
  };

  const handleClearAll = () => {
    setItems([]);
  };

  const handleRemove = (id) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const iconFor = (type) => {
    switch (type) {
      case "live":
        return <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse mt-1" />;
      case "like":
        return <Heart size={15} className="fill-rose-500 text-rose-500 mt-1" />;
      case "comment":
        return <MessageSquare size={15} className="text-sky-500 mt-1" />;
      case "coin":
        return <Sparkles size={15} className="fill-brand-500 text-brand-500 mt-1" />;
      default:
        return <Bell size={15} className="text-muted mt-1" />;
    }
  };

  return (
    <div className="max-w-[760px] mx-auto px-6 py-6 min-h-[calc(100vh-72px)] bg-canvas">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[25px] font-extrabold tracking-tight flex items-center gap-2">
            <Bell className="text-brand-600" size={24} /> Notifications
          </h1>
          <p className="text-[14px] text-muted">Stay updated with your creators, rewards and activity</p>
        </div>

        {items.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleMarkAllRead}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 text-[12.5px] font-bold hover:bg-canvas text-ink"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
            <button
              onClick={handleClearAll}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 text-[12.5px] font-bold hover:bg-rose-50 text-rose-600"
            >
              <Trash2 size={14} /> Clear all
            </button>
          </div>
        )}
      </div>

      {items.length > 0 ? (
        <Card className="divide-y divide-line overflow-hidden">
          {items.map((it) => (
            <div
              key={it.id}
              className={`p-4 flex items-start justify-between gap-3 transition ${
                it.unread ? "bg-brand-50/40" : "hover:bg-canvas/50"
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {iconFor(it.type)}
                {it.user !== "System" ? (
                  <Avatar name={it.user} size={38} />
                ) : (
                  <span className="grid h-[38px] w-[38px] place-items-center rounded-full bg-brand-100 text-brand-600">
                    <Sparkles size={18} />
                  </span>
                )}
                <div className="min-w-0 leading-tight">
                  <p className="text-[13.5px] text-ink leading-relaxed">
                    {it.user !== "System" && (
                      <span className="font-bold inline-flex items-center gap-0.5 mr-1 text-ink">
                        {it.user} {it.user !== "System" && <Verified size={11} />}
                      </span>
                    )}
                    {it.text}
                  </p>
                  <p className="mt-1 text-[11.5px] text-muted font-medium">{it.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {it.link && (
                  <Link
                    to={it.link}
                    className="h-8 rounded-lg bg-brand-600 px-3.5 text-[12.0px] font-bold text-white hover:bg-brand-700 flex items-center justify-center"
                  >
                    View
                  </Link>
                )}
                <button
                  onClick={() => handleRemove(it.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg hover:bg-canvas text-muted hover:text-ink/80"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </Card>
      ) : (
        <div className="py-16 text-center bg-white rounded-2xl border border-line mt-4">
          <Bell className="mx-auto text-muted/60 mb-3" size={36} />
          <p className="text-[15.5px] font-extrabold text-ink">Inbox is clean!</p>
          <p className="text-[13px] text-muted mt-1">You will receive alerts here when creators post updates or interact with you</p>
        </div>
      )}
    </div>
  );
}
