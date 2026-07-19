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

export interface ProviderConfig {
  id: string;
  label: string;
  provider: SanwoProviderDefinition;
  publicKey: string;
  currency: string;
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: "paystack",
    label: "Paystack",
    provider: paystackProvider,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ?? "",
    currency: "NGN",
  },
  {
    id: "flutterwave",
    label: "Flutterwave",
    provider: flutterwaveProvider,
    publicKey: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY ?? "",
    currency: "NGN",
  },
{
    id: "paypal",
    label: "PayPal",
    provider: paypalProvider,
    publicKey: import.meta.env.VITE_PAYPAL_CLIENT_ID ?? "",
    currency: "USD",
  },
  {
    id: "razorpay",
    label: "Razorpay",
    provider: razorpayProvider,
    publicKey: import.meta.env.VITE_RAZORPAY_KEY_ID ?? "",
    currency: "INR",
  },
  {
    id: "monnify",
    label: "Monnify",
    provider: monnifyProvider,
    publicKey: import.meta.env.VITE_MONNIFY_API_KEY ?? "",
    currency: "NGN",
  },
  {
    id: "yoco",
    label: "Yoco",
    provider: yocoProvider,
    publicKey: import.meta.env.VITE_YOCO_PUBLIC_KEY ?? "",
    currency: "ZAR",
  },
  {
    id: "interswitch",
    label: "Interswitch",
    provider: interswitchProvider,
    publicKey: import.meta.env.VITE_INTERSWITCH_MERCHANT_CODE ?? "",
    currency: "NGN",
  },
];

export function App() {
  const [selectedId, setSelectedId] = useState(PROVIDERS[0].id);

  const selected = PROVIDERS.find((p) => p.id === selectedId) ?? PROVIDERS[0];

  return (
    <SanwoReactProvider
      key={selected.id}
      provider={selected.provider}
      publicKey={selected.publicKey}
      containerId="sanwo-container"
    >
      <CheckoutForm
        providers={PROVIDERS}
        selectedId={selectedId}
        onProviderChange={setSelectedId}
        currency={selected.currency}
        providerId={selected.id}
      />
    </SanwoReactProvider>
  );
}
