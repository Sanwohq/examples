"use client";

import { useState } from "react";
import { createSanwo } from "@sanwohq/web";
import { paystackProvider } from "@sanwohq/paystack";
import type { CheckoutResult } from "@sanwohq/types";

export default function Checkout() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckoutResult | null>(null);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const sanwo = createSanwo({
        provider: paystackProvider,
        publicKey: "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      });

      const checkoutResult = await sanwo({
        amount: Math.round(parseFloat(amount) * 100), // convert to kobo
        currency: "NGN",
        customer: { email },
      });

      setResult(checkoutResult);
    } catch (err) {
      console.error("Payment error:", err);
      setResult({
        status: "failed",
        provider: "paystack",
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
            Amount (NGN)
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
          {loading ? "Processing..." : "Pay Now"}
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
