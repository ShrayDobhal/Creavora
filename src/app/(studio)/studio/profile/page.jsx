"use client";

import { useEffect, useState } from "react";
import CreatorProfilePage from "@/app/(fan)/creator/[handle]/page";
import { AsyncState } from "@/components/consumer/AsyncState";
import { getProfile } from "@/services/consumer-api";

export default function StudioProfilePage() {
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getProfile({ signal: controller.signal })
      .then((result) => { setProfile(result); setStatus("success"); })
      .catch((loadError) => {
        if (loadError.name === "AbortError") return;
        setError(loadError.message);
        setStatus("error");
      });
    return () => controller.abort();
  }, [reloadKey]);

  if (status !== "success" || !profile) {
    return <main className="p-6"><AsyncState status={status} error={error} onRetry={() => { setStatus("loading"); setReloadKey((value) => value + 1); }} /></main>;
  }

  return <CreatorProfilePage handleOverride={profile.handle} backHref="/studio" isOwnProfile />;
}
