"use client";

import { MapPin, Pencil, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AsyncState } from "@/components/consumer/AsyncState";
import { FeedCard } from "@/components/consumer/FeedCard";
import { ProfileEditor } from "@/components/consumer/ProfileEditor";
import {
  createComment,
  getComments,
  getFeed,
  getProfile,
  toggleBookmark,
  toggleLike,
} from "@/services/consumer-api";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const loadProfile = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const [nextProfile, page] = await Promise.all([getProfile(), getFeed({ mode: "latest" })]);
      setProfile(nextProfile);
      setPosts(page.items.filter((post) => post.viewer?.canManage));
      setStatus("success");
    } catch (loadError) {
      setError(loadError?.message || "Unable to load profile");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(loadProfile);
  }, [loadProfile]);

  useEffect(() => {
    const handleUserUpdate = (event) => setProfile(event.detail);
    window.addEventListener("user-update", handleUserUpdate);
    return () => window.removeEventListener("user-update", handleUserUpdate);
  }, []);

  if (status !== "success" || !profile) {
    return <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6"><AsyncState status={status} error={error} onRetry={loadProfile} emptyTitle="Profile unavailable" emptyMessage="Try again in a moment" /></main>;
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
      <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className="h-32 bg-gradient-to-r from-brand-200 via-brand-100 to-cyan-100 sm:h-44">
          {profile.coverImage ? <><img src={profile.coverImage} alt="Profile cover" className="h-full w-full object-cover" />{/* eslint-disable-line @next/next/no-img-element -- uploaded profile media uses a verified external host */}</> : null}
        </div>
        <div className="px-4 pb-5 sm:px-6">
          <div className="relative z-10 -mt-10 w-fit">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-white bg-brand-100 text-2xl font-black text-brand-700">
                {profile.avatar ? <><img src={profile.avatar} alt={`${profile.name} avatar`} className="h-full w-full object-cover" />{/* eslint-disable-line @next/next/no-img-element -- uploaded profile media uses a verified external host */}</> : profile.name.slice(0, 1).toUpperCase()}
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0"><h1 className="truncate text-2xl font-black">{profile.name}</h1><p className="truncate text-sm text-muted">@{profile.handle}</p></div>
            <button type="button" onClick={() => setEditing((current) => !current)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-line px-4 text-sm font-bold hover:bg-canvas"><Pencil size={16} /> {editing ? "Close editor" : "Edit profile"}</button>
          </div>
          {profile.roleTitle ? <p className="mt-4 text-sm font-bold text-ink/85">{profile.roleTitle}</p> : null}
          {profile.bio ? <p className="mt-2 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-muted">{profile.bio}</p> : null}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {profile.location ? <span className="inline-flex items-center gap-1.5"><MapPin size={16} />{profile.location}</span> : null}
            {profile.website ? <a href={profile.website} target="_blank" rel="noreferrer" className="font-bold text-brand-700 hover:underline">Website</a> : null}
            <span className="inline-flex items-center gap-1.5"><Users size={16} />{profile.counts.followers} followers</span>
            <span>{profile.counts.following} following</span>
            <span>{profile.counts.posts} posts</span>
          </div>
        </div>
      </section>
      {editing ? <section className="mt-5 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6"><ProfileEditor profile={profile} onSaved={(saved) => { setProfile(saved); setEditing(false); }} /></section> : null}
      <section className="mt-6" aria-labelledby="your-posts-title">
        <div className="mb-4 flex items-baseline justify-between gap-3"><h2 id="your-posts-title" className="text-xl font-black">Your posts</h2><span className="text-sm text-muted">{profile.counts.posts} published</span></div>
        {posts.length ? <div className="space-y-5">{posts.map((post) => <FeedCard key={post.id} post={post} onLike={toggleLike} onBookmark={toggleBookmark} onLoadComments={getComments} onCreateComment={createComment} onMutated={loadProfile} />)}</div> : <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-muted">Your published posts will appear here</div>}
      </section>
    </main>
  );
}
