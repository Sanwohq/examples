# Sanwo Laravel Example

A minimal Laravel example showing how to integrate the [Sanwo Laravel SDK](https://github.com/Sanwohq/laravel) with Blade components for checkout buttons and custom amount forms.

## Setup

### 1. Create a new Laravel app (or use your existing one)

```bash
composer create-project laravel/laravel sanwo-laravel-example
cd sanwo-laravel-example
```

### 2. Install the Sanwo package

```bash
composer require sanwohq/laravel
```

### 3. Publish the config

```bash
php artisan vendor:publish --tag=sanwo-config
```

### 4. Add your keys to `.env`

```env
SANWO_PROVIDER=paystack
SANWO_PUBLIC_KEY=pk_test_xxxxx
SANWO_CURRENCY=NGN
SANWO_DEBUG=true
```

### 5. Copy the example files

Copy these files into your Laravel project:

```
routes/web.php          → routes/web.php
resources/views/sanwo.blade.php → resources/views/sanwo.blade.php
```

### 6. Run

```bash
php artisan serve
```

Open [http://localhost:8000](http://localhost:8000) — you should see the Sanwo payment demo page.

## What the example shows

- **`<x-sanwo-scripts />`** — loads the Sanwo embed script from CDN
- **`<x-sanwo-checkout />`** — renders a checkout button with data attributes
- **Multiple providers** — Paystack, Flutterwave, and Monnify buttons
- **`<x-sanwo-custom-amount />`** — renders a custom amount form (donation use case)
- **JavaScript callback** — handles payment results
- **Config fallback** — components inherit provider/key/currency from `config/sanwo.php`

## Requirements

- PHP 8.1+
- Laravel 10, 11, or 12
