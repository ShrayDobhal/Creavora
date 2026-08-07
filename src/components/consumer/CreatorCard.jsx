"use client";

import { useState } from "react";
import { BadgeCheck, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import EditorialImage from "./EditorialImage";

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "C";

export function ConsumerAvatar({ creator, size = "h-12 w-12" }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(creator.avatar) && !failed;

  return (
    <span
      className={`grid aspect-square shrink-0 place-items-center overflow-hidden rounded-full bg-brand-100 font-extrabold text-brand-700 ${size}`}
      aria-label={`${creator.name} avatar`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote creator URLs are user-provided.
        <img
          src={creator.avatar}
          alt=""
          className="h-full w-full object-cover object-center"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initials(creator.name)}</span>
      )}
    </span>
  );
}

export function CreatorCard({ creator, onFollow }) {
  const [isFollowing, setIsFollowing] = useState(Boolean(creator.isFollowing));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleFollow() {
    if (!onFollow || pending) return;
    const previous = isFollowing;
    setIsFollowing(!previous);
    setPending(true);
    setError("");
    try {
      const result = await onFollow(creator.handle);
      setIsFollowing(Boolean(result.isFollowing));
    } catch (followError) {
      setIsFollowing(previous);
      setError(followError.message || "Unable to update follow status");
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="group relative flex h-full min-h-[390px] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl">
      <Link href={`/creator/${creator.handle}`} className="absolute inset-0 z-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500" aria-label={`Open ${creator.name}'s profile`} />
      <div className="pointer-events-none h-36 shrink-0 bg-gradient-to-br from-[#241541] via-brand-700 to-[#d1609f]">
        {creator.coverImage ? (
          <EditorialImage
            src={creator.coverImage}
            alt={`${creator.name} cover`}
            className="h-full w-full object-cover"
            fallbackLabel="Creator cover unavailable"
          />
        ) : null}
      </div>
      <div className="pointer-events-none relative z-[1] flex flex-1 flex-col p-4">
        <div className="-mt-10 flex items-end justify-between gap-3">
          <ConsumerAvatar creator={creator} size="h-16 w-16 ring-4 ring-white" />
          {onFollow ? (
            <button
              type="button"
              aria-pressed={isFollowing}
              disabled={pending}
              onClick={(event) => { event.preventDefault(); event.stopPropagation(); handleFollow(); }}
              className={`pointer-events-auto relative z-10 inline-flex h-9 items-center gap-2 rounded-full px-4 text-xs font-bold transition disabled:opacity-60 ${
                isFollowing
                  ? "border border-line bg-white text-ink"
                  : "bg-brand-600 text-white hover:bg-brand-700"
              }`}
            >
              <UserPlus size={14} /> {isFollowing ? "Following" : "Follow"}
            </button>
          ) : null}
        </div>
        <p className="mt-4 flex items-center gap-1.5 font-extrabold transition-colors group-hover:text-brand-700">
          {creator.name}
          {creator.verified ? <BadgeCheck size={16} className="fill-blue-500 text-white" /> : null}
        </p>
        <p className="text-xs text-muted">@{creator.handle}</p>
        {creator.roleTitle || creator.category ? (
          <p className="mt-3 min-h-5 text-sm text-ink/75">{creator.roleTitle || creator.category}</p>
        ) : <span className="mt-3 min-h-5" />}
        {creator.bio ? <p className="mt-2 line-clamp-2 min-h-[44px] text-sm leading-relaxed text-muted">{creator.bio}</p> : <p className="mt-2 min-h-[44px] text-sm text-muted">View profile and published work</p>}
        {typeof creator.followerCount === "number" ? (
          <p className="mt-auto flex items-center gap-1.5 pt-4 text-xs font-semibold text-muted">
            <Users size={14} /> {creator.followerCount.toLocaleString("en-IN")} followers
          </p>
        ) : null}
        {error ? <p className="mt-2 text-xs font-semibold text-rose-600" role="alert">{error}</p> : null}
      </div>
    </article>
  );
}
