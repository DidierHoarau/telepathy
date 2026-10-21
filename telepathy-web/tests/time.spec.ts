import { describe, expect, test } from "vitest";
import { formatDateTime, formatRelativeTime, toTimestamp } from "~/utils/time";

const now = Date.parse("2026-10-21T12:00:00Z");

describe("formatRelativeTime", () => {
  test("formats recent timestamps", () => {
    expect(formatRelativeTime("2026-10-21T11:59:30Z", now)).toBe("just now");
    expect(formatRelativeTime("2026-10-21T11:55:00Z", now)).toBe("5m ago");
    expect(formatRelativeTime("2026-10-21T09:00:00Z", now)).toBe("3h ago");
    expect(formatRelativeTime("2026-10-18T12:00:00Z", now)).toBe("3d ago");
    expect(formatRelativeTime("2026-08-21T12:00:00Z", now)).toBe("2mo ago");
    expect(formatRelativeTime("2024-10-21T12:00:00Z", now)).toBe("2y ago");
  });

  test("returns an empty string for missing or invalid values", () => {
    expect(formatRelativeTime(null, now)).toBe("");
    expect(formatRelativeTime("not-a-date", now)).toBe("");
  });

  test("clamps future timestamps to just now", () => {
    expect(formatRelativeTime("2026-10-21T13:00:00Z", now)).toBe("just now");
  });
});

describe("toTimestamp", () => {
  test("parses ISO strings and dates", () => {
    expect(toTimestamp("2026-10-21T12:00:00Z")).toBe(now);
    expect(toTimestamp(new Date(now))).toBe(now);
  });
});

describe("formatDateTime", () => {
  test("returns an empty string for invalid input", () => {
    expect(formatDateTime(undefined)).toBe("");
  });

  test("returns a localized date for valid input", () => {
    expect(formatDateTime("2026-10-21T12:00:00Z")).not.toBe("");
  });
});
