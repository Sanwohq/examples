# Sanwo Ruby Example

Example app showing how to integrate the [Sanwo](https://sanwohq.com) payment SDK with Ruby / Sinatra.

## Run

```bash
cd sinatra-app
bundle install
ruby app.rb
```

Open [http://localhost:5050](http://localhost:5050).

## What the example shows

- **Multiple providers** — Paystack, Flutterwave, Monnify, Interswitch scenarios
- **Provider options** — card-only, bank transfer, different checkout methods
- **Form inputs** — email and amount entered by the user
- **Result handling** — success, cancelled, failed, pending states
- **CDN embed** — uses the Sanwo embed script loaded via `client.render_script`

## Configuration

Set environment variables to override defaults:

```bash
SANWO_PUBLIC_KEY=pk_test_xxx ruby app.rb
```
