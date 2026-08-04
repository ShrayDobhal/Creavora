export function safeRedirectPath(value, fallback) {
  if (
    typeof value !== "string"
    || !value.startsWith("/")
    || value.startsWith("//")
    || value.includes("\\")
  ) {
    return fallback;
  }

  return value;
}
