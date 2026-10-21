import type { Agent } from "~/types/telepathy";

/** Matches the server's default AGENT_REGISTRATION_DURATION (30 minutes). */
export const AGENT_ONLINE_WINDOW_MS = 30 * 60 * 1000;

export function isAgentOnline(
  agent: Agent,
  now: number = Date.now(),
  windowMs: number = AGENT_ONLINE_WINDOW_MS,
): boolean {
  const timestamp = Date.parse(agent.lastSyncDate ?? "");
  if (!Number.isFinite(timestamp)) return false;
  return now - timestamp <= windowMs;
}
