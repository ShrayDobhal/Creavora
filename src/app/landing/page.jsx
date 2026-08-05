import {
  ArrowRight,
  Coffee,
  Cpu,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  Laugh,
  Lock,
  Music,
  Palette,
  Plane,
  Shirt,
  Sparkles,
  Trophy,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CATEGORY_OPTIONS } from "@/lib/consumer/constants";

const navLinks = [
  { label: "Purpose", href: "#purpose" },
  { label: "Categories", href: "#categories" },
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
                <Link href="/register" className="group flex h-12 items-center gap-3 rounded-full bg-brand-600 px-6 text-sm font-bold text-white shadow-[0_18px_34px_-14px_rgba(107,63,239,.65)] hover:bg-brand-700">
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

            <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] bg-[#171126] shadow-[0_35px_70px_-28px_rgba(52,24,112,.55)]">
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
                <div key={label} className="flex min-h-28 flex-col justify-between rounded-2xl border border-line bg-white p-4">
                  <Icon size={22} className="text-brand-600" aria-hidden="true" />
                  <span className="text-sm font-bold">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="community" className="scroll-mt-24 px-5 pb-16 sm:px-8 lg:pb-24">
          <div className="mx-auto grid max-w-[1500px] gap-10 overflow-hidden rounded-[2rem] bg-[#15131d] p-7 text-white sm:p-10 lg:grid-cols-[.8fr_1.2fr] lg:p-14">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-300">Grounded community evidence</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Community proof you can inspect</h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/65">
                No anonymous testimonials or inflated totals. The evidence is in product paths you can open and verify.
              </p>
            </div>
            <ol className="divide-y divide-white/10 border-y border-white/10">
              <li className="grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-300">Public discovery</p>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">Creator profiles and public community results come from the application discovery service, not a fixed landing-page catalogue.</p>
                </div>
                <Link href="/explore" className="flex items-center gap-2 text-sm font-bold text-white hover:text-brand-300">
                  Browse discovery <ArrowRight size={15} />
                </Link>
              </li>
              <li className="grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-300">Following state</p>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">Following is stored through the social API and has a dedicated feed mode for the creators a member chooses.</p>
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
              <Link href="/register" className="flex h-12 items-center rounded-full bg-brand-600 px-6 text-sm font-bold text-white hover:bg-brand-700">Join as a fan</Link>
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
