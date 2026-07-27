import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from flask import Flask, render_template
from sanwo.flask import SanwoFlask

app = Flask(__name__)

app.config["SANWO_PROVIDER"] = os.environ.get("SANWO_PROVIDER", "paystack")
app.config["SANWO_PUBLIC_KEY"] = os.environ.get("SANWO_PUBLIC_KEY", "pk_test_09659224f31a77f7370044ad9e69dede7dd177e1")
app.config["SANWO_CURRENCY"] = os.environ.get("SANWO_CURRENCY", "NGN")
app.config["SANWO_DEBUG"] = os.environ.get("SANWO_DEBUG", "true").lower() == "true"

app.config["FLUTTERWAVE_PUBLIC_KEY"] = os.environ.get("FLUTTERWAVE_PUBLIC_KEY", "FLWPUBK_TEST-xxxxx")
app.config["MONNIFY_API_KEY"] = os.environ.get("MONNIFY_API_KEY", "MK_TEST_xxxxx")
app.config["MONNIFY_CONTRACT_CODE"] = os.environ.get("MONNIFY_CONTRACT_CODE", "2403120008")
app.config["INTERSWITCH_MERCHANT_CODE"] = os.environ.get("INTERSWITCH_MERCHANT_CODE", "MX007")
app.config["INTERSWITCH_PAY_ITEM_ID"] = os.environ.get("INTERSWITCH_PAY_ITEM_ID", "101007")

sanwo = SanwoFlask(app)


@app.route("/")
def index():
    return render_template("sanwo.html")


if __name__ == "__main__":
    app.run(debug=True, port=5050)
