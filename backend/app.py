"""
KataPlan Flask API.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS

try:
    from .logic import calculate_financing_quote, get_product_catalog
except ImportError:
    from logic import calculate_financing_quote, get_product_catalog


app = Flask(__name__)
CORS(app)


def build_openapi_spec():
    return {
        "openapi": "3.1.0",
        "info": {
            "title": "KataPlan Participation Finance API",
            "version": "2.0.0",
            "description": (
                "Indicative participation finance quote engine for a bank-style "
                "digital pre-application prototype."
            ),
        },
        "paths": {
            "/api/health": {
                "get": {
                    "summary": "Health check",
                    "responses": {"200": {"description": "API is healthy."}},
                }
            },
            "/api/products": {
                "get": {
                    "summary": "Product catalog",
                    "responses": {"200": {"description": "Supported products and defaults."}},
                }
            },
            "/api/calculate": {
                "post": {
                    "summary": "Generate an indicative quote",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "required": [
                                        "product_type",
                                        "asset_price",
                                        "down_payment",
                                        "months",
                                        "monthly_income",
                                    ],
                                    "properties": {
                                        "product_type": {"type": "string"},
                                        "asset_condition": {"type": "string"},
                                        "asset_price": {"type": "number"},
                                        "down_payment": {"type": "number"},
                                        "months": {"type": "integer"},
                                        "monthly_income": {"type": "number"},
                                        "existing_commitments": {"type": "number"},
                                        "channel": {"type": "string"},
                                        "customer_segment": {"type": "string"},
                                        "manual_profit_rate": {"type": "number"},
                                    },
                                }
                            }
                        },
                    },
                    "responses": {
                        "200": {"description": "Indicative quote generated."},
                        "400": {"description": "Invalid JSON or missing fields."},
                        "422": {"description": "Business validation failed."},
                    },
                }
            },
            "/api/openapi.json": {
                "get": {
                    "summary": "OpenAPI document",
                    "responses": {"200": {"description": "OpenAPI JSON."}},
                }
            },
        },
    }


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"}), 200


@app.get("/api/products")
def products():
    return jsonify(get_product_catalog()), 200


@app.get("/api/openapi.json")
def openapi_document():
    return jsonify(build_openapi_spec()), 200


@app.post("/api/calculate")
@app.post("/api/quote")
def calculate():
    payload = request.get_json(silent=True)

    if payload is None:
        return jsonify({"errors": ["İstek gövdesi geçerli JSON formatında olmalıdır."]}), 400

    result, errors = calculate_financing_quote(payload)
    if errors:
        status_code = 400 if any("zorunludur" in error or "olmalıdır" in error for error in errors) else 422
        return jsonify({"errors": errors}), status_code

    return jsonify(result), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
