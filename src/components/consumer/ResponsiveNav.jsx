"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, House, LayoutGrid, UserRound } from "lucide-react";

export const releaseNav = [
  { href: "/home", label: "Home", icon: House },
  { href: "/feed", label: "Feed", icon: LayoutGrid },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export default function ResponsiveNav({
  items = releaseNav,
  pathname: providedPathname,
  variant = "desktop",
  unreadNotifications,
  onNotificationsOpen,
}) {
  const currentPathname = usePathname() || "";
  const pathname = providedPathname ?? currentPathname;
  const isMobile = variant === "mobile";

  return (
    <nav
      aria-label={isMobile ? "Mobile primary navigation" : "Primary navigation"}
      className={isMobile
        ? "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur lg:hidden"
        : "space-y-1"}
    >
      <div className={isMobile ? "mx-auto flex max-w-md items-center justify-around" : "space-y-1"}>
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const count = label === "Notifications" ? unreadNotifications : null;
          return (
            <Link
              key={href}
              href={href}
              onClick={label === "Notifications" ? onNotificationsOpen : undefined}
              aria-current={active ? "page" : undefined}
              className={isMobile
                ? `relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                  active ? "text-brand-700" : "text-ink/65"
                }`
                : `flex h-11 items-center gap-3.5 rounded-xl px-3.5 text-[14.5px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                  active ? "bg-brand-50 font-bold text-brand-700" : "text-ink/80 hover:bg-canvas"
                }`}
            >
              <span className="relative">
                <Icon size={19} className={active ? "text-brand-600" : "text-ink/70"} />
                {typeof count === "number" && count > 0 ? (
                  <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white">
                    {count}
                  </span>
                ) : null}
              </span>
              <span className={isMobile ? "truncate" : "flex-1"}>{label}</span>
              {!isMobile && typeof count === "number" && count > 0 ? (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
