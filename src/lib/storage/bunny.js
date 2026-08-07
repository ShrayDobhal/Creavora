import { createHash } from "node:crypto";

const required = [
  "BUNNY_STORAGE_ZONE",
  "BUNNY_STORAGE_ACCESS_KEY",
  "BUNNY_STORAGE_HOSTNAME",
  "BUNNY_CDN_BASE_URL",
];

const storageHostnamePattern = /^(?:[a-z]{2}\.)?storage\.bunnycdn\.com$/i;

export function getBunnyStorageConfiguration(env = process.env) {
  const missing = required.filter((name) => !env[name]);
  if (missing.length) return { configured: false, reason: "missing_configuration" };
  if (!storageHostnamePattern.test(env.BUNNY_STORAGE_HOSTNAME)) {
    return { configured: false, reason: "invalid_storage_hostname" };
  }
  try {
    const cdn = new URL(env.BUNNY_CDN_BASE_URL);
    if (cdn.protocol !== "https:") return { configured: false, reason: "invalid_cdn_url" };
  } catch {
    return { configured: false, reason: "invalid_cdn_url" };
  }
  return { configured: true };
}

export function buildObjectKey({ ownerId, assetId, extension }) {
  return `users/${ownerId}/${assetId}.${extension}`;
}

export function buildPublicUrl(key, env = process.env) {
  return `${env.BUNNY_CDN_BASE_URL.replace(/\/+$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

function buildStorageUrl(key, env) {
  const zone = encodeURIComponent(env.BUNNY_STORAGE_ZONE);
  const path = key.split("/").map(encodeURIComponent).join("/");
  return `https://${env.BUNNY_STORAGE_HOSTNAME}/${zone}/${path}`;
}

export async function uploadObject({ key, mimeType, body, env = process.env, fetchImpl = fetch }) {
  if (!getBunnyStorageConfiguration(env).configured) {
    throw new Error("Bunny Storage is not configured");
  }
  const bytes = body instanceof Uint8Array ? body : new Uint8Array(body);
  const checksum = createHash("sha256").update(bytes).digest("hex").toUpperCase();
  const response = await fetchImpl(buildStorageUrl(key, env), {
    method: "PUT",
    headers: {
      AccessKey: env.BUNNY_STORAGE_ACCESS_KEY,
      Checksum: checksum,
      "Content-Type": mimeType,
    },
    body: bytes,
  });
  if (response.status !== 201) {
    throw new Error(`Bunny Storage upload failed with status ${response.status}`);
  }
  return { checksum };
}
