"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Bookmark,
  Clock3,
  LockKeyhole,
  Heart,
  MessageCircle,
  Play,
  Share2,
  Maximize2,
} from "lucide-react";
import Link from "next/link";
import { ConsumerAvatar } from "./CreatorCard";
import EditorialImage from "./EditorialImage";
import { OwnedPostMenu } from "./OwnedPostMenu";
import { CommentDrawer } from "./CommentDrawer";

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
};

const numericCount = (value) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const copyLink = async (value) => {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) throw new Error("Unable to copy post link");
};

export function FeedCard({
  post,
  onLike,
  onBookmark,
  onLoadComments,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  onShare,
  onMutated,
}) {
  const [editedContent, setEditedContent] = useState(null);
  const content = editedContent ?? post.content;
  const [isLiked, setIsLiked] = useState(Boolean(post.viewer?.isLiked));
  const [likes, setLikes] = useState(numericCount(post.counts?.likes));
  const [isBookmarked, setIsBookmarked] = useState(Boolean(post.viewer?.isBookmarked));
  const [pendingAction, setPendingAction] = useState(null);
  const [error, setError] = useState("");
  const [videoFailed, setVideoFailed] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(numericCount(post.counts?.comments));
  const [shareCount, setShareCount] = useState(numericCount(post.counts?.shares));

  async function handleLike() {
    if (!onLike || pendingAction) return;
    const previous = { isLiked, likes };
    setIsLiked(!isLiked);
    setLikes(likes === null ? null : Math.max(0, likes + (isLiked ? -1 : 1)));
    setPendingAction("like");
    setError("");
    try {
      const result = await onLike(post.id);
      setIsLiked(Boolean(result.isLiked));
      setLikes(numericCount(result.likesCount));
    } catch (likeError) {
      setIsLiked(previous.isLiked);
      setLikes(previous.likes);
      setError(likeError.message || "Unable to update like");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleBookmark() {
    if (!onBookmark || pendingAction) return;
    const previous = isBookmarked;
    setIsBookmarked(!previous);
    setPendingAction("bookmark");
    setError("");
    try {
      const result = await onBookmark(post.id);
      setIsBookmarked(Boolean(result.isBookmarked));
    } catch (bookmarkError) {
      setIsBookmarked(previous);
      setError(bookmarkError.message || "Unable to update bookmark");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleShare() {
    if (pendingAction) return;
    setPendingAction("share");
    setError("");
    try {
      const url = `${window.location.origin}/post/${post.id}`;
      if (navigator.share) await navigator.share({ title: `Post by ${post.creator.name}`, url });
      else await copyLink(url);
      if (onShare) {
        const result = await onShare(post.id);
        setShareCount(numericCount(result.sharesCount));
      }
    } catch (shareError) {
      if (shareError?.name !== "AbortError") setError(shareError.message || "Unable to share post");
    } finally {
      setPendingAction(null);
    }
  }

  const mediaAlt = content || `Post by ${post.creator.name}`;
  const locked = post.isPremium && post.availability === "locked";
  const premiumPreview = post.isPremium && post.availability === "preview";
  const checkoutHref = `/checkout?creator=${encodeURIComponent(post.creator.handle)}`;
  const commentButtonLabel = commentsOpen
    ? `Hide ${commentCount ?? ""} comments`.replace(/\s+/g, " ")
    : `View ${commentCount ?? ""} comments`.replace(/\s+/g, " ");

  return (
    <>
    <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <header className="flex items-center gap-3 p-4 sm:p-5">
        <Link href={`/creator/${post.creator.handle}`} aria-label={`View ${post.creator.name}'s profile`}>
          <ConsumerAvatar creator={post.creator} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/creator/${post.creator.handle}`} className="flex w-fit items-center gap-1.5 truncate text-sm font-extrabold hover:underline">
            {post.creator.name}
            {post.creator.verified ? <BadgeCheck size={15} className="fill-blue-500 text-white" /> : null}
          </Link>
          <p className="text-xs text-muted">{post.creator.roleTitle || `@${post.creator.handle}`} · {formatDate(post.publishedAt)}</p>
        </div>
        <OwnedPostMenu
          post={{ ...post, content }}
          onMutated={(mutation) => {
            if (mutation.type === "update") setEditedContent(mutation.post.content);
            onMutated?.(mutation);
          }}
        />
      </header>

      {locked ? (
        <div className="relative min-h-64 overflow-hidden bg-neutral-900">
          {post.mediaUrl && !post.mediaType?.toLowerCase().startsWith("video") ? (
            <EditorialImage src={post.mediaUrl} alt="Locked premium preview" className="absolute inset-0 h-full w-full scale-105 object-cover blur-xl opacity-60" fallbackLabel="Premium media" />
          ) : <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-neutral-900 to-violet-900" />}
          <div className="absolute inset-0 bg-black/35" />
          <div className="relative z-10 grid min-h-64 place-items-center p-8 text-center text-white">
            <div>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white/15 backdrop-blur"><LockKeyhole size={22} /></span>
              <p className="mt-4 text-lg font-black">Premium content</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/75">You have viewed the two free premium previews from this creator</p>
              <Link href={checkoutHref} className="mt-5 inline-flex min-h-10 items-center rounded-xl bg-white px-5 text-sm font-black text-brand-800">Subscribe to unlock</Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          {premiumPreview ? <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-xs font-bold text-brand-800 sm:mx-5"><Clock3 size={15} /> Free premium preview {post.previewIndex} of 2</div> : null}
          {content ? <Link href={`/post/${post.id}`} className="block px-4 pb-4 text-[15px] leading-7 text-ink/85 hover:text-brand-800 sm:px-5">{content}</Link> : null}
          {post.mediaUrl ? (
            post.mediaType?.toLowerCase().startsWith("video") ? (
              videoFailed ? (
                <div role="img" aria-label={mediaAlt} className="grid min-h-48 place-items-center bg-canvas p-5 text-sm font-semibold text-muted">Media unavailable</div>
              ) : post.mediaUrl.includes("iframe.mediadelivery.net") ? (
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={post.mediaUrl}
                    title={mediaAlt}
                    loading="lazy"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                </div>
              ) : (
                <div className="relative bg-black">
                  <video
                    src={post.mediaUrl}
                    controls
                    preload="metadata"
                    className="max-h-[620px] w-full"
                    aria-label={mediaAlt}
                    onError={() => setVideoFailed(true)}
                  />
                  <Play className="pointer-events-none absolute left-4 top-4 text-white/80" size={20} />
                </div>
              )
            ) : (
              <Link href={`/post/${post.id}`} aria-label={`Open post by ${post.creator.name}`} className="block">
                <EditorialImage
                  src={post.mediaUrl}
                  alt={mediaAlt}
                  className="max-h-[720px] w-full bg-neutral-100 object-contain transition-opacity hover:opacity-95"
                  fallbackLabel="Media unavailable"
                />
              </Link>
            )
          ) : null}
        </>
      )}

      <footer className="m-4 flex items-center gap-4 border-t border-line pt-3 sm:m-5">
        <button
          type="button"
          aria-label={`${isLiked ? "Unlike" : "Like"} post by ${post.creator.name}`}
          aria-pressed={isLiked}
          disabled={Boolean(pendingAction) || locked}
          onClick={handleLike}
          className={`inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-sm font-bold disabled:opacity-60 ${isLiked ? "text-rose-600" : "text-ink/70"}`}
        >
          <Heart size={19} className={isLiked ? "fill-current" : ""} /> {likes === null ? null : likes.toLocaleString("en-IN")}
        </button>
        {onLoadComments ? (
          <button
            type="button"
            aria-expanded={commentsOpen}
            aria-label={commentButtonLabel}
            onClick={() => { if (!locked) setCommentsOpen(true); }}
            disabled={locked}
            className="inline-flex min-h-10 items-center gap-1.5 text-sm text-muted"
          >
            <MessageCircle size={18} /> {commentCount === null ? null : commentCount.toLocaleString("en-IN")}
          </button>
        ) : commentCount === null ? null : (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted" aria-label={`${commentCount} comments`}>
            <MessageCircle size={18} /> {commentCount.toLocaleString("en-IN")}
          </span>
        )}
        <button type="button" onClick={handleShare} disabled={Boolean(pendingAction)} aria-label="Share post" className="inline-flex min-h-10 items-center gap-1.5 text-sm text-muted disabled:opacity-60"><Share2 size={17} /> {shareCount === null ? null : shareCount.toLocaleString("en-IN")}</button>
        <Link href={`/post/${post.id}`} aria-label="Open post" className="grid min-h-10 min-w-10 place-items-center rounded-full text-ink/65 hover:bg-canvas"><Maximize2 size={17} /></Link>
        <button
          type="button"
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark post"}
          aria-pressed={isBookmarked}
          disabled={Boolean(pendingAction) || locked}
          onClick={handleBookmark}
          className={`ml-auto grid min-h-10 min-w-10 place-items-center rounded-full disabled:opacity-60 ${isBookmarked ? "text-brand-700" : "text-ink/65"}`}
        >
          <Bookmark size={19} className={isBookmarked ? "fill-current" : ""} />
        </button>
      </footer>

      {error ? <p className="mx-4 mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 sm:mx-5" role="alert">{error}</p> : null}
    </article>
    {onLoadComments && onCreateComment && !locked ? (
      <CommentDrawer
        post={post}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        onLoad={onLoadComments}
        onCreate={onCreateComment}
        onUpdate={onUpdateComment || (() => Promise.reject(new Error("Comment editing is unavailable")))}
        onDelete={onDeleteComment || (() => Promise.reject(new Error("Comment deletion is unavailable")))}
        onCountChange={(count) => setCommentCount(numericCount(count))}
      />
    ) : null}
    </>
  );
}
