# Sanwo Go Example

Example app showing how to integrate the [Sanwo](https://sanwohq.com) payment SDK with Go's `net/http`.

## Run

```bash
go run main.go
```

Open [http://localhost:8080](http://localhost:8080).

## What the example shows

- **Multiple providers** — Paystack, Flutterwave, Monnify, Interswitch scenarios
- **Provider options** — card-only, bank transfer, different checkout methods
- **Form inputs** — email and amount entered by the user
- **Result handling** — success, cancelled, failed, pending states
- **CDN embed** — uses the Sanwo embed script loaded via `s.RenderScript()`

## Configuration

Set environment variables to override defaults:

```bash
SANWO_PUBLIC_KEY=pk_test_xxx go run main.go
```
