"use client";

import {
  ArrowRight,
  Bell,
  Briefcase,
  ChevronDown,
  Coffee,
  Dumbbell,
  GraduationCap,
  Heart,
  LayoutGrid,
  Lock,
  MoreHorizontal,
  Music,
  Palette,
  Play,
  Plane,
  Search,
  Shirt,
  Sparkles,
  Star,
  Gamepad2,
  Users,
} from "lucide-react";
import Link from "next/link";;
import { Avatar, Photo, Verified } from "@/ui/Media.jsx";
import { slug } from "@/data.js";

const navLinks = ["Home", "Creators", "Categories", "Live", "Community", "Blog"];

const categories = [
  { label: "All", icon: LayoutGrid },
  { label: "Fitness", icon: Dumbbell },
  { label: "Fashion", icon: Shirt },
  { label: "Gaming", icon: Gamepad2 },
  { label: "Travel", icon: Plane },
  { label: "Music", icon: Music },
  { label: "Art", icon: Palette },
  { label: "Education", icon: GraduationCap },
  { label: "Business", icon: Briefcase },
  { label: "Lifestyle", icon: Coffee },
  { label: "More", icon: MoreHorizontal },
];

const stats = [
  { icon: Users, tint: "bg-brand-50 text-brand-600", value: "10K+", label: "Creators" },
  { icon: Users, tint: "bg-sky-50 text-sky-600", value: "500K+", label: "Active Fans" },
  { icon: Lock, tint: "bg-emerald-50 text-emerald-600", value: "2M+", label: "Exclusive Posts" },
  { icon: Heart, tint: "bg-rose-50 text-rose-500", value: "4.9", label: "User Rating", stars: true },
];

const topCreators = [
  { name: "Ananya Sharma", role: "Fashion & Lifestyle" },
  { name: "Rohit Gamer", role: "Gaming" },
  { name: "Meera Art", role: "Artist" },
  { name: "Arjun Fitness", role: "Fitness Coach" },
  { name: "Wander With Karan", role: "Travel Creator" },
  { name: "Fit With Neha", role: "Fitness Coach" },
];

function CollageCard({ name, role, seed, className = "", style }) {
  return (
    <Photo
      seed={seed}
      dark
      className={`rounded-2xl shadow-[0_18px_40px_-14px_rgba(15,15,20,.45)] ${className}`}
      style={style}
    >
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/85 to-transparent p-3 pt-8">
        <Avatar name={name} size={26} />
        <div className="min-w-0 leading-tight">
          <p className="flex items-center gap-1 truncate text-[12.5px] font-bold text-white">
            {name} <Verified size={12} />
          </p>
          <p className="truncate text-[10.5px] text-white/70">{role}</p>
        </div>
        <span className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/20 text-white backdrop-blur">
          <Lock size={11} />
        </span>
      </div>
    </Photo>
  );
}

export default function Landing() {
  return (
    <div className="min-h-full bg-white">
      <header className="sticky top-0 z-30 flex h-[72px] items-center gap-8 border-b border-line bg-white px-8">
        <Link href="/" className="flex items-center gap-2.5" title="Enter the app">
          <span className="relative grid h-8 w-8 place-items-center">
            <span className="absolute inset-0 rounded-full border-[3.5px] border-[#141419] border-r-transparent" />
            <Sparkles size={11} className="absolute -right-0.5 -top-0.5 fill-brand-500 text-brand-500" />
          </span>
          <span className="text-[21px] font-extrabold tracking-tight">Creavora</span>
        </Link>

        <nav className="hidden items-center gap-8 xl:flex">
          {navLinks.map((l, i) => (
            <a
              key={l}
              href="#"
              className={`relative py-1 text-[14.5px] font-semibold ${
                i === 0 ? "text-brand-600" : "text-ink/75 hover:text-ink"
              }`}
            >
              {l}
              {i === 0 && (
                <span className="absolute inset-x-0 -bottom-1 h-[2.5px] rounded-full bg-brand-600" />
              )}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-6">
          <label className="relative hidden items-center md:flex">
            <input
              placeholder="Search creators, topics..."
              className="h-11 w-[260px] rounded-full border border-line bg-canvas pl-5 pr-12 text-[13.5px] outline-none placeholder:text-muted focus:border-brand-300 focus:bg-white"
            />
            <Search size={16} className="absolute right-4 text-muted" />
          </label>
          <button className="flex items-center gap-1 text-[13.5px] font-bold">
            EN <ChevronDown size={14} className="text-muted" />
          </button>
          <Link href="/studio" className="text-[14px] font-bold hover:text-brand-600">
            Become a Creator
          </Link>
          <Bell size={19} className="text-ink/70" />
          <Link href="/profile" title="My profile">
            <Avatar name="Arjun Singh" size={36} />
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-8 pb-16 pt-14">
        <div className="mx-auto grid max-w-[1500px] items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="pt-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-[13px] font-bold text-brand-700">
              <Sparkles size={14} className="fill-brand-500 text-brand-500" />
              The Premium Creator Platform
            </span>

            <h1 className="mt-7 text-[68px] font-extrabold leading-[1.06] tracking-[-0.03em]">
              Support Your
              <br />
              Favorite Creators.
              <br />
              <span className="bg-gradient-to-r from-[#f0399a] via-[#7c3aed] to-[#3b9dff] bg-clip-text text-transparent">
                Connect. Enjoy. Belong.
              </span>
            </h1>

            <p className="mt-6 max-w-[460px] text-[17px] leading-relaxed text-muted">
              Subscribe to exclusive content, live streams, and private
              communities from creators you love.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/explore"
                className="flex h-[58px] items-center gap-3 rounded-full bg-brand-600 pl-8 pr-3 text-[16px] font-bold text-white hover:bg-brand-700"
              >
                Explore Creators
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20">
                  <ArrowRight size={17} />
                </span>
              </Link>
              <button className="flex h-[58px] items-center gap-3 rounded-full border border-line bg-white pl-8 pr-3 text-[16px] font-bold hover:bg-canvas">
                How It Works
                <span className="grid h-9 w-9 place-items-center rounded-full bg-canvas">
                  <Play size={15} className="fill-ink text-ink" />
                </span>
              </button>
            </div>

            <div className="mt-10 grid max-w-[680px] grid-cols-2 gap-y-6 rounded-2xl border border-line bg-white p-6 shadow-[0_10px_30px_-20px_rgba(15,15,20,.4)] sm:grid-cols-4">
              {stats.map(({ icon: Icon, tint, value, label, stars }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${tint}`}>
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="flex items-center gap-1 text-[17px] font-extrabold">
                      {value}
                      {stars && (
                        <span className="flex text-[10px] text-amber-400">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                          ))}
                        </span>
                      )}
                    </p>
                    <p className="text-[12.5px] text-muted">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[560px]">
            <CollageCard
              name="Rohit Gamer"
              role="Gaming"
              seed="rohit-stream"
              className="absolute left-[2%] top-[6%] h-[200px] w-[215px] -rotate-6"
            />
            <CollageCard
              name="Arjun Fitness"
              role="Fitness Coach"
              seed="arjun-gym"
              className="absolute right-[6%] top-[4%] h-[210px] w-[215px] rotate-3"
            />
            <CollageCard
              name="Meera Art"
              role="Artist"
              seed="meera-studio"
              className="absolute left-[4%] top-[46%] h-[210px] w-[210px] -rotate-3"
            />
            <CollageCard
              name="Wander With Karan"
              role="Travel Creator"
              seed="karan-himachal"
              className="absolute right-[3%] top-[45%] h-[212px] w-[215px] rotate-2"
            />

            <Photo
              seed="ananya-hero"
              className="absolute left-1/2 top-[2%] h-[460px] w-[280px] -translate-x-1/2 rounded-3xl shadow-[0_30px_70px_-24px_rgba(15,15,20,.55)]"
            >
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 bg-gradient-to-t from-black/80 to-transparent p-4 pt-14">
                <Avatar name="Ananya Sharma" size={30} />
                <div className="leading-tight">
                  <p className="flex items-center gap-1 text-[14px] font-bold text-white">
                    Ananya Sharma <Verified size={13} />
                  </p>
                  <p className="text-[11.5px] text-white/75">Fashion &amp; Lifestyle</p>
                </div>
                <span className="ml-auto grid h-7 w-7 place-items-center rounded-full bg-white/20 text-white backdrop-blur">
                  <Lock size={12} />
                </span>
              </div>
            </Photo>

            <div className="absolute left-1/2 top-0 flex -translate-x-[10%] items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-[0_12px_28px_-12px_rgba(15,15,20,.45)]">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600">
                <Star size={12} className="fill-white text-white" />
              </span>
              <span className="text-[13.5px] font-bold text-brand-700">Top Creator</span>
            </div>

            <div className="absolute bottom-[2%] left-[22%] flex items-center gap-3 rounded-full bg-white px-4 py-2.5 shadow-[0_12px_28px_-12px_rgba(15,15,20,.45)]">
              <div className="flex -space-x-2">
                {["Neha", "Rohit", "Meera"].map((n) => (
                  <Avatar key={n} name={n} size={26} ring="#fff" />
                ))}
              </div>
              <div className="leading-tight">
                <p className="text-[13px] font-bold">Join 500K+</p>
                <p className="text-[11.5px] text-muted">Happy Fans</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex items-stretch gap-2 overflow-x-auto rounded-2xl border border-line bg-white px-4 py-4 no-scrollbar">
            {categories.map(({ label, icon: Icon }, i) => (
              <button
                key={label}
                className={`relative flex min-w-[104px] flex-1 flex-col items-center gap-2.5 rounded-xl py-3 text-[13px] font-semibold transition ${
                  i === 0 ? "text-brand-600" : "text-ink/80 hover:bg-canvas"
                }`}
              >
                <Icon size={22} />
                {label}
                {i === 0 && (
                  <span className="absolute inset-x-5 -bottom-4 h-[3px] rounded-full bg-brand-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-12">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="flex items-center gap-2.5 text-[27px] font-extrabold tracking-tight">
                Top Creators
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600">
                  <Star size={13} className="fill-white text-white" />
                </span>
              </h2>
              <p className="mt-1.5 text-[14.5px] text-muted">
                Discover the most loved creators on Creavora this week.
              </p>
            </div>
            <button className="flex h-11 items-center gap-2 rounded-full border border-line bg-white px-5 text-[14px] font-bold hover:bg-canvas">
              View All <ArrowRight size={15} />
            </button>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {topCreators.map((c) => (
              <Link key={c.name} href={`/creator/${slug(c.name)}`}>
                <CollageCard {...c} seed={c.name} className="h-[230px] w-full !rotate-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
