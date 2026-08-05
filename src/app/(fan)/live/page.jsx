"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, Radio, Users } from "lucide-react";
import { AsyncState } from "@/components/consumer/AsyncState";
import { ConsumerAvatar } from "@/components/consumer/CreatorCard";
import EditorialImage from "@/components/consumer/EditorialImage";
import { getLiveSessions } from "@/services/consumer-api";

const formatSessionTime = (value) => {
  if (!value) return "Time to be announced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time to be announced";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

function SessionCard({ session }) {
  const isLive = session.status === "LIVE";

  return (
    <article
      id={`session-${session.id}`}
      className="min-w-0 overflow-hidden rounded-2xl border border-line bg-white shadow-sm"
    >
      {session.thumbnailUrl ? (
        <EditorialImage
          src={session.thumbnailUrl}
          alt={`${session.title} preview`}
          fallbackLabel="Session preview unavailable"
          className="aspect-video w-full object-cover"
        />
      ) : (
        <div className="grid aspect-video place-items-center bg-[#17121f] text-white">
          <Radio size={28} aria-hidden="true" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ${
              isLive
                ? "bg-rose-100 text-rose-700"
                : "bg-brand-50 text-brand-700"
            }`}
          >
            {isLive ? "Live" : "Scheduled"}
          </span>
          {isLive ? (
            <span className="flex items-center gap-1 text-xs font-bold text-muted">
              <Users size={13} /> {session.viewerCount.toLocaleString("en-IN")}
            </span>
          ) : null}
        </div>
        <h2 className="mt-3 text-lg font-black">{session.title}</h2>
        {session.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
            {session.description}
          </p>
        ) : null}
        {!isLive ? (
          <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted">
            <CalendarClock size={14} /> {formatSessionTime(session.scheduledAt)}
          </p>
        ) : null}
        <Link
          href={`/creator/${session.host.handle}`}
          className="mt-4 flex items-center gap-3 rounded-xl bg-canvas p-3 hover:bg-brand-50"
        >
          <ConsumerAvatar creator={session.host} size="h-10 w-10" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-black">{session.host.name}</span>
            <span className="block truncate text-xs text-muted">
              {session.host.roleTitle || `@${session.host.handle}`}
            </span>
          </span>
        </Link>
      </div>
    </article>
  );
}

export default function LivePage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getLiveSessions({ signal: controller.signal })
      .then((result) => {
        setItems(result.items);
        setStatus(result.items.length ? "success" : "empty");
      })
      .catch((loadError) => {
        if (loadError.name === "AbortError") return;
        setError(loadError.message);
        setStatus("error");
      });
    return () => controller.abort();
  }, [reloadKey]);

  function retry() {
    setStatus("loading");
    setError("");
    setReloadKey((value) => value + 1);
  }

  const live = items.filter((session) => session.status === "LIVE");
  const scheduled = items.filter((session) => session.status === "SCHEDULED");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <header>
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-rose-600">
          <Radio size={15} /> Live
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Live sessions</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          See current and scheduled creator sessions. Interactive streaming is not available in this release.
        </p>
      </header>

      {status !== "success" ? (
        <div className="mt-6">
          <AsyncState
            status={status}
            error={error}
            onRetry={retry}
            emptyTitle="No live sessions available"
            emptyMessage="Current and scheduled sessions will appear here."
          />
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          <section aria-labelledby="live-now-title">
            <h2 id="live-now-title" className="text-2xl font-black">Live right now</h2>
            {live.length ? (
              <div className="mt-4 grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {live.map((session) => <SessionCard key={session.id} session={session} />)}
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-line bg-white p-5 text-sm text-muted">
                No one is live right now.
              </p>
            )}
          </section>
          <section aria-labelledby="scheduled-title">
            <h2 id="scheduled-title" className="text-2xl font-black">Upcoming sessions</h2>
            {scheduled.length ? (
              <div className="mt-4 grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {scheduled.map((session) => <SessionCard key={session.id} session={session} />)}
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-line bg-white p-5 text-sm text-muted">
                No sessions are scheduled yet.
              </p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
