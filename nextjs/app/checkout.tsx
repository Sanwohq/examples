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

const PROVIDERS = [
  {
    label: "Paystack",
    provider: paystackProvider,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
    currency: "NGN",
  },
  {
    label: "Flutterwave",
    provider: flutterwaveProvider,
    publicKey: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ?? "",
    currency: "NGN",
  },
  {
    label: "PayPal",
    provider: paypalProvider,
    publicKey: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "",
    currency: "USD",
  },
  {
    label: "Razorpay",
    provider: razorpayProvider,
    publicKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
    currency: "INR",
  },
  {
    label: "Monnify",
    provider: monnifyProvider,
    publicKey: process.env.NEXT_PUBLIC_MONNIFY_API_KEY ?? "",
    currency: "NGN",
    providerOptions: {
      contractCode: process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE ?? "",
      isTestMode: true,
    },
  },
  {
    label: "Yoco",
    provider: yocoProvider,
    publicKey: process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY ?? "",
    currency: "ZAR",
  },
  {
    label: "Interswitch",
    provider: interswitchProvider,
    publicKey: process.env.NEXT_PUBLIC_INTERSWITCH_MERCHANT_CODE ?? "",
    currency: "NGN",
    providerOptions: {
      payItemId: process.env.NEXT_PUBLIC_INTERSWITCH_PAY_ITEM_ID ?? "",
    },
  },
] as const;

export default function Checkout() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckoutResult | null>(null);

  const selected = PROVIDERS[selectedIndex];

  const sanwo = useMemo(
    () =>
      createSanwo({
        provider: selected.provider,
        publicKey: selected.publicKey,
      }),
    [selectedIndex],
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
        ...("providerOptions" in selected && {
          sanwoProviderOptions: selected.providerOptions,
        }),
      });

      setResult(checkoutResult);
    } catch (err) {
      console.error("Payment error:", err);
      setResult({
        status: "failed",
        provider: selected.label.toLowerCase(),
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
      <label style={{ display: "block", marginBottom: 16 }}>
        <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
          Payment Provider
        </span>
        <select
          value={selectedIndex}
          onChange={(e) => {
            setSelectedIndex(Number(e.target.value));
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
          {PROVIDERS.map((p, i) => (
            <option key={p.label} value={i}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

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
          {loading ? "Processing..." : `Pay with ${selected.label}`}
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
