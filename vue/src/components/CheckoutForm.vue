<script setup lang="ts">
import { ref } from "vue";
import { createSanwo } from "@sanwohq/web";
import { paystackProvider } from "@sanwohq/paystack";
import type { CheckoutResult } from "@sanwohq/types";

const email = ref("");
const amount = ref<number | undefined>();
const loading = ref(false);
const result = ref<{
  type: "success" | "cancelled" | "error";
  message: string;
} | null>(null);

// Initialize Sanwo with the Paystack provider and your public key
const sanwo = createSanwo({
  provider: paystackProvider,
  publicKey: "pk_test_xxxxxxxxxxxxxxxxxxxxx", // Replace with your Paystack public key
});

async function handlePayment() {
  if (!email.value || !amount.value) return;

  // Convert to kobo (minor units) for Paystack
  const amountInKobo = Math.round(amount.value * 100);

  loading.value = true;
  result.value = null;

  try {
    const response: CheckoutResult = await sanwo({
      amount: amountInKobo,
      currency: "NGN",
      customer: {
        email: email.value,
      },
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
    <p class="subtitle">Vue 3 example with Paystack provider</p>

    <form @submit.prevent="handlePayment">
      <label for="email">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        placeholder="customer@example.com"
        required
      />

      <label for="amount">Amount (NGN)</label>
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
        {{ loading ? "Processing..." : "Pay Now" }}
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

input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 16px;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #4f46e5;
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
