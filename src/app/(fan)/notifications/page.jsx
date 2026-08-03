"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Heart, MessageSquare, Sparkles, CheckCheck, Trash2, ShieldAlert } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";
import { Avatar, Verified } from "@/ui/Media.jsx";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading notifications:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to mark notifications as read");

      // Refetch and alert updates
      fetchNotifications();
      window.dispatchEvent(new Event("notifications-update"));
      window.dispatchEvent(new Event("user-update"));
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearAll = () => {
    setItems([]);
  };

  const handleRemove = (id) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const iconFor = (type) => {
    switch (type) {
      case "LIVE":
        return <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse mt-1.5" />;
      case "LIKE":
        return <Heart size={15} className="fill-rose-500 text-rose-500 mt-1.5" />;
      case "COMMENT":
        return <MessageSquare size={15} className="text-sky-500 mt-1.5" />;
      case "WALLET":
        return <Sparkles size={15} className="fill-brand-500 text-brand-500 mt-1.5" />;
      default:
        return <Bell size={15} className="text-muted mt-1.5" />;
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
              className="flex h-9 items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 text-[12.5px] font-bold hover:bg-canvas text-ink cursor-pointer"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
            <button
              onClick={handleClearAll}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 text-[12.5px] font-bold hover:bg-rose-50 text-rose-600 cursor-pointer"
            >
              <Trash2 size={14} /> Clear all
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-line">
          <p className="text-[14.5px] font-bold text-ink">Retrieving notifications...</p>
        </div>
      ) : items.length > 0 ? (
        <Card className="divide-y divide-line overflow-hidden bg-white">
          {items.map((it) => (
            <div
              key={it.id}
              className={`p-4 flex items-start justify-between gap-3 transition ${
                !it.read ? "bg-brand-50/40" : "hover:bg-canvas/50"
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {iconFor(it.type)}
                {it.type !== "WALLET" && it.type !== "SYSTEM" ? (
                  <Avatar name="Ananya Sharma" size={38} />
                ) : (
                  <span className="grid h-[38px] w-[38px] place-items-center rounded-full bg-brand-100 text-brand-600 shrink-0">
                    <Sparkles size={18} />
                  </span>
                )}
                <div className="min-w-0 leading-tight">
                  <p className="text-[13.5px] text-ink leading-relaxed">
                    <span className="font-extrabold mr-1">{it.title}</span>
                    {it.message}
                  </p>
                  <p className="mt-1 text-[11.5px] text-muted font-medium">
                    {new Date(it.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRemove(it.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg hover:bg-canvas text-muted hover:text-ink/80 cursor-pointer"
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
