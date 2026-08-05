"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Heart, MessageSquare, RefreshCw, Trash2 } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";
import EditorialImage from "@/components/consumer/EditorialImage";
import { getBookmarks, toggleBookmark } from "@/services/consumer-api";

export default function SavedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getBookmarks({ signal: controller.signal })
      .then((data) => setPosts(Array.isArray(data?.items) ? data.items : []))
      .catch((loadError) => {
        if (loadError.name !== "AbortError") setLoadError(loadError.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reloadKey]);

  const retry = () => {
    setLoading(true);
    setLoadError("");
    setReloadKey((current) => current + 1);
  };

  const handleRemove = async (post) => {
    setRemovingId(post.id);
    setActionError("");
    try {
      const result = await toggleBookmark(post.id);
      if (result.isBookmarked === false) {
        setPosts((current) => current.filter((item) => item.id !== post.id));
      } else {
        setActionError("The post is still saved. Please try again.");
      }
    } catch (removeError) {
      setActionError(removeError.message);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="mx-auto min-h-[calc(100vh-72px)] min-w-0 max-w-[860px] overflow-x-hidden bg-canvas px-3 py-6 sm:px-6">
      <h1 className="flex items-center gap-2 text-[25px] font-extrabold tracking-tight">
        <Bookmark className="fill-brand-600 text-brand-600" size={24} /> Saved Posts
      </h1>
      <p className="text-sm text-muted">Posts you bookmark appear here.</p>

      {(loadError || actionError) && (
        <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <span>{loadError || actionError}</span>
          {loadError && <button onClick={retry} className="inline-flex items-center gap-1 font-bold"><RefreshCw size={14} /> Try again</button>}
        </div>
      )}

      {loading ? (
        <p className="mt-6 rounded-2xl border border-line bg-white p-12 text-center text-sm text-muted" role="status">Loading saved posts…</p>
      ) : loadError ? null : posts.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-line bg-white p-12 text-center">
          <Bookmark className="mx-auto text-muted" size={34} />
          <h2 className="mt-3 font-extrabold text-ink">No saved posts</h2>
          <p className="mt-1 text-sm text-muted">Use the bookmark action on a post to keep it here.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden sm:flex">
              {post.mediaUrl ? (
                <EditorialImage src={post.mediaUrl} alt={`Post by ${post.creator.name}`} className="h-48 w-full object-cover sm:h-auto sm:w-52" fallbackLabel="Post media unavailable" />
              ) : (
                <div className="grid h-32 w-full shrink-0 place-items-center bg-brand-50 text-brand-700 sm:h-auto sm:w-52"><Bookmark size={28} /></div>
              )}
              <div className="flex min-w-0 flex-1 flex-col p-5">
                <Link href={`/creator/${encodeURIComponent(post.creator.handle)}`} className="font-extrabold text-ink hover:underline">
                  {post.creator.name}
                </Link>
                {post.creator.roleTitle && <p className="text-xs text-muted">{post.creator.roleTitle}</p>}
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink">{post.content || "This post is not currently available."}</p>
                <div className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-xs text-muted">
                  <span className="inline-flex items-center gap-1"><Heart size={14} /> {post.counts.likes}</span>
                  <span className="inline-flex items-center gap-1"><MessageSquare size={14} /> {post.counts.comments}</span>
                  <button
                    onClick={() => handleRemove(post)}
                    disabled={removingId === post.id}
                    aria-label={`Remove saved post by ${post.creator.name}`}
                    className="ml-auto inline-flex items-center gap-1.5 font-bold text-rose-600 disabled:opacity-50"
                  >
                    <Trash2 size={14} /> {removingId === post.id ? "Removing…" : "Remove"}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
