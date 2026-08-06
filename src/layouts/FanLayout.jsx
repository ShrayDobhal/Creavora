"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, BadgeCheck, Bell, Bookmark, ChevronDown, Compass, FolderHeart, LogOut, MessageCircle, Plus, Radio, Settings, Sparkles, UserRound, WalletCards } from "lucide-react";
import ConsumerWorkspaceNav from "@/components/consumer/ConsumerWorkspaceNav";
import ResponsiveNav from "@/components/consumer/ResponsiveNav";

const accountLinks = [
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/live", label: "Live", icon: Radio },
  { href: "/subscriptions", label: "Subscriptions", icon: BadgeCheck },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/collections", label: "Collections", icon: FolderHeart },
  { href: "/wallet", label: "Wallet", icon: WalletCards },
  { href: "/rewards", label: "Rewards", icon: Award },
  { href: "/saved", label: "Saved Posts", icon: Bookmark },
  { href: "/settings", label: "Settings", icon: Settings },
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
      title="Go to the Blindly landing page"
      className={`flex w-fit items-center gap-2.5 ${className}`}
    >
      <Sparkles size={26} className="fill-brand-500 text-brand-500" />
      <span className="text-[22px] font-extrabold tracking-tight">Blindly</span>
    </Link>
  );
}

export function UserMenu({ name, label, sub, items, user }) {
  const [open, setOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef(null);
  const router = useRouter();
  const displayName = name || user?.name || "Account";
  const displayLabel = label ?? user?.name ?? "Account";
  const displaySub = sub ?? (user?.handle ? `@${user.handle}` : null);
  const links = items ?? accountLinks;

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const signOut = async () => {
    setLogoutError("");
    setSigningOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("Logout request failed");
      setOpen(false);
      window.dispatchEvent(new Event("user-update"));
      router.push("/landing");
      router.refresh();
    } catch {
      setLogoutError("Unable to sign out, please try again");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-label="Open account menu"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2.5 rounded-full pl-1 pr-1 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
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
                className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-semibold hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-600"
              >
                <Icon size={16} className="text-ink/60" />
                {itemLabel}
              </Link>
            ))}
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13.5px] font-semibold text-rose-700 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-600 disabled:cursor-wait disabled:opacity-60"
            >
              <LogOut size={16} aria-hidden="true" />
              {signingOut ? "Signing out" : "Sign out"}
            </button>
            {logoutError ? <p className="px-4 pb-1 text-xs font-semibold text-rose-700" role="alert">{logoutError}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function TopBar({ user, unreadNotifications }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-[72px] min-w-0 items-center gap-4 border-b border-line bg-white px-3 shadow-[0_1px_0_rgba(15,15,20,.04)] sm:px-6">
      <div className="shrink-0 sm:w-[196px]">
        <Logo />
      </div>
      <div className="hidden flex-1 justify-center md:flex">
        <Link
          href="/explore"
          className="flex h-11 w-full max-w-[560px] items-center gap-3 rounded-full border border-line bg-canvas px-4 text-sm font-semibold text-muted hover:border-brand-300 hover:bg-white hover:text-ink"
        >
          <Compass size={17} aria-hidden="true" />
          Explore Blindly
        </Link>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <Link href="/feed#create-post" className="hidden min-h-10 items-center gap-2 rounded-full bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700 sm:inline-flex"><Plus size={17} /> Create post</Link>
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

export default function FanLayout({ children, topbar }) {
  const [user, setUser] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(null);

  useEffect(() => {
    let userController;
    let notificationsController;

    const loadUser = () => {
      userController?.abort();
      const controller = new AbortController();
      userController = controller;
      fetch("/api/auth/me", { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : null))
        .then((nextUser) => {
          if (nextUser) setUser(nextUser);
        })
        .catch((error) => {
          if (error.name !== "AbortError") console.error("Unable to load account identity", error);
        });
    };

    const loadNotifications = () => {
      notificationsController?.abort();
      const controller = new AbortController();
      notificationsController = controller;
      fetch("/api/notifications", { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : null))
        .then((notifications) => {
          if (Array.isArray(notifications)) {
            setUnreadNotifications(notifications.filter((notification) => !notification.read).length);
          }
        })
        .catch((error) => {
          if (error.name !== "AbortError") console.error("Unable to load notifications", error);
        });
    };

    loadUser();
    loadNotifications();
    window.addEventListener("user-update", loadUser);
    window.addEventListener("notifications-update", loadNotifications);

    return () => {
      window.removeEventListener("user-update", loadUser);
      window.removeEventListener("notifications-update", loadNotifications);
      userController?.abort();
      notificationsController?.abort();
    };
  }, []);

  return (
    <div className="min-h-dvh overflow-x-clip bg-white pt-[72px]">
      <TopBar {...topbar} user={user} unreadNotifications={unreadNotifications} />
      <div>
        <aside className="no-scrollbar fixed bottom-0 left-0 top-[72px] z-20 hidden w-[244px] overflow-y-auto border-r border-line bg-white px-4 py-4 lg:block">
          <ConsumerWorkspaceNav unreadNotifications={unreadNotifications} />
        </aside>
        <main className="min-h-[calc(100dvh-72px)] min-w-0 overflow-x-hidden bg-canvas pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:ml-[244px] lg:pb-0">{children}</main>
      </div>
      <ResponsiveNav variant="mobile" unreadNotifications={unreadNotifications} />
    </div>
  );
}
