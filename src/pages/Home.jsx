import {
  ArrowRight,
  Bell,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Crown,
  Flame,
  Gift,
  PlayCircle,
  Settings2,
  Sparkles,
  Star,
  TrendingUp,
  UserPlus,
  Users,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, SectionHead } from "../ui/Bits.jsx";
import { Avatar, Photo, Verified } from "../ui/Media.jsx";
import { creators, slug } from "../data.js";

const quickLinks = [
  { icon: Video, tint: "bg-rose-50 text-rose-500", title: "Live Now", sub: "24 Live" },
  { icon: Star, tint: "bg-amber-50 text-amber-500", title: "Top Creators", sub: "Most Popular" },
  { icon: UserPlus, tint: "bg-emerald-50 text-emerald-600", title: "New Creators", sub: "Just Joined" },
  { icon: TrendingUp, tint: "bg-sky-50 text-sky-600", title: "Trending", sub: "This Week" },
  { icon: Flame, tint: "bg-orange-50 text-orange-500", title: "Challenges", sub: "Join & Win" },
  { icon: Users, tint: "bg-brand-50 text-brand-600", title: "Communities", sub: "Connect" },
];

const liveSessions = [
  { day: "24", mon: "MAY", title: "Live Q&A Session", who: "Ananya Sharma", when: "Today, 7:00 PM" },
  { day: "24", mon: "MAY", title: "Gaming Stream", who: "Rohit Gamer", when: "Today, 8:30 PM" },
  { day: "25", mon: "MAY", title: "Art Workshop", who: "Meera Art", when: "Tomorrow, 5:00 PM" },
];

const rewards = [
  { icon: CircleCheck, label: "Daily Login", xp: "+50 XP", progress: null },
  { icon: PlayCircle, label: "Watch 3 Live Streams", xp: "+100 XP", progress: "2 / 3" },
  { icon: Users, label: "Refer a Friend", xp: "+200 XP", progress: "0 / 1" },
];

function Carousel({ title, children, viewAll = true }) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[21px] font-extrabold tracking-tight">{title}</h2>
        <div className="flex items-center gap-2">
          {viewAll && (
            <button className="text-[13px] font-semibold text-brand-600 hover:underline">
              View All
            </button>
          )}
          <button className="grid h-8 w-8 place-items-center rounded-full border border-line bg-white text-muted hover:bg-canvas">
            <ChevronLeft size={15} />
          </button>
          <button className="grid h-8 w-8 place-items-center rounded-full border border-line bg-white text-muted hover:bg-canvas">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="flex gap-6 px-6 py-6 xl:pr-6">
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[25px] font-extrabold tracking-tight">
              Good morning, Arjun! 👋
            </h1>
            <p className="mt-1 text-[14px] text-muted">
              Ready to discover something amazing today?
            </p>
          </div>
          <button className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13.5px] font-semibold hover:bg-white/70">
            Customize <Settings2 size={15} />
          </button>
        </div>

        {/* hero banner */}
        <div className="relative mt-5 overflow-hidden rounded-2xl bg-[#141419] p-9">
          <div className="relative z-10 max-w-[420px]">
            <h2 className="text-[38px] font-extrabold leading-[1.12] tracking-tight text-white">
              Where creators
              <br />
              <span className="bg-gradient-to-r from-[#f0399a] to-[#a97bff] bg-clip-text text-transparent">
                come closer.
              </span>
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-white/70">
              Exclusive content, real connections,
              <br />
              unforgettable experiences.
            </p>
            <Link
              to="/explore"
              className="mt-7 flex w-fit items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-[14px] font-bold text-white hover:bg-brand-500"
            >
              Explore Creators
            </Link>
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[520px] items-center justify-end gap-3 pr-6 md:flex">
            <div className="flex flex-col gap-3">
              <Photo seed="rohit-stream" dark className="h-[115px] w-[110px] rounded-xl">
                <MiniLabel name="Rohit Gamer" role="Gaming Creator" />
              </Photo>
              <Photo seed="meera-studio" dark className="h-[150px] w-[110px] rounded-xl">
                <MiniLabel name="Meera Art" role="Digital Artist" />
              </Photo>
            </div>
            <Photo seed="ananya-hero" className="h-[290px] w-[200px] rounded-2xl">
              <MiniLabel name="Ananya Sharma" role="Fashion Creator" big />
            </Photo>
            <div className="flex flex-col gap-3">
              <Photo seed="karan-himachal" dark className="h-[115px] w-[110px] rounded-xl">
                <MiniLabel name="Wander With Karan" role="Travel Creator" />
              </Photo>
              <Photo seed="neha-fit" dark className="h-[150px] w-[110px] rounded-xl">
                <MiniLabel name="Fit With Neha" role="Fitness Coach" />
              </Photo>
            </div>
          </div>

          <span className="absolute right-[248px] top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg">
            <Crown size={16} className="fill-brand-500 text-brand-500" />
          </span>
        </div>

        {/* quick links strip */}
        <Card className="mt-4 flex items-stretch gap-1 overflow-x-auto px-3 py-3 no-scrollbar">
          {quickLinks.map(({ icon: Icon, tint, title, sub }) => (
            <button
              key={title}
              className="flex min-w-[168px] flex-1 items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-canvas"
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tint}`}>
                <Icon size={18} />
              </span>
              <span className="leading-tight">
                <span className="block text-[13.5px] font-bold">{title}</span>
                <span className="block text-[12px] text-muted">{sub}</span>
              </span>
            </button>
          ))}
        </Card>

        <Carousel title="Recommended For You">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {creators.map((c, i) => (
              <Card key={c.name} className="overflow-hidden">
                <Link to={`/creator/${slug(c.name)}`} className="block">
                <Photo seed={c.name} dark className="relative h-[150px]">
                  {i === 0 && (
                    <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-rose-500">
                      <Flame size={11} className="fill-rose-500" /> Trending
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 pt-10">
                    <div className="flex items-center gap-2">
                      <Avatar name={c.name} size={26} />
                      <div className="min-w-0 leading-tight">
                        <p className="flex items-center gap-1 truncate text-[12.5px] font-bold text-white">
                          {c.name} <Verified size={12} />
                        </p>
                        <p className="truncate text-[10.5px] text-white/70">{c.role}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-[11.5px] font-medium text-white/80">
                      {c.posts} Posts
                    </p>
                  </div>
                </Photo>
                </Link>
                <div className="flex items-center justify-between px-3 py-3">
                  <p className="text-[13.5px] font-extrabold">
                    ₹{c.price}
                    <span className="text-[11.5px] font-medium text-muted"> / month</span>
                  </p>
                  <Link
                    to="/checkout"
                    className="flex h-8 items-center rounded-lg bg-brand-600 px-3.5 text-[12.5px] font-bold text-white hover:bg-brand-700"
                  >
                    Subscribe
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </Carousel>

        <Carousel title="Live Right Now">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              { seed: "live-ananya", views: "1.2K", live: true },
              { seed: "live-rohit", views: "890", live: true },
              { seed: "live-neha", views: "567", live: true },
              { seed: "live-meera", views: "450" },
              { seed: "live-karan", views: "320" },
            ].map((l) => (
              <Photo key={l.seed} seed={l.seed} dark className="h-[150px] rounded-2xl">
                {l.live && (
                  <span className="absolute left-2.5 top-2.5 rounded-md bg-rose-500 px-2 py-0.5 text-[10.5px] font-extrabold tracking-wide text-white">
                    LIVE
                  </span>
                )}
                <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur">
                  <Users size={11} /> {l.views}
                </span>
              </Photo>
            ))}
          </div>
        </Carousel>
      </div>

      {/* right rail */}
      <aside className="hidden w-[320px] shrink-0 space-y-4 xl:block">
        <Card className="p-4">
          <SectionHead title="Your Subscriptions" />
          <div className="mt-3 space-y-3.5">
            {creators.slice(0, 4).map((c) => (
              <Link
                key={c.name}
                to={`/creator/${slug(c.name)}`}
                className="flex items-center gap-3"
              >
                <Avatar name={c.name} size={38} />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-[13.5px] font-bold">{c.name}</p>
                  <p className="truncate text-[12px] text-muted">{c.role}</p>
                </div>
                <Bell size={16} className="text-brand-600" />
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionHead title="Upcoming Live Sessions" />
          <div className="mt-3 space-y-3">
            {liveSessions.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-canvas leading-none">
                  <span className="text-[15px] font-extrabold">{s.day}</span>
                  <span className="text-[9.5px] font-bold text-muted">{s.mon}</span>
                </div>
                <Photo seed={s.who} dark className="h-11 w-10 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-[13px] font-bold">{s.title}</p>
                  <p className="truncate text-[11.5px] text-muted">{s.who}</p>
                  <p className="truncate text-[11.5px] text-muted">{s.when}</p>
                </div>
                <button className="h-7 shrink-0 rounded-lg border border-brand-200 px-2.5 text-[11.5px] font-bold text-brand-700 hover:bg-brand-50">
                  Remind Me
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionHead title="Fan Rewards" />
          <div className="mt-3 flex items-center gap-3">
            <Avatar name="Arjun Singh" size={34} />
            <div className="flex-1">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold">Level 3 – Super Fan</span>
                <span className="font-semibold text-muted">
                  <b className="text-ink">650</b> / 1000 XP
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
                <div className="h-full w-[65%] rounded-full bg-brand-600" />
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {rewards.map(({ icon: Icon, label, xp, progress }) => (
              <div key={label} className="flex items-center gap-3 text-[13px]">
                <Icon size={17} className="text-emerald-500" />
                <span className="flex-1 font-semibold">{label}</span>
                <span className="font-bold text-brand-600">{xp}</span>
                {progress && (
                  <span className="w-9 text-right text-[11.5px] text-muted">{progress}</span>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-[#8b5cf6] to-[#e05fd6] p-5 text-white">
          <p className="flex items-center gap-1.5 text-[16px] font-extrabold">
            Invite &amp; Earn <Gift size={16} />
          </p>
          <p className="mt-1.5 max-w-[190px] text-[12.5px] leading-snug text-white/85">
            Earn up to ₹500 for every friend you invite!
          </p>
          <button className="mt-3.5 h-8 rounded-lg bg-white px-4 text-[12.5px] font-bold text-brand-700">
            Invite Now
          </button>
          <Gift
            size={110}
            className="pointer-events-none absolute -bottom-4 -right-3 text-white/25"
          />
        </div>
      </aside>
    </div>
  );
}

function MiniLabel({ name, role, big }) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/85 to-transparent p-2 pt-7">
      <Avatar name={name} size={big ? 24 : 18} />
      <div className="min-w-0 leading-tight">
        <p
          className={`flex items-center gap-1 truncate font-bold text-white ${
            big ? "text-[12.5px]" : "text-[10px]"
          }`}
        >
          {name} <Verified size={big ? 12 : 9} />
        </p>
        <p className={`truncate text-white/70 ${big ? "text-[10.5px]" : "text-[8.5px]"}`}>
          {role}
        </p>
      </div>
    </div>
  );
}
