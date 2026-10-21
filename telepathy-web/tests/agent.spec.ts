import { describe, expect, test } from "vitest";
import { AGENT_ONLINE_WINDOW_MS, isAgentOnline } from "~/utils/agent";

const now = Date.parse("2026-10-21T12:00:00Z");

describe("isAgentOnline", () => {
  test("is online when the last sync is inside the window", () => {
    expect(isAgentOnline({ id: "agent", lastSyncDate: "2026-10-21T11:45:00Z" }, now)).toBe(true);
  });

  test("is offline when the last sync is outside the window", () => {
    expect(isAgentOnline({ id: "agent", lastSyncDate: "2026-10-21T11:00:00Z" }, now)).toBe(false);
  });

  test("is offline without a valid sync date", () => {
    expect(isAgentOnline({ id: "agent" }, now)).toBe(false);
    expect(isAgentOnline({ id: "agent", lastSyncDate: "invalid" }, now)).toBe(false);
  });

  test("accepts a custom window", () => {
    expect(isAgentOnline({ id: "agent", lastSyncDate: "2026-10-21T11:00:00Z" }, now, 2 * 60 * 60 * 1000)).toBe(
      true,
    );
    expect(AGENT_ONLINE_WINDOW_MS).toBe(30 * 60 * 1000);
  });
});
