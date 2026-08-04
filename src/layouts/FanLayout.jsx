"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Compass, LayoutGrid, LogOut, Sparkles } from "lucide-react";

const nav = [
  { href: "/feed", label: "Feed", icon: LayoutGrid },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

const accountLinks = [
  ...nav,
  { href: "/landing", label: "Landing page", icon: LogOut },
];

const initials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

function AccountAvatar({ name, size = "h-10 w-10" }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-extrabold text-brand-700 ${size}`}
      aria-label={`${name} avatar`}
    >
      {initials(name)}
    </span>
  );
}

export function Logo({ className = "" }) {
  return (
    <Link
      href="/landing"
      title="Go to the Creavora landing page"
      className={`flex w-fit items-center gap-2.5 ${className}`}
    >
      <Sparkles size={26} className="fill-brand-500 text-brand-500" />
      <span className="text-[22px] font-extrabold tracking-tight">Creavora</span>
    </Link>
  );
}

export function UserMenu({ name, label, sub, items, user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const displayName = name || user?.name || "Account";
  const displayLabel = label ?? user?.name ?? "Account";
  const displaySub = sub ?? (user?.handle ? `@${user.handle}` : null);
  const links = items ?? accountLinks;

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-label="Open account menu"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2.5 rounded-full pl-1 pr-1 hover:bg-canvas"
      >
        <AccountAvatar name={displayName} size="h-[38px] w-[38px]" />
        {displayLabel ? (
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-[13.5px] font-bold">{displayLabel}</span>
            {displaySub ? (
              <span className="block text-[11.5px] font-semibold text-muted">{displaySub}</span>
            ) : null}
          </span>
        ) : null}
        <ChevronDown
          size={15}
          className={`text-muted transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[248px] overflow-hidden rounded-2xl border border-line bg-white py-2 shadow-[0_18px_44px_-16px_rgba(15,15,20,.35)]">
          <div className="flex items-center gap-3 px-4 pb-3 pt-1">
            <AccountAvatar name={displayName} />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[13.5px] font-bold">{displayLabel}</p>
              {displaySub ? <p className="truncate text-[12px] text-muted">{displaySub}</p> : null}
            </div>
          </div>
          <div className="border-t border-line pt-1.5">
            {links.map(({ href, label: itemLabel, icon: Icon }) => (
              <Link
                key={`${href}:${itemLabel}`}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-semibold hover:bg-canvas"
              >
                <Icon size={16} className="text-ink/60" />
                {itemLabel}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function TopBar({ user, unreadNotifications }) {
  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center gap-4 border-b border-line bg-white px-4 sm:px-6">
      <div className="shrink-0 sm:w-[196px]">
        <Logo />
      </div>
      <div className="hidden flex-1 justify-center md:flex">
        <Link
          href="/explore"
          className="flex h-11 w-full max-w-[560px] items-center gap-3 rounded-full border border-line bg-canvas px-4 text-sm font-semibold text-muted hover:border-brand-300 hover:bg-white hover:text-ink"
        >
          <Compass size={17} aria-hidden="true" />
          Explore Creavora
        </Link>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-canvas"
        >
          <Bell size={19} />
          {typeof unreadNotifications === "number" && unreadNotifications > 0 ? (
            <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {unreadNotifications}
            </span>
          ) : null}
        </Link>
        <UserMenu user={user} />
      </div>
    </header>
  );
}

function SideNav({ unreadNotifications }) {
  const pathname = usePathname() || "";

  return (
    <nav className="space-y-1" aria-label="Consumer navigation">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const count = label === "Notifications" ? unreadNotifications : null;
        return (
          <Link
            key={href}
            href={href}
            className={`flex h-11 items-center gap-3.5 rounded-xl px-3.5 text-[14.5px] font-semibold transition ${
              active ? "bg-brand-50 font-bold text-brand-700" : "text-ink/80 hover:bg-canvas"
            }`}
          >
            <Icon size={19} className={active ? "text-brand-600" : "text-ink/70"} />
            <span className="flex-1">{label}</span>
            {typeof count === "number" && count > 0 ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export default function FanLayout({ children, topbar }) {
  const [user, setUser] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch("/api/auth/me", { signal: controller.signal }).then((response) =>
        response.ok ? response.json() : null,
      ),
      fetch("/api/notifications", { signal: controller.signal }).then((response) =>
        response.ok ? response.json() : null,
      ),
    ])
      .then(([nextUser, notifications]) => {
        if (nextUser) setUser(nextUser);
        if (Array.isArray(notifications)) {
          setUnreadNotifications(notifications.filter((notification) => !notification.read).length);
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") console.error("Unable to load consumer navigation", error);
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <TopBar {...topbar} user={user} unreadNotifications={unreadNotifications} />
      <div className="flex">
        <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[244px] shrink-0 overflow-y-auto border-r border-line px-4 py-4 lg:block">
          <SideNav unreadNotifications={unreadNotifications} />
        </aside>
        <main className="min-w-0 flex-1 bg-canvas">{children}</main>
      </div>
    </div>
  );
}
