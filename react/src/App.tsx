import { SanwoReactProvider } from "@sanwohq/react";
import { paystackProvider } from "@sanwohq/paystack";
import { CheckoutForm } from "./CheckoutForm";

/**
 * Replace with your own Paystack public key.
 * You can get one from https://dashboard.paystack.com/#/settings/developers
 */
const PAYSTACK_PUBLIC_KEY = "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

export function App() {
  return (
    <SanwoReactProvider
      provider={paystackProvider}
      publicKey={PAYSTACK_PUBLIC_KEY}
      containerId="sanwo-container"
    >
      <CheckoutForm />
    </SanwoReactProvider>
  );
}
