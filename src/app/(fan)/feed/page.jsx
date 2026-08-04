"use client";

import { useEffect, useRef, useState } from "react";
import { Clock3, Users } from "lucide-react";
import { AsyncState } from "@/components/consumer/AsyncState";
import { FeedCard } from "@/components/consumer/FeedCard";
import {
  createComment,
  getComments,
  getFeed,
  toggleBookmark,
  toggleLike,
} from "@/services/consumer-api";

const filters = [
  { label: "Latest", mode: "latest", icon: Clock3 },
  { label: "Following", mode: "following", icon: Users },
];

export default function FeedPage() {
  const [mode, setMode] = useState("latest");
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const paginationController = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    paginationController.current?.abort();

    getFeed({ mode, signal: controller.signal })
      .then((page) => {
        setPosts(page.items);
        setNextCursor(page.nextCursor);
        setStatus(page.items.length ? "success" : "empty");
      })
      .catch((loadError) => {
        if (loadError.name === "AbortError") return;
        setError(loadError.message);
        setStatus("error");
      });

    return () => controller.abort();
  }, [mode, reloadKey]);

  useEffect(() => () => paginationController.current?.abort(), []);

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    const controller = new AbortController();
    paginationController.current?.abort();
    paginationController.current = controller;
    setLoadingMore(true);
    setError("");
    try {
      const page = await getFeed({ mode, cursor: nextCursor, signal: controller.signal });
      setPosts((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch (loadError) {
      if (loadError.name !== "AbortError") setError(loadError.message);
    } finally {
      if (paginationController.current === controller) {
        paginationController.current = null;
        setLoadingMore(false);
      }
    }
  }

  function cancelPagination() {
    paginationController.current?.abort();
    paginationController.current = null;
    setLoadingMore(false);
  }

  function chooseMode(nextMode) {
    if (nextMode === mode) return;
    cancelPagination();
    setStatus("loading");
    setPosts([]);
    setNextCursor(null);
    setError("");
    setMode(nextMode);
  }

  function retry() {
    cancelPagination();
    setStatus("loading");
    setError("");
    setReloadKey((value) => value + 1);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0" aria-labelledby="feed-title">
          <header className="mb-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-600">Posts</p>
            <h1 id="feed-title" className="mt-1 text-3xl font-black tracking-tight">Feed</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Posts from creators you follow and discover.</p>
          </header>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-1" aria-label="Feed filters">
            {filters.map(({ label, mode: filterMode, icon: Icon }) => (
              <button
                key={filterMode}
                type="button"
                aria-pressed={mode === filterMode}
                onClick={() => chooseMode(filterMode)}
                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold transition ${
                  mode === filterMode ? "bg-ink text-white" : "border border-line bg-white text-ink hover:border-brand-300"
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          {status !== "success" ? (
            <AsyncState
              status={status}
              error={error}
              onRetry={retry}
              emptyTitle={mode === "following" ? "No posts from followed creators" : "No posts yet"}
              emptyMessage={mode === "following" ? "Follow creators in Explore to add posts here." : "Check back later."}
            />
          ) : (
            <div className="space-y-5">
              {posts.map((post) => (
                <FeedCard
                  key={`${mode}:${post.id}`}
                  post={post}
                  onLike={toggleLike}
                  onBookmark={toggleBookmark}
                  onLoadComments={getComments}
                  onCreateComment={createComment}
                />
              ))}
              {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700" role="alert">{error}</p> : null}
              {nextCursor ? (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="mx-auto flex h-11 items-center justify-center rounded-full border border-ink bg-white px-6 text-sm font-bold hover:bg-ink hover:text-white disabled:opacity-60"
                >
                  {loadingMore ? "Loading more" : "Load more"}
                </button>
              ) : null}
            </div>
          )}
        </section>

        <aside className="hidden lg:block">
          <div className="sticky top-5 rounded-2xl bg-[#17121f] p-6 text-white">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-300">Feed filters</p>
            <h2 className="mt-3 text-xl font-black">Choose what to view</h2>
            <p className="mt-3 text-sm leading-6 text-white/70">Latest sorts by publication time. Following shows creators you follow.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
