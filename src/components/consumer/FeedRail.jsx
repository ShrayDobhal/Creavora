import { Radio, Sparkles } from "lucide-react";
import Link from "next/link";
import { ConsumerAvatar } from "./CreatorCard";
import { FeedCard } from "./FeedCard";

export function FeedRail({
  posts,
  creators = [],
  topics = [],
  liveSessions = [],
  onLike,
  onBookmark,
}) {
  if (posts) {
    if (!posts.length) {
      return <p className="rounded-2xl border border-dashed border-line bg-white p-5 text-sm text-muted">No featured posts yet.</p>;
    }

    return (
      <div className="grid min-w-0 gap-5 xl:grid-cols-2">
        {posts.map((post) => <div key={post.id} className="min-w-0"><FeedCard post={post} onLike={onLike} onBookmark={onBookmark} /></div>)}
      </div>
    );
  }

  const live = liveSessions.filter((session) => session.status === "LIVE");

  return (
    <aside className="space-y-5" aria-label="Contextual discovery">
      <section className="rounded-2xl border border-line bg-white p-5" aria-labelledby="feed-creators-title">
        <div className="flex items-center justify-between gap-3">
          <h2 id="feed-creators-title" className="text-base font-black">Creators to know</h2>
          <Link href="/explore" className="text-xs font-bold text-brand-700 hover:underline">Explore</Link>
        </div>
        {creators.length ? (
          <div className="mt-4 space-y-3">
            {creators.slice(0, 4).map((creator) => (
              <Link key={creator.id} href={`/creator/${creator.handle}`} className="flex min-w-0 items-center gap-3 rounded-xl p-1 hover:bg-canvas">
                <ConsumerAvatar creator={creator} size="h-10 w-10" />
                <span className="min-w-0"><span className="block truncate text-sm font-black">{creator.name}</span><span className="block truncate text-xs text-muted">{creator.roleTitle || creator.category || `@${creator.handle}`}</span></span>
              </Link>
            ))}
          </div>
        ) : <p className="mt-4 text-sm text-muted">Creator recommendations will appear here.</p>}
      </section>

      <section className="rounded-2xl border border-line bg-white p-5" aria-labelledby="feed-topics-title">
        <h2 id="feed-topics-title" className="flex items-center gap-2 text-base font-black"><Sparkles size={16} className="text-brand-600" /> Explore topics</h2>
        {topics.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {topics.map(({ name }) => <Link key={name} href={`/explore?category=${encodeURIComponent(name)}`} className="rounded-full bg-brand-50 px-3 py-2 text-xs font-bold text-brand-800 hover:bg-brand-100">{name}</Link>)}
          </div>
        ) : <p className="mt-4 text-sm text-muted">Topics will appear as creators join.</p>}
      </section>

      <section className="rounded-2xl bg-[#17121f] p-5 text-white" aria-labelledby="feed-live-title">
        <h2 id="feed-live-title" className="flex items-center gap-2 text-base font-black"><Radio size={16} className="text-rose-400" /> Live right now</h2>
        {live.length ? (
          <div className="mt-4 space-y-3">
            {live.slice(0, 3).map((session) => <Link key={session.id} href={`/live#session-${session.id}`} className="block rounded-xl bg-white/10 p-3 hover:bg-white/15"><span className="block truncate text-sm font-black">{session.title}</span><span className="mt-1 block truncate text-xs text-white/65">{session.host.name} · {session.viewerCount.toLocaleString("en-IN")} watching</span></Link>)}
          </div>
        ) : <p className="mt-4 text-sm text-white/65">No one is live right now.</p>}
      </section>
    </aside>
  );
}
