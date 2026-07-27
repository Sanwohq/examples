import os
from django.shortcuts import render


def index(request):
    return render(request, "sanwo.html", {
        "flutterwave_key": os.environ.get("FLUTTERWAVE_PUBLIC_KEY", "FLWPUBK_TEST-xxxxx"),
        "monnify_key": os.environ.get("MONNIFY_API_KEY", "MK_TEST_xxxxx"),
        "monnify_contract": os.environ.get("MONNIFY_CONTRACT_CODE", "2403120008"),
        "interswitch_merchant": os.environ.get("INTERSWITCH_MERCHANT_CODE", "MX007"),
        "interswitch_pay_item": os.environ.get("INTERSWITCH_PAY_ITEM_ID", "101007"),
    })
