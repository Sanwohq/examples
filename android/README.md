# Sanwo Android Example

Example code showing how to integrate the [Sanwo Android SDK](https://github.com/SanwoHQ/sanwo-android) into an Android app with Kotlin.

## What's included

| File | Purpose |
|------|---------|
| `MainActivity.kt` | Complete activity with provider selection, checkout, and result handling |
| `build.gradle.kts` | Dependencies to add to your app module |

## Setup

This is **example code to copy into an existing Android project**, not a standalone buildable project.

### 1. Add JitPack repository

In your project's `settings.gradle.kts`:

```kotlin
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://jitpack.io") }
    }
}
```

### 2. Add dependencies

In your app's `build.gradle.kts`, add the core SDK and whichever providers you need:

```kotlin
dependencies {
    implementation("com.github.SanwoHQ.sanwo-android:core:1.0.0")

    // Add only the providers you need
    implementation("com.github.SanwoHQ.sanwo-android:paystack:1.0.0")
    implementation("com.github.SanwoHQ.sanwo-android:flutterwave:1.0.0")
    implementation("com.github.SanwoHQ.sanwo-android:razorpay:1.0.0")
    implementation("com.github.SanwoHQ.sanwo-android:monnify:1.0.0")
    implementation("com.github.SanwoHQ.sanwo-android:interswitch:1.0.0")
}
```

### 3. Copy and adapt

Copy `MainActivity.kt` into your project and replace the placeholder keys with your real test keys from each provider's dashboard.

### 4. Layout

The activity expects a layout at `res/layout/activity_main.xml` with these view IDs:

- `spinner_provider` — `Spinner`
- `input_email` — `TextInputEditText`
- `input_amount` — `TextInputEditText`
- `label_currency` — `TextView`
- `btn_pay` — `Button`

## API patterns

The example demonstrates two Sanwo API patterns:

**Activity Result API (recommended)** — used in this example:

```kotlin
val sanwo = Sanwo(provider = paystackProvider, publicKey = "pk_test_...")
val launcher = sanwo.registerForCheckoutResult(this) { result -> }
sanwo.launchCheckout(this, launcher, options)
```

**Callable pattern** — simpler alternative:

```kotlin
sanwo(activity = this, options = CheckoutOptions(...)) { result -> }
```

## Providers

| Provider | Package | Key format |
|----------|---------|------------|
| Paystack | `com.sanwohq.paystack` | `pk_test_...` |
| Flutterwave | `com.sanwohq.flutterwave` | `FLWPUBK_TEST-...` |
| Razorpay | `com.sanwohq.razorpay` | `rzp_test_...` |
| Monnify | `com.sanwohq.monnify` | `MK_TEST_...` (+ contractCode) |
| Interswitch | `com.sanwohq.interswitch` | Merchant code (+ payItemId, siteRedirectUrl) |
