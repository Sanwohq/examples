# Sanwo Android Example

A runnable Android example app demonstrating how to integrate the [Sanwo Android SDK](https://github.com/Sanwohq/android) with all supported payment providers.

## Providers

| Provider | Package | Key format |
|----------|---------|------------|
| Paystack | `com.sanwohq.paystack` | `pk_test_...` |
| Flutterwave | `com.sanwohq.flutterwave` | `FLWPUBK_TEST-...` |
| Razorpay | `com.sanwohq.razorpay` | `rzp_test_...` |
| Monnify | `com.sanwohq.monnify` | `MK_TEST_...` (+ contractCode) |
| Interswitch | `com.sanwohq.interswitch` | Merchant code (+ payItemId, siteRedirectUrl) |

## Setup

1. Copy `Config.example.kt` into `app/src/main/kotlin/com/example/sanwocheckout/Config.kt`
2. Replace the placeholder values with your real test keys from each provider's dashboard
3. Build and run:

```bash
./gradlew :app:assembleDebug
```

Or open in Android Studio and run on a device/emulator.

## Project structure

```
android/
├── build.gradle.kts          # Root build file
├── settings.gradle.kts        # JitPack repo + module config
├── gradle.properties
├── Config.example.kt          # Copy to Config.kt with your keys
└── app/
    ├── build.gradle.kts       # App dependencies (JitPack SDK)
    └── src/main/
        ├── AndroidManifest.xml
        ├── kotlin/com/example/sanwocheckout/
        │   └── MainActivity.kt
        └── res/
            ├── layout/activity_main.xml
            └── values/
                ├── colors.xml
                └── themes.xml
```
