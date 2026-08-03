import { useState } from "react";
import { Gift, Sparkles, Trophy, Award, CheckCircle2, ChevronRight, User } from "lucide-react";
import { Card, SectionHead } from "../ui/Bits.jsx";
import { Avatar } from "../ui/Media.jsx";

const initialTasks = [
  { id: 1, label: "Daily Login", xp: "+50 XP", progress: null, completed: true },
  { id: 2, label: "Watch 3 Live Streams", xp: "+100 XP", progress: "2 / 3", completed: false },
  { id: 3, label: "Refer a Friend", xp: "+200 XP", progress: "0 / 1", completed: false },
  { id: 4, label: "Like 5 posts in Feed", xp: "+75 XP", progress: "5 / 5", completed: true, claimed: false },
  { id: 5, label: "Send a Tip to Creator", xp: "+150 XP", progress: "0 / 1", completed: false },
];

const leaderboard = [
  { rank: 1, name: "Neha Verma", points: 320, level: "Gold Fan" },
  { rank: 2, name: "Riya Malhotra", points: 280, level: "Silver Fan" },
  { rank: 3, name: "Kavya Singh", points: 210, level: "Silver Fan" },
  { rank: 4, name: "Sneha Iyer", points: 150, level: "Bronze Fan" },
  { rank: 5, name: "Mehak Arora", points: 120, level: "Bronze Fan" },
];

const badges = [
  { name: "First Cheer", desc: "Sent your first coin tip", date: "12 May 2026", color: "from-amber-400 to-orange-500" },
  { name: "Super Fan", desc: "Subscribed to Ananya Sharma for 3 months", date: "24 May 2026", color: "from-purple-500 to-indigo-500" },
  { name: "Live Watcher", desc: "Spent 5 hours watching live broadcasts", date: "28 May 2026", color: "from-rose-400 to-pink-500" },
  { name: "Alpha Supporter", desc: "Placed in Top 10 Leaderboard", date: "Unearned", color: "from-neutral-400 to-neutral-600 bg-neutral-100", locked: true },
];

export default function Rewards() {
  const [tasks, setTasks] = useState(initialTasks);
  const [xp, setXp] = useState(650);

  const handleClaim = (id, xpReward) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, claimed: true } : t))
    );
    const addedXp = parseInt(xpReward.replace(/\D/g, ""), 10);
    setXp((prev) => {
      const newXp = prev + addedXp;
      if (newXp >= 1000) {
        alert("Congratulations! You leveled up to Level 4!");
        return newXp - 1000;
      }
      return newXp;
    });
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 px-6 py-6 min-h-[calc(100vh-72px)] bg-canvas">
      {/* tasks/quests section */}
      <div className="flex-1 min-w-0">
        <div>
          <h1 className="text-[25px] font-extrabold tracking-tight flex items-center gap-2">
            <Gift className="text-brand-600" size={24} /> Fan Rewards
          </h1>
          <p className="text-[14px] text-muted">Complete daily quests, earn XP points, and rank up your level</p>
        </div>

        {/* user level card */}
        <Card className="mt-5 p-6 bg-gradient-to-br from-brand-600 via-[#8b5cf6] to-[#e05fd6] text-white">
          <div className="flex items-center gap-4">
            <Avatar name="Arjun Singh" size={48} ring="ring-white/40" />
            <div className="flex-1">
              <div className="flex items-center justify-between text-[14px]">
                <span className="font-extrabold uppercase tracking-wider text-white/90">Level 3 – Super Fan</span>
                <span className="font-black text-white">
                  {xp} / 1,000 XP
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white" style={{ width: `${(xp / 1000) * 100}%` }} />
              </div>
            </div>
          </div>
        </Card>

        {/* daily tasks list */}
        <section className="mt-8">
          <SectionHead title="Daily Quests" />
          <Card className="mt-4 divide-y divide-line overflow-hidden">
            {tasks.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`grid h-7 w-7 place-items-center rounded-full ${
                    t.completed ? "bg-emerald-50 text-emerald-600" : "bg-neutral-50 text-muted"
                  }`}>
                    <CheckCircle2 size={16} />
                  </span>
                  <div className="leading-tight">
                    <p className="text-[13.5px] font-bold text-ink">{t.label}</p>
                    {t.progress && (
                      <p className="text-[11.5px] text-muted font-semibold mt-0.5">Progress: {t.progress}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[13px] font-extrabold text-brand-600">{t.xp}</span>
                  {t.completed && !t.claimed && t.id === 4 ? (
                    <button
                      onClick={() => handleClaim(t.id, t.xp)}
                      className="h-8 rounded-lg bg-brand-600 px-3.5 text-[12px] font-bold text-white hover:bg-brand-700 shadow"
                    >
                      Claim
                    </button>
                  ) : t.completed || t.claimed ? (
                    <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Completed
                    </span>
                  ) : (
                    <span className="text-[12px] font-bold text-muted bg-canvas px-2 py-0.5 rounded">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </section>

        {/* badges section */}
        <section className="mt-8">
          <SectionHead title="Your Achievements & Badges" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {badges.map((b) => (
              <Card key={b.name} className={`p-4 flex items-start gap-3.5 ${b.locked ? "opacity-60 bg-canvas/30" : ""}`}>
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white font-bold ${b.color}`}>
                  <Award size={24} />
                </div>
                <div className="leading-tight">
                  <h3 className="text-[14.5px] font-extrabold text-ink">{b.name}</h3>
                  <p className="mt-1 text-[12px] text-muted leading-snug">{b.desc}</p>
                  <p className="mt-2 text-[10.5px] text-brand-600/80 font-bold uppercase">{b.date}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* leaderboard sidebar */}
      <aside className="w-full xl:w-[320px] shrink-0">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="text-amber-500" size={20} />
            <h2 className="text-[16px] font-extrabold">Top Contributors</h2>
          </div>

          <div className="space-y-4">
            {leaderboard.map((u) => (
              <div key={u.rank} className="flex items-center gap-3">
                <span className={`w-5 text-center text-[13.5px] font-black ${
                  u.rank === 1 ? "text-amber-500 text-[15px]" : u.rank === 2 ? "text-neutral-400" : "text-muted"
                }`}>
                  {u.rank}
                </span>
                <Avatar name={u.name} size={30} />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="text-[13px] font-bold text-ink truncate">{u.name}</p>
                  <p className="text-[10.5px] text-muted font-medium">{u.level}</p>
                </div>
                <span className="text-[13px] font-extrabold text-brand-600">{u.points} pts</span>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 h-9 rounded-xl border border-line text-[12.5px] font-bold text-ink hover:bg-canvas">
            View Full Leaderboard
          </button>
        </Card>
      </aside>
    </div>
  );
}
