"use client";

import Link from "next/link";
import { Bell, Radio, Sparkles, Users } from "lucide-react";
import { CreatorCard } from "./CreatorCard";
import EditorialImage from "./EditorialImage";
import { FeedRail } from "./FeedRail";

const EmptyList = ({ children }) => (
  <p className="rounded-2xl border border-dashed border-line bg-white p-5 text-sm text-muted">
    {children}
  </p>
);

export default function HomeDashboard({ data, onFollow }) {
  const hasConnections =
    data.creators.length > 0 ||
    data.featuredPosts.length > 0 ||
    data.stories.length > 0 ||
    data.liveSessions.length > 0 ||
    data.subscriptions.length > 0;

  return (
    <main className="mx-auto w-full max-w-7xl overflow-hidden px-4 py-6 sm:px-6 lg:py-8">
      <header className="rounded-3xl bg-[#17121f] px-5 py-7 text-white sm:px-8 sm:py-9">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-300">
              Home
            </p>
            <h1 className="mt-2 break-words text-3xl font-black tracking-tight sm:text-4xl">
              Welcome back, {data.viewer.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              Find creators, current stories, and posts shaped by the Blindly community.
            </p>
          </div>
          <Link
            href="/notifications"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-bold hover:bg-white/15"
          >
            <Bell size={17} />
            {data.unreadNotifications > 0
              ? `${data.unreadNotifications} unread`
              : "Notifications"}
          </Link>
        </div>
      </header>

      {!hasConnections ? (
        <section className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-5">
          <h2 className="font-black">
            Your Blindly workspace is ready for new connections
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Explore creators and return as new posts, stories, and live sessions arrive.
          </p>
          <Link
            href="/explore"
            className="mt-4 inline-flex min-h-10 items-center rounded-full bg-ink px-5 text-sm font-bold text-white"
          >
            Explore creators
          </Link>
        </section>
      ) : null}

      <section className="mt-8 min-w-0" aria-labelledby="stories-title">
        <div className="flex items-center justify-between gap-4">
          <h2 id="stories-title" className="text-xl font-black">
            Stories
          </h2>
          <Link href="/feed" className="text-sm font-bold text-brand-700 hover:underline">
            View feed
          </Link>
        </div>
        {data.stories.length ? (
          <div className="mt-4 flex max-w-full gap-3 overflow-x-auto pb-2">
            {data.stories.map((story) => (
              <Link
                key={story.id}
                href={`/creator/${story.creator.handle}`}
                className="w-32 shrink-0 overflow-hidden rounded-2xl border border-line bg-white"
              >
                <EditorialImage
                  src={story.mediaUrl}
                  alt={`${story.creator.name}'s story`}
                  fallbackLabel="Story unavailable"
                  className="aspect-[4/5] w-full object-cover"
                />
                <p className="truncate px-3 py-2 text-xs font-bold">{story.creator.name}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyList>No active stories right now.</EmptyList>
          </div>
        )}
      </section>

      <section className="mt-8 min-w-0" aria-labelledby="creators-title">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-600">
              <Users size={15} /> Discover
            </p>
            <h2 id="creators-title" className="mt-1 text-2xl font-black">
              Creators to know
            </h2>
          </div>
          <Link href="/explore" className="text-sm font-bold text-brand-700 hover:underline">
            Browse all
          </Link>
        </div>
        {data.categories.length ? (
          <div className="mt-4 flex max-w-full gap-2 overflow-x-auto pb-1">
            {data.categories.map((category) => (
              <Link
                key={category}
                href={`/explore?category=${encodeURIComponent(category)}`}
                className="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-xs font-bold"
              >
                {category}
              </Link>
            ))}
          </div>
        ) : null}
        {data.creators.length ? (
          <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.creators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} onFollow={onFollow} />
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyList>No creator recommendations yet.</EmptyList>
          </div>
        )}
      </section>

      <div className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0" aria-labelledby="featured-title">
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-600">
            <Sparkles size={15} /> Trending
          </p>
          <h2 id="featured-title" className="mb-4 mt-1 text-2xl font-black">
            Featured posts
          </h2>
          <FeedRail posts={data.featuredPosts} />
        </section>

        <aside className="min-w-0 space-y-7">
          <section aria-labelledby="live-title">
            <div className="flex items-center justify-between gap-3">
              <h2 id="live-title" className="flex items-center gap-2 text-lg font-black">
                <Radio size={18} className="text-rose-500" /> Live now
              </h2>
              <Link href="/live" className="text-xs font-bold text-brand-700 hover:underline">
                Open live
              </Link>
            </div>
            {data.liveSessions.length ? (
              <div className="mt-3 space-y-3">
                {data.liveSessions.map((session) => (
                  <Link
                    key={session.id}
                    href="/live"
                    className="block overflow-hidden rounded-2xl border border-line bg-white"
                  >
                    <EditorialImage
                      src={session.thumbnailUrl}
                      alt={`${session.title} live session`}
                      fallbackLabel="Live preview unavailable"
                      className="aspect-video w-full object-cover"
                    />
                    <div className="p-4">
                      <p className="line-clamp-2 text-sm font-black">{session.title}</p>
                      <p className="mt-1 text-xs text-muted">
                        {session.host.name} | {session.viewerCount.toLocaleString("en-IN")} watching
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-3">
                <EmptyList>No one is live right now.</EmptyList>
              </div>
            )}
          </section>

          <section aria-labelledby="subscriptions-title">
            <div className="flex items-center justify-between gap-3">
              <h2 id="subscriptions-title" className="text-lg font-black">
                Your subscriptions
              </h2>
              <Link
                href="/subscriptions"
                className="text-xs font-bold text-brand-700 hover:underline"
              >
                Manage
              </Link>
            </div>
            {data.subscriptions.length ? (
              <div className="mt-3 space-y-2">
                {data.subscriptions.map((subscription) => (
                  <Link
                    key={subscription.id}
                    href={`/creator/${subscription.creator.handle}`}
                    className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black">
                        {subscription.creator.name}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {subscription.tier}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-bold text-emerald-700">Active</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-3">
                <EmptyList>No active subscriptions.</EmptyList>
              </div>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
