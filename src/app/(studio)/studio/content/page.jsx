"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, FileImage, Heart, Loader2, MessageCircle, Play, RefreshCw, Share2 } from "lucide-react";
import { Card, Chip } from "@/ui/Bits.jsx";
import { PostComposer } from "@/components/consumer/PostComposer";
import EditorialImage from "@/components/consumer/EditorialImage";

const formatDate = (value) => new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
}).format(new Date(value));

const kindFor = (post) => post.mediaType?.toLowerCase().startsWith("video") ? "Video" : post.mediaUrl ? "Photo" : "Text";

function PostMedia({ post }) {
  if (!post.mediaUrl) return <div className="grid aspect-video place-items-center bg-brand-50 text-brand-600"><FileImage size={28} /></div>;
  if (post.mediaType?.toLowerCase().startsWith("video")) {
    return <div className="relative aspect-video overflow-hidden bg-black"><video src={post.mediaUrl} preload="metadata" className="h-full w-full object-cover" /><span className="absolute inset-0 grid place-items-center"><span className="grid h-11 w-11 place-items-center rounded-full bg-black/65 text-white"><Play size={18} className="fill-white" /></span></span></div>;
  }
  return <EditorialImage src={post.mediaUrl} alt="Published post media" fallbackLabel="Post image unavailable" className="aspect-video w-full object-cover" />;
}

export default function StudioContent() {
  const [items, setItems] = useState([]);
  const [scope, setScope] = useState("All");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const loadContent = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/studio/posts", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load your content");
      setItems(data.items || []);
      setStatus("success");
    } catch (loadError) {
      setError(loadError.message || "Unable to load your content");
      setStatus("error");
    }
  }, []);

  useEffect(() => { queueMicrotask(loadContent); }, [loadContent]);

  const visibleItems = useMemo(() => items.filter((post) => scope === "All" || kindFor(post) === scope), [items, scope]);
  const totals = useMemo(() => ({
    posts: items.length,
    views: items.reduce((sum, post) => sum + (post.viewsCount || 0), 0),
    likes: items.reduce((sum, post) => sum + (post.likesCount || 0), 0),
    comments: items.reduce((sum, post) => sum + (post.commentsCount || 0), 0),
  }), [items]);

  return (
    <main className="min-w-0 space-y-6 bg-canvas/30 px-3 py-6 sm:px-6">
      <header>
        <h1 className="text-[25px] font-extrabold tracking-tight">Content</h1>
        <p className="mt-1 text-sm text-muted">Publish new work and manage every post stored on your creator account</p>
      </header>

      <section id="create-post" aria-labelledby="publish-title">
        <h2 id="publish-title" className="sr-only">Publish a post</h2>
        <PostComposer onPublished={loadContent} />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Content performance summary">
        {[
          ["Published posts", totals.posts],
          ["Post views", totals.views],
          ["Likes", totals.likes],
          ["Comments", totals.comments],
        ].map(([label, value]) => <Card key={label} className="p-4"><p className="text-xs font-bold text-muted">{label}</p><p className="mt-2 text-2xl font-black">{value.toLocaleString("en-IN")}</p></Card>)}
      </section>

      <section aria-labelledby="your-content-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h2 id="your-content-title" className="text-xl font-black">Your content</h2><p className="mt-1 text-sm text-muted">Only posts published from this creator account appear here</p></div>
          <div className="flex gap-2">{["All", "Photo", "Video", "Text"].map((item) => <Chip key={item} active={scope === item} onClick={() => setScope(item)} className="cursor-pointer px-3.5 py-1.5">{item}</Chip>)}</div>
        </div>

        {status === "loading" ? <div className="mt-4 grid min-h-48 place-items-center rounded-2xl border border-line bg-white" role="status"><Loader2 className="animate-spin text-brand-600" /><span className="sr-only">Loading creator content</span></div> : null}
        {status === "error" ? <div className="mt-4 rounded-2xl border border-rose-200 bg-white p-8 text-center"><p role="alert" className="text-sm font-semibold text-rose-700">{error}</p><button type="button" onClick={loadContent} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-bold"><RefreshCw size={15} /> Try again</button></div> : null}
        {status === "success" && !visibleItems.length ? <div className="mt-4 rounded-2xl border border-dashed border-line bg-white p-10 text-center"><p className="font-black">No {scope === "All" ? "published content" : scope.toLowerCase() + " posts"} yet</p><p className="mt-1 text-sm text-muted">Your next published post will appear here immediately</p></div> : null}
        {status === "success" && visibleItems.length ? (
          <div className="mt-4 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {visibleItems.map((post) => (
              <Card key={post.id} className="group overflow-hidden bg-white">
                <Link href={`/post/${post.id}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500">
                  <PostMedia post={post} />
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-black text-brand-700">{kindFor(post)}</span><span className="text-xs text-muted">{formatDate(post.publishedAt || post.createdAt)}</span></div>
                    <p className="mt-3 line-clamp-2 min-h-11 text-sm font-bold leading-6">{post.content}</p>
                    <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-3 text-xs font-bold text-muted">
                      <span className="inline-flex items-center gap-1"><Eye size={14} />{post.viewsCount || 0}</span>
                      <span className="inline-flex items-center gap-1"><Heart size={14} />{post.likesCount || 0}</span>
                      <span className="inline-flex items-center gap-1"><MessageCircle size={14} />{post.commentsCount || 0}</span>
                      <span className="inline-flex items-center gap-1"><Share2 size={14} />{post.sharesCount || 0}</span>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
