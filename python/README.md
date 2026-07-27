# Sanwo Python Examples

Example apps showing how to integrate the [Sanwo](https://sanwohq.com) payment SDK with Flask, Django, and FastAPI.

## Flask

```bash
cd flask-app
pip install -r requirements.txt
python app.py
```

Open [http://localhost:5050](http://localhost:5050).

## Django

```bash
cd django-app
pip install -r requirements.txt
python manage.py runserver
```

Open [http://localhost:8000](http://localhost:8000).

## FastAPI

```bash
cd fastapi-app
pip install -r requirements.txt
python app.py
```

Open [http://localhost:5050](http://localhost:5050).

## What the examples show

- **Multiple providers** — Paystack, Flutterwave, Monnify, Interswitch scenarios
- **Provider options** — card-only, bank transfer, different checkout methods
- **Form inputs** — email and amount entered by the user
- **Result handling** — success, cancelled, failed, pending states
- **CDN embed** — uses the Sanwo embed script loaded via `sanwo_scripts()`

## Configuration

All examples include a `.env` file with test keys. Replace with your own keys from each provider's dashboard.
