import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Command,
  Crown,
  DollarSign,
  LayoutDashboard,
  LayoutGrid,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  Tv,
  Users,
  Megaphone,
  Wallet,
} from "lucide-react";
import { Avatar, Verified } from "../ui/Media.jsx";
import { Logo, UserMenu } from "./FanLayout.jsx";
import { Home, User } from "lucide-react";

const creatorMenu = [
  { to: "/profile", label: "My Profile", icon: User },
  { to: "/studio/content", label: "Content", icon: LayoutDashboard },
  { to: "/studio/earnings", label: "Earnings", icon: DollarSign },
  { to: "/studio/community", label: "Community", icon: Users },
  { to: "/", label: "Switch to Fan View", icon: Home },
  { to: "/landing", label: "Landing Page", icon: Crown },
];

const nav = [
  { to: "/studio", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/studio/content", label: "Content", icon: LayoutGrid },
  { to: "/studio/live", label: "Live & Events", icon: Tv },
  { to: "/studio/messages", label: "Messages", icon: MessageSquare, count: 23 },
  { to: "/studio/subscribers", label: "Subscribers", icon: Users },
  { to: "/studio/earnings", label: "Earnings", icon: DollarSign },
  { to: "/studio/analytics", label: "Analytics", icon: TrendingUp },
  { to: "/studio/payouts", label: "Payouts", icon: Wallet },
  { to: "/studio/promotions", label: "Promotions", icon: Megaphone },
  { to: "/studio/community", label: "Community", icon: Users },
  { to: "/studio/settings", label: "Settings", icon: Settings },
];

export function CreatorTopBar({
  placeholder = "Search anything...",
  coins = 230,
  createLabel = "Create",
  title,
  subtitle,
  right,
}) {
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center gap-4 border-b border-line bg-white px-6">
      <div className="w-[196px] shrink-0">
        {title ? (
          <div>
            <h1 className="text-[21px] font-extrabold tracking-tight">{title}</h1>
            <p className="text-[12.5px] text-muted">{subtitle}</p>
          </div>
        ) : (
          <Logo />
        )}
      </div>

      {!title && (
        <div className="flex flex-1 justify-center">
          <label className="relative flex w-full max-w-[540px] items-center">
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
      )}
      {title && <div className="flex-1" />}

      <div className="flex shrink-0 items-center gap-3">
        {right ?? (
          <button className="flex h-11 items-center gap-2 rounded-full bg-brand-600 px-5 text-[14px] font-bold text-white hover:bg-brand-700">
            <Plus size={17} /> {createLabel}
          </button>
        )}
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
        <UserMenu
          name="Ananya Sharma"
          label="Ananya Sharma"
          sub="Creator"
          items={creatorMenu}
        />
      </div>
    </header>
  );
}

function ProfileCard() {
  return (
    <Link to="/creator/ananya-sharma" className="block rounded-2xl bg-brand-50/70 p-3.5 hover:bg-brand-50">
      <div className="flex items-center gap-3">
        <Avatar name="Ananya Sharma" size={46} />
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[14.5px] font-bold">
            Ananya Sharma <Verified size={14} />
          </p>
          <p className="text-[12px] text-muted">@ananyasharma</p>
        </div>
      </div>
      <span className="mt-2.5 inline-block rounded-md bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-700">
        Creator Account
      </span>
    </Link>
  );
}

function PlanCard() {
  return (
    <div className="rounded-2xl bg-brand-50/70 p-5 text-center">
      <Crown size={26} className="mx-auto fill-brand-500 text-brand-500" />
      <p className="mt-2.5 text-[14.5px] font-bold">You're on Premium Plan</p>
      <p className="mt-2 text-[12.5px] leading-snug text-muted">
        Your plan renews on
        <br />
        25 May 2024
      </p>
      <button className="mt-3.5 h-9 w-full rounded-lg border border-brand-200 bg-white text-[13px] font-bold text-brand-700 hover:bg-brand-50">
        Manage Plan
      </button>
    </div>
  );
}

export default function CreatorLayout({ children, topbar }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-full bg-white">
      <CreatorTopBar {...topbar} />
      <div className="flex">
        <aside className="sticky top-[76px] hidden h-[calc(100vh-76px)] w-[244px] shrink-0 flex-col overflow-y-auto border-r border-line px-4 py-4 lg:flex">
          <ProfileCard />
          <nav className="mt-4 space-y-1">
            {nav.map(({ to, label, icon: Icon, count, end }) => {
              const active = end ? pathname === to : pathname.startsWith(to);
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`flex h-11 items-center gap-3.5 rounded-xl px-3.5 text-[14.5px] font-semibold transition ${
                    active ? "bg-brand-50 text-brand-700" : "text-ink/80 hover:bg-canvas"
                  }`}
                >
                  <Icon size={19} className={active ? "text-brand-600" : "text-ink/70"} />
                  <span className="flex-1">{label}</span>
                  {count != null && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">
                      {count}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
          <div className="mt-auto pb-6 pt-6">
            <PlanCard />
          </div>
        </aside>
        <main className="min-w-0 flex-1 bg-canvas">{children}</main>
      </div>
    </div>
  );
}
