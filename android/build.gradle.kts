// build.gradle.kts (Module :app)
//
// Add these dependencies to your existing Android project's app-level build.gradle.kts.
// The Sanwo SDK is distributed via JitPack.

// 1. Add JitPack to your project-level settings.gradle.kts:
//
//    dependencyResolutionManagement {
//        repositories {
//            google()
//            mavenCentral()
//            maven { url = uri("https://jitpack.io") }
//        }
//    }

dependencies {
    // Sanwo core SDK
    implementation("com.github.SanwoHQ.sanwo-android:core:1.0.0")

    // Payment providers — add only the ones you need
    implementation("com.github.SanwoHQ.sanwo-android:paystack:1.0.0")
    implementation("com.github.SanwoHQ.sanwo-android:flutterwave:1.0.0")
    implementation("com.github.SanwoHQ.sanwo-android:razorpay:1.0.0")
    implementation("com.github.SanwoHQ.sanwo-android:monnify:1.0.0")
    implementation("com.github.SanwoHQ.sanwo-android:interswitch:1.0.0")

    // AndroidX (likely already in your project)
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.activity:activity-ktx:1.9.0")
}
