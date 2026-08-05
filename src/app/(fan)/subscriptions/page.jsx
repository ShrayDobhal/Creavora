"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Library, RefreshCw } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";
import { ConsumerAvatar } from "@/components/consumer/CreatorCard";
import {
  cancelSubscription,
  getSubscriptions,
  joinFreeSubscription,
} from "@/services/consumer-api";

const formatDate = (value) => {
  if (!value) return "Not provided";
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(parsed);
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [actionError, setActionError] = useState("");
  const [pendingCreatorId, setPendingCreatorId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getSubscriptions({ signal: controller.signal })
      .then((data) => {
        setSubscriptions(Array.isArray(data?.items) ? data.items : []);
        setRecommendations(Array.isArray(data?.recommendations) ? data.recommendations : []);
      })
      .catch((loadError) => {
        if (loadError.name !== "AbortError") setError(loadError.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reloadKey]);

  const retry = () => {
    setLoading(true);
    setError("");
    setFeedback("");
    setActionError("");
    setReloadKey((current) => current + 1);
  };

  const join = async (recommendation) => {
    setPendingCreatorId(recommendation.id);
    setActionError("");
    setFeedback("");
    try {
      const data = await joinFreeSubscription(recommendation.id);
      const subscription = {
        ...data.subscription,
        creator: data.subscription.creator || recommendation,
      };
      setSubscriptions((current) => [
        subscription,
        ...current.filter((item) => item.creator.id !== recommendation.id),
      ]);
      setRecommendations((current) => current.filter((item) => item.id !== recommendation.id));
      setFeedback(`You now have free access to ${recommendation.name}.`);
    } catch (actionFailure) {
      setActionError(actionFailure.message);
    } finally {
      setPendingCreatorId("");
    }
  };

  const cancel = async (subscription) => {
    const creator = subscription.creator;
    setPendingCreatorId(creator.id);
    setActionError("");
    setFeedback("");
    try {
      const data = await cancelSubscription(subscription.id);
      setSubscriptions((current) => current.map((item) => (
        item.id === subscription.id
          ? { ...item, ...data.subscription, creator: data.subscription.creator || item.creator }
          : item
      )));
      setFeedback(`Subscription to ${creator.name} cancelled.`);
    } catch (actionFailure) {
      setActionError(actionFailure.message);
    } finally {
      setPendingCreatorId("");
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] min-w-0 overflow-x-hidden bg-canvas px-3 py-6 sm:px-6">
      <h1 className="flex items-center gap-2 text-[25px] font-extrabold tracking-tight">
        <Library className="text-brand-600" size={24} /> Subscriptions
      </h1>
      <p className="text-sm text-muted">Your current creator access, shown as recorded.</p>

      {error && (
        <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <span>{error}</span>
          <button onClick={retry} className="inline-flex items-center gap-1 font-bold"><RefreshCw size={14} /> Try again</button>
        </div>
      )}
      {feedback && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{feedback}</p>}
      {actionError && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{actionError}</p>}

      {loading ? (
        <p className="mt-6 rounded-2xl border border-line bg-white p-12 text-center text-sm text-muted" role="status">Loading subscriptions…</p>
      ) : error ? null : subscriptions.length === 0 && recommendations.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-line bg-white p-12 text-center">
          <AlertCircle className="mx-auto text-muted" size={34} />
          <h2 className="mt-3 font-extrabold text-ink">No subscriptions found</h2>
          <p className="mt-1 text-sm text-muted">Active and past subscriptions will appear here when available.</p>
        </div>
      ) : (
        <>
          {subscriptions.length > 0 && (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {subscriptions.map((subscription) => (
                <Card key={subscription.id} className="p-5">
                  <div className="flex min-w-0 items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link href={`/creator/${encodeURIComponent(subscription.creator.handle)}`} className="block truncate font-extrabold text-ink hover:underline">
                        {subscription.creator.name}
                      </Link>
                      {subscription.creator.roleTitle && <p className="mt-0.5 text-xs text-muted">{subscription.creator.roleTitle}</p>}
                    </div>
                    <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{subscription.status}</span>
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4 text-sm">
                    <div>
                      <dt className="text-xs text-muted">Tier</dt>
                      <dd className="mt-1 font-bold text-ink">{subscription.tier}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Renewal or end date</dt>
                      <dd className="mt-1 font-bold text-ink">{formatDate(subscription.renewsOn)}</dd>
                    </div>
                  </dl>
                  {subscription.status === "ACTIVE" && (
                    <button
                      type="button"
                      onClick={() => cancel(subscription)}
                      disabled={pendingCreatorId === subscription.creator.id}
                      className="mt-4 rounded-lg border border-line px-3 py-2 text-sm font-bold text-ink disabled:opacity-60"
                      aria-label={`Cancel subscription to ${subscription.creator.name}`}
                    >
                      {pendingCreatorId === subscription.creator.id ? "Cancelling…" : "Cancel subscription"}
                    </button>
                  )}
                </Card>
              ))}
            </div>
          )}

          {recommendations.length > 0 && (
            <section className="mt-8" aria-labelledby="subscription-recommendations">
              <h2 id="subscription-recommendations" className="text-lg font-extrabold text-ink">Recommended Creators for You</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((recommendation) => (
                  <Card key={recommendation.id} className="min-w-0 p-4 sm:p-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <ConsumerAvatar creator={recommendation} size="h-14 w-14" />
                      <div className="min-w-0">
                        <Link href={`/creator/${encodeURIComponent(recommendation.handle)}`} className="block truncate font-extrabold text-ink hover:underline">
                          {recommendation.name}
                        </Link>
                        <p className="mt-0.5 truncate text-xs text-muted">{recommendation.category || recommendation.roleTitle || "Creator"}</p>
                        {typeof recommendation.followerCount === "number" ? (
                          <p className="mt-1 text-xs font-semibold text-muted">{recommendation.followerCount.toLocaleString("en-IN")} followers</p>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => join(recommendation)}
                      disabled={pendingCreatorId === recommendation.id}
                      className="mt-4 rounded-lg bg-brand-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
                      aria-label={`Join ${recommendation.name} for free`}
                    >
                      {pendingCreatorId === recommendation.id ? "Joining…" : "Join for free"}
                    </button>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
