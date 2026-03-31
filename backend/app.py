"""
KataPlan – Flask API
Provides a single endpoint for Murabaha financing calculations.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from logic import calculate_murabaha

app = Flask(__name__)
CORS(app)


@app.route("/api/calculate", methods=["POST"])
def calculate():
    data = request.get_json()

    if not data:
        return jsonify({"errors": ["Request body must be valid JSON."]}), 400

    product_price = data.get("product_price")
    months = data.get("months")
    profit_rate = data.get("profit_rate")

    # Check for missing fields
    missing = []
    if product_price is None or product_price == "":
        missing.append("product_price")
    if months is None or months == "":
        missing.append("months")
    if profit_rate is None or profit_rate == "":
        missing.append("profit_rate")

    if missing:
        return jsonify({"errors": [f"Missing required field: {f}" for f in missing]}), 400

    result, errors = calculate_murabaha(product_price, months, profit_rate)

    if errors:
        return jsonify({"errors": errors}), 422

    return jsonify(result), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
