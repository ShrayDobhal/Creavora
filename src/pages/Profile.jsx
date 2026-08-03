import { useState } from "react";
import {
  Camera,
  ChevronDown,
  Crown,
  Heart,
  LayoutGrid,
  List,
  Lock,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Pin,
  Play,
  Share2,
  Star,
  Youtube,
  Instagram,
  Twitter,
  Images,
  Music2,
  CheckCircle2,
} from "lucide-react";
import { Card, Chip, SectionHead, Tabs } from "../ui/Bits.jsx";
import { Avatar, Photo, Verified } from "../ui/Media.jsx";

const stats = [
  ["124", "Posts"],
  ["21.3K", "Followers"],
  ["98", "Following"],
  ["4.8K", "Subscribers"],
  ["5.0", "Rating"],
];

const posts = [
  { seed: "p-morning", caption: "My morning routine 🌟", likes: "1.2K", comments: 128, pinned: true, locked: true },
  { seed: "p-goa", caption: "Goa diaries 🌴", likes: "2.3K", comments: 210, pinned: true, locked: true },
  { seed: "p-datenight", caption: "Date night look 💕", likes: "2.3K", comments: 154, images: true },
  { seed: "p-grwm", caption: "GRWM for a party ✨", likes: "3.1K", comments: 276, locked: true, video: true },
  { seed: "p-cafe", caption: "Café corner ☕", likes: "980", comments: 64, locked: true },
  { seed: "p-studio", caption: "Studio day 📸", likes: "1.5K", comments: 88 },
  { seed: "p-sunset", caption: "Golden hour 🌇", likes: "2.1K", comments: 132, collection: true },
];

const topFans = [
  ["Rohit Gamer", "12.5K XP"],
  ["Meera Singh", "9.8K XP"],
  ["Wander With Karan", "7.2K XP"],
];

export default function Profile() {
  const [tab, setTab] = useState("Posts");
  const [scope, setScope] = useState("All");

  return (
    <div className="flex gap-6 px-6 py-5">
      <div className="min-w-0 flex-1">
        <Card className="overflow-hidden">
          <Photo seed="ananya-cover" className="h-[205px]">
            <button className="absolute left-4 top-4 flex h-9 items-center gap-2 rounded-lg bg-white/90 px-3 text-[13px] font-semibold backdrop-blur">
              <Camera size={15} /> Edit Cover
            </button>
          </Photo>

          <div className="relative px-6 pb-0 pt-4">
            <div className="absolute -top-[62px] left-6">
              <div className="relative">
                <Avatar name="Ananya Sharma" size={136} className="ring-4 ring-white" />
                <span className="absolute bottom-3 right-2 grid h-8 w-8 place-items-center rounded-full border-[3px] border-white bg-brand-600 text-white">
                  <Verified size={15} className="fill-white text-brand-600" />
                </span>
              </div>
            </div>

            <div className="ml-[168px] flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="flex items-center gap-2 text-[27px] font-extrabold tracking-tight">
                  Ananya Sharma <Verified size={20} />
                </h1>
                <p className="mt-1 flex items-center gap-3 text-[13.5px] text-muted">
                  @ananyasharma
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[12px] font-semibold text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
                  </span>
                </p>
                <p className="mt-2 flex items-center gap-2 text-[13.5px] text-muted">
                  Fashion Creator 👗 <span className="text-line">|</span>
                  <MapPin size={13} /> Mumbai, India
                </p>
                <p className="mt-2 text-[14px]">
                  Creating fashion, lifestyle &amp; travel content that inspires ✨
                </p>
                <p className="text-[14px] font-semibold">
                  Exclusive content for my amazing fam! 💜
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2.5">
                <button className="flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-[14px] font-bold text-white hover:bg-brand-700">
                  <Pencil size={15} /> Edit Profile
                </button>
                <button className="grid h-11 w-11 place-items-center rounded-xl border border-line hover:bg-canvas">
                  <Share2 size={17} />
                </button>
                <button className="grid h-11 w-11 place-items-center rounded-xl border border-line hover:bg-canvas">
                  <MoreHorizontal size={17} />
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-5 border-t border-line">
              {stats.map(([v, l], i) => (
                <div
                  key={l}
                  className={`py-4 text-center ${i ? "border-l border-line" : ""}`}
                >
                  <p className="flex items-center justify-center gap-1 text-[20px] font-extrabold">
                    {v}
                    {l === "Rating" && <Star size={15} className="fill-amber-400 text-amber-400" />}
                  </p>
                  <p className="text-[12.5px] text-muted">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="mt-4 px-4">
          <Tabs
            items={["Posts", "Reels", "Videos", "Live", "Collections", "Likes", "About"]}
            value={tab}
            onChange={setTab}
            className="border-b border-line"
          />

          <div className="flex items-center gap-2.5 py-4">
            {["All", "Public", "Premium"].map((s) => (
              <Chip key={s} active={scope === s} onClick={() => setScope(s)}>
                {s === "Premium" && <Lock size={13} />}
                {s}
              </Chip>
            ))}
            <div className="ml-auto flex items-center gap-2.5">
              <button className="flex h-10 items-center gap-2 rounded-xl border border-line px-4 text-[13px] font-semibold">
                Latest <ChevronDown size={14} className="text-muted" />
              </button>
              <div className="flex h-10 items-center rounded-xl border border-line">
                <button className="grid h-full w-10 place-items-center rounded-l-xl bg-brand-50 text-brand-600">
                  <LayoutGrid size={16} />
                </button>
                <button className="grid h-full w-10 place-items-center text-muted">
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 pb-5 sm:grid-cols-2 xl:grid-cols-4">
            {posts.map((p) => (
              <Card key={p.seed} className="overflow-hidden">
                <Photo seed={p.seed} className="h-[250px]">
                  {p.pinned && (
                    <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[11px] font-bold text-brand-700 backdrop-blur">
                      <Pin size={10} /> Pinned
                    </span>
                  )}
                  <span className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-lg bg-black/45 text-white backdrop-blur">
                    {p.video ? (
                      <Play size={12} className="fill-white" />
                    ) : p.images ? (
                      <Images size={12} />
                    ) : p.collection ? (
                      <LayoutGrid size={12} />
                    ) : (
                      <Lock size={12} />
                    )}
                  </span>
                  <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10 text-[13px] font-semibold text-white">
                    {p.caption}
                  </p>
                </Photo>
                <div className="flex items-center gap-4 px-3 py-2.5 text-[12.5px] font-semibold">
                  <span className="flex items-center gap-1.5 text-rose-500">
                    <Heart size={14} className="fill-rose-500" /> {p.likes}
                  </span>
                  <span className="flex items-center gap-1.5 text-ink/70">
                    <MessageCircle size={14} /> {p.comments}
                  </span>
                  <MoreHorizontal size={16} className="ml-auto text-muted" />
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>

      <aside className="hidden w-[336px] shrink-0 space-y-4 xl:block">
        <Card className="bg-gradient-to-b from-brand-50 to-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold">Creator Level</h3>
            <span className="rounded-md bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white">
              Platinum
            </span>
          </div>
          <div className="mt-4 grid place-items-center">
            <span className="grid h-[70px] w-[70px] place-items-center rounded-full bg-brand-600 ring-8 ring-brand-100">
              <Crown size={30} className="fill-white text-white" />
            </span>
            <p className="mt-3 text-[19px] font-extrabold">Level 12</p>
          </div>
          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-brand-100">
              <div className="h-full w-[84%] rounded-full bg-brand-600" />
            </div>
            <p className="mt-1.5 text-right text-[11.5px] font-semibold text-muted">
              8,450 / 10,000 XP
            </p>
          </div>
          <p className="mt-2 text-center text-[12.5px] text-muted">
            Keep engaging to level up! ✨
          </p>
        </Card>

        <Card className="p-4">
          <SectionHead title="Subscription" action="Manage" />
          <div className="mt-3.5 flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50">
              <Crown size={20} className="fill-brand-500 text-brand-500" />
            </span>
            <div>
              <p className="text-[13.5px] font-bold">Premium Monthly</p>
              <p className="text-[17px] font-extrabold">
                ₹499 <span className="text-[12px] font-medium text-muted">/ month</span>
              </p>
              <p className="mt-1 text-[12px] text-muted">Renews on 25 May 2024</p>
            </div>
            <span className="ml-auto flex shrink-0 items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-600">
              <CheckCircle2 size={11} /> Active
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <SectionHead title="Achievements" />
          <div className="mt-3.5 flex items-center gap-2.5">
            {["🏆", "👑", "🔥", "🎖️", "💎"].map((e, i) => (
              <span
                key={i}
                className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-[19px]"
              >
                {e}
              </span>
            ))}
            <span className="text-[13px] font-bold text-muted">+12</span>
          </div>
        </Card>

        <Card className="p-4">
          <SectionHead title="Top Fans" />
          <div className="mt-3.5 space-y-3.5">
            {topFans.map(([name, xp], i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-3 text-[12.5px] font-bold text-muted">{i + 1}</span>
                <Avatar name={name} size={34} />
                <p className="min-w-0 flex-1 truncate text-[13.5px] font-bold">{name}</p>
                <span className="shrink-0 text-[12px] font-semibold text-muted">{xp}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionHead title="Social Links" action="Edit" />
          <div className="mt-3.5 grid grid-cols-4 gap-2.5">
            {[
              { Icon: Instagram, tint: "bg-rose-50 text-rose-500" },
              { Icon: Youtube, tint: "bg-red-50 text-red-500" },
              { Icon: Twitter, tint: "bg-sky-50 text-sky-500" },
              { Icon: Music2, tint: "bg-neutral-100 text-ink" },
            ].map(({ Icon, tint }, i) => (
              <button key={i} className={`grid h-12 place-items-center rounded-xl ${tint}`}>
                <Icon size={19} />
              </button>
            ))}
          </div>
        </Card>
      </aside>
    </div>
  );
}
