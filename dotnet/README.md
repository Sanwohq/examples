# Sanwo .NET Example (ASP.NET Razor Pages)

A minimal ASP.NET example showing how to integrate the [Sanwo .NET SDK](https://github.com/Sanwohq/dotnet) with Tag Helpers for checkout buttons and custom amount forms.

## Setup

### 1. Create a new ASP.NET app (or use your existing one)

```bash
dotnet new webapp -o SanwoExample
cd SanwoExample
```

### 2. Install the Sanwo package

```bash
dotnet add package Sanwo
```

### 3. Copy the example files

Copy these files into your ASP.NET project:

```
Program.cs                          → Program.cs
appsettings.json                    → appsettings.json
Pages/_ViewImports.cshtml           → Pages/_ViewImports.cshtml
Pages/Shared/_Layout.cshtml         → Pages/Shared/_Layout.cshtml
Pages/Index.cshtml                  → Pages/Index.cshtml
Pages/Index.cshtml.cs               → Pages/Index.cshtml.cs
```

### 4. Run

```bash
dotnet run
```

Open [http://localhost:5000](http://localhost:5000) — you should see the Sanwo payment demo page.

## What the example shows

- **`<sanwo-scripts />`** — loads the Sanwo embed script from CDN
- **`<sanwo-checkout />`** — renders a checkout button with data attributes
- **Multiple providers** — Paystack, Flutterwave, and Monnify buttons
- **`<sanwo-custom-amount />`** — renders a custom amount form (donation use case)
- **`appsettings.json`** — centralized configuration via DI
- **JavaScript callback** — handles payment results

## Requirements

- .NET 8.0 or 9.0
