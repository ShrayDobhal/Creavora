const PREFIX = /^\[blindly-demo:[^\]]+\]\s*/i;
const SUFFIX = /\s*\(Blindly Demo\)\s*$/i;
const HANDLE_PREFIX = /^blindly-demo-/i;
const LEGACY_HANDLE_PREFIX = "blindly-demo-";
const DEMO_ROLE_TITLE = /^(.+?)\s+Demo Creator$/i;

export function sanitizePublicCopy(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(PREFIX, "")
    .replace(SUFFIX, "")
    .replace(HANDLE_PREFIX, "")
    .replace(DEMO_ROLE_TITLE, "$1 Creator")
    .trim();
}

export function getPublicHandleCandidates(value) {
  const cleanHandle = sanitizePublicCopy(value);
  if (typeof cleanHandle !== "string" || !cleanHandle) return [];
  return [cleanHandle, `${LEGACY_HANDLE_PREFIX}${cleanHandle}`];
}
