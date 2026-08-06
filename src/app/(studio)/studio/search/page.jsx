"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { AsyncState } from "@/components/consumer/AsyncState";
import { CreatorCard } from "@/components/consumer/CreatorCard";
import { FeedCard } from "@/components/consumer/FeedCard";
import {
  createComment,
  deleteComment,
  getComments,
  search,
  sharePost,
  toggleBookmark,
  toggleFollow,
  toggleLike,
  updateComment,
} from "@/services/consumer-api";

const emptyResults = { creators: [], posts: [], communities: [] };

function CreatorSearchResults({ requestedQuery }) {
  const [query, setQuery] = useState(requestedQuery);
  const [results, setResults] = useState(emptyResults);
  const [status, setStatus] = useState(requestedQuery ? "loading" : "empty");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!requestedQuery) return undefined;
    const controller = new AbortController();
    search({ query: requestedQuery, signal: controller.signal })
      .then((nextResults) => {
        setResults(nextResults);
        setStatus(Object.values(nextResults).some((items) => items.length) ? "success" : "empty");
      })
      .catch((searchError) => {
        if (searchError.name === "AbortError") return;
        setError(searchError.message);
        setStatus("error");
      });
    return () => controller.abort();
  }, [requestedQuery]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <header>
        <h1 className="text-3xl font-black tracking-tight">Creator search</h1>
        <p className="mt-1 text-sm text-muted">Search creators, posts, and communities from your studio</p>
        <form action="/studio/search" method="get" role="search" className="mt-5 flex max-w-2xl items-center gap-2 rounded-2xl border border-line bg-white p-2">
          <Search size={18} className="ml-2 shrink-0 text-muted" />
          <input name="q" type="search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search creators, posts, and communities" className="h-10 min-w-0 flex-1 bg-transparent px-1 text-sm outline-none" />
          <button type="submit" className="min-h-11 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white">Search</button>
        </form>
      </header>

      {status !== "success" ? (
        <div className="mt-8"><AsyncState status={status} error={error} emptyTitle={requestedQuery ? "No matching results" : "Start a search"} emptyMessage={requestedQuery ? "Try another creator, post, or community name" : "Use the search field to find content across Blindly"} /></div>
      ) : (
        <div className="mt-8 space-y-9">
          {results.creators.length ? <section><h2 className="text-xl font-black">Creators</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{results.creators.map((creator) => <CreatorCard key={creator.id} creator={creator} onFollow={toggleFollow} />)}</div></section> : null}
          {results.posts.length ? <section><h2 className="text-xl font-black">Posts</h2><div className="mt-4 grid gap-5 xl:grid-cols-2">{results.posts.map((post) => <FeedCard key={post.id} post={post} onLike={toggleLike} onBookmark={toggleBookmark} onLoadComments={getComments} onCreateComment={createComment} onUpdateComment={updateComment} onDeleteComment={deleteComment} onShare={sharePost} />)}</div></section> : null}
          {results.communities.length ? <section><h2 className="text-xl font-black">Communities</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{results.communities.map((community) => <article key={community.id} className="rounded-2xl border border-line bg-white p-5"><h3 className="font-black">{community.name}</h3><p className="mt-2 text-sm leading-6 text-muted">{community.description || "Creator community"}</p><p className="mt-3 text-xs font-bold text-brand-700">{community.memberCount.toLocaleString("en-IN")} members</p></article>)}</div></section> : null}
        </div>
      )}
    </main>
  );
}

function CreatorSearchContent() {
  const params = useSearchParams();
  const requestedQuery = params.get("q")?.trim() || "";
  return <CreatorSearchResults key={requestedQuery} requestedQuery={requestedQuery} />;
}

export default function CreatorSearchPage() {
  return <Suspense fallback={<main className="p-6"><AsyncState status="loading" /></main>}><CreatorSearchContent /></Suspense>;
}
