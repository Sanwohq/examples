import 'package:flutter/material.dart';
import 'package:sanwo_flutter/sanwo_flutter.dart';
import 'package:sanwo_paystack/sanwo_paystack.dart';
import 'package:sanwo_flutterwave/sanwo_flutterwave.dart';
import 'package:sanwo_razorpay/sanwo_razorpay.dart';
import 'package:sanwo_monnify/sanwo_monnify.dart';
import 'package:sanwo_interswitch/sanwo_interswitch.dart';

// ---------------------------------------------------------------------------
// Replace these with your actual test keys from each provider's dashboard.
// ---------------------------------------------------------------------------
const kPaystackPublicKey = 'pk_test_your_paystack_key_here';
const kFlutterwavePublicKey = 'FLWPUBK_TEST-your_flutterwave_key_here';
const kRazorpayKeyId = 'rzp_test_your_razorpay_key_here';
const kMonnifyApiKey = 'MK_TEST_your_monnify_key_here';
const kMonnifyContractCode = 'your_monnify_contract_code';
const kInterswitchMerchantCode = 'your_interswitch_merchant_code';
const kInterswitchPayItemId = 'Default_Payable_MX12345';
const kInterswitchRedirectUrl = 'https://your-site.com/callback';

// ---------------------------------------------------------------------------
// Provider configuration
// ---------------------------------------------------------------------------

enum PaymentProvider {
  paystack('Paystack', 'NGN'),
  flutterwave('Flutterwave', 'NGN'),
  razorpay('Razorpay', 'INR'),
  monnify('Monnify', 'NGN'),
  interswitch('Interswitch', 'NGN');

  const PaymentProvider(this.label, this.currency);
  final String label;
  final String currency;
}

SanwoProviderDefinition _providerDefinition(PaymentProvider p) {
  switch (p) {
    case PaymentProvider.paystack:
      return paystackProvider;
    case PaymentProvider.flutterwave:
      return flutterwaveProvider;
    case PaymentProvider.razorpay:
      return razorpayProvider;
    case PaymentProvider.monnify:
      return monnifyProvider;
    case PaymentProvider.interswitch:
      return interswitchProvider;
  }
}

String _publicKey(PaymentProvider p) {
  switch (p) {
    case PaymentProvider.paystack:
      return kPaystackPublicKey;
    case PaymentProvider.flutterwave:
      return kFlutterwavePublicKey;
    case PaymentProvider.razorpay:
      return kRazorpayKeyId;
    case PaymentProvider.monnify:
      return kMonnifyApiKey;
    case PaymentProvider.interswitch:
      return kInterswitchMerchantCode;
  }
}

Map<String, dynamic>? _extraOptions(PaymentProvider p) {
  switch (p) {
    case PaymentProvider.monnify:
      return {
        'contractCode': kMonnifyContractCode,
        'isTestMode': true,
      };
    case PaymentProvider.interswitch:
      return {
        'payItemId': kInterswitchPayItemId,
        'siteRedirectUrl': kInterswitchRedirectUrl,
      };
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

void main() {
  runApp(const SanwoExampleApp());
}

class SanwoExampleApp extends StatelessWidget {
  const SanwoExampleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sanwo Flutter Example',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF4F46E5),
        useMaterial3: true,
      ),
      home: const CheckoutPage(),
    );
  }
}

class CheckoutPage extends StatefulWidget {
  const CheckoutPage({super.key});

  @override
  State<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends State<CheckoutPage> {
  final _emailController = TextEditingController(text: 'customer@example.com');
  final _amountController = TextEditingController(text: '5000');
  PaymentProvider _selectedProvider = PaymentProvider.paystack;
  bool _loading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _pay() async {
    final email = _emailController.text.trim();
    final amountText = _amountController.text.trim();

    if (email.isEmpty || amountText.isEmpty) {
      _showSnackBar('Please enter both email and amount.');
      return;
    }

    final amountMajor = double.tryParse(amountText);
    if (amountMajor == null || amountMajor <= 0) {
      _showSnackBar('Please enter a valid amount.');
      return;
    }

    // Convert to minor units (e.g. kobo, paise).
    final amountMinor = (amountMajor * 100).round();

    // Create a Sanwo instance for the selected provider.
    final sanwo = Sanwo(
      provider: _providerDefinition(_selectedProvider),
      publicKey: _publicKey(_selectedProvider),
    );

    // Register event listeners for logging / analytics.
    sanwo.on(SanwoEvent.loaded, (data) {
      debugPrint('Sanwo [loaded]: $data');
    });
    sanwo.on(SanwoEvent.success, (data) {
      debugPrint('Sanwo [success]: $data');
    });
    sanwo.on(SanwoEvent.cancelled, (data) {
      debugPrint('Sanwo [cancelled]: $data');
    });
    sanwo.on(SanwoEvent.failed, (data) {
      debugPrint('Sanwo [failed]: $data');
    });
    sanwo.on(SanwoEvent.closed, (data) {
      debugPrint('Sanwo [closed]: $data');
    });

    setState(() => _loading = true);

    // Start the checkout flow.
    final result = await sanwo(
      context: context,
      options: CheckoutOptions(
        amount: amountMinor,
        currency: _selectedProvider.currency,
        customer: CheckoutCustomer(email: email),
        description: 'Sanwo example payment',
        extra: _extraOptions(_selectedProvider),
      ),
    );

    // Clean up listeners.
    sanwo.removeAllListeners();

    if (!mounted) return;
    setState(() => _loading = false);

    // Show the result.
    switch (result.status) {
      case CheckoutStatus.successful:
        _showResultDialog(
          title: 'Payment Successful',
          message: 'Reference: ${result.reference ?? 'N/A'}',
          icon: Icons.check_circle,
          color: Colors.green,
        );
      case CheckoutStatus.cancelled:
        _showSnackBar('Payment was cancelled.');
      case CheckoutStatus.failed:
        _showSnackBar('Payment failed: ${result.message ?? 'Unknown error'}');
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  void _showResultDialog({
    required String title,
    required String message,
    required IconData icon,
    required Color color,
  }) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        icon: Icon(icon, color: color, size: 48),
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sanwo Flutter Example')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Provider selector
            DropdownButtonFormField<PaymentProvider>(
              value: _selectedProvider,
              decoration: const InputDecoration(
                labelText: 'Payment Provider',
                border: OutlineInputBorder(),
              ),
              items: PaymentProvider.values
                  .map((p) => DropdownMenuItem(
                        value: p,
                        child: Text(p.label),
                      ))
                  .toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() => _selectedProvider = value);
                }
              },
            ),
            const SizedBox(height: 16),

            // Email field
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
                hintText: 'customer@example.com',
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),

            // Amount field
            TextField(
              controller: _amountController,
              decoration: InputDecoration(
                labelText: 'Amount (${_selectedProvider.currency})',
                border: const OutlineInputBorder(),
                hintText: '5000',
              ),
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
            ),
            const SizedBox(height: 24),

            // Pay button
            FilledButton.icon(
              onPressed: _loading ? null : _pay,
              icon: _loading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.payment),
              label: Text(
                _loading
                    ? 'Processing...'
                    : 'Pay with ${_selectedProvider.label}',
              ),
              style: FilledButton.styleFrom(
                minimumSize: const Size.fromHeight(52),
                textStyle: const TextStyle(fontSize: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
