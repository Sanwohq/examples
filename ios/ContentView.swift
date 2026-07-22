import SwiftUI
import Sanwo
import SanwoPaystack
import SanwoFlutterwave
import SanwoRazorpay
import SanwoMonnify
import SanwoInterswitch

// MARK: - Scenario configuration

struct Scenario: Identifiable, Hashable {
    let id: String
    let label: String
    let description: String
    let group: String
    let provider: SanwoProviderDefinition
    let publicKey: String
    let currency: String
    let extraOptions: [String: Any]

    static func == (lhs: Scenario, rhs: Scenario) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

// Copy .env.example to .env and add your keys
let kPaystackPublicKey = "YOUR_PAYSTACK_PUBLIC_KEY"
let kFlutterwavePublicKey = "YOUR_FLUTTERWAVE_PUBLIC_KEY"
let kRazorpayKeyId = "YOUR_RAZORPAY_KEY_ID"
let kMonnifyApiKey = "YOUR_MONNIFY_API_KEY"
let kMonnifyContractCode = "YOUR_MONNIFY_CONTRACT_CODE"
let kInterswitchMerchantCode = "YOUR_INTERSWITCH_MERCHANT_CODE"
let kInterswitchPayItemId = "YOUR_INTERSWITCH_PAY_ITEM_ID"
let kInterswitchRedirectUrl = "https://localhost"

let scenarios: [Scenario] = [
    // ── Paystack ──────────────────────────────────────────────
    Scenario(
        id: "paystack-checkout",
        label: "Paystack — Checkout",
        description: "Standard Paystack checkout popup",
        group: "Paystack",
        provider: paystackProvider,
        publicKey: kPaystackPublicKey,
        currency: "NGN",
        extraOptions: ["method": "checkout"]
    ),
    Scenario(
        id: "paystack-new-transaction",
        label: "Paystack — New Transaction",
        description: "Paystack new transaction flow",
        group: "Paystack",
        provider: paystackProvider,
        publicKey: kPaystackPublicKey,
        currency: "NGN",
        extraOptions: ["method": "newTransaction"]
    ),
    Scenario(
        id: "paystack-card-only",
        label: "Paystack — Card Only",
        description: "Paystack checkout limited to card payments",
        group: "Paystack",
        provider: paystackProvider,
        publicKey: kPaystackPublicKey,
        currency: "NGN",
        extraOptions: ["method": "checkout", "channels": ["card"]]
    ),
    Scenario(
        id: "paystack-bank-transfer",
        label: "Paystack — Bank Transfer",
        description: "Paystack checkout limited to bank transfer",
        group: "Paystack",
        provider: paystackProvider,
        publicKey: kPaystackPublicKey,
        currency: "NGN",
        extraOptions: ["method": "checkout", "channels": ["bank_transfer"]]
    ),

    // ── Flutterwave ───────────────────────────────────────────
    Scenario(
        id: "flutterwave-standard",
        label: "Flutterwave — Standard",
        description: "Standard Flutterwave checkout",
        group: "Flutterwave",
        provider: flutterwaveProvider,
        publicKey: kFlutterwavePublicKey,
        currency: "NGN",
        extraOptions: [:]
    ),
    Scenario(
        id: "flutterwave-card-only",
        label: "Flutterwave — Card Only",
        description: "Flutterwave checkout limited to card payments",
        group: "Flutterwave",
        provider: flutterwaveProvider,
        publicKey: kFlutterwavePublicKey,
        currency: "NGN",
        extraOptions: ["paymentOptions": "card"]
    ),

    // ── Razorpay ──────────────────────────────────────────────
    Scenario(
        id: "razorpay-standard",
        label: "Razorpay — Standard",
        description: "Standard Razorpay checkout",
        group: "Razorpay",
        provider: razorpayProvider,
        publicKey: kRazorpayKeyId,
        currency: "INR",
        extraOptions: [:]
    ),

    // ── Monnify ───────────────────────────────────────────────
    Scenario(
        id: "monnify-standard",
        label: "Monnify — Standard",
        description: "Standard Monnify checkout",
        group: "Monnify",
        provider: monnifyProvider,
        publicKey: kMonnifyApiKey,
        currency: "NGN",
        extraOptions: ["contractCode": kMonnifyContractCode, "isTestMode": true]
    ),
    Scenario(
        id: "monnify-card-only",
        label: "Monnify — Card Only",
        description: "Monnify checkout limited to card payments",
        group: "Monnify",
        provider: monnifyProvider,
        publicKey: kMonnifyApiKey,
        currency: "NGN",
        extraOptions: [
            "contractCode": kMonnifyContractCode,
            "isTestMode": true,
            "paymentMethods": ["CARD"],
        ]
    ),
    Scenario(
        id: "monnify-bank-transfer",
        label: "Monnify — Bank Transfer Only",
        description: "Monnify checkout limited to bank transfer",
        group: "Monnify",
        provider: monnifyProvider,
        publicKey: kMonnifyApiKey,
        currency: "NGN",
        extraOptions: [
            "contractCode": kMonnifyContractCode,
            "isTestMode": true,
            "paymentMethods": ["ACCOUNT_TRANSFER"],
        ]
    ),

    // ── Interswitch ───────────────────────────────────────────
    Scenario(
        id: "interswitch-standard",
        label: "Interswitch — Standard",
        description: "Standard Interswitch checkout",
        group: "Interswitch",
        provider: interswitchProvider,
        publicKey: kInterswitchMerchantCode,
        currency: "NGN",
        extraOptions: [
            "payItemId": kInterswitchPayItemId,
            "siteRedirectUrl": kInterswitchRedirectUrl,
        ]
    ),
]

// MARK: - Main view

struct ContentView: View {
    @State private var selectedScenario: Scenario = scenarios[0]
    @State private var email = "customer@example.com"
    @State private var amount = "5000"
    @State private var showCheckout = false

    @State private var alertTitle = ""
    @State private var alertMessage = ""
    @State private var showAlert = false

    private var checkoutOptions: CheckoutOptions {
        let minorAmount = Int((Double(amount) ?? 0) * 100)
        return CheckoutOptions(
            amount: minorAmount,
            currency: selectedScenario.currency,
            customer: CheckoutCustomer(email: email),
            metadata: selectedScenario.extraOptions.isEmpty ? nil : selectedScenario.extraOptions
        )
    }

    private var sanwo: Sanwo {
        let instance = Sanwo(
            provider: selectedScenario.provider,
            publicKey: selectedScenario.publicKey
        )

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

    // Group scenarios by their group name for display
    private var groupedScenarios: [(key: String, values: [Scenario])] {
        var groups: [(key: String, values: [Scenario])] = []
        var seen: [String: Int] = [:]
        for scenario in scenarios {
            if let idx = seen[scenario.group] {
                groups[idx].values.append(scenario)
            } else {
                seen[scenario.group] = groups.count
                groups.append((key: scenario.group, values: [scenario]))
            }
        }
        return groups
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // ── Scenario list ─────────────────────────────
                List {
                    ForEach(groupedScenarios, id: \.key) { group in
                        Section(group.key) {
                            ForEach(group.values) { scenario in
                                Button {
                                    selectedScenario = scenario
                                } label: {
                                    HStack {
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(scenario.label)
                                                .font(.subheadline)
                                                .fontWeight(selectedScenario == scenario ? .semibold : .regular)
                                                .foregroundStyle(.primary)
                                            Text(scenario.description)
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                        }
                                        Spacer()
                                        if selectedScenario == scenario {
                                            Image(systemName: "checkmark.circle.fill")
                                                .foregroundStyle(.blue)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                .listStyle(.insetGrouped)

                Divider()

                // ── Checkout form ─────────────────────────────
                VStack(spacing: 12) {
                    Text(selectedScenario.label)
                        .font(.headline)
                    Text(selectedScenario.description)
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    HStack(spacing: 12) {
                        TextField("Email", text: $email)
                            .keyboardType(.emailAddress)
                            .textContentType(.emailAddress)
                            .autocapitalization(.none)
                            .textFieldStyle(.roundedBorder)

                        TextField(selectedScenario.currency, text: $amount)
                            .keyboardType(.decimalPad)
                            .textFieldStyle(.roundedBorder)
                            .frame(width: 100)
                    }

                    Button {
                        showCheckout = true
                    } label: {
                        HStack {
                            Spacer()
                            Text("Pay with \(selectedScenario.group)")
                                .fontWeight(.semibold)
                            Spacer()
                        }
                        .padding(.vertical, 8)
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(email.isEmpty || amount.isEmpty)
                }
                .padding()
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
