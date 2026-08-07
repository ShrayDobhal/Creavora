"use client";

import { useCallback, useEffect, useState } from "react";

export const formatInr = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
}).format(Number(value || 0));

export const formatStudioDate = (value) => new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
}).format(new Date(value));

export function useStudioPerformance() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/studio/earnings", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load studio data");
      setData(body);
      setStatus("success");
    } catch (loadError) {
      setError(loadError.message || "Unable to load studio data");
      setStatus("error");
    }
  }, []);

  useEffect(() => { queueMicrotask(refresh); }, [refresh]);
  return { data, status, error, refresh };
}
