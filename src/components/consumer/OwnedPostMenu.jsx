"use client";

import { MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { deletePost, updatePost } from "@/services/consumer-api";

export function OwnedPostMenu({ post, onMutated }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.content || "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (!post.viewer?.canManage) return null;

  async function saveEdit(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || pending) return;
    setPending(true);
    setError("");
    try {
      const updated = await updatePost(post.id, { content });
      setEditing(false);
      onMutated?.({ type: "update", post: { ...post, ...updated, content: updated.content || content } });
    } catch (updateError) {
      setError(updateError?.message || "Unable to update post");
    } finally {
      setPending(false);
    }
  }

  async function confirmDelete() {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      await deletePost(post.id);
      setConfirmingDelete(false);
      setOpen(false);
      onMutated?.({ type: "delete", id: post.id });
    } catch (deleteError) {
      setError(deleteError?.message || "Unable to delete post");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative">
      <button type="button" aria-label="Post options" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">
        <MoreHorizontal size={19} />
      </button>
      {open ? (
        <div role="menu" aria-label="Post actions" className="absolute right-0 z-10 mt-1 w-40 rounded-xl border border-line bg-white p-1 shadow-lg">
          <button type="button" role="menuitem" onClick={() => { setEditing(true); setOpen(false); setError(""); }} className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-bold hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500">
            <Pencil size={16} /> Edit post
          </button>
          <button type="button" role="menuitem" onClick={() => { setConfirmingDelete(true); setOpen(false); setError(""); }} className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-bold text-rose-700 hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-500">
            <Trash2 size={16} /> Delete post
          </button>
        </div>
      ) : null}
      {editing ? (
        <form onSubmit={saveEdit} className="mt-3 rounded-xl border border-line bg-canvas p-3">
          <label htmlFor={`edit-post-${post.id}`} className="sr-only">Edit post content</label>
          <textarea id={`edit-post-${post.id}`} value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={5000} rows={4} className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand-500" />
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => { setDraft(post.content || ""); setEditing(false); }} className="min-h-10 rounded-lg px-3 text-sm font-bold hover:bg-white">Cancel</button>
            <button type="submit" disabled={pending || !draft.trim()} className="min-h-10 rounded-lg bg-brand-600 px-3 text-sm font-bold text-white disabled:opacity-60">{pending ? "Saving" : "Save post"}</button>
          </div>
        </form>
      ) : null}
      {confirmingDelete ? (
        <div role="dialog" aria-modal="true" aria-label="Delete post" className="fixed inset-0 z-20 grid place-items-center bg-black/40 p-4">
          <section className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="text-lg font-extrabold">Delete post</h2><p className="mt-1 text-sm text-muted">This post will no longer appear in your feed</p></div>
              <button type="button" aria-label="Cancel delete" onClick={() => setConfirmingDelete(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-canvas"><X size={16} /></button>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmingDelete(false)} disabled={pending} className="min-h-10 rounded-xl border border-line px-3 text-sm font-bold">Cancel</button>
              <button type="button" onClick={confirmDelete} disabled={pending} className="min-h-10 rounded-xl bg-rose-600 px-3 text-sm font-bold text-white disabled:opacity-60">{pending ? "Deleting" : "Confirm delete"}</button>
            </div>
          </section>
        </div>
      ) : null}
      {error ? <p role="alert" className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p> : null}
    </div>
  );
}
