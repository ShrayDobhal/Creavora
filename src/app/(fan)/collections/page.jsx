"use client";

import { useEffect, useState } from "react";
import { Folder, FolderPlus, RefreshCw, Trash2 } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";
import {
  createCollection,
  deleteCollection,
  getCollections,
} from "@/services/consumer-api";

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [modalError, setModalError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getCollections({ signal: controller.signal })
      .then((data) => setCollections(Array.isArray(data) ? data : []))
      .catch((loadError) => {
        if (loadError.name !== "AbortError") setLoadError(loadError.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reloadKey]);

  const retry = () => {
    setLoading(true);
    setLoadError("");
    setReloadKey((current) => current + 1);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    setModalError("");
    try {
      const created = await createCollection({
        name: name.trim(),
        description: description.trim() || null,
      });
      setCollections((current) => [created, ...current]);
      setName("");
      setDescription("");
      setShowForm(false);
    } catch (saveError) {
      setModalError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (collection) => {
    setDeletingId(collection.id);
    setActionError("");
    try {
      await deleteCollection(collection.id);
      setCollections((current) => current.filter((item) => item.id !== collection.id));
      setDeleteId(null);
    } catch (deleteError) {
      setActionError(deleteError.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-canvas px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-[25px] font-extrabold tracking-tight">
            <Folder className="text-brand-600" size={24} /> Collections
          </h1>
          <p className="text-sm text-muted">Organize your saved posts into personal collections.</p>
        </div>
        <button
          onClick={() => {
            setModalError("");
            setShowForm(true);
          }}
          className="flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 font-bold text-white"
        >
          <FolderPlus size={16} /> Create collection
        </button>
      </div>

      {(loadError || actionError) && (
        <div className="mt-5 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">
          <span>{loadError || actionError}</span>
          {loadError && <button onClick={retry} className="inline-flex items-center gap-1 font-bold"><RefreshCw size={14} /> Try again</button>}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <Card className="w-full max-w-[440px] p-6" role="dialog" aria-modal="true" aria-labelledby="collection-dialog-title">
            <h2 id="collection-dialog-title" className="text-lg font-extrabold">New collection</h2>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              {modalError && (
                <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {modalError}
                </p>
              )}
              <label className="block text-sm font-bold text-ink">
                Collection name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  disabled={saving}
                  className="mt-1.5 h-11 w-full rounded-xl border border-line px-3 font-normal outline-none focus:border-brand-400"
                />
              </label>
              <label className="block text-sm font-bold text-ink">
                Description <span className="font-normal text-muted">(optional)</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={saving}
                  className="mt-1.5 h-24 w-full resize-none rounded-xl border border-line p-3 font-normal outline-none focus:border-brand-400"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button type="button" disabled={saving} onClick={() => {
                  setModalError("");
                  setShowForm(false);
                }} className="h-10 rounded-xl border border-line px-4 font-bold">Cancel</button>
                <button type="submit" disabled={saving || !name.trim()} className="h-10 rounded-xl bg-brand-600 px-4 font-bold text-white disabled:opacity-50">
                  {saving ? "Saving…" : "Save collection"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {loading ? (
        <p className="mt-8 rounded-2xl border border-line bg-white p-10 text-center text-sm text-muted" role="status">Loading collections…</p>
      ) : loadError ? null : collections.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-white p-12 text-center">
          <Folder className="mx-auto text-muted" size={34} />
          <h2 className="mt-3 font-extrabold text-ink">No collections yet</h2>
          <p className="mt-1 text-sm text-muted">Create one when you want to organize saved posts.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collections.map((collection) => (
            <Card key={collection.id} className="p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><Folder size={20} /></span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-extrabold text-ink">{collection.name}</h2>
                  <p className="mt-1 text-xs text-muted">{collection.postsCount} {collection.postsCount === 1 ? "item" : "items"}</p>
                </div>
              </div>
              {collection.description && <p className="mt-4 text-sm leading-relaxed text-muted">{collection.description}</p>}
              <div className="mt-5 border-t border-line pt-4">
                {deleteId === collection.id ? (
                  <div role="group" aria-label={`Delete ${collection.name}?`}>
                    <p className="text-sm font-bold text-rose-700">Delete {collection.name}?</p>
                    <div className="mt-2 flex gap-2">
                      <button disabled={deletingId === collection.id} onClick={() => handleDelete(collection)} aria-label={`Confirm delete ${collection.name}`} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
                        {deletingId === collection.id ? "Deleting…" : "Delete"}
                      </button>
                      <button disabled={deletingId === collection.id} onClick={() => setDeleteId(null)} className="rounded-lg border border-line px-3 py-2 text-xs font-bold">Keep</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setDeleteId(collection.id)} aria-label={`Delete ${collection.name}`} className="inline-flex items-center gap-2 text-xs font-bold text-rose-600">
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
