"use client";

import { useState } from "react";
import { Tv, Calendar, Plus, Clock, Video, Users, CheckCircle2, ChevronRight } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";

const mockSessions = [
  { id: "1", title: "Live Q&A Session", when: "Today, 7:00 PM", status: "SCHEDULED" },
  { id: "2", title: "Gaming Stream Setup", when: "Tomorrow, 8:30 PM", status: "SCHEDULED" }
];

export default function StudioLivePage() {
  const [sessions, setSessions] = useState(mockSessions);
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title || !scheduledAt) return;

    const newSession = {
      id: String(sessions.length + 1),
      title,
      when: new Date(scheduledAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit"
      }),
      status: "SCHEDULED"
    };

    setSessions([newSession, ...sessions]);
    setTitle("");
    setScheduledAt("");
    setCreating(false);
  };

  return (
    <div className="px-6 py-6 space-y-6 max-w-[800px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[25px] font-extrabold tracking-tight">Live &amp; Events 📺</h1>
          <p className="text-[14px] text-muted">Schedule interactive live sessions, webinars, and creator stream chats.</p>
        </div>
        <button
          onClick={() => setCreating(!creating)}
          className="flex h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-[13px] font-bold text-white hover:bg-brand-700 transition"
        >
          <Plus size={16} /> Schedule Live
        </button>
      </div>

      {creating && (
        <Card className="p-5">
          <h3 className="text-[15px] font-bold mb-4">Create Live Event</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-semibold text-ink mb-1.5">Session Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. VIP Q&A and Chit-chat"
                className="h-11 w-full border border-line rounded-xl px-4 text-[13.5px] outline-none focus:border-brand-400"
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-ink mb-1.5">Scheduled Date &amp; Time</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="h-11 w-full border border-line rounded-xl px-4 text-[13.5px] outline-none focus:border-brand-400"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="h-10 rounded-xl px-4 text-[13px] font-bold border border-line hover:bg-canvas"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 rounded-xl px-4 text-[13px] font-bold bg-brand-600 hover:bg-brand-700 text-white"
              >
                Schedule Session
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Sessions list */}
      <div className="space-y-3">
        <h3 className="text-[15px] font-bold">Scheduled Broadcasts</h3>
        {sessions.map((session) => (
          <Card key={session.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Video size={19} />
              </span>
              <div>
                <h4 className="text-[14px] font-bold">{session.title}</h4>
                <p className="text-[12px] text-muted flex items-center gap-1 mt-0.5">
                  <Clock size={12} /> {session.when}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">
                <CheckCircle2 size={12} /> {session.status}
              </span>
              <button className="h-9 px-4 rounded-xl border border-line text-[12.5px] font-bold hover:bg-canvas">
                Start Live
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
