# KataPlan Technical Documentation

## 1. Overview

KataPlan is a digital participation finance prototype that simulates a Murabaha-based pre-application journey.

The current version goes beyond a calculator by combining:

- product-based financing rules
- affordability checks
- policy visibility
- document checklist support
- printable proposal generation
- scenario storage on the client

## 2. Architecture

### Frontend

- React SPA
- React Router for multi-page navigation
- Axios for API calls
- CSS-driven design system in `index.css`

### Backend

- Flask REST API
- `logic.py` as the rule-engine and quote-generation core
- `decimal` for money precision and rounding consistency

### Data Flow

1. Frontend fetches product metadata from `GET /api/products`.
2. User selects a product and fills in scenario inputs.
3. Frontend posts data to `POST /api/calculate`.
4. Backend validates the payload, applies product rules, and builds the quote.
5. Frontend renders eligibility, pricing, checklist, and schedule views.

## 3. Backend Rule Engine

The backend now supports multiple products:

- vehicle
- home_improvement
- education
- technology

Each product defines:

- min and max asset values
- down-payment thresholds
- maturity caps
- base annual profit rate
- fee bounds
- affordability floors
- documents and journey steps

The quote engine also applies:

- channel adjustment
- customer relationship adjustment
- optional asset-condition adjustment
- optional manual profit-rate override

## 4. API Endpoints

### `GET /api/health`

Returns a simple health payload.

### `GET /api/products`

Returns product defaults, constraints, channels, and customer segments.

### `POST /api/calculate`

Returns:

- normalized request payload
- quote metadata
- pricing breakdown
- rate component breakdown
- eligibility score and status
- policy checks
- document list
- assumptions
- installment schedule
- audit metadata

### `GET /api/openapi.json`

Returns a lightweight OpenAPI document describing the public API.

## 5. Frontend Pages

### `AnaSayfa.jsx`

Repositions the project as a participation finance prototype instead of a simple calculator.

### `HesaplaPage.jsx`

Main quote journey:

- product selection
- customer input
- automatic quote refresh
- saved scenarios
- PDF-ready print action
- policy/document/schedule tabs

### `KarsilastirPage.jsx`

Compares the participation finance quote with a configurable benchmark scenario.

### `NedirPage.jsx`

Explains the product and system logic behind the Murabaha model in this project.

### `HakkindaPage.jsx`

Summarizes product intent, architecture, and engineering outputs.

## 6. Quality Controls

- Backend behavior is covered by `backend/test_api.py`.
- Production frontend build is validated through `npm run build`.
- The backend uses `decimal` and `ROUND_HALF_UP` for pricing consistency.

## 7. Limitations

- No real identity verification
- No live banking integrations
- No real credit scoring or compliance engine
- No persistent backend database

These are deliberate boundaries for a portfolio prototype.
