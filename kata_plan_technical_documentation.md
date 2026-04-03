# KataPlan - Technical Documentation

## 1. Project Overview
KataPlan is a premium, portfolio-grade educational web application that simulates Murabaha-based participation finance. It provides an intuitive calculator, financial comparisons against traditional banking models, and an educational center for Islamic finance principles. The application was built to simulate real-world fintech aesthetics and features, showcasing full-stack development skills without relying on an external database.

## 2. Tech Stack

### Frontend
- **Framework:** React 19.2 (Bootstrapped with Vite 8.0)
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4.2 & Vanilla CSS (Custom tokens in `index.css`)
- **API Client:** Axios
- **Architecture Base:** Component-based UI with deep focus on responsive glassmorphism and data visualization.

### Backend
- **Framework:** Flask 3.1
- **Language:** Python 3.12+ (Utilizes the built-in `decimal` module for financial precision)
- **Middleware:** Flask-CORS for cross-origin requests

### Tooling & Environment
- Node.js (npm for frontend dependency management)
- Python Virtual Environment (`.venv`) for backend isolation
- Local multi-port proxy via Vite config for seamless dev server routing.

---

## 3. Frontend Architecture
The frontend is a Single Page Application (SPA) structured around a clean component hierarchy.
- **Routing Engine:** Handled seamlessly by `App.jsx` utilizing `react-router-dom`. Complete URL transitions happen client-side.
- **State Management:** Handled locally within pages using React `useState` and `useEffect`. Computation requests are debounced before sending to the backend to avoid API spam.
- **Styling & Theming:** Follows a modern tech/fintech aesthetic. Heavy usage of CSS variables for a "Navy & Emerald" palette, gradients, glassmorphism (`backdrop-filter`), and CSS keyframe micro-animations (`anim-up`, `num-pop`).
- **Data Visualization:** Built purely via native `<svg>` structures (`DonutChart` and `BarChart` components inside the `HesaplaPage`). It avoids bulky external tracking/graph charting libraries, optimizing bundle size.

---

## 4. Backend Architecture
The backend is built as a lightweight, stateless REST microservice using Flask.
- **Micro-Layered Design:**
  - `app.py`: Acts purely as the controller layer. It intercepts network requests (JSON), performs top-level missing field validation, handles HTTP response formatting, and manages CORS.
  - `logic.py`: The isolated business logic core. It validates data types, handles Murabaha finance mathematics, checks constraints, and constructs the amortization schedule.
- **Precision Mathematics:** Real-world money is handled using Python's `decimal` library (`ROUND_HALF_UP`) to ensure that floating-point errors do not corrupt installment and profit calculations. 

---

## 5. Page / Route Breakdown
Defined inside `frontend/src/App.jsx`.

| Route | Page Component | Description |
| :--- | :--- | :--- |
| `/` | `AnaSayfa.jsx` | Landing page providing the elevator pitch, key features, and calls-to-action. |
| `/hesapla` | `HesaplaPage.jsx` | The core Murabaha calculator. Features live inputs, SVG donut/bar charts, and an interactive installment table. |
| `/karsilastir` | `KarsilastirPage.jsx` | Comparative module. Allows the user to simulate traditional interest loans vs. Murabaha side-by-side with delta analysis. |
| `/nedir` | `NedirPage.jsx` | An educational hub explaining the differences between interest, participation banking, and Murabaha models using structured info-cards. |
| `/hakkinda` | `HakkindaPage.jsx` | Portfolio context page showcasing developer intent, tech stack specifics, and standard legal disclaimers. |
| `/*` | *Fallback 404* | A catch-all route redirecting back to the main site for nonexistent paths. |

---

## 6. Feature Breakdown & Business Logic
- **Real-Time Calculation Generation:** Uses generic debounced state bindings so that typing automatically calls the backend without a strict "Submit" button.
- **Visualized Analytics:** Instantly translates amortization endpoints into visually digestible CSS/SVG bar and donut graphs.
- **Financial Validation Rules:** The backend strictly controls parameter integrity (e.g., maximum term limit of 120 months, positive numbers, non-zero principal values).
- **Graceful Error Handling:** Form errors or server disconnection states are captured by frontend boundaries and cleanly projected using red glow/styled alert cards.

---

## 7. API & Database Flow
**Database:** The current architecture is completely **stateless**. Data persistence/databases (SQL/NoSQL) are not utilized by design. All models live in volatile memory for rapid simulation.

**API Structure:** 
- `POST /api/calculate`
  - **Payload:** `{ "product_price": 100000, "months": 12, "profit_rate": 15 }`
  - **Success Response (200):** JSON containing total profit, total payment, monthly payment, and an array of individual monthly installments.
  - **Validation Response (400/422):** Returns an explicit array of `errors` explaining constraints (e.g., "Profit rate cannot be negative").

**Integration Flow:** 
1. React component collects input changes.
2. Debounce hook delays action 420ms to await typed completion.
3. Axios posts to `/api/calculate` (proxied internally by Vite config to `localhost:5000`).
4. Flask parses the JSON, pushes it to `logic.py`, builds the mathematical schedule natively, and returns the compiled dictionary.
5. React receives the JSON tree, overrides the application state, conditionally renders the charts, and paints the DOM.

---

## 8. Folder Structure & Code Organization

```text
Kataplan/
├── backend/
│   ├── .venv/               # Virtual environment mapping
│   ├── app.py               # Flask application server (HTTP entry point)
│   ├── logic.py             # Math module (Decimal logic)
│   └── requirements.txt     # Python dependency blueprint
└── frontend/
    ├── package.json         # NPM manifest (React 19, Tailwind)
    ├── vite.config.js       # Vite bundler, proxy to port 5000 config
    ├── index.html           # HTML frame
    └── src/
        ├── main.jsx         # React DOM bootstrapper
        ├── App.jsx          # Top-flight Router and main wrapper
        ├── index.css        # Core custom tokens and raw CSS animations
        ├── components/      
        │   └── Navbar.jsx   # Sticky glassmorphism header navigation
        └── pages/
            ├── AnaSayfa.jsx 
            ├── HesaplaPage.jsx
            ├── KarsilastirPage.jsx
            ├── NedirPage.jsx
            └── HakkindaPage.jsx
```

---

## 9. Setup / Run Instructions

### Starting the Backend
1. Open a terminal and navigate to the project root: `cd <path>/Kataplan`
2. Activate your Virtual Environment: `.venv\\Scripts\\activate` (Windows)
3. Execute the server: `python backend/app.py`
4. Flask boots up internally at `http://127.0.0.1:5000/`.

### Starting the Frontend
1. Open a new terminal inside `Kataplan/frontend/`.
2. Run `npm install` (if node_modules is missing).
3. Start the Vite development server: `npm run dev`
4. Access the web platform at the locally listed Vite address (usually `http://localhost:5173` or `5174`).

*Note: You do not need to deal with CORS origin mismatch on local development because Vite masks the backend location through its native proxy config (`vite.config.js`).*

---

## 10. Potential Issues & Improvement Suggestions

1. **State Persistence:** Currently, refreshing the page clears calculated state. Storing the computed values inside `sessionStorage` or the `URL Query Params` would be ideal for sharing links (`/hesapla?price=100000&vade=12`).
2. **Mobile Optimization:** Although the grid blocks stack at `< 720px`, deeply massive nested charts and tables might scroll horizontally depending on mobile aspect ratios. Further container queries or `min-width` clamps are recommended.
3. **PWA Integration:** The architecture perfectly suits a Progressive Web Application. Adding a `manifest.json` and a service worker via Vite-PWA could allow users to install this application natively onto mobile devices.
4. **Backend Caching:** For massive scaling, repetitive calculations (same price/terms) can be memorized using `redis` or native `functools.lru_cache` if stateless traffic starts maxing out server CPU resources.
5. **Localization (i18n):** Translating the app from internal Turkish into an English variant would broaden accessibility, achievable using `react-i18next`.
