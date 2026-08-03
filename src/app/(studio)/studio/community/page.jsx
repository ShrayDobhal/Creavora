"use client";

import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Radio,
  Share2,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { Card, SectionHead, Tabs } from "@/ui/Bits.jsx";
import { Avatar, Photo, Verified } from "@/ui/Media.jsx";

const overview = [
  { icon: Users, tint: "bg-brand-50 text-brand-600", label: "Total Members", value: "2,458" },
  { icon: Users, tint: "bg-emerald-50 text-emerald-600", label: "Online Now", value: "124" },
  { icon: MessageSquare, tint: "bg-sky-50 text-sky-600", label: "Posts Today", value: "87" },
  { icon: MessageCircle, tint: "bg-violet-50 text-violet-600", label: "Total Discussions", value: "1,245" },
];

const events = [
  { title: "Live Q&A with Ananya", when: "25 May • 7:00 PM", tag: "Live", tone: "bg-rose-50 text-rose-500" },
  { title: "Content Planning Workshop", when: "28 May • 5:00 PM", tag: "Upcoming", tone: "bg-emerald-50 text-emerald-600" },
  { title: "Creator Networking Room", when: "29 May • 8:00 PM", tag: "Upcoming", tone: "bg-emerald-50 text-emerald-600" },
];

const contributors = [
  ["Neha Verma", "320 pts", "🥇"],
  ["Riya Malhotra", "280 pts", "🥈"],
  ["Kavya Singh", "210 pts", "🥉"],
  ["Sneha Iyer", "150 pts", "4"],
  ["Mehak Arora", "120 pts", "5"],
];

const guidelines = [
  "Be kind and respectful",
  "No self-promotion or spam",
  "Share value and support others",
  "Keep discussions relevant",
];

export default function StudioCommunity() {
  const [tab, setTab] = useState("Feed");

  return (
    <div className="flex gap-5 px-6 py-6">
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-3.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Users size={21} />
          </span>
          <div>
            <h1 className="text-[25px] font-extrabold tracking-tight">Creator Community</h1>
            <p className="mt-1 text-[14px] text-muted">
              A place for creators to connect, share, learn and grow together.
            </p>
          </div>
        </div>

        <Tabs
          items={[
            "Feed",
            "Discussions",
            "Announcements",
            "Rooms",
            "Events",
            "Members",
            "Leaderboard",
          ]}
          value={tab}
          onChange={setTab}
          className="mt-4 border-b border-line"
        />

        {/* composer */}
        <Card className="mt-5 p-4">
          <div className="flex items-center gap-3">
            <Avatar name="Ananya Sharma" size={42} />
            <input
              placeholder="What's on your mind, Ananya?"
              className="h-11 flex-1 rounded-xl bg-canvas px-4 text-[14px] outline-none placeholder:text-muted"
            />
          </div>
          <div className="mt-3.5 flex items-center gap-2.5">
            {[
              { icon: ImageIcon, label: "Photo / Video" },
              { icon: BarChart3, label: "Poll" },
              { icon: Radio, label: "Live Room" },
              { icon: Calendar, label: "Event" },
              { icon: MoreHorizontal, label: "More" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="flex h-10 items-center gap-2 rounded-xl border border-line px-3.5 text-[13px] font-semibold hover:bg-canvas"
              >
                <Icon size={15} className="text-ink/70" /> {label}
              </button>
            ))}
            <button className="ml-auto h-10 rounded-xl bg-brand-600 px-6 text-[13.5px] font-bold text-white hover:bg-brand-700">
              Post
            </button>
          </div>
        </Card>

        {/* featured announcement */}
        <Card className="mt-4 bg-brand-50/50 p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600">
              <Bell size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-bold">Featured Announcement</p>
              <p className="mt-1 flex items-center gap-2 text-[12.5px] text-muted">
                By Ananya Sharma • 2 days ago
                <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                  Pinned
                </span>
              </p>
            </div>
            <button className="text-muted">
              <X size={17} />
            </button>
          </div>

          <p className="mt-3 text-[15.5px] font-extrabold">
            Welcome to the Crevora Creator Community! 🎉
          </p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
            This is our space to support, collaborate and grow together. Feel free to introduce
            yourself and share your journey!
          </p>

          <div className="mt-3 flex items-center gap-2.5">
            <div className="flex -space-x-2">
              {["Neha", "Riya", "Kavya"].map((n) => (
                <Avatar key={n} name={n} size={24} ring="#fff" />
              ))}
            </div>
            <span className="text-[12.5px] font-semibold text-muted">128</span>
            <button className="ml-auto text-[12.5px] font-semibold text-brand-600">
              56 Comments
            </button>
          </div>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-[19px] font-extrabold tracking-tight">All Posts</h2>
          <div className="flex items-center gap-2.5">
            <button className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold">
              Latest <ChevronDown size={13} className="text-muted" />
            </button>
            <button className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-muted">
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>

        <Card className="mt-4 divide-y divide-line">
          {/* post 1 — photos */}
          <CommunityPost
            author="Neha Verma"
            badge={["Top Creator", "bg-brand-50 text-brand-700"]}
            time="1h ago"
            body="Just finished my new photoshoot! 📸 Behind the scenes will be up on my exclusive soon. What type of content do you guys love the most?"
            tags={["#photoshoot", "#bts", "#content"]}
            likes={45}
            comments={32}
            media={
              <div className="grid w-[240px] shrink-0 grid-cols-3 gap-1.5">
                {[0, 1, 2].map((i) => (
                  <Photo key={i} seed={`neha-shoot-${i}`} className="h-[105px] rounded-lg" />
                ))}
              </div>
            }
          />

          {/* post 2 — poll */}
          <CommunityPost
            author="Riya Malhotra"
            time="3h ago"
            body="Let's talk about creator burnout. How do you stay consistent and take care of your mental health?"
            tags={["#wellness"]}
            likes={38}
            comments={27}
            media={
              <div className="w-[248px] shrink-0 rounded-xl bg-canvas p-3.5">
                <p className="text-[12.5px] font-bold">How do you manage burnout?</p>
                <div className="mt-3 space-y-2.5">
                  {[
                    ["Take Breaks", 60],
                    ["Plan & Schedule", 25],
                    ["Meditation / Exercise", 15],
                  ].map(([label, pct]) => (
                    <div key={label}>
                      <p className="flex items-center justify-between text-[11.5px] font-semibold">
                        {label} <span className="text-muted">{pct}%</span>
                      </p>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 border-t border-line pt-2 text-[11px] text-muted">120 votes</p>
              </div>
            }
          />

          {/* post 3 */}
          <CommunityPost
            author="Kavya Singh"
            badge={["New Member", "bg-emerald-50 text-emerald-600"]}
            time="5h ago"
            body="Hey everyone! I'm Kavya, a lifestyle creator from Jaipur. Excited to be here and learn from all of you! ✨"
            likes={22}
            comments={18}
          />

          {/* post 4 — live promo */}
          <CommunityPost
            author="Ananya Sharma"
            verified
            badge={["Creator", "bg-brand-50 text-brand-700"]}
            time="1d ago"
            body={`We're going LIVE this Saturday at 7 PM IST 🎥\nTopic: How I plan my content & stay productive\nDon't miss it! See you there 💜`}
            likes={89}
            comments={61}
            media={
              <Photo
                seed="live-promo"
                dark
                className="h-[132px] w-[280px] shrink-0 rounded-xl bg-gradient-to-br from-brand-600 to-[#e05fd6]"
              >
                <div className="absolute inset-0 p-3.5">
                  <span className="flex w-fit items-center gap-1.5 rounded-md bg-white/20 px-2 py-1 text-[10.5px] font-bold text-white backdrop-blur">
                    <Radio size={10} /> Live Session
                  </span>
                  <p className="mt-2 max-w-[170px] text-[13.5px] font-extrabold leading-tight text-white">
                    How I plan my content &amp; stay productive
                  </p>
                  <p className="mt-1 text-[11px] text-white/80">25 May, 7:00 PM IST</p>
                  <button className="mt-2 flex h-7 items-center gap-1.5 rounded-lg bg-white/90 px-2.5 text-[11.5px] font-bold text-ink">
                    <Bell size={11} /> Remind Me
                  </button>
                </div>
              </Photo>
            }
          />
        </Card>
      </div>

      <aside className="hidden w-[352px] shrink-0 space-y-4 xl:block">
        <Card className="p-4">
          <h3 className="text-[15px] font-bold">Community Overview</h3>
          <div className="mt-3.5 space-y-3.5">
            {overview.map(({ icon: Icon, tint, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tint}`}>
                  <Icon size={17} />
                </span>
                <span className="flex-1 text-[13.5px] font-semibold">{label}</span>
                <span className="text-[14px] font-extrabold">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionHead title="Upcoming Events" />
          <div className="mt-3.5 space-y-3.5">
            {events.map((e) => (
              <div key={e.title} className="flex items-center gap-3">
                <Avatar name={e.title} size={38} />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-[13.5px] font-bold">{e.title}</p>
                  <p className="mt-0.5 text-[12px] text-muted">{e.when}</p>
                </div>
                <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold ${e.tone}`}>
                  {e.tag}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionHead
            title="Top Contributors"
            right={
              <button className="flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[12.5px] font-semibold">
                This Month <ChevronDown size={13} />
              </button>
            }
          />
          <div className="mt-3.5 space-y-3.5">
            {contributors.map(([name, pts, rank]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-4 text-center text-[13px] font-bold text-muted">{rank}</span>
                <Avatar name={name} size={34} />
                <p className="min-w-0 flex-1 truncate text-[13.5px] font-bold">{name}</p>
                <span className="shrink-0 text-[12.5px] font-bold text-brand-600">{pts}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 flex items-center gap-2 text-[13px] font-bold text-brand-600">
            View Leaderboard <ArrowRight size={14} />
          </button>
        </Card>

        <Card className="p-4">
          <h3 className="text-[15px] font-bold">Community Guidelines</h3>
          <ul className="mt-3.5 space-y-2.5">
            {guidelines.map((g) => (
              <li key={g} className="flex items-center gap-2.5 text-[13px]">
                <Check size={15} className="shrink-0 text-emerald-500" strokeWidth={3} />
                {g}
              </li>
            ))}
          </ul>
          <button className="mt-4 flex items-center gap-2 text-[13px] font-bold text-brand-600">
            View All Guidelines <ArrowRight size={14} />
          </button>
        </Card>
      </aside>
    </div>
  );
}

function CommunityPost({ author, verified, badge, time, body, tags, likes, comments, media }) {
  return (
    <div className="flex gap-3.5 p-4">
      <Avatar name={author} size={40} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[14px] font-bold">
          {author}
          {verified && <Verified size={13} />}
          {badge && (
            <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${badge[1]}`}>
              {badge[0]}
            </span>
          )}
          <span className="text-[12px] font-medium text-muted">• {time}</span>
        </p>
        <p className="mt-1.5 whitespace-pre-line text-[13.5px] leading-relaxed">{body}</p>
        {tags && (
          <p className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="rounded-md bg-canvas px-2 py-0.5 text-[11.5px] font-semibold text-muted">
                {t}
              </span>
            ))}
          </p>
        )}
        <div className="mt-3 flex items-center gap-6 text-[12.5px] font-semibold">
          <span className="flex items-center gap-1.5 text-rose-500">
            <Heart size={15} className="fill-rose-500" /> {likes}
          </span>
          <span className="flex items-center gap-1.5 text-ink/70">
            <MessageCircle size={15} /> {comments}
          </span>
          <span className="flex items-center gap-1.5 text-ink/70">
            <Share2 size={15} /> Share
          </span>
        </div>
      </div>
      {media}
      <button className="h-fit shrink-0 text-muted">
        <MoreHorizontal size={17} />
      </button>
    </div>
  );
}
