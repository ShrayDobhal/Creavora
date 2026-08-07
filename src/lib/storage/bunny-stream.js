import { createHash } from "node:crypto";

const required = ["BUNNY_STREAM_LIBRARY_ID", "BUNNY_STREAM_API_KEY"];
const API_BASE = "https://video.bunnycdn.com";
const TUS_ENDPOINT = "https://video.bunnycdn.com/tusupload";

export function getBunnyStreamConfiguration(env = process.env) {
  const missing = required.filter((name) => !env[name]);
  if (missing.length) return { configured: false, reason: "missing_configuration" };
  if (!/^\d+$/.test(env.BUNNY_STREAM_LIBRARY_ID)) {
    return { configured: false, reason: "invalid_library_id" };
  }
  return { configured: true };
}

export function buildVideoEmbedUrl(videoId, env = process.env) {
  return `https://iframe.mediadelivery.net/embed/${encodeURIComponent(env.BUNNY_STREAM_LIBRARY_ID)}/${encodeURIComponent(videoId)}`;
}

export async function createVideoUploadIntent({ title, env = process.env, fetchImpl = fetch, now = Date.now }) {
  if (!getBunnyStreamConfiguration(env).configured) {
    throw new Error("Bunny Stream is not configured");
  }
  const response = await fetchImpl(`${API_BASE}/library/${encodeURIComponent(env.BUNNY_STREAM_LIBRARY_ID)}/videos`, {
    method: "POST",
    headers: { AccessKey: env.BUNNY_STREAM_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ title: title.slice(0, 200) }),
  });
  if (!response.ok) throw new Error(`Bunny Stream video creation failed with status ${response.status}`);
  const video = await response.json();
  if (!video?.guid) throw new Error("Bunny Stream did not return a video ID");

  const expiration = Math.floor(now() / 1000) + 3600;
  const signature = createHash("sha256")
    .update(`${env.BUNNY_STREAM_LIBRARY_ID}${env.BUNNY_STREAM_API_KEY}${expiration}${video.guid}`)
    .digest("hex");

  return {
    videoId: video.guid,
    uploadUrl: TUS_ENDPOINT,
    uploadProtocol: "tus",
    publicUrl: buildVideoEmbedUrl(video.guid, env),
    headers: {
      AuthorizationSignature: signature,
      AuthorizationExpire: String(expiration),
      LibraryId: String(env.BUNNY_STREAM_LIBRARY_ID),
      VideoId: video.guid,
    },
  };
}

export async function getVideo({ videoId, env = process.env, fetchImpl = fetch }) {
  if (!getBunnyStreamConfiguration(env).configured) throw new Error("Bunny Stream is not configured");
  const response = await fetchImpl(`${API_BASE}/library/${encodeURIComponent(env.BUNNY_STREAM_LIBRARY_ID)}/videos/${encodeURIComponent(videoId)}`, {
    headers: { AccessKey: env.BUNNY_STREAM_API_KEY },
  });
  if (!response.ok) throw new Error(`Bunny Stream verification failed with status ${response.status}`);
  return response.json();
}

export async function deleteVideo({ videoId, env = process.env, fetchImpl = fetch }) {
  if (!getBunnyStreamConfiguration(env).configured) return;
  await fetchImpl(`${API_BASE}/library/${encodeURIComponent(env.BUNNY_STREAM_LIBRARY_ID)}/videos/${encodeURIComponent(videoId)}`, {
    method: "DELETE",
    headers: { AccessKey: env.BUNNY_STREAM_API_KEY },
  });
}
