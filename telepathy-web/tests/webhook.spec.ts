import { describe, expect, test } from "vitest";
import { generateWebhookToken, webhookUrl } from "~/utils/webhook";

describe("generateWebhookToken", () => {
  test("generates an alphanumeric token of the requested length", () => {
    const token = generateWebhookToken();
    expect(token).toHaveLength(50);
    expect(token).toMatch(/^[A-Za-z0-9]+$/);
  });

  test("generates unique tokens", () => {
    expect(generateWebhookToken(24)).not.toBe(generateWebhookToken(24));
  });

  test("supports a custom length", () => {
    expect(generateWebhookToken(12)).toHaveLength(12);
  });
});

describe("webhookUrl", () => {
  test("builds the webhook endpoint", () => {
    expect(webhookUrl("abc123", "https://telepathy.example.com")).toBe(
      "https://telepathy.example.com/api/tasks/webhooks/abc123",
    );
  });

  test("trims trailing slashes from the origin", () => {
    expect(webhookUrl("abc123", "https://telepathy.example.com/")).toBe(
      "https://telepathy.example.com/api/tasks/webhooks/abc123",
    );
  });
});
