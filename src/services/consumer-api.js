let refreshPromise = null;

function refreshBrowserSession() {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function request(path, { signal, method = "GET", body } = {}, mayRefresh = true) {
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
  if (response.status === 401 && mayRefresh && path !== "/api/auth/refresh") {
    const refreshed = await refreshBrowserSession();
    if (refreshed.ok) return request(path, { signal, method, body }, false);
  }
  if (!response.ok) {
    throw new Error(payload?.error || "Something went wrong. Please try again.");
  }
  return payload;
}

export function getFeed({ mode = "latest", cursor, signal } = {}) {
  const query = new URLSearchParams({ mode, limit: "8" });
  if (cursor) query.set("cursor", cursor);
  return request(`/api/posts?${query}`, { signal });
}

export function getConsumerHome({ signal } = {}) {
  return request("/api/consumer/home", { signal });
}

export function getLiveSessions({ signal } = {}) {
  return request("/api/live", { signal });
}

export function createPost(input, { signal } = {}) {
  return request("/api/posts", { method: "POST", signal, body: input });
}

export function getProfile({ signal } = {}) {
  return request("/api/profile", { signal });
}

export function updateProfile(input, { signal } = {}) {
  return request("/api/profile", { method: "PATCH", signal, body: input });
}

export function signImageUpload(input, { signal } = {}) {
  return request("/api/uploads/sign", { method: "POST", signal, body: input });
}

export async function uploadSignedImage({ uploadUrl, headers }, file, { signal, onProgress } = {}) {
  if (typeof XMLHttpRequest !== "undefined" && onProgress) {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("PUT", uploadUrl);
      Object.entries(headers || {}).forEach(([name, value]) => request.setRequestHeader(name, value));
      request.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
      });
      request.addEventListener("load", () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error("Image upload failed. Please try again.")));
      request.addEventListener("error", () => reject(new Error("Image upload failed. Please try again.")));
      request.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
      signal?.addEventListener("abort", () => request.abort(), { once: true });
      request.send(file);
    });
  }
  const response = await fetch(uploadUrl, { method: "PUT", headers, body: file, signal });
  if (!response.ok) throw new Error("Image upload failed. Please try again.");
}

export function completeImageUpload(assetId, { signal } = {}) {
  return request("/api/uploads/complete", {
    method: "POST",
    signal,
    body: { assetId },
  });
}

export function updatePost(postId, input, { signal } = {}) {
  return request(`/api/posts/${encodeURIComponent(postId)}`, {
    method: "PATCH",
    signal,
    body: input,
  });
}

export function deletePost(postId, { signal } = {}) {
  return request(`/api/posts/${encodeURIComponent(postId)}`, {
    method: "DELETE",
    signal,
  });
}

export function getDiscovery({ signal } = {}) {
  return request("/api/discovery", { signal });
}

export function getCreators({ category = "All", cursor, limit = 12, signal } = {}) {
  const query = new URLSearchParams({ category, limit: String(limit) });
  if (cursor) query.set("cursor", cursor);
  return request(`/api/creators?${query}`, { signal });
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

export function createComment(postId, content, parentIdOrOptions = null, options = {}) {
  const parentId = typeof parentIdOrOptions === "string" ? parentIdOrOptions : null;
  const signal = typeof parentIdOrOptions === "object" && parentIdOrOptions !== null
    ? parentIdOrOptions.signal
    : options.signal;
  return request(`/api/posts/${encodeURIComponent(postId)}/comment`, {
    method: "POST",
    signal,
    body: { content: content.trim(), ...(parentId ? { parentId } : {}) },
  });
}

export function updateComment(postId, commentId, content, { signal } = {}) {
  return request(`/api/posts/${encodeURIComponent(postId)}/comment`, { method: "PATCH", signal, body: { commentId, content: content.trim() } });
}

export function deleteComment(postId, commentId, { signal } = {}) {
  return request(`/api/posts/${encodeURIComponent(postId)}/comment`, { method: "DELETE", signal, body: { commentId } });
}

export function sharePost(postId, { signal } = {}) {
  return request(`/api/posts/${encodeURIComponent(postId)}/share`, { method: "POST", signal });
}

export function getPost(postId, { signal } = {}) {
  return request(`/api/posts/${encodeURIComponent(postId)}`, { signal });
}

export function getConversations({ signal } = {}) {
  return request("/api/messages", { signal });
}

export function getMessageThread(userId, { signal } = {}) {
  return request(`/api/messages?userId=${encodeURIComponent(userId)}`, { signal });
}

export function sendMessage(receiverId, content, { signal } = {}) {
  return request("/api/messages", {
    method: "POST",
    signal,
    body: { receiverId, content: content.trim() },
  });
}

export function getCollections({ signal } = {}) {
  return request("/api/collections", { signal });
}

export function createCollection(input, { signal } = {}) {
  return request("/api/collections", { method: "POST", signal, body: input });
}

export function deleteCollection(id, { signal } = {}) {
  return request(`/api/collections?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    signal,
  });
}

export function getBookmarks({ signal } = {}) {
  return request("/api/bookmarks", { signal });
}

export function getSubscriptions({ signal } = {}) {
  return request("/api/subscriptions", { signal });
}

export function getStudioSubscribers({ signal } = {}) {
  return request("/api/studio/subscribers", { signal });
}

export function getStudioCommunity({ signal } = {}) {
  return request("/api/studio/community", { signal });
}

export function mutateStudioCommunity(input, { signal } = {}) {
  return request("/api/studio/community", { method: "POST", signal, body: input });
}

export function joinFreeSubscription(creatorId, { signal } = {}) {
  return request("/api/subscriptions", {
    method: "POST",
    signal,
    body: { creatorId },
  });
}

export function cancelSubscription(subscriptionId, { signal } = {}) {
  return request("/api/subscriptions/cancel", {
    method: "POST",
    signal,
    body: { subscriptionId },
  });
}

export function getNotifications({ signal } = {}) {
  return request("/api/notifications", { signal });
}

export function markNotificationsRead(idOrOptions = {}, options = {}) {
  const id = typeof idOrOptions === "string" ? idOrOptions : null;
  const signal = typeof idOrOptions === "object" && idOrOptions !== null
    ? idOrOptions.signal
    : options.signal;
  return request("/api/notifications", {
    method: "POST",
    signal,
    ...(id ? { body: { id } } : {}),
  });
}

export function deleteNotifications(id, { signal } = {}) {
  const path = id
    ? `/api/notifications?id=${encodeURIComponent(id)}`
    : "/api/notifications";
  return request(path, { method: "DELETE", signal });
}
