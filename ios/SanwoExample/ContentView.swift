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
    let provider: SanwoProvider
    let publicKey: String
    let currency: String
    let method: String?
    let channels: [String]?
    let paymentOptions: String?
    let extra: [String: Any]?

    init(
        id: String,
        label: String,
        description: String,
        group: String,
        provider: SanwoProvider,
        publicKey: String,
        currency: String,
        method: String? = nil,
        channels: [String]? = nil,
        paymentOptions: String? = nil,
        extra: [String: Any]? = nil
    ) {
        self.id = id
        self.label = label
        self.description = description
        self.group = group
        self.provider = provider
        self.publicKey = publicKey
        self.currency = currency
        self.method = method
        self.channels = channels
        self.paymentOptions = paymentOptions
        self.extra = extra
    }

    static func == (lhs: Scenario, rhs: Scenario) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

// Keys are loaded from Config.swift (gitignored) — copy Config.example.swift and add your keys

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
        method: "checkout"
    ),
    Scenario(
        id: "paystack-new-transaction",
        label: "Paystack — New Transaction",
        description: "Paystack new transaction flow",
        group: "Paystack",
        provider: paystackProvider,
        publicKey: kPaystackPublicKey,
        currency: "NGN",
        method: "newTransaction"
    ),
    Scenario(
        id: "paystack-card-only",
        label: "Paystack — Card Only",
        description: "Paystack checkout limited to card payments",
        group: "Paystack",
        provider: paystackProvider,
        publicKey: kPaystackPublicKey,
        currency: "NGN",
        method: "checkout",
        channels: ["card"]
    ),
    Scenario(
        id: "paystack-bank-transfer",
        label: "Paystack — Bank Transfer",
        description: "Paystack checkout limited to bank transfer",
        group: "Paystack",
        provider: paystackProvider,
        publicKey: kPaystackPublicKey,
        currency: "NGN",
        method: "checkout",
        channels: ["bank_transfer"]
    ),

    // ── Flutterwave ───────────────────────────────────────────
    Scenario(
        id: "flutterwave-standard",
        label: "Flutterwave — Standard",
        description: "Standard Flutterwave checkout",
        group: "Flutterwave",
        provider: flutterwaveProvider,
        publicKey: kFlutterwavePublicKey,
        currency: "NGN"
    ),
    Scenario(
        id: "flutterwave-card-only",
        label: "Flutterwave — Card Only",
        description: "Flutterwave checkout limited to card payments",
        group: "Flutterwave",
        provider: flutterwaveProvider,
        publicKey: kFlutterwavePublicKey,
        currency: "NGN",
        paymentOptions: "card"
    ),

    // ── Razorpay ──────────────────────────────────────────────
    Scenario(
        id: "razorpay-standard",
        label: "Razorpay — Standard",
        description: "Standard Razorpay checkout",
        group: "Razorpay",
        provider: razorpayProvider,
        publicKey: kRazorpayKeyId,
        currency: "INR"
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
        extra: ["contractCode": kMonnifyContractCode, "isTestMode": true]
    ),
    Scenario(
        id: "monnify-card-only",
        label: "Monnify — Card Only",
        description: "Monnify checkout limited to card payments",
        group: "Monnify",
        provider: monnifyProvider,
        publicKey: kMonnifyApiKey,
        currency: "NGN",
        extra: ["contractCode": kMonnifyContractCode, "isTestMode": true, "paymentMethods": ["CARD"]]
    ),
    Scenario(
        id: "monnify-bank-transfer",
        label: "Monnify — Bank Transfer Only",
        description: "Monnify checkout limited to bank transfer",
        group: "Monnify",
        provider: monnifyProvider,
        publicKey: kMonnifyApiKey,
        currency: "NGN",
        extra: ["contractCode": kMonnifyContractCode, "isTestMode": true, "paymentMethods": ["ACCOUNT_TRANSFER"]]
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
        extra: ["payItemId": kInterswitchPayItemId, "siteRedirectUrl": kInterswitchRedirectUrl]
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
            channels: selectedScenario.channels,
            paymentOptions: selectedScenario.paymentOptions,
            method: selectedScenario.method,
            extra: selectedScenario.extra
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

#Preview {
    ContentView()
}
