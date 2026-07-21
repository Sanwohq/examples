package com.example.sanwocheckout

import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.textfield.TextInputEditText
import com.sanwohq.core.Sanwo
import com.sanwohq.core.SanwoEvent
import com.sanwohq.core.CheckoutOptions
import com.sanwohq.core.CheckoutResult
import com.sanwohq.paystack.paystackProvider
import com.sanwohq.flutterwave.flutterwaveProvider
import com.sanwohq.razorpay.razorpayProvider
import com.sanwohq.monnify.monnifyProvider
import com.sanwohq.interswitch.interswitchProvider

class MainActivity : AppCompatActivity() {

    // ── Provider configuration ─────────────────────────────────
    data class ProviderConfig(
        val name: String,
        val provider: Any,       // SanwoProviderDefinition
        val publicKey: String,
        val currency: String,
        val extraOptions: Map<String, Any> = emptyMap(),
    )

    private val providers = listOf(
        ProviderConfig(
            name = "Paystack",
            provider = paystackProvider,
            publicKey = "pk_test_your_paystack_key",
            currency = "NGN",
        ),
        ProviderConfig(
            name = "Flutterwave",
            provider = flutterwaveProvider,
            publicKey = "FLWPUBK_TEST-your_flutterwave_key",
            currency = "NGN",
        ),
        ProviderConfig(
            name = "Razorpay",
            provider = razorpayProvider,
            publicKey = "rzp_test_your_razorpay_key",
            currency = "INR",
        ),
        ProviderConfig(
            name = "Monnify",
            provider = monnifyProvider,
            publicKey = "MK_TEST_your_monnify_key",
            currency = "NGN",
            extraOptions = mapOf(
                "contractCode" to "YOUR_CONTRACT_CODE",
                "isTestMode" to true,
            ),
        ),
        ProviderConfig(
            name = "Interswitch",
            provider = interswitchProvider,
            publicKey = "YOUR_MERCHANT_CODE",
            currency = "NGN",
            extraOptions = mapOf(
                "payItemId" to "YOUR_PAY_ITEM_ID",
                "siteRedirectUrl" to "https://your-app.com/redirect",
            ),
        ),
    )

    // ── State ──────────────────────────────────────────────────
    private lateinit var sanwo: Sanwo
    private lateinit var launcher: Any  // ActivityResultLauncher from Sanwo SDK
    private var selectedProvider = 0

    // ── Views ──────────────────────────────────────────────────
    private lateinit var providerSpinner: Spinner
    private lateinit var emailInput: TextInputEditText
    private lateinit var amountInput: TextInputEditText
    private lateinit var currencyLabel: TextView
    private lateinit var payButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Bind views
        providerSpinner = findViewById(R.id.spinner_provider)
        emailInput = findViewById(R.id.input_email)
        amountInput = findViewById(R.id.input_amount)
        currencyLabel = findViewById(R.id.label_currency)
        payButton = findViewById(R.id.btn_pay)

        // Set up provider dropdown
        val adapter = ArrayAdapter(
            this,
            android.R.layout.simple_spinner_item,
            providers.map { it.name },
        )
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        providerSpinner.adapter = adapter
        providerSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, pos: Int, id: Long) {
                selectedProvider = pos
                currencyLabel.text = "Amount (${providers[pos].currency})"
                payButton.text = "Pay with ${providers[pos].name}"
                initSanwo()
            }
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        payButton.setOnClickListener { startCheckout() }

        // Initialize with the first provider
        initSanwo()
    }

    // ── SDK setup ──────────────────────────────────────────────

    private fun initSanwo() {
        val config = providers[selectedProvider]

        sanwo = Sanwo(
            provider = config.provider,
            publicKey = config.publicKey,
        )

        // Register for Activity Result API (recommended pattern)
        launcher = sanwo.registerForCheckoutResult(this) { result ->
            handleResult(result)
        }

        // Optional: listen to lifecycle events
        sanwo.on(SanwoEvent.SUCCESS) { event ->
            android.util.Log.d("Sanwo", "Payment successful: $event")
        }
        sanwo.on(SanwoEvent.CANCELLED) { event ->
            android.util.Log.d("Sanwo", "Payment cancelled: $event")
        }
        sanwo.on(SanwoEvent.FAILED) { event ->
            android.util.Log.d("Sanwo", "Payment failed: $event")
        }
    }

    // ── Launch checkout ────────────────────────────────────────

    private fun startCheckout() {
        val email = emailInput.text?.toString()?.trim().orEmpty()
        val amountText = amountInput.text?.toString()?.trim().orEmpty()

        if (email.isEmpty() || amountText.isEmpty()) {
            Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show()
            return
        }

        val config = providers[selectedProvider]
        val amountInMinorUnits = (amountText.toDoubleOrNull() ?: 0.0) * 100

        val options = CheckoutOptions(
            amount = amountInMinorUnits.toLong(),
            currency = config.currency,
            customer = mapOf("email" to email),
            description = "Sanwo Android example payment",
            sanwoProviderOptions = config.extraOptions,
        )

        // Launch using the Activity Result API
        sanwo.launchCheckout(this, launcher, options)
    }

    // ── Result handling ────────────────────────────────────────

    private fun handleResult(result: CheckoutResult) {
        when (result) {
            is CheckoutResult.Successful -> {
                showDialog(
                    title = "Payment Successful",
                    message = "Reference: ${result.reference}" +
                        if (result.transactionId != null) "\nTransaction ID: ${result.transactionId}" else "",
                )
            }
            is CheckoutResult.Cancelled -> {
                Toast.makeText(this, "Payment cancelled", Toast.LENGTH_SHORT).show()
            }
            is CheckoutResult.Failed -> {
                showDialog(
                    title = "Payment Failed",
                    message = result.error.message ?: "An unknown error occurred",
                )
            }
        }
    }

    private fun showDialog(title: String, message: String) {
        AlertDialog.Builder(this)
            .setTitle(title)
            .setMessage(message)
            .setPositiveButton("OK", null)
            .show()
    }
}
