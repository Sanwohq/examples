<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { createSanwo } from "@sanwohq/web";
import { paystackProvider } from "@sanwohq/paystack";
import { flutterwaveProvider } from "@sanwohq/flutterwave";

import { razorpayProvider } from "@sanwohq/razorpay";
import { monnifyProvider } from "@sanwohq/monnify";
import { interswitchProvider } from "@sanwohq/interswitch";
import type { CheckoutResult } from "@sanwohq/types";

interface ScenarioConfig {
  label: string;
  group: string;
  description: string;
  provider: typeof paystackProvider;
  publicKey: string;
  currency: string;
  sanwoProviderOptions: Record<string, unknown>;
}

const scenarios: Record<string, ScenarioConfig> = {
  // Paystack scenarios
  "paystack-checkout": {
    label: "Paystack — Checkout",
    group: "Paystack",
    description: "Standard Paystack checkout with all payment methods",
    provider: paystackProvider,
    publicKey: (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string) || "",
    currency: "NGN",
    sanwoProviderOptions: { method: "checkout" },
  },
  "paystack-new-transaction": {
    label: "Paystack — New Transaction",
    group: "Paystack",
    description: "Paystack new transaction flow",
    provider: paystackProvider,
    publicKey: (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string) || "",
    currency: "NGN",
    sanwoProviderOptions: { method: "newTransaction" },
  },
  "paystack-card-only": {
    label: "Paystack — Card Only",
    group: "Paystack",
    description: "Paystack checkout restricted to card payments only",
    provider: paystackProvider,
    publicKey: (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string) || "",
    currency: "NGN",
    sanwoProviderOptions: { method: "checkout", channels: ["card"] },
  },
  "paystack-bank-transfer": {
    label: "Paystack — Bank Transfer",
    group: "Paystack",
    description: "Paystack checkout restricted to bank transfer only",
    provider: paystackProvider,
    publicKey: (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string) || "",
    currency: "NGN",
    sanwoProviderOptions: { method: "checkout", channels: ["bank_transfer"] },
  },

  // Flutterwave scenarios
  "flutterwave-standard": {
    label: "Flutterwave — Standard",
    group: "Flutterwave",
    description: "Standard Flutterwave checkout with all payment options",
    provider: flutterwaveProvider,
    publicKey: (import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY as string) || "",
    currency: "NGN",
    sanwoProviderOptions: {},
  },
  "flutterwave-card-only": {
    label: "Flutterwave — Card Only",
    group: "Flutterwave",
    description: "Flutterwave checkout restricted to card payments only",
    provider: flutterwaveProvider,
    publicKey: (import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY as string) || "",
    currency: "NGN",
    sanwoProviderOptions: { paymentOptions: "card" },
  },

  // Razorpay scenarios
  "razorpay-standard": {
    label: "Razorpay — Standard",
    group: "Razorpay",
    description: "Standard Razorpay checkout",
    provider: razorpayProvider,
    publicKey: (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || "",
    currency: "INR",
    sanwoProviderOptions: {},
  },

  // Monnify scenarios
  "monnify-standard": {
    label: "Monnify — Standard",
    group: "Monnify",
    description: "Standard Monnify checkout with all payment methods",
    provider: monnifyProvider,
    publicKey: (import.meta.env.VITE_MONNIFY_API_KEY as string) || "",
    currency: "NGN",
    sanwoProviderOptions: {
      contractCode: (import.meta.env.VITE_MONNIFY_CONTRACT_CODE as string) || "",
      isTestMode: true,
    },
  },
  "monnify-card-only": {
    label: "Monnify — Card Only",
    group: "Monnify",
    description: "Monnify checkout restricted to card payments only",
    provider: monnifyProvider,
    publicKey: (import.meta.env.VITE_MONNIFY_API_KEY as string) || "",
    currency: "NGN",
    sanwoProviderOptions: {
      contractCode: (import.meta.env.VITE_MONNIFY_CONTRACT_CODE as string) || "",
      isTestMode: true,
      paymentMethods: ["CARD"],
    },
  },
  "monnify-bank-transfer": {
    label: "Monnify — Bank Transfer Only",
    group: "Monnify",
    description: "Monnify checkout restricted to bank transfer only",
    provider: monnifyProvider,
    publicKey: (import.meta.env.VITE_MONNIFY_API_KEY as string) || "",
    currency: "NGN",
    sanwoProviderOptions: {
      contractCode: (import.meta.env.VITE_MONNIFY_CONTRACT_CODE as string) || "",
      isTestMode: true,
      paymentMethods: ["ACCOUNT_TRANSFER"],
    },
  },

  // Interswitch scenarios
  "interswitch-standard": {
    label: "Interswitch — Standard",
    group: "Interswitch",
    description: "Standard Interswitch checkout",
    provider: interswitchProvider,
    publicKey: (import.meta.env.VITE_INTERSWITCH_MERCHANT_CODE as string) || "",
    currency: "NGN",
    sanwoProviderOptions: {
      payItemId: (import.meta.env.VITE_INTERSWITCH_PAY_ITEM_ID as string) || "",
    },
  },
};

type ScenarioKey = keyof typeof scenarios;

const selectedScenario = ref<ScenarioKey>("paystack-checkout");
const email = ref("");
const amount = ref<number | undefined>();
const loading = ref(false);
const result = ref<{
  type: "success" | "cancelled" | "error";
  message: string;
} | null>(null);

const currentConfig = computed(() => scenarios[selectedScenario.value]);
const currentCurrency = computed(() => currentConfig.value.currency);
const scenarioDescription = computed(() => currentConfig.value.description);

// Group scenarios by provider for <optgroup> rendering
const groupedScenarios = computed(() => {
  const groups: Record<string, { key: string; label: string }[]> = {};
  for (const [key, config] of Object.entries(scenarios)) {
    if (!groups[config.group]) {
      groups[config.group] = [];
    }
    groups[config.group].push({ key, label: config.label });
  }
  return groups;
});

function buildSanwoInstance(scenarioKey: ScenarioKey) {
  const config = scenarios[scenarioKey];
  const instance = createSanwo({
    provider: config.provider,
    publicKey: config.publicKey,
  });

  instance.on("started", (event) => console.log("Sanwo: started", event));
  instance.on("opened", (event) => console.log("Sanwo: opened", event));
  instance.on("loaded", (event) => console.log("Sanwo: loaded", event));
  instance.on("success", (event) => console.log("Sanwo: success", event));
  instance.on("cancelled", (event) => console.log("Sanwo: cancelled", event));
  instance.on("failed", (event) => console.log("Sanwo: failed", event));
  instance.on("closed", (event) => console.log("Sanwo: closed", event));

  return instance;
}

const sanwo = ref(buildSanwoInstance(selectedScenario.value));

watch(selectedScenario, (newScenario) => {
  sanwo.value = buildSanwoInstance(newScenario);
  result.value = null;
});

async function handlePayment() {
  if (!email.value || !amount.value) return;

  const amountInMinorUnits = Math.round(amount.value * 100);

  loading.value = true;
  result.value = null;

  try {
    const config = currentConfig.value;

    const response: CheckoutResult = await sanwo.value({
      amount: amountInMinorUnits,
      currency: config.currency,
      customer: {
        email: email.value,
      },
      description: "Sanwo example payment",
      onLoad: () => console.log("Sanwo: onLoad callback fired"),
      onError: (err) => console.log("Sanwo: onError callback fired", err),
      ...(Object.keys(config.sanwoProviderOptions).length > 0
        ? { sanwoProviderOptions: config.sanwoProviderOptions }
        : {}),
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
      <label for="scenario">Payment Scenario</label>
      <select id="scenario" v-model="selectedScenario">
        <optgroup
          v-for="(items, group) in groupedScenarios"
          :key="group"
          :label="group"
        >
          <option
            v-for="item in items"
            :key="item.key"
            :value="item.key"
          >
            {{ item.label }}
          </option>
        </optgroup>
      </select>
      <p class="scenario-description">{{ scenarioDescription }}</p>

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
        {{ loading ? "Processing..." : `Pay with ${currentConfig.group}` }}
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

.scenario-description {
  color: #888;
  font-size: 0.8rem;
  margin-top: -8px;
  margin-bottom: 16px;
  font-style: italic;
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
