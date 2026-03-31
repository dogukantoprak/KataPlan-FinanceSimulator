# KataPlan – Participation Finance Simulator

A multi-page Turkish web application that simulates **Murabaha-based (interest-free) financing**. Built as a portfolio project targeting participation banking / fintech roles.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Language](https://img.shields.io/badge/language-Turkish-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## 🏦 What is Murabaha?

Murabaha is the core financing model used in participation (Islamic) banking. Instead of charging interest:

1. The bank purchases the product on behalf of the customer.
2. The bank resells it at a disclosed **profit margin** (kâr payı).
3. The customer pays in fixed monthly installments over the agreed period.

**Formula used in this app:**
```
Total Cost    = Product Price × (1 + Profit Rate / 100)
Monthly Payment = Total Cost ÷ Months
Total Profit    = Product Price × (Profit Rate / 100)
```

---

## 🚀 Features

| Feature | Details |
|---------|---------|
| Multi-page React app | 5 pages with React Router v6 |
| Real-time calculation | Updates on input change with 400ms debounce |
| Financial precision | Python `decimal` module – no floating-point errors |
| Loan comparison | Murabaha vs. Conventional side-by-side |
| Educational content | Murabaha, profit vs. interest, Turkey history |
| Full Turkish UI | All labels, copy, and messages in Turkish |
| Responsive design | Mobile-friendly glassmorphism layout |

---

## 📁 Project Structure

```
/kataplan
├── /backend
│   ├── app.py              # Flask API – POST /api/calculate
│   ├── logic.py            # Murabaha engine + input validation
│   └── requirements.txt
├── /frontend
│   ├── /src
│   │   ├── App.jsx         # BrowserRouter + 5 routes
│   │   ├── index.css       # Tailwind v4 + design system
│   │   ├── main.jsx
│   │   ├── /components
│   │   │   └── Navbar.jsx  # Sticky responsive navbar
│   │   └── /pages
│   │       ├── AnaSayfa.jsx        # Home page
│   │       ├── HesaplaPage.jsx     # Calculator
│   │       ├── KarsilastirPage.jsx # Comparison
│   │       ├── NedirPage.jsx       # Educational
│   │       └── HakkindaPage.jsx    # About
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🗺️ Pages

| Route | Turkish Name | Description |
|-------|-------------|-------------|
| `/` | Ana Sayfa | Hero, formula card, feature cards, CTA |
| `/hesapla` | Finansman Hesapla | Calculator with live results + installment table |
| `/karsilastir` | Karşılaştırma | Murabaha vs Conventional loan comparison |
| `/nedir` | Katılım Bankacılığı | Educational content about Islamic finance |
| `/hakkinda` | Hakkında | Project info, tech stack, architecture |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Backend | Python 3 + Flask |
| CORS | flask-cors |
| Precision | Python `decimal` module |

---

## 📡 API Reference

### `POST /api/calculate`

**Request:**
```json
{
  "product_price": "250000",
  "months": 36,
  "profit_rate": "18"
}
```

**Success Response (200):**
```json
{
  "product_price":    "250000",
  "total_payment":    "295000.00",
  "monthly_payment":  "8194.44",
  "total_profit":     "45000.00",
  "months":           36,
  "profit_rate":      "18",
  "installments": [
    { "month": 1, "payment": "8194.44", "remaining_balance": "286805.56" },
    ...
  ]
}
```

**Error Response (422):**
```json
{ "errors": ["Ürün fiyatı sıfırdan büyük olmalıdır."] }
```

---

## ⚡ Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Backend

```bash
cd backend
python -m pip install -r requirements.txt
python app.py
# → Running on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:5173
```

Open `http://localhost:5173` – API calls are proxied to the Flask backend automatically.

---

## ⚠️ Disclaimer

This application is built for **educational and portfolio purposes only**. It does not constitute financial advice. Calculations use a simplified Murabaha model. Do not make real financial decisions based on this tool.

---

## 📄 License

MIT
