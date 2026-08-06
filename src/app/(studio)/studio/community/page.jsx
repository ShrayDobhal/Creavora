"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Heart,
  LoaderCircle,
  MessageCircle,
  Radio,
  RefreshCw,
  Send,
  Trophy,
  Users,
} from "lucide-react";
import { AsyncState } from "@/components/consumer/AsyncState";
import { Avatar, Verified } from "@/ui/Media.jsx";
import { Card, Tabs } from "@/ui/Bits.jsx";
import { getStudioCommunity, mutateStudioCommunity } from "@/services/consumer-api";

const tabs = ["Feed", "Discussions", "Announcements", "Rooms", "Events", "Members", "Leaderboard"];

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

const EmptyPanel = ({ title, body }) => (
  <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-12 text-center">
    <p className="font-black">{title}</p>
    <p className="mt-1 text-sm text-muted">{body}</p>
  </div>
);

function CommunityPostCard({ post, pending, onLike, onReply }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [reply, setReply] = useState("");

  return (
    <Card className="overflow-hidden bg-white p-4 sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <Avatar name={post.author.name} src={post.author.avatar} size={42} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5 text-sm font-black">
            {post.author.name}{post.author.verified ? <Verified size={13} /> : null}
            <span className="font-medium text-muted">@{post.author.handle}</span>
          </p>
          <p className="mt-0.5 text-xs text-muted">{formatDate(post.createdAt)}</p>
        </div>
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-black text-brand-700">{post.kind.toLowerCase()}</span>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-ink/85">{post.content}</p>
      <div className="mt-4 flex items-center gap-3 border-t border-line pt-3">
        <button type="button" disabled={pending} onClick={() => onLike(post.id)} aria-pressed={post.viewerLiked} className={`inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-sm font-bold disabled:opacity-50 ${post.viewerLiked ? "text-rose-600" : "text-muted"}`}>
          <Heart size={18} className={post.viewerLiked ? "fill-current" : ""} /> {post.likesCount.toLocaleString("en-IN")}
        </button>
        <button type="button" onClick={() => setCommentsOpen((value) => !value)} aria-expanded={commentsOpen} className="inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-sm font-bold text-muted">
          <MessageCircle size={18} /> {post.repliesCount.toLocaleString("en-IN")}
        </button>
      </div>
      {commentsOpen ? (
        <div className="mt-3 space-y-3 border-t border-line pt-4">
          {post.replies.length ? post.replies.map((comment) => (
            <div key={comment.id} className="flex gap-2.5 rounded-xl bg-canvas p-3">
              <Avatar name={comment.author.name} src={comment.author.avatar} size={32} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black">{comment.author.name} <span className="font-medium text-muted">{formatDate(comment.createdAt)}</span></p>
                <p className="mt-1 text-sm leading-6">{comment.content}</p>
              </div>
            </div>
          )) : <p className="text-sm text-muted">No comments yet</p>}
          <form onSubmit={(event) => { event.preventDefault(); const content = reply.trim(); if (!content) return; onReply(post.id, content).then((result) => { if (result) setReply(""); }); }} className="flex items-end gap-2">
            <label htmlFor={`community-reply-${post.id}`} className="sr-only">Add a comment</label>
            <textarea id={`community-reply-${post.id}`} value={reply} onChange={(event) => setReply(event.target.value)} maxLength={1500} rows={2} placeholder="Add a comment" className="min-w-0 flex-1 resize-none rounded-xl border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-brand-500" />
            <button type="submit" disabled={!reply.trim() || pending} aria-label="Post comment" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white disabled:opacity-50"><Send size={17} /></button>
          </form>
        </div>
      ) : null}
    </Card>
  );
}

export default function StudioCommunity() {
  const [tab, setTab] = useState("Feed");
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [pending, setPending] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [communityForm, setCommunityForm] = useState({ name: "", description: "" });
  const [postContent, setPostContent] = useState("");
  const [roomForm, setRoomForm] = useState({ title: "", description: "", scheduledAt: "" });
  const [eventForm, setEventForm] = useState({ title: "", description: "", startAt: "", location: "", type: "ONLINE" });

  useEffect(() => {
    const controller = new AbortController();
    getStudioCommunity({ signal: controller.signal })
      .then((workspace) => { setData(workspace); setStatus("success"); })
      .catch((loadError) => {
        if (loadError.name === "AbortError") return;
        setError(loadError.message);
        setStatus("error");
      });
    return () => controller.abort();
  }, [reloadKey]);

  const mutate = async (input) => {
    if (pending) return null;
    setPending(true);
    setActionError("");
    try {
      const result = await mutateStudioCommunity(input);
      setReloadKey((value) => value + 1);
      return result;
    } catch (mutationError) {
      setActionError(mutationError.message);
      return null;
    } finally {
      setPending(false);
    }
  };

  const visiblePosts = useMemo(() => {
    const posts = data?.posts || [];
    if (tab === "Discussions") return posts.filter((post) => post.kind === "DISCUSSION");
    if (tab === "Announcements") return posts.filter((post) => post.kind === "ANNOUNCEMENT");
    return posts;
  }, [data?.posts, tab]);

  if (status !== "success" || !data) {
    return <main className="p-6"><AsyncState status={status} error={error} onRetry={() => setReloadKey((value) => value + 1)} /></main>;
  }

  if (!data.community) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-black">Create your creator community</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Start a real community workspace for posts, discussions, rooms, events and members</p>
        <form onSubmit={(event) => { event.preventDefault(); mutate({ action: "create-community", ...communityForm }); }} className="mt-6 space-y-4 rounded-2xl border border-line bg-white p-5">
          <label className="block text-sm font-bold">Community name<input required minLength={3} maxLength={80} value={communityForm.name} onChange={(event) => setCommunityForm((current) => ({ ...current, name: event.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-line px-3 outline-none focus:border-brand-500" /></label>
          <label className="block text-sm font-bold">Description<textarea maxLength={500} rows={4} value={communityForm.description} onChange={(event) => setCommunityForm((current) => ({ ...current, description: event.target.value }))} className="mt-2 w-full rounded-xl border border-line px-3 py-2 outline-none focus:border-brand-500" /></label>
          {actionError ? <p role="alert" className="text-sm font-semibold text-rose-600">{actionError}</p> : null}
          <button type="submit" disabled={pending || communityForm.name.trim().length < 3} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white disabled:opacity-50">{pending ? <LoaderCircle size={16} className="animate-spin" /> : null} Create community</button>
        </form>
      </main>
    );
  }

  const postKind = tab === "Discussions" ? "DISCUSSION" : tab === "Announcements" ? "ANNOUNCEMENT" : "POST";

  return (
    <main className="grid min-w-0 gap-5 px-3 py-5 sm:px-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <header className="flex items-start gap-3.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><Users size={21} /></span>
          <div><h1 className="text-2xl font-black tracking-tight">{data.community.name}</h1><p className="mt-1 text-sm text-muted">{data.community.description || "Your creator community"}</p></div>
        </header>

        <Tabs items={tabs} value={tab} onChange={setTab} className="mt-5 border-b border-line" />
        {actionError ? <div className="mt-4 flex items-center justify-between rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700" role="alert"><span>{actionError}</span><button type="button" onClick={() => setActionError("")}><RefreshCw size={15} /></button></div> : null}

        {["Feed", "Discussions", "Announcements"].includes(tab) ? (
          <>
            <form onSubmit={(event) => { event.preventDefault(); const content = postContent.trim(); if (!content) return; mutate({ action: "create-post", kind: postKind, content }).then((result) => { if (result) setPostContent(""); }); }} className="mt-5 rounded-2xl border border-line bg-white p-4">
              <label htmlFor="community-post" className="text-sm font-black">{tab === "Feed" ? "Share with your community" : tab === "Discussions" ? "Start a discussion" : "Publish an announcement"}</label>
              <textarea id="community-post" value={postContent} onChange={(event) => setPostContent(event.target.value)} maxLength={3000} rows={3} placeholder="Write something useful for your community" className="mt-3 w-full resize-y rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm leading-6 outline-none focus:border-brand-500" />
              <div className="mt-3 flex justify-end"><button type="submit" disabled={!postContent.trim() || pending} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white disabled:opacity-50">{pending ? <LoaderCircle size={15} className="animate-spin" /> : null} Publish</button></div>
            </form>
            <div className="mt-5 space-y-4">{visiblePosts.length ? visiblePosts.map((post) => <CommunityPostCard key={post.id} post={post} pending={pending} onLike={(postId) => mutate({ action: "toggle-like", postId })} onReply={(postId, content) => mutate({ action: "reply", postId, content })} />) : <EmptyPanel title={`No ${tab.toLowerCase()} yet`} body="Your first persisted community entry will appear here" />}</div>
          </>
        ) : null}

        {tab === "Rooms" ? <section className="mt-5 space-y-5"><form onSubmit={(event) => { event.preventDefault(); mutate({ action: "create-room", ...roomForm }).then((result) => { if (result) setRoomForm({ title: "", description: "", scheduledAt: "" }); }); }} className="grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-2"><h2 className="sm:col-span-2 text-lg font-black">Schedule a room</h2><input required value={roomForm.title} onChange={(event) => setRoomForm((current) => ({ ...current, title: event.target.value }))} placeholder="Room title" className="h-11 rounded-xl border border-line px-3" /><input required type="datetime-local" value={roomForm.scheduledAt} onChange={(event) => setRoomForm((current) => ({ ...current, scheduledAt: event.target.value }))} className="h-11 rounded-xl border border-line px-3" /><textarea value={roomForm.description} onChange={(event) => setRoomForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" className="rounded-xl border border-line px-3 py-2 sm:col-span-2" /><button disabled={pending} className="min-h-10 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white sm:col-span-2">Schedule room</button></form><div className="grid gap-4 md:grid-cols-2">{data.rooms.length ? data.rooms.map((room) => <Card key={room.id} className="p-4"><Radio size={18} className="text-brand-600" /><h3 className="mt-3 font-black">{room.title}</h3><p className="mt-1 text-sm text-muted">{room.description || "Creator hangout room"}</p><p className="mt-3 text-xs font-bold text-brand-700">{formatDate(room.scheduledAt)}</p><span className="mt-3 inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-black text-brand-700">{room.status}</span></Card>) : <div className="md:col-span-2"><EmptyPanel title="No rooms scheduled" body="Create the first real community room" /></div>}</div></section> : null}

        {tab === "Events" ? <section className="mt-5 space-y-5"><form onSubmit={(event) => { event.preventDefault(); mutate({ action: "create-event", ...eventForm }).then((result) => { if (result) setEventForm({ title: "", description: "", startAt: "", location: "", type: "ONLINE" }); }); }} className="grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-2"><h2 className="sm:col-span-2 text-lg font-black">Create an event</h2><input required value={eventForm.title} onChange={(event) => setEventForm((current) => ({ ...current, title: event.target.value }))} placeholder="Event title" className="h-11 rounded-xl border border-line px-3" /><input required type="datetime-local" value={eventForm.startAt} onChange={(event) => setEventForm((current) => ({ ...current, startAt: event.target.value }))} className="h-11 rounded-xl border border-line px-3" /><input value={eventForm.location} onChange={(event) => setEventForm((current) => ({ ...current, location: event.target.value }))} placeholder="Location or meeting link" className="h-11 rounded-xl border border-line px-3" /><select value={eventForm.type} onChange={(event) => setEventForm((current) => ({ ...current, type: event.target.value }))} className="h-11 rounded-xl border border-line px-3"><option>ONLINE</option><option>OFFLINE</option><option>HYBRID</option></select><textarea value={eventForm.description} onChange={(event) => setEventForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" className="rounded-xl border border-line px-3 py-2 sm:col-span-2" /><button disabled={pending} className="min-h-10 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white sm:col-span-2">Create event</button></form><div className="grid gap-4 md:grid-cols-2">{data.events.length ? data.events.map((event) => <Card key={event.id} className="p-4"><Calendar size={18} className="text-brand-600" /><h3 className="mt-3 font-black">{event.title}</h3><p className="mt-1 text-sm text-muted">{event.description || event.type}</p><p className="mt-3 text-xs font-bold text-brand-700">{formatDate(event.startAt)}</p><p className="mt-1 text-xs text-muted">{event.location || event.type}</p></Card>) : <div className="md:col-span-2"><EmptyPanel title="No events created" body="Create the first persisted community event" /></div>}</div></section> : null}

        {tab === "Members" ? <section className="mt-5 grid gap-3 sm:grid-cols-2">{data.members.map((member) => <Card key={member.id} className="flex items-center gap-3 p-4"><Avatar name={member.name} src={member.avatar} size={42} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{member.name}</p><p className="truncate text-xs text-muted">@{member.handle}</p></div><span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-black text-brand-700">{member.role}</span></Card>)}</section> : null}

        {tab === "Leaderboard" ? <section className="mt-5 overflow-hidden rounded-2xl border border-line bg-white">{data.leaderboard.map((member, index) => <div key={member.id} className="flex items-center gap-3 border-b border-line p-4 last:border-0"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-black text-brand-700">{index + 1}</span><Avatar name={member.name} src={member.avatar} size={38} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{member.name}</p><p className="text-xs text-muted">{member.posts} posts · {member.replies} comments · {member.likesReceived} likes received</p></div><span className="flex items-center gap-1 text-sm font-black text-brand-700"><Trophy size={15} /> {member.points}</span></div>)}</section> : null}
      </div>

      <aside className="space-y-4 2xl:block">
        <Card className="p-5"><h2 className="font-black">Community overview</h2><div className="mt-4 grid grid-cols-2 gap-3">{[["Members", data.community.counts.members], ["Posts", data.community.counts.posts], ["Rooms", data.community.counts.rooms], ["Events", data.community.counts.events]].map(([label, value]) => <div key={label} className="rounded-xl bg-canvas p-3"><p className="text-xl font-black">{value.toLocaleString("en-IN")}</p><p className="mt-1 text-xs text-muted">{label}</p></div>)}</div></Card>
        <Card className="p-5"><h2 className="font-black">How ranking works</h2><p className="mt-2 text-sm leading-6 text-muted">Members earn 10 points for a post, 5 for a comment and 2 for each like received</p></Card>
      </aside>
    </main>
  );
}
