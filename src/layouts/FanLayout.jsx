import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Bell,
  Bookmark,
  Command,
  Crown,
  Gift,
  Home,
  LayoutGrid,
  Library,
  MessageCircle,
  MessageSquare,
  Plus,
  Radio,
  Search,
  Settings,
  Sparkles,
  Compass,
  Wallet,
  ChevronDown,
  ArrowRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import { Avatar } from "../ui/Media.jsx";

const nav = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/feed", label: "Feed", icon: LayoutGrid },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/live", label: "Live Now", icon: Radio, live: true },
  { to: "/subscriptions", label: "Subscriptions", icon: Library },
  { to: "/messages", label: "Messages", icon: MessageSquare, count: 2 },
  { to: "/notifications", label: "Notifications", icon: Bell, count: 3 },
  { to: "/collections", label: "Collections", icon: Library },
  { to: "/wallet", label: "My Wallet", icon: Wallet },
  { to: "/rewards", label: "Earn Rewards", icon: Gift },
  { to: "/saved", label: "Saved Posts", icon: Bookmark },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Logo({ className = "" }) {
  return (
    <Link
      to="/landing"
      title="Go to the Crevora landing page"
      className={`flex w-fit items-center gap-2.5 ${className}`}
    >
      <Sparkles size={26} className="fill-brand-500 text-brand-500" />
      <span className="text-[22px] font-extrabold tracking-tight">Crevora</span>
    </Link>
  );
}

/** Account menu — the only route into /profile, /checkout and the creator studio. */
export function UserMenu({
  name = "Arjun Singh",
  label = "Hey, Arjun",
  sub = "Premium Fan",
  items,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const links = items ?? [
    { to: "/profile", label: "My Profile", icon: User },
    { to: "/creator/ananya-sharma", label: "Browse a Creator", icon: Sparkles },
    { to: "/checkout", label: "Subscription & Billing", icon: CreditCard },
    { to: "/wallet", label: "My Wallet", icon: Wallet },
    { to: "/studio/content", label: "Creator Studio", icon: LayoutDashboard },
    { to: "/landing", label: "Landing Page", icon: LogOut },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-full pl-1 pr-1 hover:bg-canvas"
      >
        <Avatar name={name} size={38} />
        {label && (
          <span className="text-left leading-tight">
            <span className="block text-[13.5px] font-bold">{label}</span>
            <span className="block text-[11.5px] font-semibold text-brand-600">{sub}</span>
          </span>
        )}
        <ChevronDown
          size={15}
          className={`text-muted transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[248px] overflow-hidden rounded-2xl border border-line bg-white py-2 shadow-[0_18px_44px_-16px_rgba(15,15,20,.35)]">
          <div className="flex items-center gap-3 px-4 pb-3 pt-1">
            <Avatar name={name} size={40} />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[13.5px] font-bold">{name}</p>
              <p className="truncate text-[12px] text-muted">{sub}</p>
            </div>
          </div>
          <div className="border-t border-line pt-1.5">
            {links.map(({ to, label: l, icon: Icon }) => (
              <Link
                key={to + l}
                to={to}
                className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-semibold hover:bg-canvas"
              >
                <Icon size={16} className="text-ink/60" />
                {l}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TopBar({ placeholder = "Search creators, posts, topics...", coins = 120, greeting = true }) {
  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center gap-4 border-b border-line bg-white px-6">
      <div className="w-[196px] shrink-0">
        <Logo />
      </div>

      <div className="flex flex-1 justify-center">
        <label className="relative flex w-full max-w-[560px] items-center">
          <Search size={17} className="absolute left-4 text-muted" />
          <input
            placeholder={placeholder}
            className="h-11 w-full rounded-full border border-line bg-canvas pl-11 pr-16 text-[14px] outline-none placeholder:text-muted focus:border-brand-300 focus:bg-white"
          />
          <span className="absolute right-4 flex items-center gap-0.5 text-[12px] font-semibold text-muted">
            <Command size={12} /> K
          </span>
        </label>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button className="flex h-11 items-center gap-2 rounded-full bg-brand-600 px-5 text-[14px] font-bold text-white hover:bg-brand-700">
          <Plus size={17} /> Create
        </button>

        {coins != null && (
          <span className="flex h-10 items-center gap-1.5 rounded-full bg-brand-50 px-3.5 text-[13px] font-bold text-brand-700">
            <Sparkles size={14} className="fill-brand-500 text-brand-500" />
            {coins}
          </span>
        )}

        <button className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-canvas">
          <Bell size={19} />
          <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>
        <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-canvas">
          <MessageCircle size={19} />
        </button>

        <UserMenu label={greeting ? "Hey, Arjun" : ""} />
      </div>
    </header>
  );
}

function SideNav() {
  const { pathname } = useLocation();
  return (
    <nav className="space-y-1">
      {nav.map(({ to, label, icon: Icon, count, live, end }) => {
        const active = end ? pathname === to : pathname.startsWith(to);
        return (
          <NavLink
            key={to}
            to={to}
            className={`flex h-11 items-center gap-3.5 rounded-xl px-3.5 text-[14.5px] font-semibold transition ${
              active
                ? "bg-brand-50 text-brand-700"
                : "text-ink/80 hover:bg-canvas"
            }`}
          >
            <Icon size={19} className={active ? "text-brand-600" : "text-ink/70"} />
            <span className="flex-1">{label}</span>
            {count != null && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
            {live && (
              <span className="rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide text-white">
                LIVE
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function PremiumCard() {
  return (
    <div className="rounded-2xl bg-[#141419] p-4 text-white">
      <div className="flex items-start gap-2.5">
        <Crown size={20} className="mt-0.5 shrink-0 fill-brand-400 text-brand-400" />
        <div>
          <p className="text-[15px] font-bold">Go Premium</p>
          <p className="mt-1 text-[12px] leading-snug text-white/60">
            Unlock exclusive content, early access &amp; more.
          </p>
        </div>
      </div>
      <Link
        to="/checkout"
        className="mt-3.5 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-[13px] font-bold hover:bg-brand-500"
      >
        Upgrade Now <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export function WalletCard() {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12.5px] font-semibold text-muted">Wallet Balance</p>
          <p className="mt-1 text-[24px] font-extrabold tracking-tight">₹1,250.00</p>
        </div>
        <button className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-white">
          <Plus size={15} />
        </button>
      </div>
      <div className="mt-3.5 grid grid-cols-2 border-t border-line pt-3 text-[13px]">
        <div>
          <p className="text-[12px] font-medium text-muted">Following</p>
          <p className="mt-0.5 text-[17px] font-bold">128</p>
        </div>
        <div className="border-l border-line pl-4">
          <p className="text-[12px] font-medium text-muted">Followers</p>
          <p className="mt-0.5 text-[17px] font-bold">2.4K</p>
        </div>
      </div>
    </div>
  );
}

export default function FanLayout({ children, topbar }) {
  return (
    <div className="min-h-full bg-white">
      <TopBar {...topbar} />
      <div className="flex">
        <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[244px] shrink-0 overflow-y-auto border-r border-line px-4 py-4 lg:block">
          <SideNav />
          <div className="mt-5 space-y-4 pb-6">
            <PremiumCard />
            <WalletCard />
          </div>
        </aside>
        <main className="min-w-0 flex-1 bg-canvas">{children}</main>
      </div>
    </div>
  );
}
