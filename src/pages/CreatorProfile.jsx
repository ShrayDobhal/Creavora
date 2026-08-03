import { useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Check,
  Crown,
  Globe,
  Heart,
  Images,
  Link2,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Play,
  Share2,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, SectionHead, Tabs } from "../ui/Bits.jsx";
import { Avatar, Photo, Verified } from "../ui/Media.jsx";

const stats = [
  ["124", "Posts"],
  ["21.3K", "Followers"],
  ["98", "Following"],
  ["4.8K", "Subscribers"],
  ["5.0", "Rating"],
];

const perks = [
  "Access to exclusive posts",
  "Behind the scenes content",
  "Early access to new videos",
  "Live chat & priority replies",
  "Special subscriber badges",
];

const openPosts = [
  { seed: "cafe-corner", caption: "My new café corner ☕✨", likes: "1.2K", comments: 128, icon: Images },
  { seed: "beach-days", caption: "Beach days are the best 🌊", likes: "2.3K", comments: 210, icon: Play },
  { seed: "sunday-fit", caption: "Sunday fit check 🤍", likes: "1.8K", comments: 154, icon: Lock },
];

const supporters = [
  ["Rohit Gamer", "Platinum", "text-brand-600"],
  ["Meera Singh", "Platinum", "text-brand-600"],
  ["Wander With Karan", "Gold", "text-amber-500"],
  ["Pooja Verma", "Gold", "text-amber-500"],
];

export default function CreatorProfile() {
  const [tab, setTab] = useState("Posts");

  return (
    <div className="flex gap-6 px-6 py-5">
      <div className="min-w-0 flex-1">
        <Card className="overflow-hidden">
          <Photo seed="ananya-neon-cover" className="h-[200px]">
            <Link
              to="/explore"
              className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white backdrop-blur"
            >
              <ArrowLeft size={18} />
            </Link>
            <button className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white backdrop-blur">
              <MoreHorizontal size={18} />
            </button>
          </Photo>

          <div className="relative px-6 pt-4">
            <div className="absolute -top-[60px] left-6">
              <div className="relative">
                <Avatar name="Ananya Sharma" size={132} className="ring-4 ring-white" />
                <span className="absolute bottom-3 right-2 grid h-8 w-8 place-items-center rounded-full border-[3px] border-white bg-brand-600">
                  <Verified size={15} className="fill-white text-brand-600" />
                </span>
              </div>
            </div>

            <div className="ml-[164px] flex items-start gap-4">
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
                <Link
                  to="/checkout"
                  className="flex h-11 items-center gap-2 rounded-full bg-brand-600 px-6 text-[14px] font-bold text-white hover:bg-brand-700"
                >
                  <Crown size={16} className="fill-white" /> Subscribe
                </Link>
                <button className="grid h-11 w-11 place-items-center rounded-full border border-line hover:bg-canvas">
                  <Share2 size={17} />
                </button>
                <button className="grid h-11 w-11 place-items-center rounded-full border border-line hover:bg-canvas">
                  <Bookmark size={17} />
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-5 border-t border-line">
              {stats.map(([v, l], i) => (
                <div key={l} className={`py-4 text-center ${i ? "border-l border-line" : ""}`}>
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

        <Card className="mt-4 px-4 pb-5">
          <Tabs
            items={["Posts", "Reels", "Live", "Collections", "Likes"]}
            value={tab}
            onChange={setTab}
            className="border-b border-line"
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {openPosts.map((p) => (
              <div key={p.seed}>
                <Photo seed={p.seed} className="h-[200px] rounded-2xl">
                  <span className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-lg bg-black/45 text-white backdrop-blur">
                    <p.icon size={12} />
                  </span>
                  <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10 text-[13px] font-semibold text-white">
                    {p.caption}
                  </p>
                </Photo>
                <div className="flex items-center gap-4 px-1 py-2.5 text-[12.5px] font-semibold">
                  <span className="flex items-center gap-1.5 text-rose-500">
                    <Heart size={14} className="fill-rose-500" /> {p.likes}
                  </span>
                  <span className="flex items-center gap-1.5 text-ink/70">
                    <MessageCircle size={14} /> {p.comments}
                  </span>
                  <Bookmark size={15} className="ml-auto text-ink/60" />
                </div>
              </div>
            ))}

            {["lock-1", "lock-2", "lock-3"].map((s) => (
              <Photo key={s} seed={s} className="h-[200px] rounded-2xl">
                <div className="absolute inset-0 grid place-items-center bg-black/45 backdrop-blur-[6px] text-center">
                  <div>
                    <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-white/25 text-white">
                      <Lock size={16} />
                    </span>
                    <p className="mt-2.5 text-[13.5px] font-bold text-white">Premium Content</p>
                    <p className="text-[11.5px] text-white/75">Subscribe to unlock</p>
                    <Link
                      to="/checkout"
                      className="mt-3 inline-flex h-8 items-center rounded-lg bg-brand-600 px-4 text-[12.5px] font-bold text-white"
                    >
                      Subscribe to View
                    </Link>
                  </div>
                </div>
                <span className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-lg bg-black/45 text-white backdrop-blur">
                  <Lock size={12} />
                </span>
              </Photo>
            ))}
          </div>
        </Card>
      </div>

      <aside className="hidden w-[352px] shrink-0 space-y-4 xl:block">
        <Card className="p-5">
          <h3 className="text-[15px] font-bold">Subscription</h3>
          <div className="mt-3.5 flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50">
              <Crown size={20} className="fill-brand-500 text-brand-500" />
            </span>
            <div>
              <p className="text-[13.5px] font-bold">Premium Monthly</p>
              <p className="text-[17px] font-extrabold">
                ₹499 <span className="text-[12px] font-medium text-muted">/ month</span>
              </p>
            </div>
          </div>

          <ul className="mt-4 space-y-2.5">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-[13.5px]">
                <Check size={15} className="shrink-0 text-emerald-500" strokeWidth={3} />
                {p}
              </li>
            ))}
          </ul>

          <Link
            to="/checkout"
            className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-[14px] font-bold text-white hover:bg-brand-700"
          >
            Subscribe Now
          </Link>
          <p className="mt-2.5 text-center text-[12px] text-muted">
            Cancel anytime • Secure payment
          </p>
        </Card>

        <Card className="p-5">
          <h3 className="text-[15px] font-bold">About Ananya</h3>
          <ul className="mt-3.5 space-y-3 text-[13.5px]">
            <li className="flex items-center gap-2.5">
              <Globe size={15} className="text-muted" /> Fashion | Lifestyle | Travel
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={15} className="text-muted" /> Collab: ananya@crevora.com
            </li>
            <li className="flex items-center gap-2.5">
              <Link2 size={15} className="text-muted" />
              <a href="#" className="text-brand-600 underline">
                youtu.be/ananyasharma
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Calendar size={15} className="text-muted" /> Joined Jan 2023
            </li>
          </ul>
        </Card>

        <Card className="p-4">
          <SectionHead title="Top Supporters" />
          <div className="mt-3.5 space-y-3.5">
            {supporters.map(([name, tier, tone], i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-3 text-[12.5px] font-bold text-muted">{i + 1}</span>
                <Avatar name={name} size={34} />
                <p className="min-w-0 flex-1 truncate text-[13.5px] font-bold">{name}</p>
                <span className={`flex shrink-0 items-center gap-1.5 text-[12px] font-semibold ${tone}`}>
                  {tier} <Crown size={13} className="fill-current" />
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionHead title="Achievements" />
          <div className="mt-3.5 flex items-center gap-2.5">
            {["🏆", "🔥", "💎", "👑"].map((e, i) => (
              <span key={i} className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-[19px]">
                {e}
              </span>
            ))}
            <span className="text-[13px] font-bold text-muted">+12</span>
          </div>
        </Card>
      </aside>
    </div>
  );
}
