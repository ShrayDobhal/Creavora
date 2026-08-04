"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, DollarSign, Award, Loader2, ArrowUpRight, ArrowDownRight, FileSpreadsheet } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/studio/earnings")
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading analytics:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h1 className="text-[25px] font-extrabold tracking-tight">Studio Analytics 📊</h1>
        <p className="text-[14px] text-muted">Detailed performance trends, audience statistics, and metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data?.kpis?.map((kpi, idx) => (
          <Card key={idx} className="p-5 flex flex-col justify-between">
            <div>
              <p className="text-[12.5px] font-semibold text-muted">{kpi.label}</p>
              <h3 className="text-[24px] font-extrabold tracking-tight mt-1.5">{kpi.value}</h3>
            </div>
            {kpi.delta && (
              <div className="flex items-center gap-1 mt-3">
                <span className={`flex items-center gap-0.5 text-[12px] font-bold ${kpi.up ? "text-emerald-600" : "text-rose-600"}`}>
                  {kpi.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {kpi.delta}
                </span>
                <span className="text-[11.5px] text-muted">{kpi.note}</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Graphical placeholders */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold">Revenue Growth</h3>
            <button className="flex items-center gap-1.5 text-[12.5px] font-bold text-brand-600">
              <FileSpreadsheet size={15} /> Export
            </button>
          </div>
          <div className="h-60 rounded-xl bg-canvas flex items-end justify-between p-4 gap-2">
            {[45, 60, 55, 70, 80, 75, 95].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-brand-600 rounded-t-md transition-all hover:bg-brand-500" style={{ height: `${val}%` }} />
                <span className="text-[11px] font-semibold text-muted">M{idx + 1}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold">Audience Growth</h3>
            <button className="flex items-center gap-1.5 text-[12.5px] font-bold text-brand-600">
              <FileSpreadsheet size={15} /> Export
            </button>
          </div>
          <div className="h-60 rounded-xl bg-canvas flex items-end justify-between p-4 gap-2">
            {[30, 45, 40, 60, 50, 70, 85].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-indigo-500 rounded-t-md transition-all hover:bg-indigo-400" style={{ height: `${val}%` }} />
                <span className="text-[11px] font-semibold text-muted">M{idx + 1}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
