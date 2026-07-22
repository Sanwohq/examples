import 'package:flutter/material.dart';
import 'package:sanwo_flutter/sanwo_flutter.dart';
import 'package:sanwo_paystack/sanwo_paystack.dart';
import 'package:sanwo_flutterwave/sanwo_flutterwave.dart';
import 'package:sanwo_razorpay/sanwo_razorpay.dart';
import 'package:sanwo_monnify/sanwo_monnify.dart';
import 'package:sanwo_interswitch/sanwo_interswitch.dart';

const kPaystackPublicKey = 'pk_test_09659224f31a77f7370044ad9e69dede7dd177e1';
const kFlutterwavePublicKey = 'FLWPUBK_TEST-9b27878d10450bee730880c3064dce82-X';
const kRazorpayKeyId = 'rzp_test_NG25191hleuEtf';
const kMonnifyApiKey = 'MK_TEST_NXM9TBLPUE';
const kMonnifyContractCode = '2403120008';
const kInterswitchMerchantCode = 'MX007';
const kInterswitchPayItemId = '101007';
const kInterswitchRedirectUrl = 'https://localhost';

class Scenario {
  const Scenario({
    required this.id,
    required this.label,
    required this.description,
    required this.group,
    required this.provider,
    required this.publicKey,
    required this.currency,
    this.extra,
    this.method,
    this.channels,
    this.paymentOptions,
  });

  final String id;
  final String label;
  final String description;
  final String group;
  final SanwoProviderDefinition provider;
  final String publicKey;
  final String currency;
  final Map<String, dynamic>? extra;
  final String? method;
  final List<String>? channels;
  final String? paymentOptions;
}

final scenarios = <Scenario>[
  // ── Paystack ──────────────────────────────────────────────
  Scenario(
    id: 'paystack-checkout',
    label: 'Paystack — Checkout',
    description: 'Standard Paystack checkout popup',
    group: 'Paystack',
    provider: paystackProvider,
    publicKey: kPaystackPublicKey,
    currency: 'NGN',
    method: 'checkout',
  ),
  Scenario(
    id: 'paystack-new-transaction',
    label: 'Paystack — New Transaction',
    description: 'Paystack new transaction flow',
    group: 'Paystack',
    provider: paystackProvider,
    publicKey: kPaystackPublicKey,
    currency: 'NGN',
    method: 'newTransaction',
  ),
  Scenario(
    id: 'paystack-card-only',
    label: 'Paystack — Card Only',
    description: 'Paystack checkout limited to card payments',
    group: 'Paystack',
    provider: paystackProvider,
    publicKey: kPaystackPublicKey,
    currency: 'NGN',
    method: 'checkout',
    channels: ['card'],
  ),
  Scenario(
    id: 'paystack-bank-transfer',
    label: 'Paystack — Bank Transfer',
    description: 'Paystack checkout limited to bank transfer',
    group: 'Paystack',
    provider: paystackProvider,
    publicKey: kPaystackPublicKey,
    currency: 'NGN',
    method: 'checkout',
    channels: ['bank_transfer'],
  ),

  // ── Flutterwave ───────────────────────────────────────────
  Scenario(
    id: 'flutterwave-standard',
    label: 'Flutterwave — Standard',
    description: 'Standard Flutterwave checkout',
    group: 'Flutterwave',
    provider: flutterwaveProvider,
    publicKey: kFlutterwavePublicKey,
    currency: 'NGN',
  ),
  Scenario(
    id: 'flutterwave-card-only',
    label: 'Flutterwave — Card Only',
    description: 'Flutterwave checkout limited to card payments',
    group: 'Flutterwave',
    provider: flutterwaveProvider,
    publicKey: kFlutterwavePublicKey,
    currency: 'NGN',
    paymentOptions: 'card',
  ),

  // ── Razorpay ──────────────────────────────────────────────
  Scenario(
    id: 'razorpay-standard',
    label: 'Razorpay — Standard',
    description: 'Standard Razorpay checkout',
    group: 'Razorpay',
    provider: razorpayProvider,
    publicKey: kRazorpayKeyId,
    currency: 'INR',
  ),

  // ── Monnify ───────────────────────────────────────────────
  Scenario(
    id: 'monnify-standard',
    label: 'Monnify — Standard',
    description: 'Standard Monnify checkout',
    group: 'Monnify',
    provider: monnifyProvider,
    publicKey: kMonnifyApiKey,
    currency: 'NGN',
    extra: {'contractCode': kMonnifyContractCode, 'isTestMode': true},
  ),
  Scenario(
    id: 'monnify-card-only',
    label: 'Monnify — Card Only',
    description: 'Monnify checkout limited to card payments',
    group: 'Monnify',
    provider: monnifyProvider,
    publicKey: kMonnifyApiKey,
    currency: 'NGN',
    extra: {
      'contractCode': kMonnifyContractCode,
      'isTestMode': true,
      'paymentMethods': ['CARD'],
    },
  ),
  Scenario(
    id: 'monnify-bank-transfer',
    label: 'Monnify — Bank Transfer Only',
    description: 'Monnify checkout limited to bank transfer',
    group: 'Monnify',
    provider: monnifyProvider,
    publicKey: kMonnifyApiKey,
    currency: 'NGN',
    extra: {
      'contractCode': kMonnifyContractCode,
      'isTestMode': true,
      'paymentMethods': ['ACCOUNT_TRANSFER'],
    },
  ),

  // ── Interswitch ───────────────────────────────────────────
  Scenario(
    id: 'interswitch-standard',
    label: 'Interswitch — Standard',
    description: 'Standard Interswitch checkout',
    group: 'Interswitch',
    provider: interswitchProvider,
    publicKey: kInterswitchMerchantCode,
    currency: 'NGN',
    extra: {
      'payItemId': kInterswitchPayItemId,
      'siteRedirectUrl': kInterswitchRedirectUrl,
    },
  ),
];

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
  int _selectedIndex = 0;
  bool _loading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  Scenario get _selected => scenarios[_selectedIndex];

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

    final amountMinor = (amountMajor * 100).round();

    final sanwo = Sanwo(
      provider: _selected.provider,
      publicKey: _selected.publicKey,
    );

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

    final result = await sanwo(
      context: context,
      options: CheckoutOptions(
        amount: amountMinor,
        currency: _selected.currency,
        customer: CheckoutCustomer(email: email),
        description: 'Sanwo example payment',
        method: _selected.method,
        channels: _selected.channels,
        paymentOptions: _selected.paymentOptions,
        extra: _selected.extra,
      ),
    );

    sanwo.removeAllListeners();

    if (!mounted) return;
    setState(() => _loading = false);

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
    final groups = <String, List<int>>{};
    for (var i = 0; i < scenarios.length; i++) {
      groups.putIfAbsent(scenarios[i].group, () => []).add(i);
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Sanwo Flutter Example')),
      body: Column(
        children: [
          // ── Scenario list ────────────────────────────────
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              children: [
                for (final group in groups.entries) ...[
                  Padding(
                    padding: const EdgeInsets.only(top: 16, bottom: 4),
                    child: Text(
                      group.key,
                      style: Theme.of(context)
                          .textTheme
                          .labelLarge
                          ?.copyWith(color: Theme.of(context).colorScheme.primary),
                    ),
                  ),
                  for (final idx in group.value)
                    _ScenarioTile(
                      scenario: scenarios[idx],
                      selected: idx == _selectedIndex,
                      onTap: () => setState(() => _selectedIndex = idx),
                    ),
                ],
              ],
            ),
          ),

          const Divider(height: 1),

          // ── Checkout form ────────────────────────────────
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  _selected.label,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 4),
                Text(
                  _selected.description,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 12),

                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _emailController,
                        decoration: const InputDecoration(
                          labelText: 'Email',
                          border: OutlineInputBorder(),
                          isDense: true,
                        ),
                        keyboardType: TextInputType.emailAddress,
                      ),
                    ),
                    const SizedBox(width: 12),
                    SizedBox(
                      width: 120,
                      child: TextField(
                        controller: _amountController,
                        decoration: InputDecoration(
                          labelText: _selected.currency,
                          border: const OutlineInputBorder(),
                          isDense: true,
                        ),
                        keyboardType:
                            const TextInputType.numberWithOptions(decimal: true),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

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
                        : 'Pay with ${_selected.group}',
                  ),
                  style: FilledButton.styleFrom(
                    minimumSize: const Size.fromHeight(48),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ScenarioTile extends StatelessWidget {
  const _ScenarioTile({
    required this.scenario,
    required this.selected,
    required this.onTap,
  });

  final Scenario scenario;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Card(
      elevation: 0,
      color: selected ? scheme.primaryContainer : scheme.surfaceContainerLow,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: selected
            ? BorderSide(color: scheme.primary, width: 1.5)
            : BorderSide.none,
      ),
      child: ListTile(
        dense: true,
        title: Text(
          scenario.label,
          style: TextStyle(
            fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
            color: selected ? scheme.onPrimaryContainer : null,
          ),
        ),
        subtitle: Text(
          scenario.description,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: selected
                    ? scheme.onPrimaryContainer.withValues(alpha: 0.7)
                    : null,
              ),
        ),
        trailing: selected
            ? Icon(Icons.check_circle, color: scheme.primary, size: 20)
            : null,
        onTap: onTap,
      ),
    );
  }
}
