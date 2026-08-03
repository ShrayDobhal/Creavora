import { useState } from "react";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  CheckCircle2,
  Circle,
  FileText,
  Filter,
  FolderOpen,
  Heart,
  Image as ImageIcon,
  Lock,
  MessageCircle,
  Mic,
  MoreVertical,
  Play,
  Radio,
  Sparkles,
  Upload,
  Video,
  Check,
} from "lucide-react";
import { Card, Chip, SectionHead, Tabs } from "../ui/Bits.jsx";
import { Photo } from "../ui/Media.jsx";

const uploadTypes = [
  { title: "Photo", sub: "JPG, PNG, HEIC", icon: ImageIcon, tint: "bg-brand-50 text-brand-600" },
  { title: "Video", sub: "MP4, MOV, AVI", icon: Play, tint: "bg-violet-50 text-violet-600" },
  { title: "Reel / Short", sub: "15s – 60s videos", icon: Video, tint: "bg-rose-50 text-rose-500" },
  { title: "Live Stream", sub: "Go live with fans", icon: Radio, tint: "bg-orange-50 text-orange-500" },
  { title: "Audio", sub: "MP3, WAV, M4A", icon: Mic, tint: "bg-brand-50 text-brand-600" },
  { title: "Document", sub: "PDF, DOC, PPT", icon: FileText, tint: "bg-sky-50 text-sky-600" },
  { title: "Poll", sub: "Ask your audience", icon: BarChart3, tint: "bg-amber-50 text-amber-500" },
  { title: "Story", sub: "24h disappearing", icon: Circle, tint: "bg-emerald-50 text-emerald-500" },
];

const items = [
  { seed: "bts-shoot", title: "Behind the scenes from today's photoshoot", kind: "Photo", tint: "bg-brand-50 text-brand-700", date: "May 16, 2024 • 10:30 AM", vis: "Visible to Subscribers", likes: "1.2K", comments: 128, locked: true },
  { seed: "grwm", title: "GRWM for a party 👗✨", kind: "Video", tint: "bg-violet-50 text-violet-700", date: "May 15, 2024 • 08:15 PM", vis: "Visible to Subscribers", likes: "2.4K", comments: 210, duration: "08:45", locked: true },
  { seed: "beach-reel", title: "Quick beach look reel 🌟", kind: "Reel", tint: "bg-rose-50 text-rose-600", date: "May 14, 2024 • 05:45 PM", vis: "Public", likes: "3.1K", comments: 156, duration: "01:02" },
  { seed: "playlist", title: "My Sunday playlist 🎧", kind: "Audio", tint: "bg-amber-50 text-amber-600", date: "May 13, 2024 • 11:20 AM", vis: "Visible to Subscribers", likes: "842", comments: 72, duration: "12:36", audio: true },
  { seed: "poll", title: "What content do you want next?", kind: "Poll", tint: "bg-orange-50 text-orange-600", date: "May 12, 2024 • 09:00 PM", vis: "Visible to Subscribers", votes: "1.8K votes", poll: true },
];

const overview = [
  { icon: Calendar, tint: "text-brand-600 bg-brand-50", label: "Total Posts", value: 48 },
  { icon: ImageIcon, tint: "text-sky-600 bg-sky-50", label: "Photos", value: 22 },
  { icon: Play, tint: "text-violet-600 bg-violet-50", label: "Videos", value: 16 },
  { icon: Mic, tint: "text-rose-500 bg-rose-50", label: "Audios", value: 5 },
  { icon: FileText, tint: "text-emerald-600 bg-emerald-50", label: "Documents", value: 3 },
  { icon: Radio, tint: "text-orange-500 bg-orange-50", label: "Live Streams", value: 2 },
];

const quickActions = [
  { icon: Calendar, tint: "bg-brand-50 text-brand-600", title: "Schedule Post", sub: "Plan your content" },
  { icon: FolderOpen, tint: "bg-amber-50 text-amber-500", title: "Create Collection", sub: "Organize your content" },
  { icon: Radio, tint: "bg-rose-50 text-rose-500", title: "Go Live", sub: "Connect with fans" },
  { icon: Circle, tint: "bg-emerald-50 text-emerald-500", title: "Post a Story", sub: "Share a quick update" },
];

const tips = [
  ["Post regularly", "Keep your audience engaged"],
  ["Go live more often", "Live sessions get more love"],
  ["Use polls & stories", "Increase interaction"],
  ["Engage in DMs", "Build stronger relationships"],
];

export default function StudioContent() {
  const [tab, setTab] = useState("My Content");
  const [scope, setScope] = useState("All");

  return (
    <div className="flex gap-5 px-6 py-6">
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[25px] font-extrabold tracking-tight">Content</h1>
            <p className="mt-1 text-[14px] text-muted">
              Upload and manage your content for your amazing subscribers.
            </p>
          </div>
          <div className="flex items-center">
            <button className="flex h-11 items-center gap-2 rounded-l-xl bg-brand-600 px-5 text-[14px] font-bold text-white hover:bg-brand-700">
              <Upload size={16} /> Upload
            </button>
            <button className="grid h-11 w-9 place-items-center rounded-r-xl bg-brand-600 text-white">
              <ChevronDown size={15} />
            </button>
          </div>
        </div>

        <Tabs
          items={["My Content", "Collections", "Scheduled", "Drafts"]}
          value={tab}
          onChange={setTab}
          className="mt-5 border-b border-line"
        />

        <Card className="mt-5 bg-canvas/60 p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[17px] font-extrabold">Upload New Content</h2>
              <p className="mt-1 text-[13.5px] text-muted">
                Choose the type of content you want to upload
              </p>
            </div>
            <button className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-bold hover:bg-canvas">
              <Upload size={15} /> Bulk Upload
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {uploadTypes.map(({ title, sub, icon: Icon, tint }) => (
              <button
                key={title}
                className="flex items-center gap-3 rounded-xl border border-line bg-white p-3.5 text-left hover:border-brand-300"
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tint}`}>
                  <Icon size={19} />
                </span>
                <span className="leading-tight">
                  <span className="block text-[14px] font-bold">{title}</span>
                  <span className="block text-[12px] text-muted">{sub}</span>
                </span>
              </button>
            ))}
          </div>
        </Card>

        <section className="mt-7">
          <h2 className="text-[19px] font-extrabold tracking-tight">Your Content</h2>

          <div className="mt-4 flex items-center gap-2.5">
            {["All", "Photos", "Videos", "Audios", "Documents", "Polls", "Live"].map((s) => (
              <Chip key={s} active={scope === s} onClick={() => setScope(s)} className="px-3.5 py-1.5">
                {s}
              </Chip>
            ))}
            <div className="ml-auto flex items-center gap-2.5">
              <button className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold">
                <Filter size={14} /> Filter <ChevronDown size={13} className="text-muted" />
              </button>
              <button className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold">
                Newest <ChevronDown size={13} className="text-muted" />
              </button>
            </div>
          </div>

          <Card className="mt-4 divide-y divide-line">
            {items.map((it) => (
              <div key={it.seed} className="flex items-center gap-4 p-3.5">
                <div className="relative shrink-0">
                  {it.poll ? (
                    <div className="grid h-[74px] w-[134px] place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500">
                      <BarChart3 size={24} className="text-white" />
                    </div>
                  ) : it.audio ? (
                    <div className="grid h-[74px] w-[134px] place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500">
                      <Play size={22} className="fill-white text-white" />
                    </div>
                  ) : (
                    <Photo seed={it.seed} className="h-[74px] w-[134px] rounded-xl" />
                  )}
                  {it.locked && (
                    <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-md bg-black/50 text-white backdrop-blur">
                      <Lock size={11} />
                    </span>
                  )}
                  {it.duration && (
                    <span className="absolute bottom-1.5 right-1.5 rounded bg-black/65 px-1.5 py-0.5 text-[10.5px] font-semibold text-white">
                      {it.duration}
                    </span>
                  )}
                  {!it.poll && !it.audio && (
                    <span className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-md bg-black/45 text-white backdrop-blur">
                      <Play size={10} className="fill-white" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-[14.5px] font-bold">
                    <span className="truncate">{it.title}</span>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold ${it.tint}`}>
                      {it.kind}
                    </span>
                  </p>
                  <p className="mt-1 text-[12.5px] text-muted">{it.date}</p>
                  <p className="mt-1.5 flex items-center gap-2.5 text-[12px]">
                    <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-600">
                      <CheckCircle2 size={11} /> Published
                    </span>
                    <span className="text-muted">• {it.vis}</span>
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-5 text-[13px] font-semibold">
                  {it.poll ? (
                    <span className="flex items-center gap-1.5 text-muted">
                      <BarChart3 size={15} /> {it.votes}
                    </span>
                  ) : (
                    <>
                      <span className="flex items-center gap-1.5 text-rose-500">
                        <Heart size={15} className="fill-rose-500" /> {it.likes}
                      </span>
                      <span className="flex items-center gap-1.5 text-ink/70">
                        <MessageCircle size={15} /> {it.comments}
                      </span>
                    </>
                  )}
                  <button className="text-muted">
                    <MoreVertical size={17} />
                  </button>
                </div>
              </div>
            ))}
          </Card>
        </section>
      </div>

      <aside className="hidden w-[352px] shrink-0 space-y-4 xl:block">
        <Card className="p-4">
          <SectionHead
            title="Content Overview"
            right={
              <button className="flex h-8 items-center gap-1.5 rounded-lg bg-brand-50 px-3 text-[12.5px] font-bold text-brand-700">
                This Month <ChevronDown size={13} />
              </button>
            }
          />
          <div className="mt-3.5 space-y-3.5">
            {overview.map(({ icon: Icon, tint, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tint}`}>
                  <Icon size={17} />
                </span>
                <span className="flex-1 text-[13.5px] font-semibold">{label}</span>
                <span className="text-[14px] font-extrabold">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-[15px] font-bold">Quick Actions</h3>
          <div className="mt-3.5 space-y-2">
            {quickActions.map(({ icon: Icon, tint, title, sub }) => (
              <button
                key={title}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-canvas"
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tint}`}>
                  <Icon size={18} />
                </span>
                <span className="leading-tight">
                  <span className="block text-[13.5px] font-bold">{title}</span>
                  <span className="block text-[12px] text-muted">{sub}</span>
                </span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="bg-brand-50/60 p-4">
          <h3 className="flex items-center gap-2 text-[15px] font-bold">
            <Sparkles size={16} className="fill-brand-500 text-brand-500" /> Tips to Grow
          </h3>
          <div className="mt-3.5 space-y-2.5">
            {tips.map(([t, s]) => (
              <div key={t} className="flex items-center gap-3 rounded-xl bg-white p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <CheckCircle2 size={17} />
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-[13px] font-bold">{t}</span>
                  <span className="block text-[12px] text-muted">{s}</span>
                </span>
                <Check size={16} className="text-emerald-500" strokeWidth={3} />
              </div>
            ))}
          </div>
          <button className="mt-3.5 flex items-center gap-1.5 text-[13px] font-bold text-brand-700">
            View All Tips →
          </button>
        </Card>
      </aside>
    </div>
  );
}
