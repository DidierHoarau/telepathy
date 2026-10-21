const WEBHOOK_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateWebhookToken(length = 50): string {
  let token = "";
  const cryptoApi = globalThis.crypto;

  if (cryptoApi?.getRandomValues) {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(length));
    for (const byte of bytes) {
      token += WEBHOOK_CHARS[byte % WEBHOOK_CHARS.length];
    }
    return token;
  }

  for (let index = 0; index < length; index += 1) {
    token += WEBHOOK_CHARS[Math.floor(Math.random() * WEBHOOK_CHARS.length)];
  }
  return token;
}

export function webhookUrl(token: string, origin: string): string {
  return `${origin.replace(/\/+$/, "")}/api/tasks/webhooks/${token}`;
}
