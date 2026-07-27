import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from starlette.templating import Jinja2Templates
from sanwo.fastapi import SanwoFastAPI

app = FastAPI()

sanwo = SanwoFastAPI(
    app,
    provider=os.environ.get("SANWO_PROVIDER", "paystack"),
    public_key=os.environ.get("SANWO_PUBLIC_KEY", "pk_test_09659224f31a77f7370044ad9e69dede7dd177e1"),
    currency=os.environ.get("SANWO_CURRENCY", "NGN"),
    debug=os.environ.get("SANWO_DEBUG", "true").lower() == "true",
)

templates = Jinja2Templates(directory="templates")
sanwo.init_templates(templates)


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("sanwo.html", {
        "request": request,
        "flutterwave_key": os.environ.get("FLUTTERWAVE_PUBLIC_KEY", "FLWPUBK_TEST-xxxxx"),
        "monnify_key": os.environ.get("MONNIFY_API_KEY", "MK_TEST_xxxxx"),
        "monnify_contract": os.environ.get("MONNIFY_CONTRACT_CODE", "2403120008"),
        "interswitch_merchant": os.environ.get("INTERSWITCH_MERCHANT_CODE", "MX007"),
        "interswitch_pay_item": os.environ.get("INTERSWITCH_PAY_ITEM_ID", "101007"),
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5050)
