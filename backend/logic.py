"""
KataPlan – Murabaha Financing Calculator
Uses Python's decimal module for financial accuracy.
"""

from decimal import Decimal, ROUND_HALF_UP, InvalidOperation


def validate_inputs(product_price, months, profit_rate):
    """Validate and sanitize user inputs. Returns (clean_values, error)."""
    errors = []

    # --- Product Price ---
    try:
        price = Decimal(str(product_price))
        if price <= 0:
            errors.append("Product price must be greater than zero.")
    except (InvalidOperation, ValueError, TypeError):
        errors.append("Product price must be a valid number.")
        price = None

    # --- Months ---
    try:
        month_count = int(months)
        if month_count <= 0:
            errors.append("Number of months must be at least 1.")
        elif month_count > 120:
            errors.append("Number of months cannot exceed 120 (10 years).")
    except (ValueError, TypeError):
        errors.append("Months must be a valid integer.")
        month_count = None

    # --- Profit Rate ---
    try:
        rate = Decimal(str(profit_rate))
        if rate < 0:
            errors.append("Profit rate cannot be negative.")
        elif rate > 100:
            errors.append("Profit rate cannot exceed 100%.")
    except (InvalidOperation, ValueError, TypeError):
        errors.append("Profit rate must be a valid number.")
        rate = None

    if errors:
        return None, errors

    return {"price": price, "months": month_count, "rate": rate}, None


def calculate_murabaha(product_price, months, profit_rate):
    """
    Calculate Murabaha financing details.

    Murabaha Model:
        Total Cost = Product Price + (Product Price × Profit Rate / 100)
        Monthly Payment = Total Cost / Months
    """
    validated, errors = validate_inputs(product_price, months, profit_rate)
    if errors:
        return None, errors

    price = validated["price"]
    month_count = validated["months"]
    rate = validated["rate"]

    TWO_PLACES = Decimal("0.01")

    total_profit = (price * rate / Decimal("100")).quantize(TWO_PLACES, rounding=ROUND_HALF_UP)
    total_payment = (price + total_profit).quantize(TWO_PLACES, rounding=ROUND_HALF_UP)
    monthly_payment = (total_payment / Decimal(str(month_count))).quantize(TWO_PLACES, rounding=ROUND_HALF_UP)

    # Build installment list
    installments = []
    remaining = total_payment
    for i in range(1, month_count + 1):
        remaining -= monthly_payment
        if remaining < 0:
            remaining = Decimal("0.00")
        installments.append({
            "month": i,
            "payment": str(monthly_payment),
            "remaining_balance": str(remaining.quantize(TWO_PLACES, rounding=ROUND_HALF_UP)),
        })

    result = {
        "product_price": str(price),
        "total_payment": str(total_payment),
        "monthly_payment": str(monthly_payment),
        "total_profit": str(total_profit),
        "months": month_count,
        "profit_rate": str(rate),
        "installments": installments,
    }

    return result, None
