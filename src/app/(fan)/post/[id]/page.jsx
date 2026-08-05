"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AsyncState } from "@/components/consumer/AsyncState";
import { FeedCard } from "@/components/consumer/FeedCard";
import {
  createComment,
  deleteComment,
  getComments,
  getPost,
  sharePost,
  toggleBookmark,
  toggleLike,
  updateComment,
} from "@/services/consumer-api";

export default function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getPost(id, { signal: controller.signal })
      .then((result) => { setPost(result); setStatus("success"); })
      .catch((loadError) => {
        if (loadError.name === "AbortError") return;
        setError(loadError.message);
        setStatus("error");
      });
    return () => controller.abort();
  }, [id, reloadKey]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <Link href="/feed" className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-bold"><ArrowLeft size={17} /> Back to Feed</Link>
      {status !== "success" ? <AsyncState status={status} error={error} onRetry={() => { setStatus("loading"); setReloadKey((value) => value + 1); }} /> : (
        <FeedCard post={post} onLike={toggleLike} onBookmark={toggleBookmark} onLoadComments={getComments} onCreateComment={createComment} onUpdateComment={updateComment} onDeleteComment={deleteComment} onShare={sharePost} onMutated={() => setReloadKey((value) => value + 1)} />
      )}
    </main>
  );
}
