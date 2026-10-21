export function toTimestamp(value?: string | Date | null): number | null {
  if (!value) return null;
  const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function formatRelativeTime(
  value?: string | Date | null,
  now: number = Date.now(),
): string {
  const timestamp = toTimestamp(value);
  if (timestamp === null) return "";
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));

  if (seconds < 45) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function formatDateTime(value?: string | Date | null): string {
  const timestamp = toTimestamp(value);
  return timestamp === null ? "" : new Date(timestamp).toLocaleString();
}
