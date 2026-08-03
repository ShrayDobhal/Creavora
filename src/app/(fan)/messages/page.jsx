"use client";

import { useEffect, useState } from "react";
import {
  Ban,
  Bell,
  BellOff,
  Image as ImageIcon,
  Info,
  Mic,
  Phone,
  Play,
  Search,
  Send,
  SquarePen,
  Smile,
  Star,
  Trash2,
  Video,
  CheckCheck,
} from "lucide-react";
import Link from "next/link";
import { Card, Chip } from "@/ui/Bits.jsx";
import { Avatar, Photo, Verified } from "@/ui/Media.jsx";
import { conversations, creators, slug } from "@/data.js";

// Fallbacks if DB has no messages yet
const chatThreads = {
  "Ananya Sharma": [
    { mine: false, lines: ["Hey Arjun! 👋", "Just wanted to say a big THANK YOU ❤️", "Your support means a lot to me!"], time: "10:30 AM" },
    { mine: true, read: true, lines: ["Hey Ananya! 😊", "You're doing amazing work. Keep inspiring! 🔥"], time: "10:32 AM" },
    { mine: false, isAudio: true, duration: "0:15", time: "10:33 AM" },
    { mine: true, read: true, lines: ["Can't wait for your next live session! 🎉"], time: "10:34 AM" },
    { mine: false, lines: ["I'm going live tomorrow at 8 PM.", "Hope to see you there! 🎬✨"], time: "10:35 AM" }
  ],
  "Rohit Gamer": [
    { mine: false, lines: ["Bro, did you see my clutch in BGMI yesterday? 🤯", "We wiped the whole squad in 30 seconds!"], time: "09:15 AM" },
    { mine: true, read: true, lines: ["Yes Rohit! That 1v4 was absolutely insane! 🔥", "Are you streaming tonight?"], time: "09:18 AM" },
    { mine: false, lines: ["Yeah, around 8:30 PM. Will test the new map updates.", "Join in if you're free!"], time: "09:20 AM" },
    { mine: true, read: true, lines: ["Definitely! Will keep my snack ready. 🍿🎮"], time: "09:22 AM" }
  ],
  "Meera Art": [
    { mine: false, lines: ["Hey Arjun! Your feedback on my painting made my day! 🎨🌸"], time: "Yesterday" },
    { mine: true, read: true, lines: ["Glad to hear Meera! The shading and color palette were outstanding.", "Do you sell physical prints of this?"], time: "Yesterday" },
    { mine: false, lines: ["Yes, I do! I can ship it to your address. Let me know if you want custom dimensions."], time: "Yesterday" },
    { mine: true, read: true, lines: ["Perfect! Let me review the size requirements and I'll send details."], time: "Yesterday" }
  ],
  "Wander With Karan": [
    { mine: false, lines: ["Hey! I'm planning my next trip to Spiti Valley next week. 🏔️🎒"], time: "2 days ago" },
    { mine: true, read: true, lines: ["Oh wow Spiti! That's going to be cold. Are you riding or driving?"], time: "2 days ago" },
    { mine: false, lines: ["Biking all the way from Manali! Will stream the route live if network allows."], time: "2 days ago" },
    { mine: true, read: true, lines: ["Safe travels Karan! Can't wait for the updates. 🏍️❄️"], time: "2 days ago" }
  ],
  "Fit With Neha": [
    { mine: false, lines: ["Hey Arjun, how is your weekly workout plan going? 💪"], time: "3 days ago" },
    { mine: true, read: true, lines: ["Going good Neha! I completed the HIIT session yesterday.", "Feeling a bit sore though! haha"], time: "3 days ago" },
    { mine: false, lines: ["Soreness is good, it means your muscles are growing! Keep drinking water.", "Next live class is on Core strength!"], time: "3 days ago" },
    { mine: true, read: true, lines: ["Awesome, will make sure not to miss that. 👍"], time: "3 days ago" }
  ],
  "Creator Squad": [
    { mine: false, sender: "Rohit Gamer", lines: ["Guys, what are we doing for the collab stream next week?"], time: "3h ago" },
    { mine: false, sender: "Meera Art", lines: ["I can design the custom banners and overlays! 🎨"], time: "3h ago" },
    { mine: true, read: true, lines: ["Count me in, I'll join as moderator and keep the chat clean! 🙌"], time: "2h ago" },
    { mine: false, sender: "Ananya Sharma", lines: ["Let's schedule it for Sunday evening. Suits everyone? ✨"], time: "1h ago" }
  ]
};

export default function Messages() {
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState("Ananya Sharma");
  const [typedMessage, setTypedMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Fetch messages from SQLite DB
  const loadMessages = () => {
    fetch(`/api/messages?active=${encodeURIComponent(active)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data);
        } else {
          // Fall back to seed chats if DB has no messages yet
          setMessages(chatThreads[active] || []);
        }
      })
      .catch((err) => {
        console.error("Error loading chat messages:", err);
        setMessages(chatThreads[active] || []);
      });
  };

  useEffect(() => {
    loadMessages();
  }, [active]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const contentToSend = typedMessage;
    setTypedMessage("");

    // optimistic update
    const optimisticMsg = {
      mine: true,
      read: true,
      lines: [contentToSend],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverName: active,
          content: contentToSend,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message via API");
      }

      // Re-load messages to sync timestamps
      loadMessages();
    } catch (error) {
      console.error("Send Message Error:", error);
    }
  };

  const activeCreator = creators.find((c) => c.name === active) || {
    name: active,
    handle: "@" + active.toLowerCase().replace(/[^a-z0-9]/g, ""),
    role: active === "Creator Squad" ? "Group Chat 👥" : "Content Creator",
    posts: 32,
    fans: "15K",
  };

  return (
    <div className="flex h-[calc(100vh-72px)] gap-4 px-4 py-4 bg-canvas/30">
      {/* conversation list */}
      <Card className="flex w-[344px] shrink-0 flex-col overflow-hidden border border-line bg-white">
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <h1 className="text-[23px] font-extrabold tracking-tight">Messages</h1>
          <button className="grid h-9 w-9 place-items-center rounded-lg text-brand-600 hover:bg-brand-50 cursor-pointer">
            <SquarePen size={19} />
          </button>
        </div>

        <div className="px-5">
          <label className="relative flex items-center">
            <Search size={16} className="absolute left-3.5 text-muted" />
            <input
              placeholder="Search messages..."
              className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-3 text-[13.5px] outline-none placeholder:text-muted focus:border-brand-300"
            />
          </label>
        </div>

        <div className="flex items-center gap-2 px-5 py-4">
          {["All", "Unread", "Groups"].map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)} className="px-4 py-1.5 cursor-pointer">
              {f}
              {f === "Unread" && (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                  2
                </span>
              )}
            </Chip>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
          {conversations.map((c) => (
            <button
              key={c.name}
              onClick={() => setActive(c.name)}
              className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-3 text-left cursor-pointer ${
                active === c.name ? "bg-brand-50 text-brand-700" : "hover:bg-canvas"
              }`}
            >
              <div className="relative shrink-0">
                <Avatar name={c.name} size={46} />
                {c.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[14px] font-bold">
                  <span className="truncate">{c.name}</span>
                  {c.verified && <Verified size={13} />}
                  <span className="ml-auto shrink-0 text-[11.5px] font-medium text-muted">
                    {c.time}
                  </span>
                </p>
                <p className="mt-0.5 flex items-center gap-2 text-[12.5px] text-muted">
                  <span className="truncate">{c.last}</span>
                  {c.unread && (
                    <span className="ml-auto grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                      {c.unread}
                    </span>
                  )}
                </p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* thread */}
      <Card className="flex min-w-0 flex-1 flex-col overflow-hidden border border-line bg-white">
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <Avatar name={active} size={46} />
          <div>
            <p className="flex items-center gap-1.5 text-[16px] font-bold">
              {active} <Verified size={15} />
            </p>
            <p className="flex items-center gap-1.5 text-[12.5px] text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-ink/70">
            {[Phone, Video, Star, Info].map((Icon, i) => (
              <button key={i} className="grid h-10 w-10 place-items-center rounded-full hover:bg-canvas cursor-pointer">
                <Icon size={19} />
              </button>
            ))}
          </div>
        </div>

        {/* chat message ledger */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5 no-scrollbar">
          <p className="text-center text-[12px] font-semibold text-muted">Today</p>

          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end gap-2.5 ${msg.mine ? "justify-end" : ""}`}>
              {!msg.mine && <Avatar name={msg.sender || active} size={34} />}
              {msg.isAudio ? (
                <div className="rounded-2xl rounded-bl-md bg-canvas px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white cursor-pointer">
                      <Play size={15} className="ml-0.5 fill-white" />
                    </button>
                    <div className="flex h-8 items-center gap-[3px]">
                      {Array.from({ length: 34 }, (_, idx) => (
                        <span
                          key={idx}
                          className={`w-[2.5px] rounded-full ${idx < 6 ? "bg-brand-600" : "bg-neutral-300"}`}
                          style={{ height: `${8 + Math.abs(Math.sin(idx * 1.7)) * 22}px` }}
                        />
                      ))}
                    </div>
                    <span className="text-[12px] font-semibold text-muted">{msg.duration}</span>
                  </div>
                  <p className="mt-1.5 text-right text-[11px] text-muted">{msg.time}</p>
                </div>
              ) : (
                <div
                  className={`max-w-[62%] rounded-2xl px-4 py-3 ${
                    msg.mine
                      ? "rounded-br-md bg-brand-600 text-white"
                      : "rounded-bl-md bg-canvas text-ink"
                  }`}
                >
                  {msg.sender && !msg.mine && (
                    <p className="text-[11.5px] font-bold text-brand-600 mb-1">{msg.sender}</p>
                  )}
                  {msg.lines?.map((line, idx) => (
                    <p key={idx} className="text-[14px] leading-relaxed">
                      {line}
                    </p>
                  ))}
                  <p
                    className={`mt-1.5 flex items-center justify-end gap-1 text-[11px] ${
                      msg.mine ? "text-white/70" : "text-muted"
                    }`}
                  >
                    {msg.time}
                    {msg.mine && msg.read && <CheckCheck size={13} />}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* input section */}
        <form onSubmit={handleSend} className="border-t border-line px-5 py-4 bg-canvas/10">
          <div className="rounded-2xl border border-line px-4 py-3 bg-white flex flex-col">
            <input
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              placeholder={`Send message to ${active}...`}
              className="w-full text-[14px] outline-none placeholder:text-muted py-1"
            />
            <div className="mt-3.5 flex items-center gap-4 text-ink/60 border-t border-line/40 pt-2.5">
              <ImageIcon size={19} className="cursor-pointer hover:text-brand-600" />
              <span className="text-[12px] font-extrabold tracking-tight cursor-pointer hover:text-brand-600">GIF</span>
              <Smile size={19} className="cursor-pointer hover:text-brand-600" />
              <Mic size={19} className="cursor-pointer hover:text-brand-600" />
              <button
                type="submit"
                className="ml-auto grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 shadow-md cursor-pointer"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </form>
      </Card>

      {/* contact rail */}
      <aside className="hidden w-[312px] shrink-0 space-y-4 overflow-y-auto 2xl:block">
        <Card className="p-5 text-center border border-line bg-white">
          <div className="relative mx-auto w-fit">
            <Avatar name={activeCreator.name} size={104} ring="ring-4 ring-brand-50" />
            <span className="absolute bottom-1 right-1 grid h-7 w-7 place-items-center rounded-full border-[3px] border-white bg-brand-600">
              <Verified size={13} className="fill-white text-brand-600" />
            </span>
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[17.5px] font-extrabold text-ink">
            {activeCreator.name} <Verified size={15} />
          </p>
          <p className="text-[12.5px] text-muted">{activeCreator.handle}</p>
          <p className="mt-1 text-[12.5px] font-semibold text-brand-600">{activeCreator.role}</p>

          <div className="mt-4.5 grid grid-cols-3 border-t border-b border-line py-3">
            {[
              [activeCreator.posts || "32", "Posts"],
              [activeCreator.fans || "15.2K", "Followers"],
              ["98", "Following"],
            ].map(([v, l]) => (
              <div key={l} className="leading-tight">
                <p className="text-[15.5px] font-black text-ink">{v}</p>
                <p className="text-[11px] text-muted font-bold uppercase mt-0.5">{l}</p>
              </div>
            ))}
          </div>

          {activeCreator.name !== "Creator Squad" ? (
            <Link href={`/creator/${slug(activeCreator.name)}`}
              className="mt-4.5 flex h-10 w-full items-center justify-center rounded-xl bg-brand-600 text-[13.5px] font-bold text-white hover:bg-brand-700 shadow-md"
            >
              View Profile
            </Link>
          ) : (
            <div className="mt-4.5 text-[12px] font-semibold text-muted bg-canvas py-2 rounded-xl">
              Collaborative Creators Group
            </div>
          )}
        </Card>

        <Card className="p-4 border border-line bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-ink">Media, Links &amp; Files</h3>
            <button className="text-[12px] font-semibold text-brand-600 hover:underline cursor-pointer">View All</button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Photo key={i} seed={`media-${activeCreator.name}-${i}`} className="aspect-square rounded-lg" />
            ))}
          </div>
        </Card>

        <Card className="divide-y divide-line p-2 border border-line bg-white">
          {[
            { Icon: Search, label: "Search in Conversation" },
            { Icon: Bell, label: "Notifications", toggle: true },
            { Icon: BellOff, label: "Mute Conversation", toggle: false },
            { Icon: Trash2, label: "Clear Chat" },
            { Icon: Ban, label: "Block User", danger: true },
          ].map(({ Icon, label, toggle, danger }) => (
            <button
              key={label}
              className={`flex w-full items-center gap-3 px-3 py-3 text-left text-[13.5px] font-semibold cursor-pointer ${
                danger ? "text-rose-500 hover:bg-rose-50/50" : "text-ink/80 hover:bg-canvas"
              }`}
            >
              <Icon size={16} className={danger ? "" : "text-ink/60"} />
              <span className="flex-1">{label}</span>
              {toggle !== undefined && (
                <span
                  className={`flex h-5 w-9 items-center rounded-full px-0.5 ${
                    toggle ? "justify-end bg-brand-600" : "justify-start bg-neutral-300"
                  }`}
                >
                  <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
                </span>
              )}
            </button>
          ))}
        </Card>
      </aside>
    </div>
  );
}
