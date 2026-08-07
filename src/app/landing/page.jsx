import {
  ArrowRight,
  Bookmark,
  Coffee,
  Cpu,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  Laugh,
  Lock,
  MessageCircle,
  Music,
  Palette,
  Plane,
  Shirt,
  Sparkles,
  Trophy,
  UploadCloud,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CATEGORY_OPTIONS } from "@/lib/consumer/constants";

const navLinks = [
  { label: "Purpose", href: "#purpose" },
  { label: "Categories", href: "#categories" },
  { label: "Experience", href: "#experience" },
  { label: "Community", href: "#community" },
];

const categoryIcons = {
  Art: Palette,
  Comedy: Laugh,
  Education: GraduationCap,
  Fashion: Shirt,
  Fitness: Dumbbell,
  Food: UtensilsCrossed,
  Gaming: Gamepad2,
  Lifestyle: Coffee,
  Music,
  Sports: Trophy,
  Technology: Cpu,
  Travel: Plane,
};

const categories = CATEGORY_OPTIONS.map((label) => ({
  label,
  icon: categoryIcons[label],
}));

export default function Landing() {
  return (
    <div className="min-h-full bg-white">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[72px] max-w-[1500px] items-center gap-6 px-5 sm:px-8">
          <Link href="/landing" className="flex items-center gap-2.5" aria-label="Blindly home">
            <span className="relative grid h-8 w-8 place-items-center" aria-hidden="true">
              <span className="absolute inset-0 rounded-full border-[3.5px] border-[#141419] border-r-transparent" />
              <Sparkles size={11} className="absolute -right-0.5 -top-0.5 fill-brand-500 text-brand-500" />
            </span>
            <span className="text-xl font-extrabold tracking-tight">Blindly</span>
          </Link>

          <nav className="ml-4 hidden items-center gap-6 lg:flex" aria-label="Landing page">
            {navLinks.map(({ label, href }) => (
              <a key={href} href={href} className="text-sm font-semibold text-ink/70 hover:text-ink">
                {label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="hidden px-3 py-2 text-sm font-bold hover:text-brand-600 sm:inline-flex">
              User Login
            </Link>
            <Link href="/creator-login" className="px-3 py-2 text-sm font-bold hover:text-brand-600">
              Creator Login
            </Link>
            <Link href="/register" className="hidden h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700 md:flex">
              Join Blindly
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section id="purpose" className="scroll-mt-24 px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
          <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-[minmax(0,.88fr)_minmax(0,1.12fr)]">
            <div className="animate-fade-up">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-700">
                Direct creator communities
              </p>
              <h1 className="mt-5 text-5xl font-extrabold leading-[1.03] tracking-[-0.045em] sm:text-6xl xl:text-[72px]">
                Follow the work
                <br />
                Know the creator
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
                Discover independent creators, follow new releases, and keep the conversations you care about in one place.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/register?role=USER" className="group flex h-12 items-center gap-3 rounded-full bg-brand-600 px-6 text-sm font-bold text-white shadow-[0_18px_34px_-14px_rgba(107,63,239,.65)] hover:bg-brand-700">
                  Create a fan account
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link href="/explore" className="flex h-12 items-center rounded-full border border-line px-6 text-sm font-bold hover:bg-canvas">
                  Explore creators
                </Link>
              </div>
              <p className="mt-5 text-sm text-muted">
                Already a member? <Link href="/login" className="font-bold text-brand-700 hover:underline">User Login</Link>
              </p>
            </div>

            <div className="landing-hero-media relative min-h-[520px] overflow-hidden rounded-[2rem] bg-[#171126] shadow-[0_35px_70px_-28px_rgba(52,24,112,.55)]">
              <Image
                src="/images/creator-collective-hero.png"
                alt="Creators working together in a content studio"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 56vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#110b1d]/75 via-transparent to-[#12091f]/15" />
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/15 bg-black/35 p-5 text-white backdrop-blur-md sm:left-8 sm:right-auto sm:max-w-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">One shared space</p>
                <p className="mt-2 text-xl font-extrabold">Discover, follow, and return.</p>
              </div>
              <div className="animate-float absolute right-7 top-7 hidden rounded-2xl border border-white/15 bg-white/90 p-4 text-ink shadow-xl backdrop-blur sm:block">
                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-brand-700">Creator drop</p>
                <p className="mt-1 text-sm font-black">New work in your feed</p>
              </div>
              <div className="animate-float-delayed absolute bottom-28 right-7 hidden rounded-2xl border border-white/15 bg-[#15131d]/90 p-4 text-white shadow-xl backdrop-blur md:block">
                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-brand-300">Community</p>
                <p className="mt-1 text-sm font-black">Follow, comment, return</p>
              </div>
            </div>
          </div>
        </section>

        <section id="categories" className="scroll-mt-24 bg-canvas px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-[1500px]">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-700">Categories</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Start with what moves you</h2>
              </div>
              <Link href="/explore" className="flex items-center gap-2 text-sm font-bold text-brand-700 hover:underline">
                Browse active creator profiles <ArrowRight size={15} />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-11">
              {categories.map(({ label, icon: Icon }) => (
                <Link key={label} href={`/explore?category=${encodeURIComponent(label)}`} className="landing-lift flex min-h-28 flex-col justify-between rounded-2xl border border-line bg-white p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500">
                  <Icon size={22} className="text-brand-600" aria-hidden="true" />
                  <span className="text-sm font-bold">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="scroll-mt-24 px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-[1500px]">
            <div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-700">Built around the work</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">A clearer way to stay close to creators</h2><p className="mt-4 text-base leading-7 text-muted">Blindly keeps discovery, posts, conversations and creator communities connected so every return feels familiar</p></div>
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {[
                [Bookmark, "Build a personal feed", "Follow the creators you value, save posts for later and move between categories without losing your place"],
                [MessageCircle, "Join real conversations", "Open a post, respond to the work and continue conversations through creator communities and messages"],
                [UploadCloud, "Publish with control", "Creators preview their media, publish from one studio and see real engagement and earnings data in the same workspace"],
              ].map(([Icon, title, copy], index) => <article key={title} className="landing-lift relative overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-sm"><span className="absolute right-5 top-4 text-6xl font-black text-brand-50">0{index + 1}</span><span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Icon size={21} /></span><h3 className="relative mt-8 text-xl font-black">{title}</h3><p className="relative mt-3 text-sm leading-7 text-muted">{copy}</p></article>)}
            </div>
          </div>
        </section>

        <section id="community" className="scroll-mt-24 px-5 pb-16 sm:px-8 lg:pb-24">
          <div className="mx-auto grid max-w-[1500px] gap-10 overflow-hidden rounded-[2rem] bg-[#15131d] p-7 text-white sm:p-10 lg:grid-cols-[.8fr_1.2fr] lg:p-14">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-300">Your community stays connected</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Discover the work and keep the connection</h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/65">
                Move naturally from a creator profile to their newest post, live interaction or community conversation
              </p>
            </div>
            <ol className="divide-y divide-white/10 border-y border-white/10">
              <li className="grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-300">Find your people</p>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">Search by creator, topic or category and open a complete profile from anywhere their card appears</p>
                </div>
                <Link href="/explore" className="flex items-center gap-2 text-sm font-bold text-white hover:text-brand-300">
                  Browse discovery <ArrowRight size={15} />
                </Link>
              </li>
              <li className="grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-300">Return to what matters</p>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">Your following feed, saved posts and notifications keep each creator relationship easy to continue</p>
                </div>
                <Link href="/feed" className="flex items-center gap-2 text-sm font-bold text-white hover:text-brand-300">
                  Open the following feed <ArrowRight size={15} />
                </Link>
              </li>
            </ol>
          </div>
        </section>

        <section className="border-y border-line bg-brand-50 px-5 py-16 sm:px-8">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <Lock size={24} className="text-brand-600" aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">One platform, two clear entry points</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">Join as a fan to discover creators, or enter the creator portal to manage your studio.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/register?role=USER" className="flex h-12 items-center rounded-full bg-brand-600 px-6 text-sm font-bold text-white hover:bg-brand-700">Join as a fan</Link>
              <Link href="/creator-login" className="flex h-12 items-center rounded-full border border-brand-200 bg-white px-6 text-sm font-bold text-brand-700 hover:bg-brand-100">Enter creator portal</Link>
            </div>
            <Link href="/register?role=CREATOR" className="mt-5 text-sm font-bold text-brand-700 hover:underline">Register as a creator</Link>
          </div>
        </section>
      </main>

      <footer className="px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Blindly is built for creators and the people who follow their work</p>
          <div className="flex gap-5">
            <Link href="/explore" className="font-semibold hover:text-ink">Explore</Link>
            <Link href="/login" className="font-semibold hover:text-ink">User Login</Link>
            <Link href="/creator-login" className="font-semibold hover:text-ink">Creator portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
