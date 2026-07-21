import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import {
  SanwoProvider,
  useSanwoCheckout,
  useSanwoContext,
} from "@sanwohq/react-native";
import type {
  SanwoProviderDefinition,
  CheckoutResult,
} from "@sanwohq/react-native";
import { paystackProvider } from "@sanwohq/paystack";
import { flutterwaveProvider } from "@sanwohq/flutterwave";
import { razorpayProvider } from "@sanwohq/razorpay";
import { monnifyProvider } from "@sanwohq/monnify";
import { interswitchProvider } from "@sanwohq/interswitch";

// ---------------------------------------------------------------------------
// Provider configurations
// ---------------------------------------------------------------------------

interface ProviderConfig {
  id: string;
  label: string;
  provider: SanwoProviderDefinition;
  publicKey: string;
  currency: string;
  sanwoProviderOptions: Record<string, unknown>;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: "paystack",
    label: "Paystack",
    provider: paystackProvider,
    publicKey: "pk_test_your_paystack_key",
    currency: "NGN",
    sanwoProviderOptions: {},
  },
  {
    id: "flutterwave",
    label: "Flutterwave",
    provider: flutterwaveProvider,
    publicKey: "FLWPUBK_TEST-your_flutterwave_key",
    currency: "NGN",
    sanwoProviderOptions: {},
  },
  {
    id: "razorpay",
    label: "Razorpay",
    provider: razorpayProvider,
    publicKey: "rzp_test_your_razorpay_key",
    currency: "INR",
    sanwoProviderOptions: {},
  },
  {
    id: "monnify",
    label: "Monnify",
    provider: monnifyProvider,
    publicKey: "MK_TEST_your_monnify_key",
    currency: "NGN",
    sanwoProviderOptions: { contractCode: "YOUR_CONTRACT_CODE", isTestMode: true },
  },
  {
    id: "interswitch",
    label: "Interswitch",
    provider: interswitchProvider,
    publicKey: "YOUR_MERCHANT_CODE",
    currency: "NGN",
    sanwoProviderOptions: { payItemId: "YOUR_PAY_ITEM_ID" },
  },
];

// ---------------------------------------------------------------------------
// Checkout form (must be rendered inside <SanwoProvider>)
// ---------------------------------------------------------------------------

function CheckoutForm({ config }: { config: ProviderConfig }) {
  const { checkout, isLoading, error, result, reset } = useSanwoCheckout();
  const { on } = useSanwoContext();

  const [email, setEmail] = useState("customer@example.com");
  const [amount, setAmount] = useState("5000");

  // Listen for success events via the event emitter
  useEffect(() => {
    const unsubscribe = on("success", (event) => {
      console.log("Payment succeeded:", event.data);
    });
    return unsubscribe;
  }, [on]);

  const handlePay = async () => {
    const numericAmount = parseFloat(amount);
    if (!email || isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Validation", "Please enter a valid email and amount.");
      return;
    }

    try {
      await checkout({
        amount: Math.round(numericAmount * 100), // convert to minor units
        currency: config.currency,
        customer: { email },
        description: "Sanwo React Native example payment",
        onLoad: () => console.log("Checkout loaded"),
        onError: (err) => console.log("Checkout error:", err),
        sanwoProviderOptions: config.sanwoProviderOptions,
      });
    } catch {
      // Error is captured in the hook's `error` state
    }
  };

  // ── Result screen ──
  if (result) {
    return (
      <View style={styles.section}>
        <ResultDisplay result={result} />
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            reset();
            setAmount("5000");
          }}
        >
          <Text style={styles.secondaryButtonText}>Make another payment</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Form screen ──
  return (
    <View style={styles.section}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="customer@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Amount ({config.currency})</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="5000"
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={[styles.payButton, isLoading && styles.payButtonDisabled]}
        onPress={handlePay}
        disabled={isLoading}
      >
        <Text style={styles.payButtonText}>
          {isLoading ? "Processing..." : `Pay with ${config.label}`}
        </Text>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Error: {error.message}</Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Result display
// ---------------------------------------------------------------------------

function ResultDisplay({ result }: { result: CheckoutResult }) {
  switch (result.status) {
    case "successful":
      return (
        <View style={styles.successBox}>
          <Text style={styles.resultTitle}>Payment Successful</Text>
          <Text>Reference: {result.reference}</Text>
          {result.transactionId && (
            <Text>Transaction ID: {result.transactionId}</Text>
          )}
        </View>
      );
    case "cancelled":
      return (
        <View style={styles.warningBox}>
          <Text style={styles.resultTitle}>Payment Cancelled</Text>
          <Text>The payment was cancelled by the user.</Text>
        </View>
      );
    case "failed":
      return (
        <View style={styles.errorBox}>
          <Text style={styles.resultTitle}>Payment Failed</Text>
          <Text style={styles.errorText}>{result.error.message}</Text>
        </View>
      );
    case "pending":
      return (
        <View style={styles.warningBox}>
          <Text style={styles.resultTitle}>Payment Pending</Text>
          <Text>The payment is being processed.</Text>
        </View>
      );
  }
}

// ---------------------------------------------------------------------------
// App root
// ---------------------------------------------------------------------------

export default function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = PROVIDERS[selectedIndex];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Sanwo Checkout</Text>
        <Text style={styles.subtitle}>React Native Example</Text>

        {/* Provider picker */}
        <Text style={styles.label}>Payment Provider</Text>
        <View style={styles.pickerRow}>
          {PROVIDERS.map((p, i) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.pickerChip,
                i === selectedIndex && styles.pickerChipActive,
              ]}
              onPress={() => setSelectedIndex(i)}
            >
              <Text
                style={[
                  styles.pickerChipText,
                  i === selectedIndex && styles.pickerChipTextActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Wrap the checkout form with SanwoProvider, keyed to re-mount on provider change */}
        <SanwoProvider
          key={selected.id}
          provider={selected.provider}
          publicKey={selected.publicKey}
        >
          <CheckoutForm config={selected} />
        </SanwoProvider>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  section: {
    marginTop: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111",
  },
  pickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  pickerChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  pickerChipActive: {
    backgroundColor: "#0a7c42",
    borderColor: "#0a7c42",
  },
  pickerChipText: {
    fontSize: 13,
    color: "#333",
  },
  pickerChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  payButton: {
    marginTop: 20,
    backgroundColor: "#0a7c42",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  secondaryButtonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
  errorBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
  },
  errorText: {
    color: "#991b1b",
    fontSize: 14,
  },
  successBox: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f0fdf4",
  },
  warningBox: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#fffbeb",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
});
