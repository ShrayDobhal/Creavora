"use client";

import { useEffect, useState } from "react";
import { Shield, Users, AlertTriangle, ShieldCheck, RefreshCw, Ban, UserCheck, Loader2 } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";
import { Avatar } from "@/ui/Media.jsx";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalCreators: 0, openReports: 0 });
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  const fetchAdminData = () => {
    setLoading(true);
    // Fetch users and reports through unified query stubs
    Promise.all([
      fetch("/api/creators").then(res => res.json()),
      fetch("/api/notifications").then(res => res.json())
    ])
      .then(([creatorsData, notificationsData]) => {
        setUsers(creatorsData || []);
        // Simulate mock report items based on loaded dataset
        setReports([
          { id: "r1", reporter: "Arjun Singh", target: "Spam content post", reason: "SPAM", status: "PENDING" },
          { id: "r2", reporter: "Pooja Singh", target: "Inappropriate comments", reason: "HARASSMENT", status: "PENDING" }
        ]);
        setStats({
          totalUsers: (creatorsData?.length || 0) + 2,
          totalCreators: creatorsData?.length || 0,
          openReports: 2
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Admin load error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    queueMicrotask(fetchAdminData);
  }, []);

  const handleUserBan = (userId, handle) => {
    setActioning(userId);
    // Simulate user ban/unban moderation call
    setTimeout(() => {
      alert(`User @${handle} status updated (simulation)`);
      setActioning(null);
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-white">
        <Loader2 className="animate-spin text-brand-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col">
      {/* Top Header */}
      <header className="h-[72px] border-b border-white/5 bg-[#09090b] flex items-center justify-between px-8">
        <div className="flex items-center gap-2.5">
          <Shield size={24} className="text-brand-500 fill-brand-500/10" />
          <span className="text-[20px] font-extrabold tracking-tight">Creavora Admin Security Control</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-8 space-y-8 max-w-[1200px] mx-auto w-full">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight">System Moderation &amp; Control</h1>
          <p className="text-[14px] text-neutral-400">Review flagged content reports, audit users, and manage platform permissions.</p>
        </div>

        {/* Stats Strip */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5 bg-white/5 border-white/5 text-white flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Users size={22} />
            </span>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-neutral-400">Total Users</p>
              <h3 className="text-[24px] font-extrabold mt-0.5">{stats.totalUsers}</h3>
            </div>
          </Card>

          <Card className="p-5 bg-white/5 border-white/5 text-white flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck size={22} />
            </span>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-neutral-400">Total Creators</p>
              <h3 className="text-[24px] font-extrabold mt-0.5">{stats.totalCreators}</h3>
            </div>
          </Card>

          <Card className="p-5 bg-white/5 border-white/5 text-white flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle size={22} />
            </span>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-neutral-400">Open Moderation Reports</p>
              <h3 className="text-[24px] font-extrabold mt-0.5">{stats.openReports}</h3>
            </div>
          </Card>
        </div>

        {/* Content Moderation Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Active Reports */}
          <div className="space-y-4">
            <h3 className="text-[17px] font-bold flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-400" /> Pending Reports
            </h3>
            {reports.map((rep) => (
              <Card key={rep.id} className="p-4 bg-white/5 border-white/5 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                      {rep.reason}
                    </span>
                    <span className="text-[13px] font-bold text-neutral-300">By {rep.reporter}</span>
                  </div>
                  <p className="text-[12px] text-neutral-400 mt-1">Target: {rep.target}</p>
                </div>
                <div className="flex gap-2">
                  <button className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[11.5px] font-bold transition text-white">
                    Dismiss
                  </button>
                  <button className="h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-[11.5px] font-bold transition text-white">
                    Take Action
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* User management & ban list */}
          <div className="space-y-4">
            <h3 className="text-[17px] font-bold flex items-center gap-2">
              <Users size={18} className="text-brand-400" /> User Accounts
            </h3>
            {users.map((usr) => (
              <Card key={usr.id} className="p-4 bg-white/5 border-white/5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={usr.name} size={36} />
                  <div>
                    <h4 className="text-[13.5px] font-bold">{usr.name}</h4>
                    <p className="text-[11.5px] text-neutral-400 mt-0.5">@{usr.handle} • {usr.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUserBan(usr.id, usr.handle)}
                  disabled={actioning === usr.id}
                  className="h-8 px-3 rounded-lg border border-white/10 hover:bg-white/5 text-[12px] font-bold text-rose-400 transition"
                >
                  {actioning === usr.id ? <RefreshCw size={12} className="animate-spin" /> : "Ban User"}
                </button>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
