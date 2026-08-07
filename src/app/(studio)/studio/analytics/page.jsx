"use client";

import { Eye, FileText, Heart, Loader2, MessageCircle, RefreshCw, Share2, Users } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";
import { formatInr, useStudioPerformance } from "@/components/studio/useStudioPerformance";

export default function AnalyticsPage() {
  const { data, status, error, refresh } = useStudioPerformance();
  if (status === "loading") return <div className="grid min-h-[420px] place-items-center" role="status"><Loader2 className="animate-spin text-brand-600" /><span className="sr-only">Loading analytics</span></div>;
  if (status === "error") return <div className="m-6 rounded-2xl border border-rose-200 bg-white p-8 text-center"><p role="alert" className="text-sm font-semibold text-rose-700">{error}</p><button type="button" onClick={refresh} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-bold"><RefreshCw size={15} /> Try again</button></div>;
  const { analytics, earnings } = data;
  const engagementTotal = analytics.likes + analytics.comments + analytics.shares;
  const engagementRate = analytics.views ? engagementTotal / analytics.views * 100 : 0;

  return <main className="space-y-6 px-3 py-6 sm:px-6"><header><h1 className="text-[25px] font-extrabold tracking-tight">Studio analytics</h1><p className="mt-1 text-sm text-muted">Performance calculated from your published posts, subscribers and completed transactions</p></header><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{[
    ["Posts", analytics.posts, FileText], ["Views", analytics.views, Eye], ["Likes", analytics.likes, Heart], ["Comments", analytics.comments, MessageCircle], ["Shares", analytics.shares, Share2], ["Subscribers", analytics.activeSubscribers, Users],
  ].map(([label, value, Icon]) => <Card key={label} className="p-5"><Icon size={19} className="text-brand-600" /><p className="mt-4 text-xs font-bold text-muted">{label}</p><p className="mt-1 text-2xl font-black">{value.toLocaleString("en-IN")}</p></Card>)}</section><section className="grid gap-5 lg:grid-cols-3"><Card className="p-5"><p className="text-xs font-bold text-muted">Engagement actions</p><p className="mt-2 text-3xl font-black">{engagementTotal.toLocaleString("en-IN")}</p><p className="mt-2 text-sm text-muted">Likes, comments and shares across your posts</p></Card><Card className="p-5"><p className="text-xs font-bold text-muted">Engagement per view</p><p className="mt-2 text-3xl font-black">{engagementRate.toFixed(1)}%</p><p className="mt-2 text-sm text-muted">Calculated from recorded post views</p></Card><Card className="p-5"><p className="text-xs font-bold text-muted">Revenue this month</p><p className="mt-2 text-3xl font-black">{formatInr(earnings.thisMonth)}</p><p className="mt-2 text-sm text-muted">Completed creator earnings only</p></Card></section><Card className="p-5"><h2 className="font-black">Revenue activity over 30 days</h2><div className="mt-6 grid grid-cols-10 gap-2 sm:grid-cols-[repeat(30,minmax(0,1fr))]">{earnings.series.map((day) => <div key={day.date} className={`aspect-square rounded-md ${day.amount > 0 ? "bg-brand-600" : "bg-canvas"}`} title={`${new Date(day.date).toLocaleDateString("en-IN")}: ${formatInr(day.amount)}`} />)}</div><p className="mt-4 text-xs text-muted">Each square represents one day. Purple days contain completed earnings.</p></Card></main>;
}
