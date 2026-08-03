import { useState } from "react";
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
import { Link } from "react-router-dom";
import { Card, Chip } from "../ui/Bits.jsx";
import { Avatar, Photo, Verified } from "../ui/Media.jsx";
import { conversations } from "../data.js";

function Bubble({ mine, lines, time, read }) {
  return (
    <div className={`flex items-end gap-2.5 ${mine ? "justify-end" : ""}`}>
      {!mine && <Avatar name="Ananya Sharma" size={34} />}
      <div
        className={`max-w-[62%] rounded-2xl px-4 py-3 ${
          mine
            ? "rounded-br-md bg-brand-600 text-white"
            : "rounded-bl-md bg-canvas text-ink"
        }`}
      >
        {lines.map((l, i) => (
          <p key={i} className="text-[14px] leading-relaxed">
            {l}
          </p>
        ))}
        <p
          className={`mt-1.5 flex items-center justify-end gap-1 text-[11px] ${
            mine ? "text-white/70" : "text-muted"
          }`}
        >
          {time}
          {read && <CheckCheck size={13} />}
        </p>
      </div>
    </div>
  );
}

export default function Messages() {
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState("Ananya Sharma");

  return (
    <div className="flex h-[calc(100vh-72px)] gap-4 px-4 py-4">
      {/* conversation list */}
      <Card className="flex w-[344px] shrink-0 flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <h1 className="text-[23px] font-extrabold tracking-tight">Messages</h1>
          <button className="grid h-9 w-9 place-items-center rounded-lg text-brand-600 hover:bg-brand-50">
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
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)} className="px-4 py-1.5">
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
              className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-3 text-left ${
                active === c.name ? "bg-brand-50" : "hover:bg-canvas"
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
      <Card className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <Avatar name="Ananya Sharma" size={46} />
          <div>
            <p className="flex items-center gap-1.5 text-[16px] font-bold">
              Ananya Sharma <Verified size={15} />
            </p>
            <p className="flex items-center gap-1.5 text-[12.5px] text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-ink/70">
            {[Phone, Video, Star, Info].map((Icon, i) => (
              <button key={i} className="grid h-10 w-10 place-items-center rounded-full hover:bg-canvas">
                <Icon size={19} />
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <p className="text-center text-[12px] font-semibold text-muted">Today</p>

          <Bubble
            lines={[
              "Hey Arjun! 👋",
              "Just wanted to say a big THANK YOU ❤️",
              "Your support means a lot to me!",
            ]}
            time="10:30 AM"
          />
          <Bubble
            mine
            read
            lines={["Hey Ananya! 😊", "You're doing amazing work. Keep inspiring! 🔥"]}
            time="10:32 AM"
          />

          <div className="flex items-end gap-2.5">
            <Avatar name="Ananya Sharma" size={34} />
            <div className="rounded-2xl rounded-bl-md bg-canvas px-4 py-3">
              <div className="flex items-center gap-3">
                <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                  <Play size={15} className="ml-0.5 fill-white" />
                </button>
                <div className="flex h-8 items-center gap-[3px]">
                  {Array.from({ length: 34 }, (_, i) => (
                    <span
                      key={i}
                      className={`w-[2.5px] rounded-full ${i < 6 ? "bg-brand-600" : "bg-neutral-300"}`}
                      style={{ height: `${8 + Math.abs(Math.sin(i * 1.7)) * 22}px` }}
                    />
                  ))}
                </div>
                <span className="text-[12px] font-semibold text-muted">0:15</span>
              </div>
              <p className="mt-1.5 text-right text-[11px] text-muted">10:33 AM</p>
            </div>
          </div>

          <Bubble mine read lines={["Can't wait for your next live session! 🎉"]} time="10:34 AM" />

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[12px] font-semibold text-brand-600">1 New Message</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <div>
            <Bubble
              lines={["I'm going live tomorrow at 8 PM.", "Hope to see you there! 🎬✨"]}
              time="10:35 AM"
            />
            <span className="ml-[46px] mt-1.5 inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-[11.5px] font-semibold">
              ❤️ 1
            </span>
          </div>
        </div>

        <div className="border-t border-line px-5 py-4">
          <div className="rounded-2xl border border-line px-4 py-3">
            <input
              placeholder="Type a message..."
              className="w-full text-[14px] outline-none placeholder:text-muted"
            />
            <div className="mt-3 flex items-center gap-4 text-ink/60">
              <ImageIcon size={19} />
              <span className="text-[12px] font-extrabold tracking-tight">GIF</span>
              <Smile size={19} />
              <Mic size={19} />
              <button className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-white hover:bg-brand-700">
                <Send size={17} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* contact rail */}
      <aside className="hidden w-[312px] shrink-0 space-y-4 overflow-y-auto 2xl:block">
        <Card className="p-5 text-center">
          <div className="relative mx-auto w-fit">
            <Avatar name="Ananya Sharma" size={104} />
            <span className="absolute bottom-1 right-1 grid h-7 w-7 place-items-center rounded-full border-[3px] border-white bg-brand-600">
              <Verified size={13} className="fill-white text-brand-600" />
            </span>
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[18px] font-extrabold">
            Ananya Sharma <Verified size={16} />
          </p>
          <p className="text-[13px] text-muted">@ananyasharma</p>
          <p className="mt-1 text-[13px] text-muted">Fashion Creator 👗</p>

          <div className="mt-4 grid grid-cols-3">
            {[
              ["124", "Posts"],
              ["21.3K", "Followers"],
              ["98", "Following"],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="text-[16px] font-extrabold">{v}</p>
                <p className="text-[11.5px] text-muted">{l}</p>
              </div>
            ))}
          </div>

          <Link
            to="/creator/ananya-sharma"
            className="mt-4 flex h-11 w-full items-center justify-center rounded-xl border border-brand-200 text-[14px] font-bold text-brand-700 hover:bg-brand-50"
          >
            View Profile
          </Link>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[14.5px] font-bold">Media, Links &amp; Files</h3>
            <button className="text-[12.5px] font-semibold text-brand-600">View All</button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Photo key={i} seed={`media-${i}`} className="aspect-square rounded-lg" />
            ))}
          </div>
        </Card>

        <Card className="divide-y divide-line p-2">
          {[
            { Icon: Search, label: "Search in Conversation" },
            { Icon: Bell, label: "Notifications", toggle: true },
            { Icon: BellOff, label: "Mute Conversation", toggle: false },
            { Icon: Trash2, label: "Clear Chat" },
            { Icon: Ban, label: "Block User", danger: true },
          ].map(({ Icon, label, toggle, danger }) => (
            <button
              key={label}
              className={`flex w-full items-center gap-3 px-3 py-3.5 text-left text-[13.5px] font-semibold ${
                danger ? "text-rose-500" : ""
              }`}
            >
              <Icon size={17} className={danger ? "" : "text-ink/60"} />
              <span className="flex-1">{label}</span>
              {toggle !== undefined && (
                <span
                  className={`flex h-5 w-9 items-center rounded-full px-0.5 ${
                    toggle ? "justify-end bg-brand-600" : "justify-start bg-neutral-300"
                  }`}
                >
                  <span className="h-4 w-4 rounded-full bg-white" />
                </span>
              )}
            </button>
          ))}
        </Card>
      </aside>
    </div>
  );
}
