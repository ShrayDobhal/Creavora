"use client";

import { useState } from "react";
import Link from "next/link";;
import { Radio, Users, Heart, MessageSquare, Send, Sparkles, AlertCircle } from "lucide-react";
import { Card, SectionHead } from "@/ui/Bits.jsx";
import { Avatar, Photo, Verified } from "@/ui/Media.jsx";
import { creators, slug } from "@/data.js";

const liveCreators = [
  { name: "Ananya Sharma", role: "Fashion Creator", views: "1.2K", category: "Fashion & Lifestyle", title: "Sunday Morning Styling Q&A! ✨", seed: "live-ananya" },
  { name: "Rohit Gamer", role: "Gaming Creator", views: "890", category: "Gaming", title: "Pushing Rank in BGMI! 🚀🎮", seed: "live-rohit" },
  { name: "Fit With Neha", role: "Fitness Coach", views: "567", category: "Fitness", title: "Full Body HIIT - Burn Calories! 💪🏃‍♀️", seed: "live-neha" },
  { name: "Wander With Karan", role: "Travel Vlogger", views: "410", category: "Travel", title: "Live from Manali Mall Road! 🏔️❄️", seed: "live-karan" },
  { name: "Meera Art", role: "Digital Artist", views: "350", category: "Art & Sketching", title: "Speed Painting Commission Work! 🎨🖌️", seed: "live-meera" },
];

export default function LiveNow() {
  const [selectedStream, setSelectedStream] = useState(liveCreators[0]);
  const [chatMessage, setChatMessage] = useState("");
  const [chatList, setChatList] = useState([
    { user: "Arjun Singh", text: "Hey Ananya! Love the styling tips!" },
    { user: "Priya Patel", text: "Where is that white kurti from?" },
    { user: "Rohan Das", text: "Namaste from Mumbai!" },
    { user: "Sneha Iyer", text: "Are you planning a meet-up soon?" },
  ]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatList([...chatList, { user: "Arjun Singh", text: chatMessage }]);
    setChatMessage("");
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 px-6 py-6 min-h-[calc(100vh-72px)] bg-canvas">
      {/* main video stream view */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[25px] font-extrabold tracking-tight flex items-center gap-2">
              <Radio className="text-rose-500 animate-pulse" size={24} /> Live Now
            </h1>
            <p className="text-[14px] text-muted">Watch and interact with your favorite creators in real-time</p>
          </div>
        </div>

        {/* stream screen */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
          <Photo seed={selectedStream.seed} className="w-full h-full object-cover">
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/75" />
            
            {/* stats overlays */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="flex h-6 items-center gap-1.5 rounded-md bg-rose-500 px-2.5 text-[11px] font-extrabold tracking-wide text-white">
                LIVE
              </span>
              <span className="flex h-6 items-center gap-1.5 rounded-md bg-black/60 px-2.5 text-[11.5px] font-bold text-white backdrop-blur">
                <Users size={12} /> {selectedStream.views} watching
              </span>
            </div>

            {/* stream info overlay bottom */}
            <div className="absolute bottom-5 inset-x-5 flex items-end justify-between">
              <div className="text-white max-w-[70%]">
                <span className="text-[12px] font-bold uppercase tracking-wider bg-brand-600/80 px-2 py-0.5 rounded-md">
                  {selectedStream.category}
                </span>
                <h2 className="mt-2 text-[20px] md:text-[24px] font-black leading-tight drop-shadow">
                  {selectedStream.title}
                </h2>
                <div className="mt-3.5 flex items-center gap-2.5">
                  <Avatar name={selectedStream.name} size={36} ring="ring-brand-500" />
                  <div className="leading-tight">
                    <p className="flex items-center gap-1 font-bold text-[14px]">
                      {selectedStream.name} <Verified size={13} />
                    </p>
                    <p className="text-[11.5px] text-white/70">{selectedStream.role}</p>
                  </div>
                </div>
              </div>

              {/* action overlay */}
              <div className="flex gap-2">
                <button className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 backdrop-blur">
                  <Heart size={20} className="fill-rose-500 text-rose-500" />
                </button>
                <Link href={`/creator/${slug(selectedStream.name)}`}
                  className="flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-[14px] font-bold text-white hover:bg-brand-500 shadow-lg"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </Photo>
        </div>

        {/* creators list row */}
        <section className="mt-8">
          <SectionHead title="Active Broadcasts" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {liveCreators.map((c) => {
              const active = c.name === selectedStream.name;
              return (
                <Card
                  key={c.name}
                  onClick={() => setSelectedStream(c)}
                  className={`overflow-hidden cursor-pointer hover:border-brand-300 transition-all ${
                    active ? "ring-2 ring-brand-500 border-transparent" : ""
                  }`}
                >
                  <Photo seed={c.seed} className="h-[120px] relative">
                    <span className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded bg-rose-500 px-1.5 py-0.5 text-[9.5px] font-extrabold text-white">
                      LIVE
                    </span>
                    <span className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[9.5px] font-bold text-white">
                      <Users size={10} /> {c.views}
                    </span>
                  </Photo>
                  <div className="p-3">
                    <p className="text-[11.5px] font-extrabold text-brand-600 uppercase tracking-wider">
                      {c.category}
                    </p>
                    <h3 className="mt-1 text-[13.5px] font-bold text-ink truncate">
                      {c.title}
                    </h3>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Avatar name={c.name} size={22} />
                      <div className="min-w-0 leading-tight">
                        <p className="truncate text-[12px] font-bold flex items-center gap-1">
                          {c.name} <Verified size={11} />
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </div>

      {/* side chat container */}
      <aside className="w-full xl:w-[340px] shrink-0">
        <Card className="flex flex-col h-[600px] xl:h-[calc(100vh-120px)] overflow-hidden">
          <div className="p-4 border-b border-line bg-canvas/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-[15.5px] font-extrabold">Live Chat</h2>
            </div>
            <span className="text-[12px] font-bold text-muted flex items-center gap-1">
              <Users size={12} /> {selectedStream.views}
            </span>
          </div>

          {/* chat list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
            {chatList.map((chat, i) => {
              const self = chat.user === "Arjun Singh";
              return (
                <div key={i} className="flex gap-2.5 items-start">
                  <Avatar name={chat.user} size={26} />
                  <div className="min-w-0 leading-tight">
                    <p className={`text-[12.5px] font-bold ${self ? "text-brand-600" : "text-ink"}`}>
                      {chat.user}
                    </p>
                    <p className="mt-1 text-[13px] text-ink/90 bg-canvas p-2.5 rounded-xl rounded-tl-none leading-relaxed">
                      {chat.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* input */}
          <form onSubmit={handleSendChat} className="p-4 border-t border-line bg-canvas/20">
            <div className="flex gap-2">
              <input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Say something nice..."
                className="flex-1 h-10 px-3.5 text-[13px] rounded-xl border border-line bg-white focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white hover:bg-brand-700"
              >
                <Send size={15} />
              </button>
            </div>
          </form>
        </Card>
      </aside>
    </div>
  );
}
