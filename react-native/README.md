# Sanwo React Native Example

Minimal React Native example showing how to integrate the Sanwo payment SDK with all supported providers.

## Packages Used

- `@sanwohq/react-native` — React Native SDK (SanwoProvider + useSanwoCheckout hook)
- `@sanwohq/paystack`, `@sanwohq/flutterwave`, `@sanwohq/razorpay`, `@sanwohq/monnify`, `@sanwohq/interswitch` — Provider definitions
- `react-native-webview` — Required peer dependency for the checkout modal

## Setup

This example contains only the source files that demonstrate SDK usage. You need a React Native project to run it.

1. **Create a new React Native project:**

   ```bash
   npx @react-native-community/cli init SanwoExample
   cd SanwoExample
   ```

2. **Copy the example files into your project:**

   ```bash
   cp /path/to/this/example/App.tsx ./App.tsx
   ```

3. **Install the Sanwo packages and peer dependencies:**

   ```bash
   npm install @sanwohq/react-native @sanwohq/paystack @sanwohq/flutterwave @sanwohq/razorpay @sanwohq/monnify @sanwohq/interswitch react-native-webview
   ```

4. **Update the public keys** in `App.tsx` with your test keys from each provider's dashboard.

5. **Install iOS pods** (macOS only):

   ```bash
   cd ios && pod install && cd ..
   ```

6. **Run the app:**

   ```bash
   npx react-native run-ios
   # or
   npx react-native run-android
   ```

## How It Works

The integration follows a Provider + Hook pattern:

```tsx
// 1. Wrap your app with SanwoProvider
<SanwoProvider provider={paystackProvider} publicKey="pk_test_...">
  <CheckoutScreen />
</SanwoProvider>

// 2. Use the checkout hook in any child component
function CheckoutScreen() {
  const { checkout, isLoading, error, result, reset } = useSanwoCheckout();

  const handlePay = async () => {
    const result = await checkout({
      amount: 500000,        // amount in minor units (e.g. kobo)
      currency: 'NGN',
      customer: { email: 'user@example.com' },
    });
    console.log(result.status); // 'successful' | 'cancelled' | 'failed'
  };

  return <Button title="Pay" onPress={handlePay} disabled={isLoading} />;
}

// 3. (Optional) Listen to events via the context
const { on } = useSanwoContext();
useEffect(() => {
  const unsubscribe = on('success', (event) => {
    console.log('Payment succeeded:', event.data);
  });
  return unsubscribe;
}, [on]);
```

## Requirements

- Node.js 22+
- React Native >= 0.70
- react-native-webview >= 11
