async function request(path, { signal, method = "GET", body } = {}) {
  const response = await fetch(path, {
    method,
    signal,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || "Something went wrong. Please try again.");
  }
  return payload;
}

export function getFeed({ mode = "latest", cursor, signal } = {}) {
  const query = new URLSearchParams({ mode, limit: "12" });
  if (cursor) query.set("cursor", cursor);
  return request(`/api/posts?${query}`, { signal });
}

export function getDiscovery({ signal } = {}) {
  return request("/api/discovery", { signal });
}

export function search({ query, type = "all", signal }) {
  const params = new URLSearchParams({ q: query.trim(), type });
  return request(`/api/search?${params}`, { signal });
}

export function saveSearchHistory({ query, type, signal }) {
  const normalized = query.trim();
  return request("/api/search/history", {
    method: "POST",
    signal,
    body: { query: normalized, ...(type ? { type } : {}) },
  });
}

export function getCreator({ handle, signal }) {
  return request(`/api/creators/${encodeURIComponent(handle)}`, { signal });
}

export function toggleLike(postId, { signal } = {}) {
  return request(`/api/posts/${encodeURIComponent(postId)}/like`, {
    method: "POST",
    signal,
  });
}

export function toggleBookmark(postId, { signal } = {}) {
  return request(`/api/posts/${encodeURIComponent(postId)}/bookmark`, {
    method: "POST",
    signal,
  });
}

export function toggleFollow(handle, { signal } = {}) {
  return request(`/api/creators/${encodeURIComponent(handle)}/follow`, {
    method: "POST",
    signal,
  });
}

export function getComments(postId, { signal } = {}) {
  return request(`/api/posts/${encodeURIComponent(postId)}/comment`, { signal });
}

export function createComment(postId, content, { signal } = {}) {
  return request(`/api/posts/${encodeURIComponent(postId)}/comment`, {
    method: "POST",
    signal,
    body: { content: content.trim() },
  });
}
