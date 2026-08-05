"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, MessageCircle, Pencil, Reply, Trash2, X } from "lucide-react";

const formatTimestamp = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

function CommentAvatar({ user }) {
  if (user?.avatar) {
    // eslint-disable-next-line @next/next/no-img-element -- remote profile images are user supplied
    return <img src={user.avatar} alt="" loading="lazy" className="h-9 w-9 shrink-0 rounded-full object-cover" />;
  }
  return <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-black text-brand-700">{user?.name?.slice(0, 1)?.toUpperCase() || "U"}</span>;
}

function CommentItem({ comment, onReply, onEdit, onDelete, pendingId }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);

  async function save(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || content === comment.content) return setEditing(false);
    try {
      await onEdit(comment.id, content);
      setEditing(false);
    } catch {
      // The drawer presents the request error and keeps the editor open for retry.
    }
  }

  return (
    <article className="flex gap-3 rounded-2xl bg-canvas p-3" data-comment-id={comment.id}>
      <CommentAvatar user={comment.user} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="text-sm font-extrabold">{comment.user?.name || `@${comment.user?.handle}`}</p>
          <time className="text-[11px] text-muted" dateTime={comment.createdAt}>{formatTimestamp(comment.createdAt)}</time>
        </div>
        {editing ? (
          <form onSubmit={save} className="mt-2">
            <label className="sr-only" htmlFor={`edit-comment-${comment.id}`}>Edit comment</label>
            <textarea id={`edit-comment-${comment.id}`} value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} rows={2} className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand-500" />
            <div className="mt-2 flex gap-2">
              <button type="submit" disabled={!draft.trim() || pendingId === comment.id} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">Save</button>
              <button type="button" onClick={() => { setDraft(comment.content); setEditing(false); }} className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-bold">Cancel</button>
            </div>
          </form>
        ) : <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-ink/80">{comment.content}</p>}
        {!editing ? (
          <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold text-muted">
            <button type="button" onClick={() => onReply(comment)} className="inline-flex min-h-8 items-center gap-1 hover:text-brand-700"><Reply size={13} /> Reply</button>
            {comment.viewer?.canManage ? (
              <>
                <button type="button" onClick={() => setEditing(true)} className="inline-flex min-h-8 items-center gap-1 hover:text-brand-700"><Pencil size={13} /> Edit</button>
                <button type="button" onClick={() => onDelete(comment.id)} disabled={pendingId === comment.id} className="inline-flex min-h-8 items-center gap-1 text-rose-700 disabled:opacity-60"><Trash2 size={13} /> Delete</button>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function CommentDrawer({ post, open, onClose, onLoad, onCreate, onUpdate, onDelete, onCountChange }) {
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const closeButton = useRef(null);

  const roots = useMemo(() => comments.filter((comment) => !comment.parentId), [comments]);
  const replies = useMemo(() => comments.reduce((map, comment) => {
    if (comment.parentId) map.set(comment.parentId, [...(map.get(comment.parentId) || []), comment]);
    return map;
  }, new Map()), [comments]);

  async function load() {
    setStatus("loading");
    setError("");
    try {
      setComments(await onLoad(post.id));
      setStatus("success");
    } catch (loadError) {
      setError(loadError.message || "Unable to load comments");
      setStatus("error");
    }
  }

  useEffect(() => {
    if (!open) return undefined;
    const loadTimer = window.setTimeout(load, 0);
    const focusFrame = window.requestAnimationFrame?.(() => closeButton.current?.focus());
    const closeOnEscape = (event) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => { window.clearTimeout(loadTimer); if (focusFrame) window.cancelAnimationFrame?.(focusFrame); document.removeEventListener("keydown", closeOnEscape); };
    // Reload only when this drawer opens for a different post
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, post.id]);

  if (!open) return null;

  async function submit(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || pendingId) return;
    setPendingId("create");
    setError("");
    try {
      const result = replyingTo
        ? await onCreate(post.id, content, replyingTo.id)
        : await onCreate(post.id, content);
      setComments((current) => [...current, result.comment]);
      onCountChange(result.commentsCount);
      setDraft("");
      setReplyingTo(null);
    } catch (createError) {
      setError(createError.message || "Unable to add comment");
    } finally {
      setPendingId(null);
    }
  }

  async function edit(commentId, content) {
    setPendingId(commentId);
    setError("");
    try {
      const updated = await onUpdate(post.id, commentId, content);
      setComments((current) => current.map((comment) => comment.id === commentId ? updated : comment));
    } catch (editError) {
      setError(editError.message || "Unable to update comment");
      throw editError;
    } finally {
      setPendingId(null);
    }
  }

  async function remove(commentId) {
    if (!window.confirm("Delete this comment?")) return;
    setPendingId(commentId);
    setError("");
    try {
      const result = await onDelete(post.id, commentId);
      setComments((current) => current.filter((comment) => comment.id !== commentId));
      onCountChange(result.commentsCount);
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete comment");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/45 sm:flex sm:justify-end" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby={`comments-title-${post.id}`} className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl bg-white shadow-2xl sm:static sm:h-full sm:max-h-none sm:w-[min(480px,100vw)] sm:rounded-none">
        <header className="flex items-center gap-3 border-b border-line px-4 py-4 sm:px-5">
          <MessageCircle size={19} className="text-brand-600" />
          <h2 id={`comments-title-${post.id}`} className="text-lg font-black">Comments</h2>
          <button ref={closeButton} type="button" onClick={onClose} aria-label="Close comments" className="ml-auto grid h-10 w-10 place-items-center rounded-full hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"><X size={20} /></button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {status === "loading" ? <div className="space-y-3" role="status"><p className="inline-flex items-center gap-2 text-sm text-muted"><LoaderCircle className="animate-spin" size={17} /> Loading comments</p>{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-canvas" />)}</div> : null}
          {status === "error" ? <div className="rounded-2xl bg-rose-50 p-4"><p className="text-sm font-semibold text-rose-700" role="alert">{error}</p><button type="button" onClick={load} className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-bold">Retry</button></div> : null}
          {status === "success" && !comments.length ? <div className="grid min-h-52 place-items-center text-center"><div><MessageCircle className="mx-auto text-muted" /><p className="mt-3 font-black">No comments yet</p><p className="mt-1 text-sm text-muted">Start the conversation</p></div></div> : null}
          {status === "success" ? <div className="space-y-3">{roots.map((comment) => <div key={comment.id}><CommentItem comment={comment} onReply={setReplyingTo} onEdit={edit} onDelete={remove} pendingId={pendingId} />{(replies.get(comment.id) || []).map((reply) => <div key={reply.id} className="ml-7 mt-2 sm:ml-11"><CommentItem comment={reply} onReply={() => setReplyingTo(comment)} onEdit={edit} onDelete={remove} pendingId={pendingId} /></div>)}</div>)}</div> : null}
          {status === "success" && comments.length > roots.length ? comments.filter((comment) => comment.parentId && !comments.some((parent) => parent.id === comment.parentId)).map((comment) => <CommentItem key={comment.id} comment={comment} onReply={setReplyingTo} onEdit={edit} onDelete={remove} pendingId={pendingId} />) : null}
        </div>
        <form onSubmit={submit} className="border-t border-line bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
          {error && status !== "error" ? <p className="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700" role="alert">{error}</p> : null}
          {replyingTo ? <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted"><span>Replying to {replyingTo.user?.name}</span><button type="button" onClick={() => setReplyingTo(null)} className="font-bold text-brand-700">Cancel</button></div> : null}
          <div className="flex items-end gap-2">
            <label htmlFor={`comment-${post.id}`} className="sr-only">Add a comment</label>
            <textarea id={`comment-${post.id}`} value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} rows={2} placeholder={replyingTo ? "Write a reply" : "Add a comment"} className="min-h-11 min-w-0 flex-1 resize-none rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
            <button type="submit" disabled={!draft.trim() || Boolean(pendingId)} className="min-h-11 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white disabled:opacity-60">{pendingId === "create" ? "Posting" : replyingTo ? "Post reply" : "Post comment"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
