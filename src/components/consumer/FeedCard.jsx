"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Bookmark,
  Clock3,
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
  const unavailable = post.isPremium && post.availability === "coming_soon";
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

      {unavailable ? (
        <div className="mx-4 grid min-h-44 place-items-center rounded-xl bg-neutral-100 p-8 text-center sm:mx-5">
          <div>
            <Clock3 className="mx-auto text-brand-600" size={28} />
            <p className="mt-3 font-bold">This post is not available in the current release.</p>
          </div>
        </div>
      ) : (
        <>
          {content ? <p className="px-4 pb-4 text-[15px] leading-7 text-ink/85 sm:px-5">{content}</p> : null}
          {post.mediaUrl ? (
            post.mediaType?.toLowerCase().startsWith("video") ? (
              videoFailed ? (
                <div role="img" aria-label={mediaAlt} className="grid min-h-48 place-items-center bg-canvas p-5 text-sm font-semibold text-muted">Media unavailable</div>
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
              <EditorialImage
                src={post.mediaUrl}
                alt={mediaAlt}
                className="aspect-[4/3] max-h-[680px] w-full bg-neutral-100 object-cover"
                fallbackLabel="Media unavailable"
              />
            )
          ) : null}
        </>
      )}

      <footer className="m-4 flex items-center gap-4 border-t border-line pt-3 sm:m-5">
        <button
          type="button"
          aria-label={`${isLiked ? "Unlike" : "Like"} post by ${post.creator.name}`}
          aria-pressed={isLiked}
          disabled={Boolean(pendingAction)}
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
            onClick={() => setCommentsOpen(true)}
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
          disabled={Boolean(pendingAction)}
          onClick={handleBookmark}
          className={`ml-auto grid min-h-10 min-w-10 place-items-center rounded-full disabled:opacity-60 ${isBookmarked ? "text-brand-700" : "text-ink/65"}`}
        >
          <Bookmark size={19} className={isBookmarked ? "fill-current" : ""} />
        </button>
      </footer>

      {error ? <p className="mx-4 mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 sm:mx-5" role="alert">{error}</p> : null}
    </article>
    {onLoadComments && onCreateComment ? (
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
