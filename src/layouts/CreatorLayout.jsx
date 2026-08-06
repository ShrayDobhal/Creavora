"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
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
import { Verified } from "../ui/Media.jsx";
import { ConsumerAvatar } from "@/components/consumer/CreatorCard";
import { Logo, UserMenu } from "./FanLayout.jsx";
import { Home, User } from "lucide-react";

const creatorMenu = [
  { href: "/studio/settings", label: "Edit Profile", icon: User },
  { href: "/studio/content", label: "Content", icon: LayoutDashboard },
  { href: "/studio/earnings", label: "Earnings", icon: DollarSign },
  { href: "/studio/community", label: "Community", icon: Users },
  { href: "/", label: "Switch to Fan View", icon: Home },
  { href: "/landing", label: "Landing Page", icon: Crown },
];

const nav = [
  { href: "/studio", label: "Dashboard", icon: LayoutDashboard, end: true },
  { href: "/studio/content", label: "Content", icon: LayoutGrid },
  { href: "/studio/live", label: "Live & Events", icon: Tv },
  { href: "/studio/messages", label: "Messages", icon: MessageSquare },
  { href: "/studio/subscribers", label: "Subscribers", icon: Users },
  { href: "/studio/earnings", label: "Earnings", icon: DollarSign },
  { href: "/studio/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/studio/payouts", label: "Payouts", icon: Wallet },
  { href: "/studio/promotions", label: "Promotions", icon: Megaphone },
  { href: "/studio/community", label: "Community", icon: Users },
  { href: "/studio/settings", label: "Settings", icon: Settings },
];

export function CreatorTopBar({
  placeholder = "Search anything...",
  coins = 230,
  createLabel = "Create",
  title,
  subtitle,
  right,
  user,
  unreadNotifications = 0,
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-[76px] min-w-0 items-center gap-2 border-b border-line bg-white px-3 shadow-[0_1px_0_rgba(15,15,20,.04)] sm:gap-4 sm:px-6">
      <div className="min-w-0 shrink-0 sm:w-[196px]">
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
        <div className="hidden flex-1 justify-center md:flex">
          <form action="/studio/search" method="get" role="search" className="relative flex w-full max-w-[540px] items-center">
            <Search size={17} className="absolute left-4 text-muted" />
            <input
              name="q"
              type="search"
              aria-label="Search creators, posts, and communities"
              placeholder={placeholder}
              className="h-11 w-full rounded-full border border-line bg-canvas pl-11 pr-16 text-[14px] outline-none placeholder:text-muted focus:border-brand-300 focus:bg-white"
            />
            <span className="absolute right-4 flex items-center gap-0.5 text-[12px] font-semibold text-muted">
              <Command size={12} /> K
            </span>
          </form>
        </div>
      )}
      {title && <div className="flex-1" />}

      <div className="flex shrink-0 items-center gap-3">
        {right ?? (
          <Link href="/feed#create-post" aria-label="Create post" className="flex h-11 items-center gap-2 rounded-full bg-brand-600 px-3 text-[14px] font-bold text-white hover:bg-brand-700 cursor-pointer sm:px-5">
            <Plus size={17} /> <span className="hidden sm:inline">{createLabel}</span>
          </Link>
        )}
        {coins != null && (
          <span className="hidden h-10 items-center gap-1.5 rounded-full bg-brand-50 px-3.5 text-[13px] font-bold text-brand-700 xl:flex">
            <Sparkles size={14} className="fill-brand-500 text-brand-500" />
            {coins}
          </span>
        )}
        <Link href="/studio/notifications" className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-canvas cursor-pointer text-ink">
          <Bell size={19} />
          {unreadNotifications > 0 && (
            <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse">
              {unreadNotifications}
            </span>
          )}
        </Link>
        <UserMenu
          name={user?.name || "Creator"}
          label={user?.name || "Creator"}
          sub="Creator Portal"
          items={creatorMenu}
          user={user}
        />
      </div>
    </header>
  );
}

export default function CreatorLayout({ children, topbar }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchUser = () => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setUser(data);
        }
      })
      .catch((err) => console.error("Error loading creator layout state:", err));
  };

  const fetchNotifications = () => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          const count = data.filter((n) => !n.read).length;
          setUnreadNotifications(count);
        }
      })
      .catch((err) => console.error("Error loading notifications:", err));
  };

  useEffect(() => {
    fetchUser();
    fetchNotifications();
    const notificationPoll = window.setInterval(fetchNotifications, 30_000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") fetchNotifications();
    };

    window.addEventListener("user-update", fetchUser);
    window.addEventListener("notifications-update", fetchNotifications);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(notificationPoll);
      window.removeEventListener("user-update", fetchUser);
      window.removeEventListener("notifications-update", fetchNotifications);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  return (
    <div className="min-h-dvh overflow-x-clip bg-white pt-[76px]">
      <CreatorTopBar
        {...topbar}
        coins={user ? Math.round(user.walletBalance) : 0}
        user={user}
        unreadNotifications={unreadNotifications}
      />
      <div>
        <aside className="no-scrollbar fixed bottom-0 left-0 top-[76px] z-20 hidden w-[244px] flex-col overflow-y-auto overscroll-contain border-r border-line bg-white px-4 py-4 lg:flex">
          {user && (
            <Link href="/studio/profile" className="block rounded-2xl bg-brand-50/70 p-3.5 hover:bg-brand-50">
              <div className="flex items-center gap-3">
                <ConsumerAvatar creator={user} size="h-[46px] w-[46px]" />
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-[14.5px] font-bold">
                    {user.name} <Verified size={14} />
                  </p>
                  <p className="text-[12px] text-muted">@{user.handle}</p>
                </div>
              </div>
              <span className="mt-2.5 inline-block rounded-md bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                Creator Account
              </span>
            </Link>
          )}
          <nav className="mt-4 space-y-1">
            {nav.map(({ href, label, icon: Icon, count, end }) => {
              const active = end ? pathname === href : pathname.startsWith(href);
              const displayCount = label === "Messages" ? count : (label === "Notifications" ? unreadNotifications : null);
              return (
                <Link
                  key={href + label}
                  href={href}
                  className={`flex h-11 items-center gap-3.5 rounded-xl px-3.5 text-[14.5px] font-semibold transition ${
                    active ? "bg-brand-50 text-brand-700 font-bold" : "text-ink/80 hover:bg-canvas"
                  }`}
                >
                  <Icon size={19} className={active ? "text-brand-600" : "text-ink/70"} />
                  <span className="flex-1">{label}</span>
                  {displayCount != null && displayCount > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">
                      {displayCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-h-[calc(100dvh-76px)] min-w-0 overflow-x-hidden bg-canvas lg:ml-[244px]">{children}</main>
      </div>
    </div>
  );
}
