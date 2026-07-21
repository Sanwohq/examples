# Sanwo iOS Example (SwiftUI)

A minimal SwiftUI example showing how to integrate the [Sanwo iOS SDK](https://github.com/Sanwohq/ios) with all five payment providers.

## Setup

This is **not** a standalone Xcode project. Copy `ContentView.swift` into your own SwiftUI app.

### 1. Add the Sanwo SDK via Swift Package Manager

In Xcode, go to **File > Add Package Dependencies...** and enter:

```
https://github.com/Sanwohq/ios.git
```

Set the version rule to **Up to Next Major** from `0.1.0`.

Select the libraries you need:

| Library | Provider |
|---------|----------|
| **Sanwo** | Core (always required) |
| **SanwoPaystack** | Paystack |
| **SanwoFlutterwave** | Flutterwave |
| **SanwoRazorpay** | Razorpay |
| **SanwoMonnify** | Monnify |
| **SanwoInterswitch** | Interswitch |

### 2. Replace placeholder keys

Open `ContentView.swift` and replace the placeholder public keys in `PaymentProvider.makeSanwo()` with your real test keys from each provider's dashboard.

For Monnify, also replace `your_monnify_contract_code` in `providerMetadata`.
For Interswitch, replace `your_interswitch_pay_item_id` and update the `siteRedirectUrl`.

### 3. Use ContentView

Set `ContentView` as your app's root view:

```swift
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

## What the example shows

- **Provider picker** — switch between Paystack, Flutterwave, Razorpay, Monnify, and Interswitch
- **`.sanwoCheckout()` modifier** — the SwiftUI way to present checkout
- **Event handling** — chainable `.on(.loaded)`, `.on(.success)`, etc.
- **Result handling** — `switch` over `.successful`, `.cancelled`, `.failed`
- **Provider-specific options** — Monnify's `contractCode`/`isTestMode` and Interswitch's `payItemId`/`siteRedirectUrl` passed via `metadata`

## Requirements

- iOS 15.0+
- Swift 5.9+
- Xcode 15.0+
