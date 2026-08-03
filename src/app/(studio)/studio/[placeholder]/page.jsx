"use client";

import Link from "next/link";
import { useRouter, usePathname, useParams } from "next/navigation";;
import { ArrowLeft, Construction } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";

/**
 * Sidebar entries exist in the mockups but have no screen of their own, so they
 * land here instead of silently bouncing back to Home.
 */
export default function Placeholder({ title }) {
  const { pathname } = useLocation();
  const label =
    title ??
    pathname
      .split("/")
      .filter(Boolean)
      .pop()
      .replace(/-/g, " ")
      .replace(/^./, (c) => c.toUpperCase());

  return (
    <div className="grid min-h-[calc(100vh-72px)] place-items-center px-6 py-10">
      <Card className="max-w-[440px] p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Construction size={26} />
        </span>
        <h1 className="mt-4 text-[21px] font-extrabold tracking-tight">{label}</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          This screen isn't part of the supplied mockups, so there's nothing to clone yet.
          Everything that was designed is wired and reachable from the sidebar and the
          account menu.
        </p>
        <Link href="/"
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-[14px] font-bold text-white hover:bg-brand-700"
        >
          <ArrowLeft size={15} /> Back to Home
        </Link>
      </Card>
    </div>
  );
}
