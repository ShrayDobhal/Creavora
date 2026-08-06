"use client";

import { useEffect, useState } from "react";
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
  X,
} from "lucide-react";
import { Card, Chip, SectionHead, Tabs } from "@/ui/Bits.jsx";
import { Photo } from "@/ui/Media.jsx";
import { PostComposer } from "@/components/consumer/PostComposer";

const uploadTypes = [
  { title: "Photo", sub: "JPG, PNG, HEIC", icon: ImageIcon, tint: "bg-brand-50 text-brand-600" },
  { title: "Video", sub: "MP4, MOV, AVI", icon: Play, tint: "bg-violet-50 text-violet-600" },
  { title: "Reel / Short", sub: "15s – 60s videos", icon: Video, tint: "bg-rose-50 text-rose-500" },
  { title: "Live Stream", sub: "Go live with fans", icon: Radio, tint: "bg-orange-50 text-orange-500" },
];

const initialItems = [
  { id: "bts-shoot", title: "Behind the scenes from today's photoshoot", kind: "Photo", tint: "bg-brand-50 text-brand-700", date: "May 16, 2024 • 10:30 AM", vis: "Visible to Subscribers", likes: "1.2K", comments: 128, locked: true },
  { id: "grwm", title: "GRWM for a party 👗✨", kind: "Video", tint: "bg-violet-50 text-violet-700", date: "May 15, 2024 • 08:15 PM", vis: "Visible to Subscribers", likes: "2.4K", comments: 210, duration: "08:45", locked: true },
  { id: "beach-reel", title: "Quick beach look reel 🌟", kind: "Reel", tint: "bg-rose-50 text-rose-600", date: "May 14, 2024 • 05:45 PM", vis: "Public", likes: "3.1K", comments: 156, duration: "01:02" },
  { id: "playlist", title: "My Sunday playlist 🎧", kind: "Audio", tint: "bg-amber-50 text-amber-600", date: "May 13, 2024 • 11:20 AM", vis: "Visible to Subscribers", likes: "842", comments: 72, duration: "12:36", audio: true },
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
  const [items, setItems] = useState(initialItems);

  // Upload overlay states
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("Photo");
  const [isPremium, setIsPremium] = useState(true);
  const [price, setPrice] = useState("199");
  const [mediaUrl, setMediaUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/studio/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: title,
          mediaUrl: mediaUrl || "bts-shoot",
          mediaType: kind,
          isPremium: isPremium,
          price: isPremium ? parseFloat(price) : 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload post to SQLite");
      }

      const newPost = await response.json();

      const itemVal = {
        id: newPost.id,
        seed: newPost.mediaUrl || "bts-shoot",
        title: newPost.content,
        kind: newPost.mediaType,
        tint: kind === "Photo" ? "bg-brand-50 text-brand-700" : "bg-violet-50 text-violet-700",
        date: new Date(newPost.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        vis: newPost.isPremium ? "Visible to Subscribers" : "Public",
        likes: "0",
        comments: 0,
        locked: newPost.isPremium,
      };

      setItems([itemVal, ...items]);
      setShowModal(false);

      // Reset fields
      setTitle("");
      setMediaUrl("");
      setIsPremium(true);
      setPrice("199");

      alert("Exclusive post uploaded and registered in SQLite successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Something went wrong while publishing the post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-76px)] min-w-0 gap-5 bg-canvas/30 px-3 py-5 sm:px-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-[25px] font-extrabold tracking-tight">Content</h1>
            <p className="mt-1 text-[14px] text-muted">
              Upload and manage your content for your amazing subscribers.
            </p>
          </div>
          <button
            onClick={() => document.getElementById("create-post")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-[14px] font-bold text-white hover:bg-brand-700 cursor-pointer"
          >
            <Upload size={16} /> Upload New
          </button>
        </div>

        <div className="mt-5">
          <PostComposer onPublished={(newPost) => {
            setItems((current) => [{ id: newPost.id, seed: newPost.mediaUrl, title: newPost.content, kind: "Photo", tint: "bg-brand-50 text-brand-700", date: new Date(newPost.publishedAt).toLocaleString("en-IN"), vis: "Public", likes: "0", comments: 0, locked: false }, ...current]);
          }} />
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
              <h2 className="text-[17px] font-extrabold">Publish Creator Post</h2>
              <p className="mt-1 text-[13.5px] text-muted">
                Create new posts directly to your subscriber feeds
              </p>
            </div>
            <button
              onClick={() => document.getElementById("create-post")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-bold hover:bg-canvas cursor-pointer"
            >
              <Upload size={15} /> Publish Form
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {uploadTypes.map(({ title, sub, icon: Icon, tint }) => (
              <button
                key={title}
                onClick={() => {
                  setKind(title === "Reel / Short" ? "Reel" : title);
                  document.getElementById("create-post")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="flex items-center gap-3 rounded-xl border border-line bg-white p-3.5 text-left hover:border-brand-300 cursor-pointer"
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

        {/* Upload Modal Form Overlay */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
            <Card className="w-full max-w-[500px] p-6 bg-white relative shadow-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 text-muted hover:text-ink cursor-pointer"
              >
                <X size={20} />
              </button>

              <h2 className="text-[18px] font-extrabold flex items-center gap-2">
                <Upload size={18} className="text-brand-600" /> Upload Content Post
              </h2>
              <p className="text-[12.5px] text-muted mt-0.5">Publish high-quality Indian-centric media for fans</p>

              <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-[12.5px] font-bold text-muted mb-1.5">Post Content / Caption</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Describe what this post is about..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 text-[13.5px] border border-line rounded-xl outline-none focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12.5px] font-bold text-muted mb-1.5">Content Type</label>
                    <select
                      value={kind}
                      onChange={(e) => setKind(e.target.value)}
                      className="w-full h-11 px-2.5 text-[13.5px] border border-line rounded-xl outline-none"
                    >
                      <option value="Photo">Photo</option>
                      <option value="Video">Video</option>
                      <option value="Reel">Reel / Short</option>
                      <option value="Audio">Audio</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-bold text-muted mb-1.5">Unsplash Photo Seed</label>
                    <input
                      type="text"
                      placeholder="e.g. ananya-hero, rohit-stream"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="w-full h-11 px-3 text-[13.5px] border border-line rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-b border-line py-3.5">
                  <span className="leading-tight">
                    <p className="text-[13.5px] font-bold">Premium Lock</p>
                    <p className="text-[11.5px] text-muted font-medium">Require subscription to unlock post</p>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPremium((p) => !p)}
                    className={`flex h-6 w-11 items-center rounded-full px-0.5 transition cursor-pointer ${
                      isPremium ? "justify-end bg-brand-600" : "justify-start bg-neutral-300"
                    }`}
                  >
                    <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                {isPremium && (
                  <div>
                    <label className="block text-[12.5px] font-bold text-muted mb-1.5">Unlock Cost (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full h-11 px-3 text-[13.5px] border border-line rounded-xl outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 bg-brand-600 text-white rounded-xl text-[14px] font-bold hover:bg-brand-700 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Publish Post"}
                </button>
              </form>
            </Card>
          </div>
        )}

        <section className="mt-7">
          <h2 className="text-[19px] font-extrabold tracking-tight">Your Content</h2>

          <div className="mt-4 flex items-center gap-2.5">
            {["All", "Photos", "Videos", "Audios"].map((s) => (
              <Chip key={s} active={scope === s} onClick={() => setScope(s)} className="px-3.5 py-1.5 cursor-pointer">
                {s}
              </Chip>
            ))}
          </div>

          <Card className="mt-4 divide-y divide-line bg-white">
            {items
              .filter((it) => scope === "All" || it.kind === scope.replace("s", ""))
              .map((it) => (
                <div key={it.id} className="flex items-center gap-4 p-3.5">
                  <div className="relative shrink-0">
                    {it.audio ? (
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
                    <span className="flex items-center gap-1.5 text-rose-500">
                      <Heart size={15} className="fill-rose-500" /> {it.likes}
                    </span>
                    <span className="flex items-center gap-1.5 text-ink/70">
                      <MessageCircle size={15} /> {it.comments}
                    </span>
                    <button className="text-muted cursor-pointer">
                      <MoreVertical size={17} />
                    </button>
                  </div>
                </div>
              ))}
          </Card>
        </section>
      </div>

      <aside className="hidden min-w-0 space-y-4 2xl:block">
        <Card className="p-4 bg-white">
          <SectionHead
            title="Content Overview"
            right={
              <button className="flex h-8 items-center gap-1.5 rounded-lg bg-brand-50 px-3 text-[12.5px] font-bold text-brand-700 cursor-pointer">
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

        <Card className="p-4 bg-white">
          <h3 className="text-[15px] font-bold">Quick Actions</h3>
          <div className="mt-3.5 space-y-2">
            {quickActions.map(({ icon: Icon, tint, title, sub }) => (
              <button
                key={title}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-canvas cursor-pointer"
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

        <Card className="bg-brand-50/60 p-4 border border-brand-100">
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
        </Card>
      </aside>
    </div>
  );
}
