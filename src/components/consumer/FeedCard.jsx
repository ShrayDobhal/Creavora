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
} from "lucide-react";
import Link from "next/link";
import { ConsumerAvatar } from "./CreatorCard";

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
};

const numericCount = (value) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

export function FeedCard({
  post,
  onLike,
  onBookmark,
  onLoadComments,
  onCreateComment,
}) {
  const [isLiked, setIsLiked] = useState(Boolean(post.viewer?.isLiked));
  const [likes, setLikes] = useState(numericCount(post.counts?.likes));
  const [isBookmarked, setIsBookmarked] = useState(Boolean(post.viewer?.isBookmarked));
  const [pendingAction, setPendingAction] = useState(null);
  const [error, setError] = useState("");
  const [mediaFailed, setMediaFailed] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(numericCount(post.counts?.comments));
  const [commentStatus, setCommentStatus] = useState("idle");
  const [commentError, setCommentError] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [commentPending, setCommentPending] = useState(false);

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

  async function handleCommentsToggle() {
    if (commentsOpen) {
      setCommentsOpen(false);
      return;
    }

    setCommentsOpen(true);
    if (commentStatus === "success" || !onLoadComments) return;
    setCommentStatus("loading");
    setCommentError("");
    try {
      const result = await onLoadComments(post.id);
      setComments(Array.isArray(result) ? result : []);
      setCommentStatus("success");
    } catch (loadError) {
      setCommentError(loadError.message || "Unable to load comments");
      setCommentStatus("error");
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();
    const content = commentDraft.trim();
    if (!content || !onCreateComment || commentPending) return;

    setCommentPending(true);
    setCommentError("");
    try {
      const result = await onCreateComment(post.id, content);
      setComments((current) => [result.comment, ...current]);
      setCommentCount(
        numericCount(result.commentsCount) ??
          (commentCount === null ? null : commentCount + 1),
      );
      setCommentDraft("");
      setCommentStatus("success");
    } catch (createError) {
      setCommentError(createError.message || "Unable to add comment");
    } finally {
      setCommentPending(false);
    }
  }

  const mediaAlt = post.content || `Post by ${post.creator.name}`;
  const shares = numericCount(post.counts?.shares);
  const unavailable = post.isPremium && post.availability === "coming_soon";
  const commentButtonLabel = commentsOpen
    ? `Hide ${commentCount ?? ""} comments`.replace(/\s+/g, " ")
    : `View ${commentCount ?? ""} comments`.replace(/\s+/g, " ");

  return (
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
          {post.content ? <p className="px-4 pb-4 text-[15px] leading-7 text-ink/85 sm:px-5">{post.content}</p> : null}
          {post.mediaUrl && !mediaFailed ? (
            post.mediaType?.toLowerCase().startsWith("video") ? (
              <div className="relative bg-black">
                <video
                  src={post.mediaUrl}
                  controls
                  preload="metadata"
                  className="max-h-[620px] w-full"
                  aria-label={mediaAlt}
                  onError={() => setMediaFailed(true)}
                />
                <Play className="pointer-events-none absolute left-4 top-4 text-white/80" size={20} />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- API media may come from creator-selected hosts.
              <img
                src={post.mediaUrl}
                alt={mediaAlt}
                className="max-h-[680px] w-full bg-neutral-100 object-cover"
                onError={() => setMediaFailed(true)}
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
            onClick={handleCommentsToggle}
            className="inline-flex min-h-10 items-center gap-1.5 text-sm text-muted"
          >
            <MessageCircle size={18} /> {commentCount === null ? null : commentCount.toLocaleString("en-IN")}
          </button>
        ) : commentCount === null ? null : (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted" aria-label={`${commentCount} comments`}>
            <MessageCircle size={18} /> {commentCount.toLocaleString("en-IN")}
          </span>
        )}
        {shares === null ? null : (
          <span className="hidden items-center gap-1.5 text-sm text-muted sm:inline-flex" aria-label={`${shares} shares`}>
            <Share2 size={17} /> {shares.toLocaleString("en-IN")}
          </span>
        )}
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

      {commentsOpen ? (
        <section className="mx-4 mb-4 border-t border-line pt-4 sm:mx-5" aria-label="Comments">
          {commentStatus === "loading" ? <p className="text-sm text-muted" role="status">Loading comments</p> : null}
          {commentError ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700" role="alert">{commentError}</p> : null}
          {commentStatus === "success" ? (
            <>
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <label htmlFor={`comment-${post.id}`} className="sr-only">Add a comment</label>
                <input
                  id={`comment-${post.id}`}
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  maxLength={2000}
                  placeholder="Add a comment"
                  className="h-10 min-w-0 flex-1 rounded-xl border border-line px-3 text-sm outline-none focus:border-brand-300"
                />
                <button type="submit" disabled={commentPending || !commentDraft.trim()} className="h-10 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white disabled:opacity-60">
                  {commentPending ? "Posting" : "Post comment"}
                </button>
              </form>
              <div className="mt-4 space-y-3">
                {comments.length ? comments.map((comment) => (
                  <article key={comment.id} className="rounded-xl bg-canvas p-3">
                    <p className="text-xs font-bold">{comment.user?.name || `@${comment.user?.handle}`}</p>
                    <p className="mt-1 text-sm leading-6 text-ink/80">{comment.content}</p>
                  </article>
                )) : <p className="text-sm text-muted">No comments yet.</p>}
              </div>
            </>
          ) : null}
        </section>
      ) : null}
      {error ? <p className="mx-4 mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 sm:mx-5" role="alert">{error}</p> : null}
    </article>
  );
}
