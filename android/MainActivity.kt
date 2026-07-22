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

    // ── Scenario configuration ────────────────────────────────
    data class Scenario(
        val id: String,
        val label: String,
        val description: String,
        val group: String,
        val provider: Any,
        val publicKey: String,
        val currency: String,
        val extraOptions: Map<String, Any> = emptyMap(),
    )

    private val scenarios = listOf(
        // ── Paystack ──────────────────────────────────────────
        Scenario(
            id = "paystack-checkout",
            label = "Paystack — Checkout",
            description = "Standard Paystack checkout popup",
            group = "Paystack",
            provider = paystackProvider,
            publicKey = "pk_test_09659224f31a77f7370044ad9e69dede7dd177e1",
            currency = "NGN",
            extraOptions = mapOf("method" to "checkout"),
        ),
        Scenario(
            id = "paystack-new-transaction",
            label = "Paystack — New Transaction",
            description = "Paystack new transaction flow",
            group = "Paystack",
            provider = paystackProvider,
            publicKey = "pk_test_09659224f31a77f7370044ad9e69dede7dd177e1",
            currency = "NGN",
            extraOptions = mapOf("method" to "newTransaction"),
        ),
        Scenario(
            id = "paystack-card-only",
            label = "Paystack — Card Only",
            description = "Paystack checkout limited to card payments",
            group = "Paystack",
            provider = paystackProvider,
            publicKey = "pk_test_09659224f31a77f7370044ad9e69dede7dd177e1",
            currency = "NGN",
            extraOptions = mapOf("method" to "checkout", "channels" to listOf("card")),
        ),
        Scenario(
            id = "paystack-bank-transfer",
            label = "Paystack — Bank Transfer",
            description = "Paystack checkout limited to bank transfer",
            group = "Paystack",
            provider = paystackProvider,
            publicKey = "pk_test_09659224f31a77f7370044ad9e69dede7dd177e1",
            currency = "NGN",
            extraOptions = mapOf("method" to "checkout", "channels" to listOf("bank_transfer")),
        ),

        // ── Flutterwave ───────────────────────────────────────
        Scenario(
            id = "flutterwave-standard",
            label = "Flutterwave — Standard",
            description = "Standard Flutterwave checkout",
            group = "Flutterwave",
            provider = flutterwaveProvider,
            publicKey = "FLWPUBK_TEST-9b27878d10450bee730880c3064dce82-X",
            currency = "NGN",
        ),
        Scenario(
            id = "flutterwave-card-only",
            label = "Flutterwave — Card Only",
            description = "Flutterwave checkout limited to card payments",
            group = "Flutterwave",
            provider = flutterwaveProvider,
            publicKey = "FLWPUBK_TEST-9b27878d10450bee730880c3064dce82-X",
            currency = "NGN",
            extraOptions = mapOf("paymentOptions" to "card"),
        ),

        // ── Razorpay ──────────────────────────────────────────
        Scenario(
            id = "razorpay-standard",
            label = "Razorpay — Standard",
            description = "Standard Razorpay checkout",
            group = "Razorpay",
            provider = razorpayProvider,
            publicKey = "rzp_test_NG25191hleuEtf",
            currency = "INR",
        ),

        // ── Monnify ───────────────────────────────────────────
        Scenario(
            id = "monnify-standard",
            label = "Monnify — Standard",
            description = "Standard Monnify checkout",
            group = "Monnify",
            provider = monnifyProvider,
            publicKey = "MK_TEST_NXM9TBLPUE",
            currency = "NGN",
            extraOptions = mapOf("contractCode" to "2403120008", "isTestMode" to true),
        ),
        Scenario(
            id = "monnify-card-only",
            label = "Monnify — Card Only",
            description = "Monnify checkout limited to card payments",
            group = "Monnify",
            provider = monnifyProvider,
            publicKey = "MK_TEST_NXM9TBLPUE",
            currency = "NGN",
            extraOptions = mapOf(
                "contractCode" to "2403120008",
                "isTestMode" to true,
                "paymentMethods" to listOf("CARD"),
            ),
        ),
        Scenario(
            id = "monnify-bank-transfer",
            label = "Monnify — Bank Transfer Only",
            description = "Monnify checkout limited to bank transfer",
            group = "Monnify",
            provider = monnifyProvider,
            publicKey = "MK_TEST_NXM9TBLPUE",
            currency = "NGN",
            extraOptions = mapOf(
                "contractCode" to "2403120008",
                "isTestMode" to true,
                "paymentMethods" to listOf("ACCOUNT_TRANSFER"),
            ),
        ),

        // ── Interswitch ───────────────────────────────────────
        Scenario(
            id = "interswitch-standard",
            label = "Interswitch — Standard",
            description = "Standard Interswitch checkout",
            group = "Interswitch",
            provider = interswitchProvider,
            publicKey = "MX007",
            currency = "NGN",
            extraOptions = mapOf(
                "payItemId" to "101007",
                "siteRedirectUrl" to "https://localhost",
            ),
        ),
    )

    // ── State ──────────────────────────────────────────────────
    private lateinit var sanwo: Sanwo
    private lateinit var launcher: Any
    private var selectedScenario = 0

    // ── Views ──────────────────────────────────────────────────
    private lateinit var scenarioSpinner: Spinner
    private lateinit var descriptionLabel: TextView
    private lateinit var emailInput: TextInputEditText
    private lateinit var amountInput: TextInputEditText
    private lateinit var currencyLabel: TextView
    private lateinit var payButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        scenarioSpinner = findViewById(R.id.spinner_provider)
        descriptionLabel = findViewById(R.id.label_description)
        emailInput = findViewById(R.id.input_email)
        amountInput = findViewById(R.id.input_amount)
        currencyLabel = findViewById(R.id.label_currency)
        payButton = findViewById(R.id.btn_pay)

        val adapter = ArrayAdapter(
            this,
            android.R.layout.simple_spinner_item,
            scenarios.map { it.label },
        )
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        scenarioSpinner.adapter = adapter
        scenarioSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, pos: Int, id: Long) {
                selectedScenario = pos
                val scenario = scenarios[pos]
                descriptionLabel.text = scenario.description
                currencyLabel.text = "Amount (${scenario.currency})"
                payButton.text = "Pay with ${scenario.group}"
                initSanwo()
            }
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        payButton.setOnClickListener { startCheckout() }
        initSanwo()
    }

    // ── SDK setup ──────────────────────────────────────────────

    private fun initSanwo() {
        val scenario = scenarios[selectedScenario]

        sanwo = Sanwo(
            provider = scenario.provider,
            publicKey = scenario.publicKey,
        )

        launcher = sanwo.registerForCheckoutResult(this) { result ->
            handleResult(result)
        }

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

        val scenario = scenarios[selectedScenario]
        val amountInMinorUnits = (amountText.toDoubleOrNull() ?: 0.0) * 100

        val options = CheckoutOptions(
            amount = amountInMinorUnits.toLong(),
            currency = scenario.currency,
            customer = mapOf("email" to email),
            description = "Sanwo Android example payment",
            sanwoProviderOptions = scenario.extraOptions,
        )

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
