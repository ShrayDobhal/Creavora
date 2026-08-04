"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Compass, Lock, Users } from "lucide-react";
import { AsyncState } from "@/components/consumer/AsyncState";
import { CreatorCard } from "@/components/consumer/CreatorCard";
import { FeedCard } from "@/components/consumer/FeedCard";
import { SearchPanel } from "@/components/consumer/SearchPanel";
import { getDiscovery, search, toggleBookmark, toggleFollow, toggleLike } from "@/services/consumer-api";

const emptySearch = { creators: [], posts: [], communities: [] };

function CommunityCard({ community }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="h-28 bg-gradient-to-br from-brand-900 to-[#c85b91]">
        {community.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- API media may use community-selected hosts.
          <img src={community.coverImage} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.hidden = true; }} />
        ) : null}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-extrabold">{community.name}</h3>
          {community.isPrivate ? <Lock size={15} aria-label="Private community" /> : null}
        </div>
        {community.description ? <p className="mt-2 text-sm leading-6 text-muted">{community.description}</p> : null}
        {typeof community.memberCount === "number" ? (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-muted"><Users size={14} /> {community.memberCount.toLocaleString("en-IN")} members</p>
        ) : null}
      </div>
    </article>
  );
}

export default function ExplorePage() {
  const [discovery, setDiscovery] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");
  const [reloadKey, setReloadKey] = useState(0);
  const [searchRequest, setSearchRequest] = useState(null);
  const [searchState, setSearchState] = useState({ status: "idle", results: emptySearch, error: "" });

  useEffect(() => {
    const controller = new AbortController();
    getDiscovery({ signal: controller.signal })
      .then((result) => {
        setDiscovery(result);
        setStatus(result.recommended.length || result.trending.length ? "success" : "empty");
      })
      .catch((loadError) => {
        if (loadError.name === "AbortError") return;
        setError(loadError.message);
        setStatus("error");
      });
    return () => controller.abort();
  }, [reloadKey]);

  useEffect(() => {
    if (!searchRequest) return undefined;

    const controller = new AbortController();
    search({ query: searchRequest.query, signal: controller.signal })
      .then((results) => setSearchState({ status: "success", results, error: "" }))
      .catch((searchError) => {
        if (searchError.name === "AbortError") return;
        setSearchState({ status: "error", results: emptySearch, error: searchError.message });
      });
    return () => controller.abort();
  }, [searchRequest]);

  const handleSearch = useCallback((query) => {
    setSearchState((current) => ({ ...current, status: "loading", error: "" }));
    setSearchRequest((current) => ({ query, sequence: (current?.sequence || 0) + 1 }));
  }, []);
  const clearSearch = useCallback(() => {
    setSearchRequest(null);
    setSearchState({ status: "idle", results: emptySearch, error: "" });
  }, []);
  const searchQuery = searchRequest?.query || "";
  const retryDiscovery = useCallback(() => {
    setStatus("loading");
    setError("");
    setReloadKey((value) => value + 1);
  }, []);
  const discoveredCreators = useMemo(() => {
    if (!discovery) return [];
    const unique = new Map([...discovery.recommended, ...discovery.trending].map((creator) => [creator.id, creator]));
    const creators = [...unique.values()];
    return category === "All" ? creators : creators.filter((creator) => creator.category === category);
  }, [category, discovery]);
  const hasSearchResults = Object.values(searchState.results).some((items) => items.length);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <header className="grid gap-6 rounded-3xl bg-[#17121f] p-6 text-white md:grid-cols-[1fr_minmax(320px,520px)] md:items-end md:p-8">
        <div>
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-300"><Compass size={15} /> Discover</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Explore</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">Search creators, posts, and communities.</p>
        </div>
        <SearchPanel onSearch={handleSearch} busy={searchState.status === "loading"} />
      </header>

      {searchQuery ? (
        <section className="mt-8" aria-labelledby="search-results-title">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-600">Search results</p>
              <h2 id="search-results-title" className="mt-1 text-2xl font-black">“{searchQuery}”</h2>
            </div>
            <button type="button" onClick={clearSearch} className="text-sm font-bold text-brand-700 hover:underline">Back to discovery</button>
          </div>
          {searchState.status === "loading" || searchState.status === "error" ? (
            <AsyncState status={searchState.status} error={searchState.error} />
          ) : !hasSearchResults ? (
            <AsyncState status="empty" emptyTitle="No matching results" emptyMessage="Try a creator name, topic, or community." />
          ) : (
            <div className="mt-5 space-y-8">
              {searchState.results.creators.length ? (
                <div><h3 className="mb-3 text-lg font-black">Creators</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{searchState.results.creators.map((creator) => <CreatorCard key={creator.id} creator={creator} />)}</div></div>
              ) : null}
              {searchState.results.posts.length ? (
                <div><h3 className="mb-3 text-lg font-black">Posts</h3><div className="grid gap-5 lg:grid-cols-2">{searchState.results.posts.map((post) => <FeedCard key={post.id} post={post} onLike={toggleLike} onBookmark={toggleBookmark} />)}</div></div>
              ) : null}
              {searchState.results.communities.length ? (
                <div><h3 className="mb-3 text-lg font-black">Communities</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{searchState.results.communities.map((community) => <CommunityCard key={community.id} community={community} />)}</div></div>
              ) : null}
            </div>
          )}
        </section>
      ) : (
        <section className="mt-8" aria-labelledby="discovery-title">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-600">Categories</p>
            <h2 id="discovery-title" className="mt-1 text-2xl font-black">Discover creators</h2>
          </div>
          {discovery ? (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2" aria-label="Creator categories">
              {["All", ...discovery.categories].map((item) => (
                <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`h-9 shrink-0 rounded-full px-4 text-sm font-bold ${category === item ? "bg-brand-600 text-white" : "border border-line bg-white"}`}>{item}</button>
              ))}
            </div>
          ) : null}
          {status !== "success" ? (
            <div className="mt-5"><AsyncState status={status} error={error} onRetry={retryDiscovery} emptyTitle="No creators to discover yet" emptyMessage="The directory will update as creator profiles go live." /></div>
          ) : discoveredCreators.length ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{discoveredCreators.map((creator) => <CreatorCard key={creator.id} creator={creator} onFollow={toggleFollow} />)}</div>
          ) : (
            <div className="mt-5"><AsyncState status="empty" emptyTitle={`No ${category} creators yet`} emptyMessage="Choose another category to keep exploring." /></div>
          )}
        </section>
      )}
    </main>
  );
}
