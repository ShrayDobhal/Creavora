import { AlertCircle, Inbox, LoaderCircle, RefreshCw } from "lucide-react";

export function AsyncState({
  status,
  error,
  onRetry,
  emptyTitle = "Nothing here yet",
  emptyMessage = "New work will appear here as creators publish it.",
}) {
  if (status === "loading") {
    return (
      <div className="grid min-h-56 place-items-center text-center" role="status">
        <div>
          <LoaderCircle className="mx-auto animate-spin text-brand-600" size={28} />
          <p className="mt-3 text-sm font-semibold">Loading</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="grid min-h-56 place-items-center rounded-2xl border border-rose-200 bg-rose-50/60 p-6 text-center" role="alert">
        <div>
          <AlertCircle className="mx-auto text-rose-600" size={28} />
          <p className="mt-3 font-bold">We couldn&apos;t load this page</p>
          <p className="mt-1 max-w-md text-sm text-muted">{error}</p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-white"
            >
              <RefreshCw size={15} /> Try again
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-line bg-white p-6 text-center">
        <div>
          <Inbox className="mx-auto text-brand-500" size={28} />
          <p className="mt-3 font-bold">{emptyTitle}</p>
          <p className="mt-1 max-w-md text-sm text-muted">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return null;
}
