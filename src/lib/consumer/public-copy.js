const PREFIX = /^\[blindly-demo:[^\]]+\]\s*/i;
const SUFFIX = /\s*\(Blindly Demo\)\s*$/i;
const HANDLE_PREFIX = /^blindly-demo-/i;

export function sanitizePublicCopy(value) {
  if (typeof value !== "string") return value;
  return value.replace(PREFIX, "").replace(SUFFIX, "").replace(HANDLE_PREFIX, "").trim();
}
