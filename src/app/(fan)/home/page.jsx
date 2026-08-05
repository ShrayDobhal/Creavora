"use client";

import { useEffect, useState } from "react";
import { AsyncState } from "@/components/consumer/AsyncState";
import HomeDashboard from "@/components/consumer/HomeDashboard";
import {
  getConsumerHome,
  toggleBookmark,
  toggleFollow,
  toggleLike,
} from "@/services/consumer-api";

export default function HomePage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getConsumerHome({ signal: controller.signal })
      .then((home) => {
        setData(home);
        setStatus("success");
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

  if (status !== "success" || !data) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <AsyncState
          status={status}
          error={error}
          onRetry={retry}
        />
      </main>
    );
  }

  return (
    <HomeDashboard
      data={data}
      onFollow={toggleFollow}
      onLike={toggleLike}
      onBookmark={toggleBookmark}
    />
  );
}
