"use client";

import { useState, useMemo } from "react";
import { createSanwo } from "@sanwohq/web";
import { paystackProvider } from "@sanwohq/paystack";
import { flutterwaveProvider } from "@sanwohq/flutterwave";
import { paypalProvider } from "@sanwohq/paypal";
import { razorpayProvider } from "@sanwohq/razorpay";
import { monnifyProvider } from "@sanwohq/monnify";
import { yocoProvider } from "@sanwohq/yoco";
import { interswitchProvider } from "@sanwohq/interswitch";
import type { CheckoutResult } from "@sanwohq/types";

interface Scenario {
  id: string;
  label: string;
  group: string;
  description: string;
  provider: typeof paystackProvider;
  publicKey: string;
  currency: string;
  sanwoProviderOptions: Record<string, unknown>;
}

const SCENARIOS: Scenario[] = [
  // ── Paystack ──────────────────────────────────────────────
  {
    id: "paystack-checkout",
    label: "Paystack — Checkout",
    group: "Paystack",
    description: "Standard Paystack checkout popup",
    provider: paystackProvider,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
    currency: "NGN",
    sanwoProviderOptions: { method: "checkout" },
  },
  {
    id: "paystack-new-transaction",
    label: "Paystack — New Transaction",
    group: "Paystack",
    description: "Paystack new transaction flow",
    provider: paystackProvider,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
    currency: "NGN",
    sanwoProviderOptions: { method: "newTransaction" },
  },
  {
    id: "paystack-card",
    label: "Paystack — Card Only",
    group: "Paystack",
    description: "Paystack checkout restricted to card payments",
    provider: paystackProvider,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
    currency: "NGN",
    sanwoProviderOptions: { method: "checkout", channels: ["card"] },
  },
  {
    id: "paystack-bank-transfer",
    label: "Paystack — Bank Transfer",
    group: "Paystack",
    description: "Paystack checkout restricted to bank transfers",
    provider: paystackProvider,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
    currency: "NGN",
    sanwoProviderOptions: { method: "checkout", channels: ["bank_transfer"] },
  },

  // ── Flutterwave ───────────────────────────────────────────
  {
    id: "flutterwave-standard",
    label: "Flutterwave — Standard",
    group: "Flutterwave",
    description: "Standard Flutterwave checkout with all payment methods",
    provider: flutterwaveProvider,
    publicKey: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ?? "",
    currency: "NGN",
    sanwoProviderOptions: {},
  },
  {
    id: "flutterwave-card",
    label: "Flutterwave — Card Only",
    group: "Flutterwave",
    description: "Flutterwave checkout restricted to card payments",
    provider: flutterwaveProvider,
    publicKey: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ?? "",
    currency: "NGN",
    sanwoProviderOptions: { paymentOptions: "card" },
  },

  // ── PayPal ────────────────────────────────────────────────
  {
    id: "paypal-standard",
    label: "PayPal — Standard",
    group: "PayPal",
    description: "Standard PayPal checkout",
    provider: paypalProvider,
    publicKey: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "",
    currency: "USD",
    sanwoProviderOptions: {},
  },

  // ── Razorpay ──────────────────────────────────────────────
  {
    id: "razorpay-standard",
    label: "Razorpay — Standard",
    group: "Razorpay",
    description: "Standard Razorpay checkout",
    provider: razorpayProvider,
    publicKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
    currency: "INR",
    sanwoProviderOptions: {},
  },

  // ── Monnify ───────────────────────────────────────────────
  {
    id: "monnify-standard",
    label: "Monnify — Standard",
    group: "Monnify",
    description: "Standard Monnify checkout with all payment methods",
    provider: monnifyProvider,
    publicKey: process.env.NEXT_PUBLIC_MONNIFY_API_KEY ?? "",
    currency: "NGN",
    sanwoProviderOptions: {
      contractCode: process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE ?? "",
      isTestMode: true,
    },
  },
  {
    id: "monnify-card",
    label: "Monnify — Card Only",
    group: "Monnify",
    description: "Monnify checkout restricted to card payments",
    provider: monnifyProvider,
    publicKey: process.env.NEXT_PUBLIC_MONNIFY_API_KEY ?? "",
    currency: "NGN",
    sanwoProviderOptions: {
      contractCode: process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE ?? "",
      isTestMode: true,
      paymentMethods: ["CARD"],
    },
  },
  {
    id: "monnify-bank-transfer",
    label: "Monnify — Bank Transfer Only",
    group: "Monnify",
    description: "Monnify checkout restricted to bank transfers",
    provider: monnifyProvider,
    publicKey: process.env.NEXT_PUBLIC_MONNIFY_API_KEY ?? "",
    currency: "NGN",
    sanwoProviderOptions: {
      contractCode: process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE ?? "",
      isTestMode: true,
      paymentMethods: ["ACCOUNT_TRANSFER"],
    },
  },

  // ── Yoco ──────────────────────────────────────────────────
  {
    id: "yoco-standard",
    label: "Yoco — Standard",
    group: "Yoco",
    description: "Standard Yoco checkout",
    provider: yocoProvider,
    publicKey: process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY ?? "",
    currency: "ZAR",
    sanwoProviderOptions: {},
  },

  // ── Interswitch ───────────────────────────────────────────
  {
    id: "interswitch-standard",
    label: "Interswitch — Standard",
    group: "Interswitch",
    description: "Standard Interswitch checkout",
    provider: interswitchProvider,
    publicKey: process.env.NEXT_PUBLIC_INTERSWITCH_MERCHANT_CODE ?? "",
    currency: "NGN",
    sanwoProviderOptions: {
      payItemId: process.env.NEXT_PUBLIC_INTERSWITCH_PAY_ITEM_ID ?? "",
    },
  },
];

/** Derive ordered, unique group names for building <optgroup> elements. */
function getGroups(scenarios: Scenario[]): string[] {
  const seen = new Set<string>();
  const groups: string[] = [];
  for (const s of scenarios) {
    if (!seen.has(s.group)) {
      seen.add(s.group);
      groups.push(s.group);
    }
  }
  return groups;
}

const GROUPS = getGroups(SCENARIOS);

export default function Checkout() {
  const [selectedId, setSelectedId] = useState(SCENARIOS[0].id);
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckoutResult | null>(null);

  const selected = SCENARIOS.find((s) => s.id === selectedId) ?? SCENARIOS[0];

  const sanwo = useMemo(
    () =>
      createSanwo({
        provider: selected.provider,
        publicKey: selected.publicKey,
      }),
    [selectedId],
  );

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const checkoutResult = await sanwo({
        amount: Math.round(parseFloat(amount) * 100),
        currency: selected.currency,
        customer: { email },
        description: "Sanwo example payment",
        ...(Object.keys(selected.sanwoProviderOptions).length > 0 && {
          sanwoProviderOptions: selected.sanwoProviderOptions,
        }),
      });

      setResult(checkoutResult);
    } catch (err) {
      console.error("Payment error:", err);
      setResult({
        status: "failed",
        provider: selected.group.toLowerCase(),
        error: {
          code: "CHECKOUT_FAILED",
          message: err instanceof Error ? err.message : "Payment failed",
          recoverable: false,
        },
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <label style={{ display: "block", marginBottom: 4 }}>
        <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
          Payment Scenario
        </span>
        <select
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            setResult(null);
          }}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #ddd",
            fontSize: 14,
            boxSizing: "border-box",
            background: "#fff",
          }}
        >
          {GROUPS.map((group) => (
            <optgroup key={group} label={group}>
              {SCENARIOS.filter((s) => s.group === group).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <p
        style={{
          margin: "4px 0 16px",
          fontSize: 13,
          color: "#666",
        }}
      >
        {selected.description}
      </p>

      <form onSubmit={handlePay}>
        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #ddd",
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 24 }}>
          <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
            Amount ({selected.currency})
          </span>
          <input
            type="number"
            required
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1000"
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #ddd",
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px 16px",
            borderRadius: 6,
            border: "none",
            background: loading ? "#999" : "#0a7c43",
            color: "#fff",
            fontSize: 16,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Processing..." : `Pay with ${selected.group}`}
        </button>
      </form>

      {result && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: 8,
            background:
              result.status === "successful"
                ? "#e6f9ee"
                : result.status === "cancelled"
                  ? "#fff8e6"
                  : "#fde8e8",
            border: `1px solid ${
              result.status === "successful"
                ? "#b3e6c9"
                : result.status === "cancelled"
                  ? "#f5e0a0"
                  : "#f5c6c6"
            }`,
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>
            {result.status === "successful" && "Payment successful"}
            {result.status === "cancelled" && "Payment cancelled"}
            {result.status === "failed" && "Payment failed"}
            {result.status === "pending" && "Payment pending"}
          </p>
          {"reference" in result && result.reference && (
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "#666" }}>
              Reference: {result.reference}
            </p>
          )}
          {"error" in result && result.error && (
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "#c0392b" }}>
              {result.error.message}
            </p>
          )}
        </div>
      )}
    </>
  );
}
