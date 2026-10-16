/**
 * Allow only same-origin relative paths for post-login redirects.
 * Blocks open redirects such as //evil.com or https://evil.com.
 */
export function safeCallbackUrl(
  value: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!value) return fallback;

  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return fallback;
  // Protocol-relative and backslash tricks
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return fallback;
  if (trimmed.includes("://")) return fallback;
  // Basic control-character guard
  if (/[\x00-\x1f\x7f]/.test(trimmed)) return fallback;

  return trimmed;
}
