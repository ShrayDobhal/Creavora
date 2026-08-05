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

export async function uploadSignedImage({ uploadUrl, headers }, file, { signal } = {}) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers,
    body: file,
    signal,
  });
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
