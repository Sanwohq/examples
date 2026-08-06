export type CheckoutMode = "client" | "server-initiated-client" | "redirect";

/** Serializable handoff created on the server and consumed by the client. */
export interface CheckoutSession {
  provider: string;
  reference: string;
  mode: CheckoutMode;
  /** Token/secret to hand to a client SDK (e.g. Stripe client_secret). */
  clientToken?: string;
  /** Hosted checkout page URL, for redirect mode. */
  redirectUrl?: string;
  /** Extra server data the client/template may need. */
  sessionData?: Record<string, unknown>;
  /** Unix ms expiry; clients should refuse stale sessions. */
  expiresAt?: number;
}

export interface ServerInitiateParams {
  amount: number;
  currency: string;
  email: string;
  name?: string;
  phone?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ServerConfig {
  secretKey: string;
  baseUrl?: string;
  [key: string]: unknown;
}

export interface WebhookEvent<D = unknown> {
  id: string;
  type: string;
  createdAt: string;
  data: D;
}

export interface SanwoServerCapability {
  initiate(
    config: ServerConfig,
    params: ServerInitiateParams
  ): Promise<CheckoutSession>;
  verify?(
    config: ServerConfig,
    reference: string
  ): Promise<{ status: "successful" | "failed" | "pending"; data: unknown }>;
  webhook?: {
    verifySignature(
      config: ServerConfig,
      headers: Headers,
      rawBody: string
    ): boolean;
    parse(rawBody: string): WebhookEvent;
    getReference?(event: WebhookEvent): string | undefined;
    isSuccess?(event: WebhookEvent): boolean;
  };
}

/** Minimal subset of a Bachs `collection.succeeded` payload. */
export interface BachsCollectionSucceededData {
  charge_id?: string | null;
  checkout_id?: string | null;
  reference?: string | null;
  status?: string;
  amount?: string;
  currency?: string;
  payment_method?: string;
  customer?: {
    id?: string;
    email?: string;
    name?: string;
  };
}