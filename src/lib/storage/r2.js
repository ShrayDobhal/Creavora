import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const required = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_BASE_URL"];

export function getR2Configuration(env = process.env) {
  const missing = required.filter((name) => !env[name]);
  return missing.length ? { configured: false, reason: "missing_configuration" } : { configured: true };
}

export function buildObjectKey({ ownerId, assetId, extension }) {
  return `users/${ownerId}/${assetId}.${extension}`;
}

export function buildPublicUrl(key, env = process.env) {
  return `${env.R2_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${key}`;
}

const createR2Client = (env) => new S3Client({
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: "auto",
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export async function createUploadIntent({ ownerId, assetId, extension, mimeType, env = process.env, client, presign = getSignedUrl }) {
  if (!getR2Configuration(env).configured) {
    throw new Error("R2 upload signing is not configured");
  }

  const key = buildObjectKey({ ownerId, assetId, extension });
  const uploadUrl = await presign(
    client ?? createR2Client(env),
    new PutObjectCommand({ Bucket: env.R2_BUCKET, Key: key, ContentType: mimeType }),
    { expiresIn: 300 },
  );

  return {
    assetId,
    key,
    uploadUrl,
    publicUrl: buildPublicUrl(key, env),
    headers: { "content-type": mimeType },
  };
}

export async function getObjectMetadata({ key, env = process.env, client }) {
  if (!getR2Configuration(env).configured) {
    throw new Error("R2 upload verification is not configured");
  }

  return (client ?? createR2Client(env)).send(
    new HeadObjectCommand({ Bucket: env.R2_BUCKET, Key: key }),
  );
}
