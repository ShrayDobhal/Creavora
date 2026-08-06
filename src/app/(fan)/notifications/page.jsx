"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Heart,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Card } from "@/ui/Bits.jsx";
import {
  deleteNotifications,
  getNotifications,
  markNotificationsRead,
} from "@/services/consumer-api";

function NotificationIcon({ type }) {
  if (type === "LIKE") return <Heart size={17} className="fill-rose-500 text-rose-500" />;
  if (type === "COMMENT" || type === "MESSAGE") {
    return <MessageSquare size={17} className="text-sky-600" />;
  }
  if (type === "LIVE") return <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />;
  if (type === "SYSTEM" || type === "WALLET") {
    return <Sparkles size={17} className="text-brand-600" />;
  }
  return <Bell size={17} className="text-muted" />;
}

const formatCreatedAt = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const safeActionUrl = (value) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : null;

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getNotifications({ signal: controller.signal })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Notifications could not be loaded");
        const hadUnread = data.some((item) => !item.read);
        setItems(data.map((item) => ({ ...item, read: true })));
        setStatus("success");
        if (hadUnread) {
          markNotificationsRead()
            .then(() => {
              window.dispatchEvent(new Event("notifications-update"));
              window.dispatchEvent(new Event("user-update"));
            })
            .catch((readError) => setActionError(readError.message));
        }
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setLoadError(error.message);
        setStatus("error");
      });
    return () => controller.abort();
  }, [reloadKey]);

  const retryNotifications = () => {
    setStatus("loading");
    setLoadError("");
    setReloadKey((current) => current + 1);
  };

  const handleClearAll = async () => {
    if (pendingAction) return;
    setPendingAction("all");
    setActionError("");
    try {
      await deleteNotifications();
      setItems([]);
      window.dispatchEvent(new Event("notifications-update"));
    } catch (error) {
      setActionError(error.message);
    } finally {
      setPendingAction(null);
    }
  };

  const handleRemove = async (id) => {
    if (pendingAction) return;
    setPendingAction(id);
    setActionError("");
    try {
      await deleteNotifications(id);
      setItems((current) => current.filter((item) => item.id !== id));
      window.dispatchEvent(new Event("notifications-update"));
    } catch (error) {
      setActionError(error.message);
    } finally {
      setPendingAction(null);
    }
  };

  const handleOpen = async (item) => {
    if (item.read) return;
    try {
      await markNotificationsRead(item.id);
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry));
      window.dispatchEvent(new Event("notifications-update"));
      window.dispatchEvent(new Event("user-update"));
    } catch {
      // Navigation remains available even if the read receipt cannot be stored.
    }
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-72px)] max-w-[760px] bg-canvas px-4 py-6 sm:px-6">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-[25px] font-extrabold tracking-tight">
            <Bell className="text-brand-600" size={24} /> Notifications
          </h1>
          <p className="text-[14px] text-muted">Persisted creator and account activity</p>
        </div>

        {status === "success" && items.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleClearAll}
              disabled={Boolean(pendingAction)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 text-[12.5px] font-bold text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={14} /> {pendingAction === "all" ? "Clearing…" : "Clear all"}
            </button>
          </div>
        ) : null}
      </header>

      {actionError ? (
        <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {actionError}
        </p>
      ) : null}

      {status === "loading" ? (
        <div className="rounded-2xl border border-line bg-white py-16 text-center" role="status">
          <p className="text-[14.5px] font-bold text-ink">Retrieving notifications…</p>
        </div>
      ) : status === "error" ? (
        <div className="rounded-2xl border border-rose-200 bg-white px-6 py-14 text-center">
          <ShieldAlert className="mx-auto mb-3 text-rose-600" size={34} />
          <p role="alert" className="text-sm font-semibold text-rose-700">{loadError}</p>
          <button
            type="button"
            onClick={retryNotifications}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-bold text-ink"
          >
            <RefreshCw size={15} /> Try again
          </button>
        </div>
      ) : items.length > 0 ? (
        <Card className="divide-y divide-line overflow-hidden bg-white">
          {items.map((item) => (
            <article
              key={item.id}
              className={`flex items-start justify-between gap-3 p-4 ${item.read ? "hover:bg-canvas/50" : "bg-brand-50/40"}`}
            >
              {safeActionUrl(item.actionUrl) ? (
                <Link
                  href={safeActionUrl(item.actionUrl)}
                  onClick={() => handleOpen(item)}
                  className="flex min-w-0 flex-1 items-start gap-3.5 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
                  aria-label={`${item.title} ${item.message}`}
                >
                  <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-brand-50">
                    <NotificationIcon type={item.type} />
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block text-[13.5px] leading-relaxed text-ink">
                      <span className="mr-1 font-extrabold">{item.title}</span>
                      {item.message}
                    </span>
                    <span className="mt-1 block text-[11.5px] font-medium text-muted">
                      {formatCreatedAt(item.createdAt)}
                    </span>
                  </span>
                </Link>
              ) : (
              <div className="flex min-w-0 flex-1 items-start gap-3.5">
                <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-brand-50">
                  <NotificationIcon type={item.type} />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="text-[13.5px] leading-relaxed text-ink">
                    <span className="mr-1 font-extrabold">{item.title}</span>
                    {item.message}
                  </p>
                  <p className="mt-1 text-[11.5px] font-medium text-muted">
                    {formatCreatedAt(item.createdAt)}
                  </p>
                </div>
              </div>
              )}
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                disabled={Boolean(pendingAction)}
                aria-label={`Remove ${item.title}`}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-canvas hover:text-ink/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            </article>
          ))}
        </Card>
      ) : (
        <div className="mt-4 rounded-2xl border border-line bg-white py-16 text-center">
          <Bell className="mx-auto mb-3 text-muted/60" size={36} />
          <p className="text-[15.5px] font-extrabold text-ink">Inbox is clean!</p>
          <p className="mt-1 text-[13px] text-muted">New persisted notifications will appear here</p>
        </div>
      )}
    </main>
  );
}
