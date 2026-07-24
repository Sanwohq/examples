# Sanwo Examples

Working example apps using the [Sanwo payment SDK](https://github.com/Sanwohq/core) across multiple frameworks.

## Examples

| Example | Framework | SDK |
|---------|-----------|-----|
| [vanilla-js](./vanilla-js) | Vite + Vanilla JS | `@sanwohq/web` |
| [react](./react) | Vite + React + TypeScript | `@sanwohq/react` |
| [nextjs](./nextjs) | Next.js 14 (App Router) | `@sanwohq/web` |
| [vue](./vue) | Vite + Vue 3 + TypeScript | `@sanwohq/vue` |
| [angular](./angular) | Angular 18 | `@sanwohq/web` |
| [svelte](./svelte) | Vite + Svelte 4 | `@sanwohq/svelte` |
| [react-native](./react-native) | React Native CLI | `@sanwohq/react-native` |
| [flutter](./flutter) | Flutter + Dart | `sanwo_flutter` |
| [android](./android) | Android + Kotlin | `com.github.Sanwohq.android` |
| [ios](./ios) | SwiftUI (iOS 15+) | `Sanwo` (SPM) |
| [embed](./embed) | No-code / Any HTML page | `@sanwohq/embed` |

## Getting Started

Each example is a standalone project. To run one:

```bash
cd <example-name>
npm install
npm run dev
```

Replace the placeholder public key (`pk_test_xxx...`) with your actual Paystack test key from the [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developers).

## API Pattern

All examples follow the same core pattern:

```js
import { createSanwo } from "@sanwohq/web";
import { paystackProvider } from "@sanwohq/paystack";

const sanwo = createSanwo({
  provider: paystackProvider,
  publicKey: "pk_test_your_key_here",
});

const result = await sanwo({
  amount: 500000, // 5000 NGN in kobo
  currency: "NGN",
  customer: { email: "user@example.com" },
});
```

## Supported Providers

All examples demonstrate these 5 providers: Paystack, Flutterwave, Razorpay, Monnify, Interswitch.

## Requirements

- **Web examples**: Node.js 22+
- **React Native**: React Native CLI, Xcode/Android Studio
- **Flutter**: Flutter SDK 3.10+
- **Android**: Android Studio, JDK 17
- **iOS**: Xcode 15+, iOS 15+
