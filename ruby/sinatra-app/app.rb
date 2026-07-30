require "dotenv/load"
require "sinatra"
require "sanwo"

set :port, 5050

client = Sanwo::Client.new(
  provider: ENV.fetch("SANWO_PROVIDER", "paystack"),
  public_key: ENV.fetch("SANWO_PUBLIC_KEY", "pk_test_09659224f31a77f7370044ad9e69dede7dd177e1"),
  currency: ENV.fetch("SANWO_CURRENCY", "NGN"),
  debug: true,
)

get "/" do
  @scripts = client.render_script
  @public_key = ENV.fetch("SANWO_PUBLIC_KEY", "pk_test_09659224f31a77f7370044ad9e69dede7dd177e1")
  @flutterwave_key = ENV.fetch("FLUTTERWAVE_PUBLIC_KEY", "FLWPUBK_TEST-9b27878d10450bee730880c3064dce82-X")
  @monnify_key = ENV.fetch("MONNIFY_API_KEY", "MK_TEST_NXM9TBLPUE")
  @monnify_contract = ENV.fetch("MONNIFY_CONTRACT_CODE", "2403120008")
  @interswitch_merchant = ENV.fetch("INTERSWITCH_MERCHANT_CODE", "MX007")
  @interswitch_pay_item = ENV.fetch("INTERSWITCH_PAY_ITEM_ID", "101007")
  erb :sanwo
end
