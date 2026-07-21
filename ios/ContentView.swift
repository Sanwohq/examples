import SwiftUI
import Sanwo
import SanwoPaystack
import SanwoFlutterwave
import SanwoRazorpay
import SanwoMonnify
import SanwoInterswitch

// MARK: - Provider configuration

/// Each provider needs its own Sanwo instance with the matching public key.
/// Replace the placeholder keys with your real test keys.
enum PaymentProvider: String, CaseIterable, Identifiable {
    case paystack     = "Paystack"
    case flutterwave  = "Flutterwave"
    case razorpay     = "Razorpay"
    case monnify      = "Monnify"
    case interswitch  = "Interswitch"

    var id: String { rawValue }

    /// The default currency for this provider.
    var defaultCurrency: String {
        switch self {
        case .razorpay: return "INR"
        default:        return "NGN"
        }
    }

    /// Creates a configured `Sanwo` instance for this provider.
    func makeSanwo() -> Sanwo {
        switch self {
        case .paystack:
            return Sanwo(provider: paystackProvider, publicKey: "pk_test_your_paystack_key")
        case .flutterwave:
            return Sanwo(provider: flutterwaveProvider, publicKey: "FLWPUBK_TEST-your_flutterwave_key")
        case .razorpay:
            return Sanwo(provider: razorpayProvider, publicKey: "rzp_test_your_razorpay_key")
        case .monnify:
            return Sanwo(provider: monnifyProvider, publicKey: "MK_TEST_your_monnify_key")
        case .interswitch:
            return Sanwo(provider: interswitchProvider, publicKey: "your_interswitch_merchant_code")
        }
    }
}

// MARK: - Main view

struct ContentView: View {
    @State private var selectedProvider: PaymentProvider = .paystack
    @State private var email = ""
    @State private var amount = ""
    @State private var showCheckout = false

    // Alert state
    @State private var alertTitle = ""
    @State private var alertMessage = ""
    @State private var showAlert = false

    /// Builds checkout options based on the selected provider and form inputs.
    private var checkoutOptions: CheckoutOptions {
        let minorAmount = Int((Double(amount) ?? 0) * 100)

        var options = CheckoutOptions(
            amount: minorAmount,
            currency: selectedProvider.defaultCurrency,
            customer: CheckoutCustomer(email: email),
            metadata: providerMetadata
        )

        return options
    }

    /// Provider-specific metadata.
    /// Monnify needs `contractCode` and `isTestMode`.
    /// Interswitch needs `payItemId` and `siteRedirectUrl`.
    private var providerMetadata: [String: Any]? {
        switch selectedProvider {
        case .monnify:
            return [
                "contractCode": "your_monnify_contract_code",
                "isTestMode": true
            ]
        case .interswitch:
            return [
                "payItemId": "your_interswitch_pay_item_id",
                "siteRedirectUrl": "https://your-app.com/redirect"
            ]
        default:
            return nil
        }
    }

    /// The Sanwo instance for the currently selected provider.
    /// Recreated when the provider changes so the correct SDK + key are used.
    private var sanwo: Sanwo {
        let instance = selectedProvider.makeSanwo()

        // Register event handlers (chainable, @discardableResult)
        instance
            .on(.loaded) { event in
                print("[\(event.provider)] Checkout loaded")
            }
            .on(.success) { event in
                print("[\(event.provider)] Payment succeeded: \(event.data ?? [:])")
            }
            .on(.cancelled) { event in
                print("[\(event.provider)] Payment cancelled")
            }
            .on(.failed) { event in
                print("[\(event.provider)] Payment failed: \(event.data ?? [:])")
            }

        return instance
    }

    var body: some View {
        NavigationStack {
            Form {
                // Provider picker
                Section("Payment Provider") {
                    Picker("Provider", selection: $selectedProvider) {
                        ForEach(PaymentProvider.allCases) { provider in
                            Text(provider.rawValue).tag(provider)
                        }
                    }
                    .pickerStyle(.menu)
                }

                // Customer details
                Section("Payment Details") {
                    TextField("Email", text: $email)
                        .keyboardType(.emailAddress)
                        .textContentType(.emailAddress)
                        .autocapitalization(.none)

                    TextField("Amount (\(selectedProvider.defaultCurrency))", text: $amount)
                        .keyboardType(.decimalPad)
                }

                // Pay button
                Section {
                    Button {
                        showCheckout = true
                    } label: {
                        HStack {
                            Spacer()
                            Text("Pay with \(selectedProvider.rawValue)")
                                .fontWeight(.semibold)
                            Spacer()
                        }
                    }
                    .disabled(email.isEmpty || amount.isEmpty)
                }
            }
            .navigationTitle("Sanwo Example")
            .sanwoCheckout(
                isPresented: $showCheckout,
                sanwo: sanwo,
                options: checkoutOptions
            ) { result in
                handleResult(result)
            }
            .alert(alertTitle, isPresented: $showAlert) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(alertMessage)
            }
        }
    }

    // MARK: - Result handling

    private func handleResult(_ result: CheckoutResult) {
        switch result {
        case .successful(let data):
            alertTitle = "Payment Successful"
            alertMessage = "Reference: \(data.reference)"
            if let txnId = data.transactionId {
                alertMessage += "\nTransaction ID: \(txnId)"
            }

        case .cancelled(let provider, _):
            alertTitle = "Payment Cancelled"
            alertMessage = "You cancelled the \(provider) checkout."

        case .failed(let provider, _, let error):
            alertTitle = "Payment Failed"
            alertMessage = "\(provider): \(error)"
        }

        showAlert = true
    }
}

// MARK: - Preview

#Preview {
    ContentView()
}
