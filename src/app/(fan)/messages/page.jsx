"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, MessageCircle, RefreshCw, Search, Send } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";
import {
  getConversations,
  getMessageThread,
  sendMessage,
} from "@/services/consumer-api";

function ParticipantAvatar({ participant, size = "h-11 w-11" }) {
  if (participant.avatar) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={participant.avatar} alt="" className={`${size} rounded-full object-cover`} />;
  }
  return (
    <span className={`${size} grid shrink-0 place-items-center rounded-full bg-brand-50 font-extrabold text-brand-700`}>
      {participant.name?.slice(0, 1).toUpperCase() || "?"}
    </span>
  );
}

const formatTime = (value) =>
  value
    ? new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value))
    : "";

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [thread, setThread] = useState(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const threadRequestRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    getConversations({ signal: controller.signal })
      .then((data) => {
        const items = Array.isArray(data?.items) ? data.items : [];
        setConversations(items);
        setActiveId((current) => current || items[0]?.participant.id || null);
        setThreadLoading(items.length > 0);
      })
      .catch((loadError) => {
        if (loadError.name !== "AbortError") setError(loadError.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reloadKey]);

  useEffect(() => {
    if (!activeId) return undefined;
    const controller = new AbortController();
    const requestId = threadRequestRef.current + 1;
    threadRequestRef.current = requestId;
    getMessageThread(activeId, { signal: controller.signal })
      .then((result) => {
        if (threadRequestRef.current === requestId) setThread(result);
      })
      .catch((loadError) => {
        if (loadError.name !== "AbortError" && threadRequestRef.current === requestId) {
          setError(loadError.message);
        }
      })
      .finally(() => {
        if (threadRequestRef.current === requestId) setThreadLoading(false);
      });
    return () => {
      controller.abort();
      if (threadRequestRef.current === requestId) threadRequestRef.current += 1;
    };
  }, [activeId]);

  const retryConversations = () => {
    setLoading(true);
    setError("");
    setReloadKey((current) => current + 1);
  };

  const selectConversation = (participantId) => {
    setMobileThreadOpen(true);
    if (participantId === activeId) return;
    threadRequestRef.current += 1;
    setThread(null);
    setThreadLoading(true);
    setError("");
    setActiveId(participantId);
  };

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return conversations;
    return conversations.filter(({ participant }) =>
      `${participant.name} ${participant.handle || ""}`.toLowerCase().includes(normalized),
    );
  }, [conversations, query]);

  const handleSend = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !thread?.participant || sending) return;
    setSending(true);
    setSendError("");
    try {
      const created = await sendMessage(thread.participant.id, content);
      setThread((current) => ({ ...current, items: [...current.items, created] }));
      setConversations((current) => current.map((conversation) =>
        conversation.participant.id === thread.participant.id
          ? { ...conversation, lastMessage: created }
          : conversation,
      ));
      setDraft("");
    } catch (sendFailure) {
      setSendError(sendFailure.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <main
      aria-label="Messages workspace"
      className="flex min-h-[calc(100vh-72px)] flex-col gap-4 overflow-x-hidden bg-canvas/30 p-4 md:flex-row"
    >
      <Card className={`${mobileThreadOpen ? "hidden md:flex" : "flex"} w-full shrink-0 flex-col overflow-hidden md:w-[344px] md:max-w-[344px]`}>
        <div className="p-5 pb-3">
          <h1 className="text-[23px] font-extrabold tracking-tight">Messages</h1>
          <label className="relative mt-4 flex items-center">
            <Search size={16} className="absolute left-3.5 text-muted" />
            <span className="sr-only">Search conversations</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search conversations"
              className="h-11 w-full rounded-xl border border-line pl-10 pr-3 text-sm outline-none focus:border-brand-300"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
          {loading ? (
            <p className="p-5 text-sm text-muted" role="status">Loading conversations…</p>
          ) : error && conversations.length === 0 ? (
            <div className="p-5 text-sm">
              <p role="alert" className="text-rose-600">{error}</p>
              <button onClick={retryConversations} className="mt-3 inline-flex items-center gap-2 font-bold text-brand-700">
                <RefreshCw size={14} /> Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-5 text-center text-sm text-muted">
              <MessageCircle className="mx-auto mb-2" />
              {query ? "No conversations match your search." : "No conversations yet."}
            </div>
          ) : filtered.map((conversation) => (
            <button
              key={conversation.participant.id}
              onClick={() => selectConversation(conversation.participant.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ${activeId === conversation.participant.id ? "bg-brand-50" : "hover:bg-canvas"}`}
            >
              <ParticipantAvatar participant={conversation.participant} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink">{conversation.participant.name}</span>
                <span className="block text-xs text-muted">{formatTime(conversation.lastMessage.createdAt)}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card className={`${mobileThreadOpen ? "flex" : "hidden md:flex"} min-w-0 w-full flex-1 flex-col overflow-hidden`}>
        {!activeId ? (
          <div className="grid flex-1 place-items-center p-8 text-center text-sm text-muted">
            Select a conversation to read your messages.
          </div>
        ) : threadLoading && !thread ? (
          <div className="grid flex-1 place-items-center text-sm text-muted" role="status">Loading messages…</div>
        ) : thread ? (
          <>
            <header className="flex items-center gap-3 border-b border-line px-5 py-4">
              <button
                type="button"
                onClick={() => setMobileThreadOpen(false)}
                aria-label="Back to conversations"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-ink md:hidden"
              >
                <ArrowLeft size={17} />
              </button>
              <ParticipantAvatar participant={thread.participant} />
              <div>
                <h2 className="font-extrabold text-ink">{thread.participant.name}</h2>
                {thread.participant.roleTitle && <p className="text-xs text-muted">{thread.participant.roleTitle}</p>}
              </div>
            </header>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5" aria-live="polite">
              {thread.items.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">No messages in this conversation yet.</p>
              ) : thread.items.map((message) => (
                <div key={message.id} className={`flex ${message.mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${message.mine ? "bg-brand-600 text-white" : "bg-canvas text-ink"}`}>
                    <p className="text-sm leading-relaxed">{message.content || "Unsupported message"}</p>
                    <p className={`mt-1 text-right text-[11px] ${message.mine ? "text-white/70" : "text-muted"}`}>{formatTime(message.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="border-t border-line p-4">
              {sendError && <p role="alert" className="mb-2 text-sm text-rose-600">{sendError}</p>}
              <div className="flex gap-2">
                <label className="flex-1">
                  <span className="sr-only">Message {thread.participant.name}</span>
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    disabled={sending}
                    placeholder={`Message ${thread.participant.name}`}
                    className="h-11 w-full rounded-xl border border-line px-4 text-sm outline-none focus:border-brand-300"
                  />
                </label>
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  aria-label="Send message"
                  className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={17} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-8 text-sm text-rose-600" role="alert">{error || "Unable to load this conversation."}</div>
        )}
      </Card>
    </main>
  );
}
