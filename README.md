# KataPlan – Participation Finance Simulator

A modern, precision-first web application designed to simulate Murabaha-based (interest-free) financing for the Turkish participation banking ecosystem.

![Language](https://img.shields.io/badge/language-Javascript%20%2F%20Python-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-API-black?logo=flask&logoColor=white)
![Status](https://img.shields.io/badge/status-active-brightgreen)

---

## 🚀 Project Vision

KataPlan is more than just a calculator—it is a comprehensive **fintech product** engineered to model interest-free financing accurately. It features high-precision calculations, interactive data visualizations, and educational comparisons, enabling users to explore alternative financing models transparently.

---

## ✨ Core Features

*   **Murabaha-Based Calculation Engine:** Accurately calculates fixed profit margins with zero variable interest.
*   **Precision-First Backend:** Fully leverages Python's `decimal` module to eliminate floating-point arithmetic errors and ensure financial reliability.
*   **Real-Time Simulation:** Multi-page React application with sub-second debounce API responses.
*   **Educational Comparison:** Side-by-side structural and financial cost analysis comparing Participation Finance (Murabaha) against Conventional Loans (Interest).
*   **Responsive Fintech UI:** Built with custom Tailwind CSS v4 featuring glassmorphism cards, dynamic SVG visualizations, and seamless mobile responsiveness.

---

## 🏦 Domain Knowledge: Why Murabaha?

In conventional banking, profit is derived from time-based **interest (Riba)** charged on money lent. 

Participation finance utilizes the **Murabaha** model:
1. The bank purchases an asset requested by the customer.
2. The bank resells the tangible asset to the customer with an agreed, transparent **fixed profit margin**.
3. The customer repays this debt in predefined installments.

This structure eliminates compound interest risk, ensures transparency, and anchors financial transactions to real-world assets.

---

## 🛠️ Tech Stack

### Frontend
*   **React 18** (Vite build setup)
*   **React Router v6** (Multi-page SPA navigation)
*   **Tailwind CSS v4** (Custom tokens, gradients, and animations)
*   **Axios** (API communication)

### Backend
*   **Python 3.9+**
*   **Flask** (RESTful API architecture)
*   **Flask-CORS** (Handling cross-origin resource sharing)
*   **Python `decimal`** (Strict financial precision)

---

## 📁 System Architecture

```text
/kataplan
├── /backend
│   ├── app.py              # Flask API Entry Point
│   ├── logic.py            # Murabaha Mathematics Engine
│   └── requirements.txt
├── /frontend
│   ├── /src
│   │   ├── App.jsx         # Routing & Main Layout
│   │   ├── index.css       # Design System CSS
│   │   ├── /components     # Reusable UI Elements
│   │   └── /pages          # Calculator, Comparison, Educational Views
│   ├── index.html
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

### Requirements
*   Node.js 18+
*   Python 3.9+

### 1. Starting the Backend

Access the backend directory, set up a virtual environment, install dependencies, and run the Flask server:

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
*The backend will run on `http://localhost:5000`.*

### 2. Starting the Frontend

In a new terminal, access the frontend directory, install npm packages, and start Vite:

```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173` (requests to `/api` are automatically proxied).*

---

## 📸 Screenshots

*(Add screenshots of the application here to showcase the beautiful UI and mobile responsiveness)*

![Dashboard View](#)
![Comparison View](#)
![Mobile Layout](#)

---

## 👨‍💻 Author

**Doğukan Toprak**
*3rd-Year Software Engineering Student | Full-Stack Developer*

Built as an advanced portfolio piece to demonstrate a deep understanding of software engineering patterns, algorithmic precision, modern React architecture, and Islamic fintech domain knowledge.
