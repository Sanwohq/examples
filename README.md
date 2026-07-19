# Sanwo Examples

Working example apps using the [Sanwo payment SDK](https://github.com/Sanwohq/core) across multiple frameworks.

## Examples

| Example | Framework | Packages Used |
|---------|-----------|--------------|
| [vanilla-js](./vanilla-js) | Vite + Vanilla JS | `@sanwohq/web`, `@sanwohq/paystack` |
| [react](./react) | Vite + React + TypeScript | `@sanwohq/react`, `@sanwohq/paystack` |
| [nextjs](./nextjs) | Next.js 14 (App Router) | `@sanwohq/web`, `@sanwohq/paystack` |
| [vue](./vue) | Vite + Vue 3 + TypeScript | `@sanwohq/web`, `@sanwohq/paystack` |

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

## Requirements

- Node.js 22+
