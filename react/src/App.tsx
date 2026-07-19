import { useState } from "react";
import { SanwoReactProvider } from "@sanwohq/react";
import type { SanwoProviderDefinition } from "@sanwohq/types";
import { paystackProvider } from "@sanwohq/paystack";
import { flutterwaveProvider } from "@sanwohq/flutterwave";
import { paypalProvider } from "@sanwohq/paypal";
import { razorpayProvider } from "@sanwohq/razorpay";
import { monnifyProvider } from "@sanwohq/monnify";
import { yocoProvider } from "@sanwohq/yoco";
import { interswitchProvider } from "@sanwohq/interswitch";
import { CheckoutForm } from "./CheckoutForm";

export interface ScenarioConfig {
  id: string;
  label: string;
  description: string;
  group: string;
  provider: SanwoProviderDefinition;
  publicKey: string;
  currency: string;
  sanwoProviderOptions: Record<string, unknown>;
}

export const SCENARIOS: ScenarioConfig[] = [
  // ── Paystack ──────────────────────────────────────────────
  {
    id: "paystack-checkout",
    label: "Paystack — Checkout",
    description: "Standard Paystack checkout popup",
    group: "Paystack",
    provider: paystackProvider,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ?? "",
    currency: "NGN",
    sanwoProviderOptions: { method: "checkout" },
  },
  {
    id: "paystack-new-transaction",
    label: "Paystack — New Transaction",
    description: "Paystack new transaction flow",
    group: "Paystack",
    provider: paystackProvider,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ?? "",
    currency: "NGN",
    sanwoProviderOptions: { method: "newTransaction" },
  },
  {
    id: "paystack-card-only",
    label: "Paystack — Card Only",
    description: "Paystack checkout limited to card payments",
    group: "Paystack",
    provider: paystackProvider,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ?? "",
    currency: "NGN",
    sanwoProviderOptions: { method: "checkout", channels: ["card"] },
  },
  {
    id: "paystack-bank-transfer",
    label: "Paystack — Bank Transfer",
    description: "Paystack checkout limited to bank transfer",
    group: "Paystack",
    provider: paystackProvider,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ?? "",
    currency: "NGN",
    sanwoProviderOptions: { method: "checkout", channels: ["bank_transfer"] },
  },

  // ── Flutterwave ───────────────────────────────────────────
  {
    id: "flutterwave-standard",
    label: "Flutterwave — Standard",
    description: "Standard Flutterwave checkout",
    group: "Flutterwave",
    provider: flutterwaveProvider,
    publicKey: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY ?? "",
    currency: "NGN",
    sanwoProviderOptions: {},
  },
  {
    id: "flutterwave-card-only",
    label: "Flutterwave — Card Only",
    description: "Flutterwave checkout limited to card payments",
    group: "Flutterwave",
    provider: flutterwaveProvider,
    publicKey: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY ?? "",
    currency: "NGN",
    sanwoProviderOptions: { paymentOptions: "card" },
  },

  // ── PayPal ────────────────────────────────────────────────
  {
    id: "paypal-standard",
    label: "PayPal — Standard",
    description: "Standard PayPal checkout",
    group: "PayPal",
    provider: paypalProvider,
    publicKey: import.meta.env.VITE_PAYPAL_CLIENT_ID ?? "",
    currency: "USD",
    sanwoProviderOptions: {},
  },

  // ── Razorpay ──────────────────────────────────────────────
  {
    id: "razorpay-standard",
    label: "Razorpay — Standard",
    description: "Standard Razorpay checkout",
    group: "Razorpay",
    provider: razorpayProvider,
    publicKey: import.meta.env.VITE_RAZORPAY_KEY_ID ?? "",
    currency: "INR",
    sanwoProviderOptions: {},
  },

  // ── Monnify ───────────────────────────────────────────────
  {
    id: "monnify-standard",
    label: "Monnify — Standard",
    description: "Standard Monnify checkout",
    group: "Monnify",
    provider: monnifyProvider,
    publicKey: import.meta.env.VITE_MONNIFY_API_KEY ?? "",
    currency: "NGN",
    sanwoProviderOptions: {
      contractCode: import.meta.env.VITE_MONNIFY_CONTRACT_CODE ?? "",
      isTestMode: true,
    },
  },
  {
    id: "monnify-card-only",
    label: "Monnify — Card Only",
    description: "Monnify checkout limited to card payments",
    group: "Monnify",
    provider: monnifyProvider,
    publicKey: import.meta.env.VITE_MONNIFY_API_KEY ?? "",
    currency: "NGN",
    sanwoProviderOptions: {
      contractCode: import.meta.env.VITE_MONNIFY_CONTRACT_CODE ?? "",
      isTestMode: true,
      paymentMethods: ["CARD"],
    },
  },
  {
    id: "monnify-bank-transfer",
    label: "Monnify — Bank Transfer Only",
    description: "Monnify checkout limited to bank transfer",
    group: "Monnify",
    provider: monnifyProvider,
    publicKey: import.meta.env.VITE_MONNIFY_API_KEY ?? "",
    currency: "NGN",
    sanwoProviderOptions: {
      contractCode: import.meta.env.VITE_MONNIFY_CONTRACT_CODE ?? "",
      isTestMode: true,
      paymentMethods: ["ACCOUNT_TRANSFER"],
    },
  },

  // ── Yoco ──────────────────────────────────────────────────
  {
    id: "yoco-standard",
    label: "Yoco — Standard",
    description: "Standard Yoco checkout",
    group: "Yoco",
    provider: yocoProvider,
    publicKey: import.meta.env.VITE_YOCO_PUBLIC_KEY ?? "",
    currency: "ZAR",
    sanwoProviderOptions: {},
  },

  // ── Interswitch ───────────────────────────────────────────
  {
    id: "interswitch-standard",
    label: "Interswitch — Standard",
    description: "Standard Interswitch checkout",
    group: "Interswitch",
    provider: interswitchProvider,
    publicKey: import.meta.env.VITE_INTERSWITCH_MERCHANT_CODE ?? "",
    currency: "NGN",
    sanwoProviderOptions: {
      payItemId: import.meta.env.VITE_INTERSWITCH_PAY_ITEM_ID ?? "",
    },
  },
];

export function App() {
  const [selectedId, setSelectedId] = useState(SCENARIOS[0].id);

  const selected =
    SCENARIOS.find((s) => s.id === selectedId) ?? SCENARIOS[0];

  return (
    <SanwoReactProvider
      key={selected.id}
      provider={selected.provider}
      publicKey={selected.publicKey}
      containerId="sanwo-container"
    >
      <CheckoutForm
        scenarios={SCENARIOS}
        selectedId={selectedId}
        onScenarioChange={setSelectedId}
        selected={selected}
      />
    </SanwoReactProvider>
  );
}
