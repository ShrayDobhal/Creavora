"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

export function SearchPanel({ query: externalQuery = "", onQueryChange, onSubmit, busy = false }) {
  const [query, setQuery] = useState(externalQuery);
  const debounceTimer = useRef(null);

  useEffect(() => {
    const normalized = query.trim();
    if (!normalized || normalized === externalQuery.trim()) return undefined;

    const timer = window.setTimeout(() => {
      debounceTimer.current = null;
      onQueryChange(normalized);
    }, 300);
    debounceTimer.current = timer;
    return () => {
      window.clearTimeout(timer);
      if (debounceTimer.current === timer) debounceTimer.current = null;
    };
  }, [externalQuery, onQueryChange, query]);

  function handleSubmit(event) {
    event.preventDefault();
    const normalized = query.trim();
    if (!normalized) return;
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    onSubmit(normalized);
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="flex min-w-0 w-full max-w-full items-center gap-2 rounded-2xl border border-line bg-white p-2 shadow-sm focus-within:border-brand-300">
      <Search className="ml-2 shrink-0 text-muted" size={19} />
      <label htmlFor="explore-search" className="sr-only">Search Blindly creators, posts, and communities</label>
      <input
        id="explore-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search Blindly creators, posts, and communities"
        className="h-10 min-w-0 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted"
      />
      <button
        type="submit"
        disabled={busy}
        className="min-h-11 shrink-0 rounded-xl bg-brand-600 px-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60 sm:px-5"
      >
        {busy ? "Searching" : "Search"}
      </button>
    </form>
  );
}
