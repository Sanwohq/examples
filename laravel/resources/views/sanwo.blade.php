<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sanwo Payment — Laravel Example</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5; color: #333; min-height: 100vh; padding: 40px 20px;
        }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { font-size: 1.75rem; margin-bottom: 8px; }
        p.subtitle { color: #666; font-size: 0.95rem; margin-bottom: 32px; }
        .card {
            background: #fff; border-radius: 12px;
            box-shadow: 0 2px 16px rgba(0,0,0,0.08); padding: 32px; margin-bottom: 24px;
        }
        .card h2 { font-size: 1.15rem; margin-bottom: 4px; }
        .card p { color: #666; font-size: 0.85rem; margin-bottom: 20px; }
        .sanwo-button {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 12px 24px; background: #4f46e5; color: #fff; border: none;
            border-radius: 8px; font-size: 1rem; font-weight: 600;
            cursor: pointer; transition: background 0.2s; margin-right: 12px; margin-bottom: 8px;
        }
        .sanwo-button:hover { background: #4338ca; }
        .sanwo-button.flutterwave { background: #f5a623; }
        .sanwo-button.flutterwave:hover { background: #e09400; }
        .sanwo-button.monnify { background: #0b6e4f; }
        .sanwo-button.monnify:hover { background: #095a40; }
        .code-block {
            background: #1e1e2e; color: #cdd6f4; border-radius: 8px;
            padding: 16px 20px; font-family: 'SF Mono', Monaco, Consolas, monospace;
            font-size: 0.8rem; line-height: 1.6; overflow-x: auto; margin-top: 16px; white-space: pre;
        }
        #result-log {
            margin-top: 32px; padding: 20px; background: #fff;
            border-radius: 12px; box-shadow: 0 2px 16px rgba(0,0,0,0.08);
        }
        #result-log h2 { font-size: 1rem; margin-bottom: 12px; }
        #log-entries { font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 0.8rem; color: #666; }
        #log-entries .entry { padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
        #log-entries .entry:last-child { border-bottom: none; }
        .entry.success { color: #065f46; }
        .entry.cancelled { color: #92400e; }
        .entry.error { color: #991b1b; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Sanwo Payment</h1>
        <p class="subtitle">Laravel Blade components — all providers and scenarios</p>

        {{-- Example 1: Paystack checkout --}}
        <div class="card">
            <h2>1. Paystack Checkout</h2>
            <p>Uses the default provider from config/sanwo.php. Just pass amount and email.</p>

            <x-sanwo-checkout
                amount="500000"
                email="customer@example.com"
                button-text="Pay ₦5,000 with Paystack"
                callback="onPaymentComplete"
            />

            <div class="code-block">&lt;x-sanwo-checkout
    amount="500000"
    email="customer@example.com"
    button-text="Pay ₦5,000 with Paystack"
    callback="onPaymentComplete"
/&gt;</div>
        </div>

        {{-- Example 2: Flutterwave checkout (override provider) --}}
        <div class="card">
            <h2>2. Flutterwave Checkout</h2>
            <p>Override the provider and public key per-button.</p>

            <x-sanwo-checkout
                amount="250000"
                email="customer@example.com"
                provider="flutterwave"
                public-key="{{ env('FLUTTERWAVE_PUBLIC_KEY', 'FLWPUBK_TEST-xxxxx') }}"
                button-text="Pay ₦2,500 with Flutterwave"
                button-class="sanwo-button flutterwave"
                callback="onPaymentComplete"
            />

            <div class="code-block">&lt;x-sanwo-checkout
    amount="250000"
    email="customer@example.com"
    provider="flutterwave"
    public-key="FLWPUBK_TEST-xxxxx"
    button-text="Pay ₦2,500 with Flutterwave"
    callback="onPaymentComplete"
/&gt;</div>
        </div>

        {{-- Example 3: Monnify checkout --}}
        <div class="card">
            <h2>3. Monnify Checkout</h2>
            <p>Another provider override — demonstrates Monnify integration.</p>

            <x-sanwo-checkout
                amount="100000"
                email="customer@example.com"
                provider="monnify"
                public-key="{{ env('MONNIFY_API_KEY', 'MK_TEST_xxxxx') }}"
                button-text="Pay ₦1,000 with Monnify"
                button-class="sanwo-button monnify"
                callback="onPaymentComplete"
            />
        </div>

        {{-- Example 4: Custom amount (donation) --}}
        <div class="card">
            <h2>4. Custom Amount (Donation)</h2>
            <p>Let users enter their own amount — great for donations and tips.</p>

            <x-sanwo-custom-amount
                email="donor@example.com"
                button-text="Donate"
                placeholder="How much would you like to give?"
                min-amount="500"
                max-amount="1000000"
                callback="onPaymentComplete"
            />

            <div class="code-block">&lt;x-sanwo-custom-amount
    email="donor@example.com"
    button-text="Donate"
    placeholder="How much would you like to give?"
    min-amount="500"
    max-amount="1000000"
    callback="onPaymentComplete"
/&gt;</div>
        </div>

        {{-- Example 5: Custom amount without email (shows email input) --}}
        <div class="card">
            <h2>5. Custom Amount + Email Input</h2>
            <p>Omit the email prop — Sanwo shows an email field automatically.</p>

            <x-sanwo-custom-amount
                button-text="Pay"
                placeholder="Enter amount"
                callback="onPaymentComplete"
            />

            <div class="code-block">&lt;x-sanwo-custom-amount
    button-text="Pay"
    placeholder="Enter amount"
    callback="onPaymentComplete"
/&gt;</div>
        </div>

        {{-- Result log --}}
        <div id="result-log">
            <h2>Event Log</h2>
            <div id="log-entries">
                <div class="entry">Waiting for payment events...</div>
            </div>
        </div>
    </div>

    {{-- Load Sanwo embed script --}}
    <x-sanwo-scripts />

    <script>
        var logEl = document.getElementById('log-entries');

        function addLog(message, type) {
            var entry = document.createElement('div');
            entry.className = 'entry ' + (type || '');
            entry.textContent = new Date().toLocaleTimeString() + ' — ' + message;
            logEl.insertBefore(entry, logEl.firstChild);
        }

        function onPaymentComplete(result) {
            if (result.status === 'successful') {
                addLog('Payment successful! Ref: ' + result.reference, 'success');
            } else if (result.status === 'cancelled') {
                addLog('Payment cancelled by user.', 'cancelled');
            } else if (result.status === 'pending') {
                addLog('Payment pending. Ref: ' + result.reference, 'cancelled');
            } else {
                addLog('Payment ' + result.status, 'error');
            }
        }

        document.addEventListener('sanwo:complete', function(e) {
            addLog('sanwo:complete event — status: ' + e.detail.status);
        });

        document.addEventListener('sanwo:error', function(e) {
            addLog('sanwo:error event — ' + e.detail.message, 'error');
        });
    </script>
</body>
</html>
