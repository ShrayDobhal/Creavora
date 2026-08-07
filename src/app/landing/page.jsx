import {
  ArrowRight,
  BarChart3,
  Bell,
  Briefcase,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  CircleDollarSign,
  Coffee,
  Compass,
  Cpu,
  Dumbbell,
  FolderOpen,
  Gamepad2,
  GraduationCap,
  Heart,
  Inbox,
  Laugh,
  Library,
  Lock,
  Megaphone,
  MessageCircle,
  Music,
  Palette,
  Plane,
  Radio,
  Search,
  ShieldCheck,
  Shirt,
  Sparkles,
  Star,
  Trophy,
  UploadCloud,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CATEGORY_OPTIONS } from "@/lib/consumer/constants";

const navLinks = [
  { label: "Categories", href: "#categories" },
  { label: "Why Blindly", href: "#why-blindly" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "FAQ", href: "#faq" },
];

const categoryStyles = [
  "bg-[#fff0f5] text-[#b8326f] border-[#f8cadc]",
  "bg-[#f1edff] text-[#6236d7] border-[#dcd2ff]",
  "bg-[#eaf6ff] text-[#1768a5] border-[#c6e6fb]",
  "bg-[#eafaf2] text-[#147653] border-[#c4ebd8]",
  "bg-[#fff7df] text-[#8f6207] border-[#f4dea1]",
  "bg-[#f2f3ff] text-[#4f51b5] border-[#d9dbfa]",
  "bg-[#fff1e8] text-[#a84c18] border-[#f4d0ba]",
  "bg-[#edf9f7] text-[#14766e] border-[#c8ebe6]",
  "bg-[#eef5ff] text-[#295fa8] border-[#cedff8]",
  "bg-[#fff0f7] text-[#a83874] border-[#f6cee2]",
  "bg-[#f2f8e9] text-[#54781f] border-[#d8e9be]",
  "bg-[#fff4e8] text-[#9c5512] border-[#f1d6b7]",
  "bg-[#f4efff] text-[#6b3fba] border-[#ddd0f7]",
  "bg-[#edf7ff] text-[#19698b] border-[#c8e7f5]",
];

const landingCategories = [
  ["Fashion", Shirt],
  ["Gaming", Gamepad2],
  ["Technology", Cpu],
  ["Fitness", Dumbbell],
  ["Education", GraduationCap],
  ["Photography", Camera],
  ["Comedy", Laugh],
  ["Food", UtensilsCrossed],
  ["Travel", Plane],
  ["Music", Music],
  ["Sports", Trophy],
  ["Business", Briefcase],
  ["Lifestyle", Coffee],
  ["Art", Palette],
].map(([label, icon], index) => ({
  label,
  icon,
  className: categoryStyles[index],
  href: CATEGORY_OPTIONS.includes(label)
    ? `/explore?category=${encodeURIComponent(label)}`
    : `/explore?q=${encodeURIComponent(label)}`,
}));

const whyItems = [
  [Search, "Discover", "Find creators through recommendations, trending categories and a feed shaped by what you follow"],
  [MessageCircle, "Connect", "Comment, chat, react, attend live interactions and take part in creator communities"],
  [Heart, "Support", "Unlock memberships, exclusive releases and subscriber-only experiences directly from creators"],
];

const steps = [
  ["01", "Discover creators you will actually enjoy", "Explore curated categories, trending creators and recommendations built around your interests"],
  ["02", "Follow and join communities", "Receive updates, interact with posts, attend live interactions and stay connected beyond the algorithm"],
  ["03", "Never miss what matters", "Keep posts, events, conversations and exclusive releases from followed creators in one clean feed"],
];

const fanFeatures = [
  "Premium posts", "Exclusive videos", "Behind the scenes", "Live interactions", "Community discussions",
  "Subscriber-only content", "Collections", "Direct messaging", "Event invitations", "Early access",
];

const creatorFeatures = [
  [UploadCloud, "Studio uploads"], [BarChart3, "Analytics"], [Users, "Community management"],
  [CircleDollarSign, "Subscriptions"], [Inbox, "Creator inbox"], [Megaphone, "Promotions"],
  [CalendarDays, "Scheduling"], [Wallet, "Earnings dashboard"], [Library, "Media library"], [Radio, "Live streaming"],
];

const platformFeatures = [
  [Bell, "Personalized feed", "See new work and updates from the creators you care about"],
  [Users, "Communities", "Join dedicated spaces for discussions, polls, announcements and events"],
  [Radio, "Live experiences", "Attend creator Q&A sessions, workshops and launches"],
  [FolderOpen, "Exclusive content", "Unlock subscriber-only posts, collections, documents and media"],
  [Compass, "Smart discovery", "Explore creators using interests, categories and trending topics"],
  [ShieldCheck, "Secure memberships", "Subscribe with confidence using flexible creator-set plans"],
];

const testimonials = [
  ["Blindly helped me build an actual community instead of chasing algorithms", "Digital artist"],
  ["The conversations here feel genuine. I keep coming back", "Community member"],
  ["Content, subscribers, analytics and live sessions finally live in one place", "Fitness creator"],
];

const faqs = [
  ["What is Blindly", "Blindly is a creator-first platform where independent creators build communities, share exclusive content, host live interactions and grow recurring memberships"],
  ["Is Blindly free", "Yes. Anyone can create a fan account and discover creators for free. Premium memberships are optional and priced by individual creators"],
  ["Can I become a creator", "Yes. Choose Creator Login to enter the creator onboarding flow and begin building your community"],
  ["What kinds of creators are on Blindly", "Artists, musicians, educators, gamers, fitness coaches, photographers, developers, comedians, filmmakers, podcasters and many more"],
];

function Logo() {
  return (
    <Link href="/landing" className="flex items-center gap-2.5" aria-label="Blindly home">
      <span className="relative grid h-8 w-8 place-items-center" aria-hidden="true">
        <span className="absolute inset-0 rounded-full border-[3.5px] border-[#141419] border-r-transparent" />
        <Sparkles size={11} className="absolute -right-0.5 -top-0.5 fill-brand-500 text-brand-500" />
      </span>
      <span className="text-xl font-extrabold tracking-tight">Blindly</span>
    </Link>
  );
}

export default function Landing() {
  return (
    <div className="min-h-full bg-white">
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[70px] max-w-[1440px] items-center gap-6 px-5 sm:px-8">
          <Logo />
          <nav className="ml-4 hidden items-center gap-6 xl:flex" aria-label="Landing page">
            {navLinks.map(({ label, href }) => (
              <a key={href} href={href} className="text-sm font-semibold text-ink/65 transition-colors hover:text-brand-700">{label}</a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
            <Link href="/login" className="hidden px-3 py-2 text-sm font-bold transition-colors hover:text-brand-600 sm:inline-flex">User Login</Link>
            <Link href="/creator-login" className="px-3 py-2 text-sm font-bold transition-colors hover:text-brand-600">Creator Login</Link>
            <Link href="/register" className="hidden h-10 items-center rounded-full bg-brand-600 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-700 md:flex">Join Blindly</Link>
          </div>
        </div>
      </header>

      <main>
        <section id="purpose" className="scroll-mt-24 overflow-hidden px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
          <div className="mx-auto grid max-w-[1440px] items-center gap-9 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
            <div className="animate-fade-up">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-700">Creator communities without the noise</p>
              <h1 className="mt-4 max-w-2xl text-5xl font-extrabold leading-[1.02] tracking-[-0.05em] sm:text-6xl xl:text-[70px]">
                Follow the work
                <br />
                Join the story
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-muted">Discover independent creators, follow new releases and continue the conversations that matter in one beautifully focused place</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register?role=USER" className="group flex h-12 w-full items-center justify-center gap-3 rounded-full bg-brand-600 px-6 text-sm font-bold text-white shadow-[0_18px_34px_-14px_rgba(107,63,239,.65)] transition hover:-translate-y-1 hover:bg-brand-700 sm:w-auto">
                  Create a fan account <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/explore" className="flex h-12 w-full items-center justify-center rounded-full border border-line bg-white px-6 text-sm font-bold transition hover:-translate-y-1 hover:border-brand-200 hover:bg-brand-50 sm:w-auto">Explore creators</Link>
              </div>
              <p className="mt-5 text-sm text-muted">Already a member? <Link href="/login" className="font-bold text-brand-700 hover:underline">User Login</Link></p>
            </div>

            <div className="landing-hero-media relative min-h-[430px] overflow-hidden rounded-[2rem] bg-[#171126] shadow-[0_35px_70px_-28px_rgba(52,24,112,.55)] sm:min-h-[500px]">
              <Image src="/images/creator-collective-hero.png" alt="Creators working together in a content studio" fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#110b1d]/80 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-black/40 p-5 text-white backdrop-blur-md sm:bottom-7 sm:left-7 sm:right-auto sm:max-w-md">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-300">One shared space</p>
                <p className="mt-2 text-xl font-extrabold">Discover, connect and keep coming back</p>
              </div>
            </div>
          </div>
        </section>

        <section id="categories" className="landing-section scroll-mt-24 bg-[#f7f5ff] px-5 py-14 sm:px-8 lg:py-16">
          <div className="mx-auto max-w-[1440px]">
            <div className="max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-700">Featured categories</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">Explore communities you will love</h2>
              <p className="mt-4 text-base leading-7 text-muted">Find creators across every passion and discover communities where conversations continue long after the content ends</p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
              {landingCategories.map(({ label, icon: Icon, className, href }) => (
                <Link key={label} href={href} className={`landing-category-card group flex min-h-24 items-center gap-3 rounded-2xl border p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${className}`}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/75 shadow-sm transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110"><Icon size={20} aria-hidden="true" /></span>
                  <span className="min-w-0 text-sm font-extrabold">{label}</span>
                </Link>
              ))}
            </div>
            <Link href="/explore" className="landing-arrow-link mt-7 inline-flex items-center gap-2 text-sm font-bold text-brand-700">Browse all creators <ArrowRight size={16} /></Link>
          </div>
        </section>

        <section id="why-blindly" className="landing-section scroll-mt-24 px-5 py-14 sm:px-8 lg:py-18">
          <div className="mx-auto max-w-[1440px]">
            <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-700">Why Blindly</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">More than content<br />A place to belong</h2>
              </div>
              <p className="max-w-2xl text-base leading-8 text-muted">Most platforms stop after publishing. Blindly helps creators build communities where conversations, memberships, live interactions and exclusive experiences happen together</p>
            </div>
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {whyItems.map(([Icon, title, copy], index) => (
                <article key={title} className={`landing-lift relative overflow-hidden rounded-3xl border p-6 ${["border-[#d8d0ff] bg-[#f2efff]", "border-[#bfe8dc] bg-[#eaf9f3]", "border-[#f7d4bf] bg-[#fff1e8]"][index]}`}>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-brand-700 shadow-sm"><Icon size={21} /></span>
                  <h3 className="mt-7 text-xl font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-ink/65">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="landing-section scroll-mt-24 px-5 py-6 sm:px-8">
          <div className="mx-auto max-w-[1440px] overflow-hidden rounded-[2rem] bg-[#15131d] px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-300">How it works</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">Three simple steps</h2>
            <div className="mt-9 grid gap-px overflow-hidden rounded-3xl bg-white/10 lg:grid-cols-3">
              {steps.map(([number, title, copy]) => (
                <article key={number} className="group bg-[#1d1a27] p-6 transition-colors duration-300 hover:bg-[#272136] sm:p-8">
                  <span className="text-sm font-black tracking-[0.2em] text-brand-300">{number}</span>
                  <h3 className="mt-7 text-xl font-black leading-7">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/60">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section px-5 py-14 sm:px-8 lg:py-18">
          <div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-2">
            <article className="rounded-[2rem] border border-[#d8d0ff] bg-[#f2efff] p-7 sm:p-9">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-700">For fans</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight">Everything your favorite creators share</h2>
              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {fanFeatures.map((feature) => <p key={feature} className="flex items-center gap-3 rounded-xl bg-white/80 px-4 py-3 text-sm font-bold"><Check size={16} className="text-brand-600" /> {feature}</p>)}
              </div>
              <Link href="/register?role=USER" className="landing-arrow-link mt-7 inline-flex items-center gap-2 text-sm font-bold text-brand-700">Join as a fan <ArrowRight size={16} /></Link>
            </article>

            <article className="rounded-[2rem] border border-[#20202a] bg-[#15131d] p-7 text-white sm:p-9">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-300">For creators</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight">Build more than an audience</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">Publish content, manage memberships, host live events, understand your audience and grow recurring revenue from one unified dashboard</p>
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {creatorFeatures.map(([Icon, feature]) => <div key={feature} className="group rounded-2xl border border-white/10 bg-white/[.06] p-4 transition duration-300 hover:-translate-y-1 hover:border-brand-400/50 hover:bg-brand-500/10"><Icon size={18} className="text-brand-300" /><p className="mt-3 text-xs font-bold leading-5 text-white/85">{feature}</p></div>)}
              </div>
              <Link href="/creator-login" className="landing-arrow-link mt-7 inline-flex items-center gap-2 text-sm font-bold text-brand-300">Open creator portal <ArrowRight size={16} /></Link>
            </article>
          </div>
        </section>

        <section id="features" className="landing-section scroll-mt-24 bg-[#f7fafc] px-5 py-14 sm:px-8 lg:py-18">
          <div className="mx-auto max-w-[1440px]">
            <div className="max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-700">Platform features</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">Designed around meaningful creator relationships</h2>
            </div>
            <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {platformFeatures.map(([Icon, title, copy], index) => (
                <article key={title} className={`landing-lift rounded-3xl border p-6 ${["border-[#d8d0ff] bg-[#f2efff]", "border-[#c9e8dc] bg-[#edf9f4]", "border-[#f3d4bd] bg-[#fff3eb]", "border-[#cbe3f4] bg-[#edf7fd]", "border-[#f0d1e3] bg-[#fff1f7]", "border-[#e8dda9] bg-[#fff9e8]"][index]}`}>
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/80 text-brand-700 shadow-sm"><Icon size={20} /></span>
                  <h3 className="mt-6 text-lg font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-ink/60">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section px-5 py-14 sm:px-8 lg:py-18">
          <div className="mx-auto max-w-[1440px]">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-700">Community voices</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">Loved by creators and communities</h2></div>
              <div className="flex gap-1 text-amber-500" aria-label="Community rating"><Star size={17} fill="currentColor" /><Star size={17} fill="currentColor" /><Star size={17} fill="currentColor" /><Star size={17} fill="currentColor" /><Star size={17} fill="currentColor" /></div>
            </div>
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {testimonials.map(([quote, role], index) => (
                <figure key={role} className={`landing-lift rounded-3xl border p-6 ${["border-[#d8d0ff] bg-[#f5f2ff]", "border-[#c7e9df] bg-[#effaf6]", "border-[#f2d5c0] bg-[#fff4ed]"][index]}`}>
                  <blockquote className="text-lg font-bold leading-8">“{quote}”</blockquote>
                  <figcaption className="mt-6 text-xs font-extrabold uppercase tracking-[0.16em] text-ink/45">{role}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="landing-section scroll-mt-24 bg-[#f7f5ff] px-5 py-14 sm:px-8 lg:py-18">
          <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[.65fr_1.35fr]">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-700">FAQ</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">Questions before you join</h2><p className="mt-4 text-sm leading-7 text-muted">Everything you need to understand the Blindly experience</p></div>
            <div className="space-y-3">
              {faqs.map(([question, answer]) => (
                <details key={question} className="group rounded-2xl border border-line bg-white px-5 py-4 shadow-sm open:border-brand-200">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-extrabold">{question}<ChevronDown size={17} className="shrink-0 text-brand-600 transition-transform group-open:rotate-180" /></summary>
                  <p className="mt-4 border-t border-line pt-4 text-sm leading-7 text-muted">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-12 sm:px-8 lg:py-16">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-600 to-[#ad4387] px-6 py-12 text-center text-white shadow-[0_30px_70px_-35px_rgba(76,35,170,.75)] sm:px-10">
            <Lock size={23} className="text-brand-200" />
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl">Find your people on Blindly</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">Join as a fan to discover creators or enter the creator portal to build your own community</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/register?role=USER" className="flex h-12 items-center rounded-full bg-white px-6 text-sm font-bold text-brand-700 transition hover:-translate-y-1 hover:bg-brand-50">Join as a fan</Link>
              <Link href="/creator-login" className="flex h-12 items-center rounded-full border border-white/30 bg-white/10 px-6 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-white/20">Enter creator portal</Link>
            </div>
            <Link href="/register?role=CREATOR" className="mt-5 text-sm font-bold text-white/85 hover:text-white hover:underline">Register as a creator</Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4"><Logo /><p className="hidden text-xs sm:block">For creators and the people who follow their work</p></div>
          <div className="flex flex-wrap gap-5"><Link href="/explore" className="font-semibold hover:text-ink">Explore</Link><Link href="/login" className="font-semibold hover:text-ink">User Login</Link><Link href="/creator-login" className="font-semibold hover:text-ink">Creator portal</Link></div>
        </div>
      </footer>
    </div>
  );
}
