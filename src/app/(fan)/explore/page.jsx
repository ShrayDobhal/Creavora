"use client";

import { useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  Briefcase,
  ChevronRight,
  Camera,
  Coffee,
  Dumbbell,
  Flame,
  Gamepad2,
  GraduationCap,
  Lock,
  MoreHorizontal,
  Music,
  Palette,
  Plane,
  Shirt,
  Smile,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";;
import { Card, Chip, SectionHead } from "@/ui/Bits.jsx";
import { Avatar, Photo, Verified } from "@/ui/Media.jsx";
import { hashtags, slug } from "@/data.js";

const filters = [
  { label: "All", icon: Sparkles },
  { label: "Fitness", icon: Dumbbell },
  { label: "Gaming", icon: Gamepad2 },
  { label: "Fashion", icon: Shirt },
  { label: "Travel", icon: Plane },
  { label: "Music", icon: Music },
  { label: "Art", icon: Palette },
  { label: "Lifestyle", icon: Coffee },
  { label: "More", icon: MoreHorizontal },
];

const categoryGrid = [
  { label: "Fitness", icon: Dumbbell },
  { label: "Gaming", icon: Gamepad2 },
  { label: "Fashion", icon: Shirt },
  { label: "Travel", icon: Plane },
  { label: "Music", icon: Music },
  { label: "Art", icon: Palette },
  { label: "Lifestyle", icon: Coffee },
  { label: "Education", icon: GraduationCap },
  { label: "Business", icon: Briefcase },
  { label: "Comedy", icon: Smile },
  { label: "Photography", icon: Camera },
  { label: "More", icon: MoreHorizontal },
];

const recommended = [
  { name: "Fit With Neha", role: "Fitness Coach", price: 399, fans: "12.5K", trending: true },
  { name: "Rohit Gamer", role: "Gaming Creator", price: 299, fans: "8.7K" },
  { name: "Wander With Karan", role: "Travel Vlogger", price: 499, fans: "15.2K" },
  { name: "Ananya Sharma", role: "Fashion Creator", price: 549, fans: "21.3K" },
];

const trending = [
  { rank: "#1", name: "Meera Art", role: "Digital Artist", views: "55.1K" },
  { rank: "#2", name: "Arjun Fitness", role: "Fitness Coach", views: "18.7K" },
  { rank: "#3", name: "Wander With Karan", role: "Travel Vlogger", views: "16.2K" },
  { rank: "#4", name: "Sangeetika", role: "Singer", views: "14.8K" },
];

const topToday = [
  { name: "Ananya Sharma", role: "Fashion Creator", n: "21.3K" },
  { name: "Rohit Gamer", role: "Gaming Creator", n: "18.7K" },
  { name: "Meera Art", role: "Digital Artist", n: "16.2K" },
  { name: "Fit With Neha", role: "Fitness Coach", n: "14.8K" },
  { name: "Wander With Karan", role: "Travel Vlogger", n: "13.1K" },
];

export default function Explore() {
  const [active, setActive] = useState("All");

  return (
    <div className="flex gap-6 px-6 py-6">
      <div className="min-w-0 flex-1">
        <h1 className="text-[25px] font-extrabold tracking-tight">Explore</h1>
        <p className="mt-1 text-[14px] text-muted">
          Discover amazing creators and exclusive content
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {filters.map(({ label, icon: Icon }) => (
            <Chip key={label} active={active === label} onClick={() => setActive(label)}>
              <Icon size={14} /> {label}
            </Chip>
          ))}
        </div>

        {/* banner */}
        <div className="relative mt-5 overflow-hidden rounded-2xl bg-[#141419] p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-[330px] shrink-0">
            <h2 className="text-[34px] font-extrabold leading-[1.15] tracking-tight text-white">
              Discover
              <br />
              <span className="bg-gradient-to-r from-[#f0399a] to-[#c084fc] bg-clip-text text-transparent">
                Connect
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#a97bff] to-[#7c3aed] bg-clip-text text-transparent">
                Get inspired
              </span>
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-white/70">
              Explore top creators across
              <br />
              categories and find your favourites
            </p>
            <Link href="/creator/ananya-sharma"
              className="mt-6 flex w-fit items-center gap-2.5 rounded-xl bg-white px-6 py-3 text-[14px] font-bold text-ink"
            >
              Discover Now <ArrowRight size={16} />
            </Link>
          </div>

          <div className="pointer-events-none hidden items-center gap-3 md:flex shrink-0 pr-2">
            {[
              { seed: "ananya-hero", name: "Ananya Sharma", role: "Fashion Creator", ring: "ring-amber-400" },
              { seed: "rohit-stream", name: "Rohit Gamer", role: "Gaming Creator", ring: "ring-amber-400" },
              { seed: "meera-studio", name: "Meera Art", role: "Digital Artist", ring: "ring-amber-400" },
            ].map((c) => (
              <Photo
                key={c.seed}
                seed={c.seed}
                className={`h-[180px] w-[130px] rounded-2xl ring-2 ${c.ring}`}
              >
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/85 to-transparent p-2.5 pt-8">
                  <Avatar name={c.name} size={20} />
                  <div className="min-w-0 leading-tight">
                    <p className="flex items-center gap-1 truncate text-[11px] font-bold text-white">
                      {c.name} <Verified size={10} />
                    </p>
                    <p className="truncate text-[9px] text-white/70">{c.role}</p>
                  </div>
                  <Lock size={10} className="ml-auto shrink-0 text-white/80" />
                </div>
              </Photo>
            ))}
          </div>
        </div>

        <section className="mt-7">
          <SectionHead
            title="Recommended For You"
            right={
              <button className="text-[13px] font-semibold text-brand-600 hover:underline">
                View All
              </button>
            }
          />
          <div className="relative mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {recommended.map((c) => (
              <Card key={c.name} className="overflow-hidden">
                <Link href={`/creator/${slug(c.name)}`} className="block">
                <Photo seed={c.name} dark className="h-[200px]">
                  {c.trending && (
                    <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-md bg-rose-500 px-2 py-1 text-[11px] font-bold text-white">
                      <Flame size={11} /> Trending
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-12">
                    <p className="flex items-center gap-1.5 text-[14px] font-bold text-white">
                      {c.name} <Verified size={13} />
                    </p>
                    <p className="text-[11.5px] text-white/70">{c.role}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {[0, 1, 2].map((k) => (
                          <Avatar key={k} name={c.name + k} size={19} ring="#fff" />
                        ))}
                      </div>
                      <span className="text-[11.5px] font-semibold text-white/90">{c.fans}</span>
                      <Lock size={12} className="ml-auto text-white/80" />
                    </div>
                  </div>
                </Photo>
                </Link>
                <div className="flex flex-col gap-2 px-3 py-3 border-t border-line">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-muted">Subscription</span>
                    <p className="font-black text-ink">₹{c.price}/mo</p>
                  </div>
                  <Link href="/checkout"
                    className="flex h-8 w-full items-center justify-center rounded-xl bg-brand-600 text-[13px] font-bold text-white hover:bg-brand-700 transition-colors"
                  >
                    Subscribe
                  </Link>
                </div>
              </Card>
            ))}
            <button className="absolute -right-4 top-[45%] grid h-9 w-9 place-items-center rounded-full bg-white shadow-[0_6px_18px_-6px_rgba(15,15,20,.5)]">
              <ChevronRight size={17} />
            </button>
          </div>
        </section>

        <section className="mt-7 pb-10">
          <SectionHead
            title="Trending This Week"
            right={
              <button className="text-[13px] font-semibold text-brand-600 hover:underline">
                View All
              </button>
            }
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {trending.map((t, i) => (
              <Link key={t.name} href={`/creator/${slug(t.name)}`}>
              <Photo seed={t.name} dark className="h-[185px] rounded-2xl">
                <span
                  className={`absolute left-2.5 top-2.5 rounded-md px-2 py-1 text-[11.5px] font-extrabold text-white ${
                    i === 0 ? "bg-orange-500" : "bg-black/55 backdrop-blur"
                  }`}
                >
                  {t.rank}
                </span>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10">
                  <p className="flex items-center gap-1.5 text-[13.5px] font-bold text-white">
                    {t.name} <Sparkles size={12} className="fill-brand-400 text-brand-400" />
                  </p>
                  <p className="flex items-center gap-1.5 text-[11.5px] text-white/70">
                    {t.role}
                    <span className="ml-auto flex items-center gap-1 font-semibold text-white/90">
                      <Users size={11} /> {t.views}
                    </span>
                  </p>
                </div>
              </Photo>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <aside className="hidden w-[368px] shrink-0 space-y-4 xl:block">
        <Card className="p-4">
          <SectionHead title="Search by Category" />
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {categoryGrid.map(({ label, icon: Icon }) => (
              <button
                key={label}
                className="flex h-11 items-center gap-2.5 rounded-xl border border-line px-3.5 text-[13px] font-semibold hover:bg-canvas"
              >
                <Icon size={16} className="text-ink/70" />
                {label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionHead title="Top Creators Today" />
          <div className="mt-3 space-y-3.5">
            {topToday.map((c, i) => (
              <Link key={c.name}
                href={`/creator/${slug(c.name)}`}
                className="flex items-center gap-3"
              >
                <span className="w-3 text-[12.5px] font-bold text-muted">{i + 1}</span>
                <Avatar name={c.name} size={38} />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="flex items-center gap-1 truncate text-[13.5px] font-bold">
                    {c.name} <Verified size={13} />
                  </p>
                  <p className="truncate text-[12px] text-muted">{c.role}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-[12.5px] font-bold">
                  {c.n} <ArrowUp size={13} className="text-emerald-500" />
                </span>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionHead title="Popular Hashtags" />
          <div className="mt-3 space-y-3">
            {hashtags.map((h) => (
              <div key={h.tag} className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-[14px] font-bold text-brand-600">
                  #
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-[13.5px] font-bold">{h.tag}</p>
                  <p className="text-[12px] text-muted">{h.posts}</p>
                </div>
                <div className="flex -space-x-1.5">
                  {[0, 1, 2].map((k) => (
                    <Avatar
                      key={k}
                      name={k === 0 ? "Ananya Sharma" : k === 1 ? "Rohit Gamer" : "Meera Art"}
                      size={24}
                      ring="#fff"
                    />
                  ))}
                </div>
                <ChevronRight size={16} className="text-muted" />
              </div>
            ))}
          </div>
        </Card>
      </aside>
    </div>
  );
}
