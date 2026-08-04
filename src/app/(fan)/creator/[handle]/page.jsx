"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BadgeCheck, Grid2X2, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AsyncState } from "@/components/consumer/AsyncState";
import { ConsumerAvatar } from "@/components/consumer/CreatorCard";
import { FeedCard } from "@/components/consumer/FeedCard";
import {
  createComment,
  getComments,
  getCreator,
  toggleBookmark,
  toggleFollow,
  toggleLike,
} from "@/services/consumer-api";

export default function CreatorProfilePage() {
  const params = useParams();
  const handle = Array.isArray(params.handle) ? params.handle[0] : params.handle;
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followPending, setFollowPending] = useState(false);
  const [followError, setFollowError] = useState("");

  useEffect(() => {
    if (!handle) return undefined;
    const controller = new AbortController();
    getCreator({ handle, signal: controller.signal })
      .then((result) => {
        setProfile(result);
        setIsFollowing(Boolean(result.creator.isFollowing));
        setStatus("success");
      })
      .catch((loadError) => {
        if (loadError.name === "AbortError") return;
        setError(loadError.message);
        setStatus("error");
      });
    return () => controller.abort();
  }, [handle, reloadKey]);

  async function handleFollow() {
    if (!profile || followPending) return;
    const previous = isFollowing;
    setIsFollowing(!previous);
    setFollowPending(true);
    setFollowError("");
    try {
      const result = await toggleFollow(profile.creator.handle);
      setIsFollowing(Boolean(result.isFollowing));
    } catch (actionError) {
      setIsFollowing(previous);
      setFollowError(actionError.message || "Unable to update follow status");
    } finally {
      setFollowPending(false);
    }
  }

  function retry() {
    setStatus("loading");
    setError("");
    setReloadKey((value) => value + 1);
  }

  const profileMatchesRoute = profile?.creator.handle === handle;
  if (status !== "success" || !profileMatchesRoute) {
    const visibleStatus = status === "success" && !profileMatchesRoute ? "loading" : status;
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <AsyncState status={visibleStatus} error={error} onRetry={retry} />
      </main>
    );
  }

  const { creator, posts } = profile;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <section className="overflow-hidden rounded-3xl border border-line bg-white" aria-labelledby="creator-name">
        <div className="relative h-44 bg-gradient-to-br from-[#201238] via-brand-800 to-[#d15f94] sm:h-56">
          {creator.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote creator URLs are user-provided.
            <img src={creator.coverImage} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.hidden = true; }} />
          ) : null}
          <Link href="/feed" aria-label="Back to feed" className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur"><ArrowLeft size={18} /></Link>
        </div>
        <div className="px-5 pb-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="-mt-12 flex min-w-0 items-end gap-4 sm:-mt-14">
              <ConsumerAvatar creator={creator} size="h-24 w-24 ring-4 ring-white sm:h-28 sm:w-28" />
              <div className="min-w-0 pb-1">
                <h1 id="creator-name" className="flex items-center gap-2 text-2xl font-black tracking-tight sm:text-3xl">
                  {creator.name}
                  {creator.verified ? <BadgeCheck size={22} className="fill-blue-500 text-white" /> : null}
                </h1>
                <p className="mt-1 text-sm text-muted">@{creator.handle}</p>
              </div>
            </div>
            <button
              type="button"
              aria-pressed={isFollowing}
              disabled={followPending}
              onClick={handleFollow}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-extrabold transition disabled:opacity-60 ${isFollowing ? "border border-line bg-white text-ink" : "bg-brand-600 text-white hover:bg-brand-700"}`}
            >
              <UserPlus size={17} /> {isFollowing ? "Following" : "Follow"}
            </button>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              {creator.roleTitle || creator.category ? <p className="text-sm font-bold text-brand-700">{[creator.roleTitle, creator.category].filter(Boolean).join(" · ")}</p> : null}
              {creator.bio ? <p className="mt-2 max-w-2xl text-[15px] leading-7 text-ink/75">{creator.bio}</p> : null}
              {followError ? <p className="mt-2 text-sm font-semibold text-rose-700" role="alert">{followError}</p> : null}
            </div>
            <dl className="flex gap-6 rounded-2xl bg-canvas px-5 py-3">
              <div><dt className="text-xs text-muted">Recent posts</dt><dd className="mt-0.5 text-lg font-black">{posts.length.toLocaleString("en-IN")}</dd></div>
              {typeof creator.followerCount === "number" ? (
                <div><dt className="flex items-center gap-1 text-xs text-muted"><Users size={12} /> Followers</dt><dd className="mt-0.5 text-lg font-black">{creator.followerCount.toLocaleString("en-IN")}</dd></div>
              ) : null}
            </dl>
          </div>
        </div>
      </section>

      <section className="mt-7" aria-labelledby="creator-posts-title">
        <div className="mb-4 flex items-center gap-2">
          <Grid2X2 className="text-brand-600" size={19} />
          <h2 id="creator-posts-title" className="text-xl font-black">Recent work</h2>
        </div>
        {posts.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {posts.map((post) => (
              <FeedCard
                key={post.id}
                post={post}
                onLike={toggleLike}
                onBookmark={toggleBookmark}
                onLoadComments={getComments}
                onCreateComment={createComment}
              />
            ))}
          </div>
        ) : (
          <AsyncState status="empty" emptyTitle="No published work yet" emptyMessage={`${creator.name} has not published a post.`} />
        )}
      </section>
    </main>
  );
}
