"use client";

import Link from "next/link";
import {
  Bell,
  CalendarClock,
  Compass,
  Radio,
  Sparkles,
  Users,
} from "lucide-react";
import { ConsumerAvatar, CreatorCard } from "./CreatorCard";
import EditorialImage from "./EditorialImage";
import { FeedRail } from "./FeedRail";

const EmptyList = ({ children, dark = false }) => (
  <p
    className={`rounded-2xl border border-dashed p-4 text-sm ${
      dark
        ? "border-white/20 bg-white/5 text-white/65"
        : "border-line bg-white text-muted"
    }`}
  >
    {children}
  </p>
);

const formatSessionTime = (value) => {
  if (!value) return "Time to be announced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time to be announced";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

function StoryMedia({ story }) {
  const label = `${story.creator.name}'s story`;
  if (story.mediaType?.toLowerCase().startsWith("video")) {
    return (
      <video
        src={story.mediaUrl}
        aria-label={label}
        controls
        preload="metadata"
        className="aspect-[4/5] w-full bg-black object-cover"
      />
    );
  }

  return (
    <Link href={`/creator/${story.creator.handle}`}>
      <EditorialImage
        src={story.mediaUrl}
        alt={label}
        fallbackLabel="Story unavailable"
        className="aspect-[4/5] w-full object-cover"
      />
    </Link>
  );
}

function HeroCollage({ creators }) {
  const heroCreators = creators
    .filter((creator) => creator.coverImage || creator.avatar)
    .slice(0, 5);
  const cardClasses = [
    "col-span-1 row-span-2 -rotate-2",
    "col-span-1 row-span-3 translate-y-3 rotate-2",
    "col-span-1 row-span-2 rotate-3",
    "col-span-1 row-span-2 -translate-y-2 rotate-2",
    "col-span-1 row-span-2 -rotate-2",
  ];

  return (
    <section className="relative min-h-72 overflow-hidden rounded-3xl bg-[#120d1d] px-6 py-8 text-white sm:px-8 lg:min-h-80">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,rgba(124,92,255,0.34),transparent_38%),radial-gradient(circle_at_22%_78%,rgba(209,96,159,0.2),transparent_34%)]" />
      <div className="relative z-10 max-w-md md:max-w-[43%]">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-300">
          Blindly community
        </p>
        <h2 className="mt-4 text-4xl font-black leading-[1.02] tracking-tight lg:text-5xl">
          Where creators come closer
        </h2>
        <p className="mt-4 text-sm leading-6 text-white/70">
          Discover real work, current broadcasts, and the people building them.
        </p>
        <Link
          href="/explore"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-500 px-5 text-sm font-black text-white hover:bg-brand-400"
        >
          <Compass size={17} /> Explore creators
        </Link>
      </div>

      {heroCreators.length ? (
        <div className="absolute inset-y-5 right-5 hidden w-[52%] grid-cols-3 grid-rows-5 gap-2 md:grid">
          {heroCreators.map((creator, index) => (
            <Link
              key={creator.id}
              href={`/creator/${creator.handle}`}
              className={`relative min-h-0 overflow-hidden rounded-2xl border border-white/25 bg-white/10 shadow-2xl ${cardClasses[index]}`}
            >
              <EditorialImage
                src={creator.coverImage || creator.avatar}
                alt={`${creator.name} featured creator`}
                fallbackLabel="Creator image unavailable"
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-3 pb-3 pt-8">
                <span className="block truncate text-xs font-black">{creator.name}</span>
                <span className="block truncate text-[10px] text-white/70">
                  {creator.roleTitle || creator.category || `@${creator.handle}`}
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="absolute bottom-6 right-6 hidden w-48 md:block">
          <EmptyList dark>Creator portraits will appear as profiles go live.</EmptyList>
        </div>
      )}
    </section>
  );
}

function LiveCard({ session }) {
  return (
    <Link
      href={`/live#session-${session.id}`}
      className="relative block w-64 shrink-0 overflow-hidden rounded-2xl bg-[#17121f] text-white"
    >
      {session.thumbnailUrl ? (
        <EditorialImage
          src={session.thumbnailUrl}
          alt={`${session.title} live session`}
          fallbackLabel="Live preview unavailable"
          className="aspect-video w-full object-cover opacity-90"
        />
      ) : (
        <div className="grid aspect-video place-items-center bg-brand-900">
          <Radio size={26} />
        </div>
      )}
      <span className="absolute left-3 top-3 rounded-md bg-rose-500 px-2 py-1 text-[10px] font-black uppercase tracking-wide">
        Live
      </span>
      <div className="p-4">
        <p className="line-clamp-1 text-sm font-black">{session.title}</p>
        <p className="mt-1 truncate text-xs text-white/65">
          {session.host.name} | {session.viewerCount.toLocaleString("en-IN")} watching
        </p>
      </div>
    </Link>
  );
}

function RightRail({ subscriptions, upcoming, unreadNotifications }) {
  return (
    <aside className="min-w-0 space-y-5 xl:sticky xl:top-5 xl:self-start">
      <section className="rounded-2xl border border-line bg-white p-5" aria-labelledby="subscriptions-title">
        <div className="flex items-center justify-between gap-3">
          <h2 id="subscriptions-title" className="text-base font-black">Your subscriptions</h2>
          <Link href="/subscriptions" className="text-xs font-bold text-brand-700 hover:underline">View all</Link>
        </div>
        {subscriptions.length ? (
          <div className="mt-4 space-y-3">
            {subscriptions.map((subscription) => (
              <Link
                key={subscription.id}
                href={`/creator/${subscription.creator.handle}`}
                className="flex min-w-0 items-center gap-3 rounded-xl p-1 hover:bg-canvas"
              >
                <ConsumerAvatar creator={subscription.creator} size="h-10 w-10" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black">{subscription.creator.name}</span>
                  <span className="block truncate text-xs text-muted">{subscription.tier}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4"><EmptyList>No active subscriptions.</EmptyList></div>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-white p-5" aria-labelledby="upcoming-title">
        <div className="flex items-center justify-between gap-3">
          <h2 id="upcoming-title" className="text-base font-black">Upcoming sessions</h2>
          <Link href="/live" className="text-xs font-bold text-brand-700 hover:underline">View all</Link>
        </div>
        {upcoming.length ? (
          <div className="mt-4 space-y-3">
            {upcoming.map((session) => (
              <Link
                key={session.id}
                href={`/live#session-${session.id}`}
                className="flex min-w-0 gap-3 rounded-xl p-1 hover:bg-canvas"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <CalendarClock size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black">{session.title}</span>
                  <span className="block text-xs leading-5 text-muted">{formatSessionTime(session.scheduledAt)}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4"><EmptyList>No sessions are scheduled yet.</EmptyList></div>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-white p-5" aria-labelledby="activity-title">
        <h2 id="activity-title" className="text-base font-black">Account activity</h2>
        <Link
          href="/notifications"
          className="mt-4 flex items-center gap-3 rounded-xl bg-canvas p-4 hover:bg-brand-50"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
            <Bell size={18} />
          </span>
          <span>
            <span className="block text-sm font-black">
              {unreadNotifications > 0
                ? `${unreadNotifications} unread notifications`
                : "No unread notifications"}
            </span>
            <span className="mt-0.5 block text-xs text-muted">Open your notification inbox</span>
          </span>
        </Link>
      </section>
    </aside>
  );
}

export default function HomeDashboard({
  data,
  onFollow,
  onLike,
  onBookmark,
}) {
  const live = data.liveSessions.filter((session) => session.status === "LIVE");
  const upcoming = data.liveSessions.filter(
    (session) => session.status === "SCHEDULED",
  );
  const hasConnections =
    data.creators.length > 0 ||
    data.featuredPosts.length > 0 ||
    data.stories.length > 0 ||
    data.liveSessions.length > 0 ||
    data.subscriptions.length > 0;

  return (
    <main className="mx-auto w-full max-w-[1500px] overflow-hidden px-3 py-5 sm:px-5 lg:px-6 lg:py-7">
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-black tracking-tight sm:text-3xl">
                Welcome back, {data.viewer.name}
              </h1>
              <p className="mt-1 text-sm text-muted">Ready to discover something new today?</p>
            </div>
            <Link href="/notifications" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-xs font-bold">
              <Bell size={15} /> {data.unreadNotifications > 0 ? `${data.unreadNotifications} unread` : "Notifications"}
            </Link>
          </header>

          <HeroCollage creators={data.creators} />

          {!hasConnections ? (
            <section className="mt-5 rounded-2xl border border-brand-200 bg-brand-50 p-5">
              <h2 className="font-black">Your Blindly workspace is ready for new connections</h2>
              <p className="mt-1 text-sm leading-6 text-muted">Explore creators and return as new posts, stories, and live sessions arrive.</p>
            </section>
          ) : null}

          <nav className="mt-4 flex max-w-full gap-2 overflow-x-auto rounded-2xl border border-line bg-white p-2" aria-label="Explore creator categories">
            {data.categories.length ? data.categories.map((category) => (
              <Link
                key={category}
                href={`/explore?category=${encodeURIComponent(category)}`}
                className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-black hover:bg-brand-50 hover:text-brand-700"
              >
                <Sparkles size={16} className="text-brand-500" /> {category}
              </Link>
            )) : (
              <span className="px-3 py-2 text-sm text-muted">Categories will appear as creator profiles go live.</span>
            )}
          </nav>

          <section className="mt-7 min-w-0" aria-labelledby="recommended-title">
            <div className="flex items-center justify-between gap-4">
              <h2 id="recommended-title" className="text-xl font-black">Recommended for you</h2>
              <Link href="/explore" className="text-xs font-bold text-brand-700 hover:underline">View all</Link>
            </div>
            {data.creators.length ? (
              <div className="mt-4 flex max-w-full gap-4 overflow-x-auto pb-2">
                {data.creators.map((creator) => (
                  <div key={creator.id} className="w-64 shrink-0"><CreatorCard creator={creator} onFollow={onFollow} /></div>
                ))}
              </div>
            ) : (
              <div className="mt-4"><EmptyList>No creator recommendations yet.</EmptyList></div>
            )}
          </section>

          <section className="mt-7 min-w-0" aria-labelledby="live-title">
            <div className="flex items-center justify-between gap-4">
              <h2 id="live-title" className="flex items-center gap-2 text-xl font-black"><Radio size={19} className="text-rose-500" /> Live right now</h2>
              <Link href="/live" className="text-xs font-bold text-brand-700 hover:underline">View all</Link>
            </div>
            {live.length ? (
              <div className="mt-4 flex max-w-full gap-4 overflow-x-auto pb-2">{live.map((session) => <LiveCard key={session.id} session={session} />)}</div>
            ) : (
              <div className="mt-4"><EmptyList>No one is live right now.</EmptyList></div>
            )}
          </section>

          <section className="mt-7 min-w-0" aria-labelledby="stories-title">
            <div className="flex items-center justify-between gap-4">
              <h2 id="stories-title" className="text-xl font-black">Current stories</h2>
              <Link href="/feed" className="text-xs font-bold text-brand-700 hover:underline">View feed</Link>
            </div>
            {data.stories.length ? (
              <div className="mt-4 flex max-w-full gap-3 overflow-x-auto pb-2">
                {data.stories.map((story) => (
                  <article key={story.id} className="w-36 shrink-0 overflow-hidden rounded-2xl border border-line bg-white">
                    <StoryMedia story={story} />
                    <Link href={`/creator/${story.creator.handle}`} className="block truncate px-3 py-2 text-xs font-black hover:underline">{story.creator.name}</Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-4"><EmptyList>No active stories right now.</EmptyList></div>
            )}
          </section>

          <section className="mt-7 min-w-0" aria-labelledby="featured-title">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id="featured-title" className="flex items-center gap-2 text-xl font-black"><Users size={19} className="text-brand-600" /> Featured posts</h2>
              <Link href="/feed" className="text-xs font-bold text-brand-700 hover:underline">Open feed</Link>
            </div>
            <FeedRail posts={data.featuredPosts} onLike={onLike} onBookmark={onBookmark} />
          </section>
        </div>

        <RightRail subscriptions={data.subscriptions} upcoming={upcoming} unreadNotifications={data.unreadNotifications} />
      </div>
    </main>
  );
}
