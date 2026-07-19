import { useState } from "react";
import { useSanwoCheckout } from "@sanwohq/react";
import type { CheckoutResult } from "@sanwohq/types";

export function CheckoutForm() {
  const { checkout, isLoading, error, result, reset } = useSanwoCheckout();

  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountInKobo = Math.round(parseFloat(amount) * 100);

    try {
      await checkout({
        amount: amountInKobo,
        currency: "NGN",
        customer: { email },
        sanwoProviderOptions: {
          channels: ["card", "bank", "ussd", "bank_transfer"],
        },
      });
    } catch {
      // Error is captured in the hook's `error` state
    }
  };

  if (result) {
    return (
      <div style={styles.card}>
        <ResultDisplay result={result} />
        <button
          onClick={() => {
            reset();
            setEmail("");
            setAmount("");
          }}
          style={styles.secondaryButton}
        >
          Make another payment
        </button>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>Sanwo + Paystack</h1>
      <p style={styles.subtitle}>React checkout example</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label htmlFor="email" style={styles.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="customer@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="amount" style={styles.label}>
            Amount (NGN)
          </label>
          <input
            id="amount"
            type="number"
            required
            min="1"
            step="0.01"
            placeholder="1000.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={styles.input}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            ...styles.button,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Processing..." : "Pay Now"}
        </button>
      </form>

      {error && (
        <div style={styles.errorBox}>
          <strong>Error:</strong> {error.message}
        </div>
      )}
    </div>
  );
}

function ResultDisplay({ result }: { result: CheckoutResult }) {
  switch (result.status) {
    case "successful":
      return (
        <div style={styles.successBox}>
          <h2 style={styles.resultTitle}>Payment Successful</h2>
          <p>Reference: {result.reference}</p>
          {result.transactionId && <p>Transaction ID: {result.transactionId}</p>}
        </div>
      );
    case "cancelled":
      return (
        <div style={styles.warningBox}>
          <h2 style={styles.resultTitle}>Payment Cancelled</h2>
          <p>The payment was cancelled by the user.</p>
        </div>
      );
    case "failed":
      return (
        <div style={styles.errorBox}>
          <h2 style={styles.resultTitle}>Payment Failed</h2>
          <p>{result.error.message}</p>
        </div>
      );
    case "pending":
      return (
        <div style={styles.warningBox}>
          <h2 style={styles.resultTitle}>Payment Pending</h2>
          <p>The payment is being processed.</p>
        </div>
      );
  }
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#ffffff",
    borderRadius: 12,
    padding: 32,
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#333",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 15,
    outline: "none",
  },
  button: {
    marginTop: 8,
    padding: "12px 20px",
    borderRadius: 8,
    border: "none",
    background: "#0a7c42",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
  },
  secondaryButton: {
    marginTop: 16,
    padding: "10px 20px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fff",
    color: "#333",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
  },
  errorBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    background: "#fef2f2",
    color: "#991b1b",
    fontSize: 14,
  },
  successBox: {
    padding: 16,
    borderRadius: 8,
    background: "#f0fdf4",
    color: "#166534",
    fontSize: 14,
  },
  warningBox: {
    padding: 16,
    borderRadius: 8,
    background: "#fffbeb",
    color: "#92400e",
    fontSize: 14,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
  },
};
