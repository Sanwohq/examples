<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { createSanwo } from "@sanwohq/web";
import { paystackProvider } from "@sanwohq/paystack";
import { flutterwaveProvider } from "@sanwohq/flutterwave";
import { stripeProvider } from "@sanwohq/stripe";
import { paypalProvider } from "@sanwohq/paypal";
import { razorpayProvider } from "@sanwohq/razorpay";
import { monnifyProvider } from "@sanwohq/monnify";
import { yocoProvider } from "@sanwohq/yoco";
import { interswitchProvider } from "@sanwohq/interswitch";
import type { CheckoutResult } from "@sanwohq/types";

type ProviderKey =
  | "paystack"
  | "flutterwave"
  | "stripe"
  | "paypal"
  | "razorpay"
  | "monnify"
  | "yoco"
  | "interswitch";

interface ProviderConfig {
  label: string;
  provider: typeof paystackProvider;
  envKey: string;
  currency: string;
}

const providers: Record<ProviderKey, ProviderConfig> = {
  paystack: {
    label: "Paystack",
    provider: paystackProvider,
    envKey: "VITE_PAYSTACK_PUBLIC_KEY",
    currency: "NGN",
  },
  flutterwave: {
    label: "Flutterwave",
    provider: flutterwaveProvider,
    envKey: "VITE_FLUTTERWAVE_PUBLIC_KEY",
    currency: "NGN",
  },
  stripe: {
    label: "Stripe",
    provider: stripeProvider,
    envKey: "VITE_STRIPE_PUBLIC_KEY",
    currency: "USD",
  },
  paypal: {
    label: "PayPal",
    provider: paypalProvider,
    envKey: "VITE_PAYPAL_CLIENT_ID",
    currency: "USD",
  },
  razorpay: {
    label: "Razorpay",
    provider: razorpayProvider,
    envKey: "VITE_RAZORPAY_KEY_ID",
    currency: "INR",
  },
  monnify: {
    label: "Monnify",
    provider: monnifyProvider,
    envKey: "VITE_MONNIFY_API_KEY",
    currency: "NGN",
  },
  yoco: {
    label: "Yoco",
    provider: yocoProvider,
    envKey: "VITE_YOCO_PUBLIC_KEY",
    currency: "ZAR",
  },
  interswitch: {
    label: "Interswitch",
    provider: interswitchProvider,
    envKey: "VITE_INTERSWITCH_MERCHANT_CODE",
    currency: "NGN",
  },
};

const selectedProvider = ref<ProviderKey>("paystack");
const email = ref("");
const amount = ref<number | undefined>();
const loading = ref(false);
const result = ref<{
  type: "success" | "cancelled" | "error";
  message: string;
} | null>(null);

const currentCurrency = computed(() => providers[selectedProvider.value].currency);

function getPublicKey(providerKey: ProviderKey): string {
  const envKey = providers[providerKey].envKey;
  return (import.meta.env[envKey] as string) || "";
}

function buildSanwoInstance(providerKey: ProviderKey) {
  const config = providers[providerKey];
  return createSanwo({
    provider: config.provider,
    publicKey: getPublicKey(providerKey),
  });
}

const sanwo = ref(buildSanwoInstance(selectedProvider.value));

watch(selectedProvider, (newProvider) => {
  sanwo.value = buildSanwoInstance(newProvider);
  result.value = null;
});

function getSanwoProviderOptions(providerKey: ProviderKey): Record<string, string> | undefined {
  if (providerKey === "monnify") {
    const contractCode = import.meta.env.VITE_MONNIFY_CONTRACT_CODE as string;
    if (contractCode) {
      return { contractCode };
    }
  }
  if (providerKey === "interswitch") {
    const payItemId = import.meta.env.VITE_INTERSWITCH_PAY_ITEM_ID as string;
    if (payItemId) {
      return { payItemId };
    }
  }
  return undefined;
}

async function handlePayment() {
  if (!email.value || !amount.value) return;

  const amountInMinorUnits = Math.round(amount.value * 100);

  loading.value = true;
  result.value = null;

  try {
    const providerOptions = getSanwoProviderOptions(selectedProvider.value);

    const response: CheckoutResult = await sanwo.value({
      amount: amountInMinorUnits,
      currency: currentCurrency.value,
      customer: {
        email: email.value,
      },
      ...(providerOptions ? { sanwoProviderOptions: providerOptions } : {}),
    });

    if (response.status === "successful") {
      result.value = {
        type: "success",
        message: `Payment successful! Reference: ${response.reference}`,
      };
    } else if (response.status === "cancelled") {
      result.value = {
        type: "cancelled",
        message: "Payment was cancelled.",
      };
    } else if (response.status === "failed") {
      result.value = {
        type: "error",
        message: `Payment failed: ${response.error.message}`,
      };
    }
  } catch (error) {
    result.value = {
      type: "error",
      message: `Payment failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="container">
    <h1>Sanwo Payment</h1>
    <p class="subtitle">Vue 3 example with multiple providers</p>

    <form @submit.prevent="handlePayment">
      <label for="provider">Payment Provider</label>
      <select id="provider" v-model="selectedProvider">
        <option
          v-for="(config, key) in providers"
          :key="key"
          :value="key"
        >
          {{ config.label }}
        </option>
      </select>

      <label for="email">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        placeholder="customer@example.com"
        required
      />

      <label for="amount">Amount ({{ currentCurrency }})</label>
      <input
        id="amount"
        v-model.number="amount"
        type="number"
        placeholder="1000"
        min="1"
        step="1"
        required
      />

      <button type="submit" :disabled="loading">
        {{ loading ? "Processing..." : `Pay with ${providers[selectedProvider].label}` }}
      </button>
    </form>

    <div v-if="result" :class="['result', result.type]">
      {{ result.message }}
    </div>
  </div>
</template>

<style scoped>
.container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  padding: 40px;
  width: 100%;
  max-width: 420px;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 24px;
}

label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: #444;
}

select,
input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 16px;
  transition: border-color 0.2s;
  background: #fff;
}

select:focus,
input:focus {
  outline: none;
  border-color: #4f46e5;
}

select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

button {
  width: 100%;
  padding: 12px;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #4338ca;
}

button:disabled {
  background: #a5b4fc;
  cursor: not-allowed;
}

.result {
  margin-top: 20px;
  padding: 14px;
  border-radius: 8px;
  font-size: 0.9rem;
}

.result.success {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.result.cancelled {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

.result.error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}
</style>
