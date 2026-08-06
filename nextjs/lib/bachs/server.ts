import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  BachsCollectionSucceededData,
  CheckoutSession,
  SanwoServerCapability,
  ServerConfig,
  ServerInitiateParams,
  WebhookEvent,
} from "./types";

export const BACHS_BASE_URLS = {
  sandbox: "https://sandbox-api.bachs.io",
  production: "https://api.bachs.io",
} as const;

function resolveBaseUrl(config: ServerConfig): string {
  if (config.baseUrl) return config.baseUrl.replace(/\/$/, "");
  return config.secretKey.startsWith("sk_sandbox")
    ? BACHS_BASE_URLS.sandbox
    : BACHS_BASE_URLS.production;
}

function toDecimalString(amount: number): string {
  return amount.toFixed(2);
}

async function initiate(
  config: ServerConfig,
  params: ServerInitiateParams
): Promise<CheckoutSession> {
  const baseUrl = resolveBaseUrl(config);
  const url = `${baseUrl}/v1/checkout-sessions`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customer: {
        email: params.email,
        ...(params.name ? { name: params.name } : {}),
        ...(params.phone ? { phone_number: params.phone } : {}),
      },
      pricing: {
        currency: params.currency,
        amount: toDecimalString(params.amount),
        price_type: "fixed",
      },
      ...(params.reference ? { reference: params.reference } : {}),
      ...(params.metadata ? { metadata: params.metadata } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Bachs initiate failed (${res.status}): ${body || res.statusText}`
    );
  }

  const data = (await res.json()) as {
    checkout_id: string;
    checkout_url: string;
    status: string;
    expires_at: string;
    created_at: string;
    reference?: string;
  };

  return {
    provider: "bachs",
    reference: data.reference || params.reference || data.checkout_id,
    mode: "redirect",
    redirectUrl: data.checkout_url,
    sessionData: {
      checkout_id: data.checkout_id,
      checkout_url: data.checkout_url,
      status: data.status,
      created_at: data.created_at,
    },
    expiresAt: new Date(data.expires_at).getTime(),
  };
}

async function verify(
  config: ServerConfig,
  reference: string
): Promise<{ status: "successful" | "failed" | "pending"; data: unknown }> {
  const baseUrl = resolveBaseUrl(config);
  const url = `${baseUrl}/v1/payments/${encodeURIComponent(reference)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.secretKey}`,
    },
  });

  if (res.status === 404) {
    return { status: "pending", data: null };
  }
  if (!res.ok) {
    throw new Error(`Bachs verify failed (${res.status})`);
  }

  const data = (await res.json()) as { status?: string };
  const status = data.status?.toUpperCase();
  if (status === "SUCCEEDED" || status === "COMPLETED") {
    return { status: "successful", data };
  }
  if (status === "FAILED" || status === "CANCELLED" || status === "EXPIRED") {
    return { status: "failed", data };
  }
  return { status: "pending", data };
}

function verifySignature(
  config: ServerConfig,
  headers: Headers,
  rawBody: string
): boolean {
  const signature = headers.get("x-bachs-signature");
  const timestamp = headers.get("x-bachs-timestamp");
  if (!signature || !timestamp) return false;

  const toleranceSeconds = (config.webhookToleranceSeconds as number) ?? 300;
  const ts = parseInt(timestamp, 10);
  if (Number.isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > toleranceSeconds) {
    return false;
  }

  const message = `${ts}.${rawBody}`;
  const expected = createHmac("sha256", config.secretKey)
    .update(message, "utf8")
    .digest("hex");

  return timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}

function parse(rawBody: string): WebhookEvent {
  const parsed = JSON.parse(rawBody) as {
    id?: string;
    type?: string;
    created_at?: string;
    data?: unknown;
  };
  return {
    id: parsed.id ?? "",
    type: parsed.type ?? "unknown",
    createdAt: parsed.created_at ?? "",
    data: parsed.data ?? {},
  };
}

function getReference(event: WebhookEvent): string | undefined {
  const data = event.data as BachsCollectionSucceededData;
  return data.reference ?? data.checkout_id ?? undefined;
}

function isSuccess(event: WebhookEvent): boolean {
  const data = event.data as BachsCollectionSucceededData;
  const status = data.status?.toUpperCase();
  return (
    event.type === "collection.succeeded" &&
    (status === "SUCCEEDED" || status === "ACCEPTED" || status === "OVERPAID")
  );
}

export const bachsServer: SanwoServerCapability = {
  initiate,
  verify,
  webhook: {
    verifySignature,
    parse,
    getReference,
    isSuccess,
  },
};
