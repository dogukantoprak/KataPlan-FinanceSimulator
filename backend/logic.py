"""
KataPlan financing engine.

This module powers a bank-style participation finance prototype built around
Murabaha pricing, product policies, eligibility checks, and transparent quote
generation.
"""

from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
from functools import lru_cache
from uuid import uuid4


TWO_PLACES = Decimal("0.01")
ZERO = Decimal("0.00")
POLICY_VERSION = "2026.04"
FORMULA_VERSION = "murabaha-disclosed-profit-v2"


CHANNELS = {
    "mobile": {
        "label": "Dijital Kanal",
        "description": "Mobil ve self-servis kanal için gösterim amaçlı teklifleme.",
        "rate_adjustment": Decimal("-0.60"),
    },
    "branch": {
        "label": "Şube Destekli Kanal",
        "description": "Şube destekli akış için gösterim amaçlı teklifleme.",
        "rate_adjustment": Decimal("0.00"),
    },
}


CUSTOMER_SEGMENTS = {
    "standard": {
        "label": "Standart Müşteri",
        "description": "Kampanya indirimi uygulanmayan temel segment.",
        "rate_adjustment": Decimal("0.00"),
    },
    "salary": {
        "label": "Maaş Müşterisi",
        "description": "İlişki indirimi tanımlanan müşteri segmenti.",
        "rate_adjustment": Decimal("-0.45"),
    },
    "premium": {
        "label": "Özel Müşteri",
        "description": "Artırılmış ilişki indirimi tanımlanan segment.",
        "rate_adjustment": Decimal("-0.75"),
    },
}


PRODUCTS = {
    "vehicle": {
        "label": "Dijital Taşıt Finansmanı",
        "short_label": "Taşıt",
        "asset_label": "Taşıt bedeli",
        "description": (
            "Sıfır veya ikinci el araçlar için şeffaf kâr yapısı ve dijital ön "
            "başvuru akışı ile kurgulanmış finansman senaryosu."
        ),
        "badge": "Bireysel",
        "min_asset_price": Decimal("100000"),
        "max_asset_price": Decimal("4000000"),
        "min_down_payment_pct": {"new": Decimal("20"), "used": Decimal("25")},
        "max_months": {"new": 48, "used": 36},
        "base_annual_profit_rate": Decimal("21.90"),
        "condition_rate_adjustment": {"new": Decimal("0.00"), "used": Decimal("0.55")},
        "arrangement_fee_pct": Decimal("0.40"),
        "arrangement_fee_min": Decimal("950"),
        "arrangement_fee_max": Decimal("3900"),
        "disposable_income_floor": Decimal("18000"),
        "stress_disposable_income_floor": Decimal("9500"),
        "max_financing_to_income_multiple": Decimal("18"),
        "defaults": {
            "asset_price": "1050000",
            "down_payment": "280000",
            "months": 24,
            "monthly_income": "115000",
            "existing_commitments": "15000",
            "asset_condition": "new",
            "channel": "mobile",
            "customer_segment": "salary",
        },
        "documents": [
            "T.C. kimlik kartı veya ikamet izni",
            "Güncel gelir belgesi / maaş bordrosu",
            "Araç faturası veya proforma fatura",
            "Araç ilanı ya da ruhsat bilgisi",
            "Gerekirse teminat / kefil evrakı",
        ],
        "journey_steps": [
            "Gösterim amaçlı teklif oluşturulur ve temel uygunluk kontrol edilir.",
            "Fatura ve gelir belgeleri hazırlanır.",
            "Ekspertiz ve nihai risk incelemesi tamamlanır.",
            "Sözleşme imzalanır ve ödeme satıcıya yönlendirilir.",
        ],
        "policy_notes": [
            "İkinci el araç senaryolarında daha sıkı vade ve peşinat sınırları uygulanabilir.",
            "Nihai onay kredi, ekspertiz ve evrak kontrolüne bağlıdır.",
        ],
    },
    "home_improvement": {
        "label": "Konut İyileştirme Finansmanı",
        "short_label": "Konut",
        "asset_label": "Proje bedeli",
        "description": (
            "Tadilat, mobilya ve belgelenmiş konut iyileştirme kalemleri için "
            "oluşturulan katılım finansmanı senaryosu."
        ),
        "badge": "Konut",
        "min_asset_price": Decimal("50000"),
        "max_asset_price": Decimal("1500000"),
        "min_down_payment_pct": {"default": Decimal("15")},
        "max_months": {"default": 36},
        "base_annual_profit_rate": Decimal("18.90"),
        "condition_rate_adjustment": {},
        "arrangement_fee_pct": Decimal("0.35"),
        "arrangement_fee_min": Decimal("850"),
        "arrangement_fee_max": Decimal("3200"),
        "disposable_income_floor": Decimal("16000"),
        "stress_disposable_income_floor": Decimal("8500"),
        "max_financing_to_income_multiple": Decimal("15"),
        "defaults": {
            "asset_price": "350000",
            "down_payment": "75000",
            "months": 18,
            "monthly_income": "90000",
            "existing_commitments": "12000",
            "asset_condition": "standard",
            "channel": "mobile",
            "customer_segment": "standard",
        },
        "documents": [
            "T.C. kimlik kartı veya ikamet izni",
            "Güncel gelir belgesi",
            "Tedarikçi faturası / proforma fatura",
            "Proje veya alışveriş dökümü",
        ],
        "journey_steps": [
            "Gösterim amaçlı tadilat teklifi oluşturulur.",
            "Faturalar ve tedarikçi bilgileri paylaşılır.",
            "Gelir ve politika kontrolü tamamlanır.",
            "Satış sözleşmesi ve ödeme akışı yürütülür.",
        ],
        "policy_notes": [
            "Sadece belgelenmiş proje maliyetleri teklife dahil edilir.",
            "Tedarikçi ve fatura doğrulaması nihai teklifi değiştirebilir.",
        ],
    },
    "education": {
        "label": "Eğitim Finansmanı",
        "short_label": "Eğitim",
        "asset_label": "Eğitim bedeli",
        "description": (
            "Öğrenim ücreti ve belgelenmiş eğitim giderleri için açık ödeme planı "
            "sunan finansman senaryosu."
        ),
        "badge": "Yaşam",
        "min_asset_price": Decimal("30000"),
        "max_asset_price": Decimal("600000"),
        "min_down_payment_pct": {"default": Decimal("10")},
        "max_months": {"default": 24},
        "base_annual_profit_rate": Decimal("16.50"),
        "condition_rate_adjustment": {},
        "arrangement_fee_pct": Decimal("0.25"),
        "arrangement_fee_min": Decimal("650"),
        "arrangement_fee_max": Decimal("1800"),
        "disposable_income_floor": Decimal("14000"),
        "stress_disposable_income_floor": Decimal("7500"),
        "max_financing_to_income_multiple": Decimal("12"),
        "defaults": {
            "asset_price": "180000",
            "down_payment": "20000",
            "months": 12,
            "monthly_income": "70000",
            "existing_commitments": "8000",
            "asset_condition": "standard",
            "channel": "mobile",
            "customer_segment": "salary",
        },
        "documents": [
            "T.C. kimlik kartı veya ikamet izni",
            "Güncel gelir belgesi",
            "Okul kabul yazısı / fatura / ücret dökümü",
            "Ödemeyi farklı kişi yapıyorsa destekleyici evrak",
        ],
        "journey_steps": [
            "Gösterim amaçlı eğitim teklifi oluşturulur.",
            "Okul ve fatura belgeleri hazırlanır.",
            "Ödeyici gelir bilgisi ve ödenebilirlik analizi tamamlanır.",
            "Sözleşme imzalanır ve ödeme kuruma yönlendirilir.",
        ],
        "policy_notes": [
            "Eğitim hizmeti kabul edilen belgelerle doğrulanmalıdır.",
            "Nihai vade kurum ve gider türüne göre değişebilir.",
        ],
    },
    "technology": {
        "label": "Teknoloji Finansmanı",
        "short_label": "Teknoloji",
        "asset_label": "Sepet tutarı",
        "description": (
            "Belgelenmiş elektronik ve teknoloji alışverişleri için kısa vadeli, "
            "sabit kâr yapılı finansman senaryosu."
        ),
        "badge": "Alışveriş",
        "min_asset_price": Decimal("15000"),
        "max_asset_price": Decimal("350000"),
        "min_down_payment_pct": {"default": Decimal("20")},
        "max_months": {"default": 12},
        "base_annual_profit_rate": Decimal("19.75"),
        "condition_rate_adjustment": {},
        "arrangement_fee_pct": Decimal("0.20"),
        "arrangement_fee_min": Decimal("350"),
        "arrangement_fee_max": Decimal("950"),
        "disposable_income_floor": Decimal("12000"),
        "stress_disposable_income_floor": Decimal("6500"),
        "max_financing_to_income_multiple": Decimal("8"),
        "defaults": {
            "asset_price": "95000",
            "down_payment": "25000",
            "months": 6,
            "monthly_income": "65000",
            "existing_commitments": "6000",
            "asset_condition": "standard",
            "channel": "mobile",
            "customer_segment": "standard",
        },
        "documents": [
            "T.C. kimlik kartı veya ikamet izni",
            "Güncel gelir belgesi",
            "Satıcı faturası / sepet dökümü",
        ],
        "journey_steps": [
            "Gösterim amaçlı sepet teklifi oluşturulur.",
            "Fatura ve gelir bilgileri paylaşılır.",
            "Politika incelemesi tamamlanır.",
            "Sözleşme ve satıcı ödeme adımı sonuçlandırılır.",
        ],
        "policy_notes": [
            "Gösterim amaçlı teklifler belgelenmiş teknoloji alışverişleri ile sınırlıdır.",
            "Kampanya koşulları satıcıya veya kanala göre değişebilir.",
        ],
    },
}


def quantize_money(value: Decimal) -> Decimal:
    return value.quantize(TWO_PLACES, rounding=ROUND_HALF_UP)


def decimal_to_str(value: Decimal) -> str:
    return format(quantize_money(value), "f")


def percentage_to_str(value: Decimal) -> str:
    return format(value.quantize(TWO_PLACES, rounding=ROUND_HALF_UP), "f")


def add_months(dt: datetime, months: int) -> datetime:
    month_index = dt.month - 1 + months
    year = dt.year + month_index // 12
    month = month_index % 12 + 1
    day = min(dt.day, 28)
    return dt.replace(year=year, month=month, day=day)


def product_value(mapping: dict, asset_condition: str, fallback_key: str):
    if asset_condition in mapping:
        return mapping[asset_condition]
    return mapping.get(fallback_key)


def parse_decimal(field_name: str, raw_value, allow_zero: bool = False):
    try:
        value = Decimal(str(raw_value))
    except (InvalidOperation, TypeError, ValueError):
        return None, f"{field_name} alanı geçerli bir sayı olmalıdır."

    if allow_zero:
        if value < 0:
            return None, f"{field_name} alanı negatif olamaz."
    else:
        if value <= 0:
            return None, f"{field_name} alanı sıfırdan büyük olmalıdır."
    return value, None


def parse_integer(field_name: str, raw_value):
    try:
        value = int(raw_value)
    except (TypeError, ValueError):
        return None, f"{field_name} alanı geçerli bir tam sayı olmalıdır."

    if value <= 0:
        return None, f"{field_name} alanı en az 1 olmalıdır."
    return value, None


def normalize_payload(payload):
    if not isinstance(payload, dict):
        return None, ["İstek gövdesi geçerli bir JSON nesnesi olmalıdır."]

    errors = []

    product_type = payload.get("product_type") or payload.get("product")
    if not product_type:
        errors.append("product_type alanı zorunludur.")
        product_type = None
    elif product_type not in PRODUCTS:
        errors.append("product_type desteklenen ürünlerden biri olmalıdır.")

    channel = payload.get("channel") or "mobile"
    if channel not in CHANNELS:
        errors.append("channel alanı mobile veya branch olmalıdır.")

    customer_segment = payload.get("customer_segment") or "standard"
    if customer_segment not in CUSTOMER_SEGMENTS:
        errors.append("customer_segment alanı standard, salary veya premium olmalıdır.")

    raw_asset_price = payload.get("asset_price", payload.get("product_price"))
    raw_down_payment = payload.get("down_payment", "0")
    raw_months = payload.get("months")
    raw_income = payload.get("monthly_income", payload.get("income"))
    raw_commitments = payload.get("existing_commitments", "0")

    if raw_asset_price in (None, ""):
        errors.append("asset_price alanı zorunludur.")
    if raw_months in (None, ""):
        errors.append("months alanı zorunludur.")
    if raw_income in (None, ""):
        errors.append("monthly_income alanı zorunludur.")

    asset_price = None
    if raw_asset_price not in (None, ""):
        asset_price, error = parse_decimal("asset_price", raw_asset_price)
        if error:
            errors.append(error)

    down_payment = None
    if raw_down_payment not in (None, ""):
        down_payment, error = parse_decimal("down_payment", raw_down_payment, allow_zero=True)
        if error:
            errors.append(error)
    else:
        down_payment = ZERO

    months = None
    if raw_months not in (None, ""):
        months, error = parse_integer("months", raw_months)
        if error:
            errors.append(error)

    monthly_income = None
    if raw_income not in (None, ""):
        monthly_income, error = parse_decimal("monthly_income", raw_income)
        if error:
            errors.append(error)

    existing_commitments = None
    if raw_commitments not in (None, ""):
        existing_commitments, error = parse_decimal(
            "existing_commitments", raw_commitments, allow_zero=True
        )
        if error:
            errors.append(error)
    else:
        existing_commitments = ZERO

    manual_profit_rate = payload.get("manual_profit_rate", payload.get("profit_rate"))
    parsed_manual_profit_rate = None
    if manual_profit_rate not in (None, ""):
        parsed_manual_profit_rate, error = parse_decimal(
            "manual_profit_rate", manual_profit_rate, allow_zero=True
        )
        if error:
            errors.append(error)

    asset_condition = payload.get("asset_condition")
    if not asset_condition:
        asset_condition = "new" if product_type == "vehicle" else "standard"

    if product_type == "vehicle":
        if asset_condition not in ("new", "used"):
            errors.append("Taşıt finansmanında asset_condition değeri new veya used olmalıdır.")
    else:
        asset_condition = "standard"

    if errors:
        return None, errors

    return {
        "product_type": product_type,
        "asset_price": asset_price,
        "down_payment": down_payment,
        "months": months,
        "monthly_income": monthly_income,
        "existing_commitments": existing_commitments,
        "channel": channel,
        "customer_segment": customer_segment,
        "asset_condition": asset_condition,
        "manual_profit_rate": parsed_manual_profit_rate,
    }, None


def build_catalog_entry(product_type: str, policy: dict) -> dict:
    constraints = {
        "min_asset_price": decimal_to_str(policy["min_asset_price"]),
        "max_asset_price": decimal_to_str(policy["max_asset_price"]),
        "max_months": deepcopy(policy["max_months"]),
        "min_down_payment_pct": {
            key: percentage_to_str(value)
            for key, value in policy["min_down_payment_pct"].items()
        },
    }

    return {
        "id": product_type,
        "label": policy["label"],
        "short_label": policy["short_label"],
        "asset_label": policy["asset_label"],
        "description": policy["description"],
        "badge": policy["badge"],
        "defaults": deepcopy(policy["defaults"]),
        "constraints": constraints,
        "documents": list(policy["documents"]),
        "journey_steps": list(policy["journey_steps"]),
        "policy_notes": list(policy["policy_notes"]),
        "base_annual_profit_rate": percentage_to_str(policy["base_annual_profit_rate"]),
    }


@lru_cache(maxsize=1)
def get_product_catalog():
    return {
        "products": [
            build_catalog_entry(product_type, policy)
            for product_type, policy in PRODUCTS.items()
        ],
        "channels": [
            {
                "id": channel_id,
                "label": channel["label"],
                "description": channel["description"],
            }
            for channel_id, channel in CHANNELS.items()
        ],
        "customer_segments": [
            {
                "id": segment_id,
                "label": segment["label"],
                "description": segment["description"],
            }
            for segment_id, segment in CUSTOMER_SEGMENTS.items()
        ],
    }


def recommend_profit_rate(data: dict, policy: dict):
    if data["manual_profit_rate"] is not None:
        return (
            data["manual_profit_rate"],
            [
                {
                    "label": "Manuel oran",
                    "delta": percentage_to_str(ZERO),
                    "details": "Gösterim amaçlı teklif, manuel girilen yıllık kâr oranını kullanır.",
                }
            ],
            "manual",
        )

    components = []
    annual_rate = policy["base_annual_profit_rate"]

    components.append(
        {
            "label": "Baz ürün oranı",
            "delta": percentage_to_str(policy["base_annual_profit_rate"]),
            "details": policy["label"],
        }
    )

    channel_adjustment = CHANNELS[data["channel"]]["rate_adjustment"]
    annual_rate += channel_adjustment
    components.append(
        {
            "label": "Kanal etkisi",
            "delta": percentage_to_str(channel_adjustment),
            "details": CHANNELS[data["channel"]]["label"],
        }
    )

    segment_adjustment = CUSTOMER_SEGMENTS[data["customer_segment"]]["rate_adjustment"]
    annual_rate += segment_adjustment
    components.append(
        {
            "label": "Müşteri ilişkisi etkisi",
            "delta": percentage_to_str(segment_adjustment),
            "details": CUSTOMER_SEGMENTS[data["customer_segment"]]["label"],
        }
    )

    condition_adjustment = policy["condition_rate_adjustment"].get(data["asset_condition"], ZERO)
    if condition_adjustment:
        annual_rate += condition_adjustment
        components.append(
            {
                "label": "Varlık durumu etkisi",
                "delta": percentage_to_str(condition_adjustment),
                "details": data["asset_condition"].title(),
            }
        )

    term_adjustment = ZERO
    if data["months"] > 36:
        term_adjustment = Decimal("0.85")
    elif data["months"] > 24:
        term_adjustment = Decimal("0.40")
    elif data["months"] > 12:
        term_adjustment = Decimal("0.15")

    if term_adjustment:
        annual_rate += term_adjustment
        components.append(
            {
                "label": "Vade etkisi",
                "delta": percentage_to_str(term_adjustment),
                "details": f"{data['months']} ay",
            }
        )

    if annual_rate < Decimal("0.00"):
        annual_rate = Decimal("0.00")

    return annual_rate, components, "auto"


def build_schedule(total_sale_price: Decimal, monthly_installment: Decimal, months: int, created_at: datetime):
    remaining = quantize_money(total_sale_price)
    schedule = []

    for month_number in range(1, months + 1):
        payment = monthly_installment
        if month_number == months:
            payment = quantize_money(remaining)

        remaining = quantize_money(remaining - payment)
        if remaining < ZERO:
            remaining = ZERO

        due_date = add_months(created_at, month_number).date().isoformat()
        schedule.append(
            {
                "month": month_number,
                "due_date": due_date,
                "payment": decimal_to_str(payment),
                "remaining_balance": decimal_to_str(remaining),
            }
        )

    return schedule


def build_policy_checks(data: dict, policy: dict, monthly_installment: Decimal):
    asset_condition = data["asset_condition"]
    min_down_payment_pct = product_value(
        policy["min_down_payment_pct"], asset_condition, "default"
    )
    max_months = product_value(policy["max_months"], asset_condition, "default")

    asset_price = data["asset_price"]
    down_payment = data["down_payment"]
    financed_amount = quantize_money(asset_price - down_payment)
    down_payment_pct = (
        quantize_money((down_payment / asset_price) * Decimal("100")) if asset_price else ZERO
    )
    dti = quantize_money(
        ((data["existing_commitments"] + monthly_installment) / data["monthly_income"]) * Decimal("100")
    )
    disposable_income = quantize_money(
        data["monthly_income"] - data["existing_commitments"] - monthly_installment
    )
    financing_to_income = quantize_money(financed_amount / data["monthly_income"])

    checks = []

    def add_check(label, status, details):
        checks.append({"label": label, "status": status, "details": details})

    if asset_price < policy["min_asset_price"] or asset_price > policy["max_asset_price"]:
        add_check(
            "Tutar aralığı",
            "fail",
            (
                f"Beklenen aralık {decimal_to_str(policy['min_asset_price'])} ile "
                f"{decimal_to_str(policy['max_asset_price'])} arasındadır."
            ),
        )
    else:
        add_check("Tutar aralığı", "pass", "Talep edilen tutar ürün limitleri içinde yer alıyor.")

    if down_payment_pct < min_down_payment_pct:
        add_check(
            "Minimum peşinat",
            "fail",
            (
                f"Minimum {percentage_to_str(min_down_payment_pct)}% gerekir, "
                f"girilen oran {percentage_to_str(down_payment_pct)}%."
            ),
        )
    else:
        add_check(
            "Minimum peşinat",
            "pass",
            (
                f"Girilen peşinat oranı {percentage_to_str(down_payment_pct)}%, "
                f"eşik oran ise {percentage_to_str(min_down_payment_pct)}%."
            ),
        )

    if data["months"] > max_months:
        add_check(
            "Azami vade",
            "fail",
            f"Bu senaryoda en fazla {max_months} ay vade kullanılabilir.",
        )
    else:
        add_check(
            "Azami vade",
            "pass",
            f"Talep edilen {data['months']} ay vade ürün sınırı içinde.",
        )

    if dti > Decimal("55.00"):
        add_check(
            "Ödenebilirlik analizi",
            "fail",
            f"Borç servis oranı {percentage_to_str(dti)}%; politika toleransının üzerinde.",
        )
    elif dti > Decimal("42.00"):
        add_check(
            "Ödenebilirlik analizi",
            "warn",
            f"Borç servis oranı {percentage_to_str(dti)}%; manuel inceleme önerilir.",
        )
    else:
        add_check(
            "Ödenebilirlik analizi",
            "pass",
            f"Borç servis oranı {percentage_to_str(dti)}% seviyesinde.",
        )

    if disposable_income < policy["stress_disposable_income_floor"]:
        add_check(
            "Net kullanılabilir gelir",
            "fail",
            (
                f"Kalan gelir {decimal_to_str(disposable_income)}; stres eşiğinin altında."
            ),
        )
    elif disposable_income < policy["disposable_income_floor"]:
        add_check(
            "Net kullanılabilir gelir",
            "warn",
            (
                f"Kalan gelir {decimal_to_str(disposable_income)}; ek inceleme önerilir."
            ),
        )
    else:
        add_check(
            "Net kullanılabilir gelir",
            "pass",
            f"Kalan gelir {decimal_to_str(disposable_income)} seviyesinde.",
        )

    if financing_to_income > policy["max_financing_to_income_multiple"]:
        add_check(
            "Gelire göre finansman yükü",
            "warn",
            (
                f"Finanse edilen tutar, beyan edilen aylık gelirin {format(financing_to_income, 'f')} katı; "
                "daha sıkı politika incelemesi gerekebilir."
            ),
        )
    else:
        add_check("Gelire göre finansman yükü", "pass", "Finansman yükü gösterim amaçlı aralık içinde.")

    return checks


def build_eligibility(checks: list):
    fail_count = sum(1 for item in checks if item["status"] == "fail")
    warn_count = sum(1 for item in checks if item["status"] == "warn")
    score = max(0, 100 - fail_count * 28 - warn_count * 9)

    reasons = [item["details"] for item in checks if item["status"] == "pass"]
    warnings = [item["details"] for item in checks if item["status"] == "warn"]
    blockers = [item["details"] for item in checks if item["status"] == "fail"]

    if fail_count:
        status = "not_eligible"
        title = "Politika uyumsuzluğu tespit edildi"
        summary = (
            "Bu senaryo mevcut politika çerçevesine tam olarak uymuyor. "
            "Vade, peşinat veya ödenebilirlik değerleri gözden geçirilmeli."
        )
    elif warn_count:
        status = "review"
        title = "Manuel inceleme önerilir"
        summary = (
            "Senaryo genel olarak uygulanabilir görünüyor; ancak ödenebilirlik veya finansman yükü "
            "nedeniyle manuel inceleme öneriliyor."
        )
    else:
        status = "eligible"
        title = "Gösterim amaçlı uygun"
        summary = (
            "Senaryo, dijital katılım finansmanı akışındaki temel politika kontrolleriyle uyumlu."
        )

    return {
        "status": status,
        "title": title,
        "summary": summary,
        "score": score,
        "reasons": reasons,
        "warnings": warnings,
        "blockers": blockers,
    }


def build_assumptions(data: dict, policy: dict, annual_rate: Decimal, rate_source: str):
    assumptions = [
        "Bu çıktı eğitim ve portfolyo amaçlı gösterim amaçlı bir teklif üretimidir.",
        "Fiyatlama, eşit taksitli sabit kâr yapısına sahip Murabaha kurgusu varsayımıyla hesaplanır.",
        "Geç ödeme, vergi, sigorta, ekspertiz ve hukuki masraflar ayrıca gösterilmedikçe hesaba dahil edilmez.",
        "Gelir ve mevcut yükümlülük bilgileri kullanıcı beyanıdır; bağımsız doğrulama yapılmamıştır.",
        f"Yıllık kâr oranı kaynağı: {rate_source}. Kullanılan oran {percentage_to_str(annual_rate)}%.",
        f"Ürün politika sürümü {POLICY_VERSION} ve formül sürümü {FORMULA_VERSION} kullanılmıştır.",
    ]

    if data["channel"] == "mobile":
        assumptions.append("Dijital kanal fiyatlaması gösterim amaçlı self-servis avantajı içerir.")
    if data["product_type"] == "vehicle" and data["asset_condition"] == "used":
        assumptions.append("İkinci el taşıt senaryoları ekspertiz ve daha sıkı nihai onay kriterlerine tabi olabilir.")

    assumptions.extend(policy["policy_notes"])
    return assumptions


def build_offer_reference(product_type: str) -> str:
    code = product_type[:3].upper()
    return f"KP-{code}-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid4().hex[:6].upper()}"


def calculate_financing_quote(payload):
    data, errors = normalize_payload(payload)
    if errors:
        return None, errors

    policy = PRODUCTS[data["product_type"]]
    min_down_payment_pct = product_value(
        policy["min_down_payment_pct"], data["asset_condition"], "default"
    )
    max_months = product_value(policy["max_months"], data["asset_condition"], "default")

    business_errors = []
    if data["asset_price"] < policy["min_asset_price"] or data["asset_price"] > policy["max_asset_price"]:
        business_errors.append(
            (
                f"{policy['asset_label']} değeri "
                f"{decimal_to_str(policy['min_asset_price'])} ile {decimal_to_str(policy['max_asset_price'])} arasında olmalıdır."
            )
        )

    if data["down_payment"] >= data["asset_price"]:
        business_errors.append("Peşinat tutarı, varlık bedelinden düşük olmalıdır.")

    if data["months"] > max_months:
        business_errors.append(f"Bu ürün senaryosunda vade en fazla {max_months} ay olabilir.")

    down_payment_pct = (
        quantize_money((data["down_payment"] / data["asset_price"]) * Decimal("100"))
        if data["asset_price"]
        else ZERO
    )
    if down_payment_pct < min_down_payment_pct:
        business_errors.append(
            (
                f"Bu senaryoda minimum peşinat oranı {percentage_to_str(min_down_payment_pct)}% olmalıdır."
            )
        )

    financed_amount = quantize_money(data["asset_price"] - data["down_payment"])
    if financed_amount <= ZERO:
        business_errors.append("Finanse edilen tutar sıfırdan büyük olmalıdır.")

    if business_errors:
        return None, business_errors

    annual_rate, rate_components, rate_source = recommend_profit_rate(data, policy)
    disclosed_profit = quantize_money(
        financed_amount * (annual_rate / Decimal("100")) * (Decimal(data["months"]) / Decimal("12"))
    )
    arrangement_fee = quantize_money(
        financed_amount * (policy["arrangement_fee_pct"] / Decimal("100"))
    )
    if arrangement_fee < policy["arrangement_fee_min"]:
        arrangement_fee = quantize_money(policy["arrangement_fee_min"])
    if arrangement_fee > policy["arrangement_fee_max"]:
        arrangement_fee = quantize_money(policy["arrangement_fee_max"])

    total_sale_price = quantize_money(financed_amount + disclosed_profit + arrangement_fee)
    monthly_installment = quantize_money(total_sale_price / Decimal(data["months"]))
    total_customer_outflow = quantize_money(data["down_payment"] + total_sale_price)
    dti = quantize_money(
        ((data["existing_commitments"] + monthly_installment) / data["monthly_income"]) * Decimal("100")
    )
    disposable_income = quantize_money(
        data["monthly_income"] - data["existing_commitments"] - monthly_installment
    )

    created_at = datetime.now(timezone.utc)
    quote_reference = build_offer_reference(data["product_type"])
    schedule = build_schedule(total_sale_price, monthly_installment, data["months"], created_at)
    policy_checks = build_policy_checks(data, policy, monthly_installment)
    eligibility = build_eligibility(policy_checks)

    result = {
        "request": {
            "product_type": data["product_type"],
            "product_label": policy["label"],
            "asset_condition": data["asset_condition"],
            "channel": data["channel"],
            "customer_segment": data["customer_segment"],
            "asset_price": decimal_to_str(data["asset_price"]),
            "down_payment": decimal_to_str(data["down_payment"]),
            "months": data["months"],
            "monthly_income": decimal_to_str(data["monthly_income"]),
            "existing_commitments": decimal_to_str(data["existing_commitments"]),
        },
        "quote": {
            "offer_reference": quote_reference,
            "created_at": created_at.isoformat(),
            "valid_until": (created_at + timedelta(hours=48)).isoformat(),
            "channel_label": CHANNELS[data["channel"]]["label"],
            "product_badge": policy["badge"],
        },
        "pricing": {
            "asset_price": decimal_to_str(data["asset_price"]),
            "down_payment": decimal_to_str(data["down_payment"]),
            "down_payment_pct": percentage_to_str(down_payment_pct),
            "financed_amount": decimal_to_str(financed_amount),
            "annual_profit_rate": percentage_to_str(annual_rate),
            "term_months": data["months"],
            "disclosed_profit": decimal_to_str(disclosed_profit),
            "arrangement_fee": decimal_to_str(arrangement_fee),
            "monthly_installment": decimal_to_str(monthly_installment),
            "total_sale_price": decimal_to_str(total_sale_price),
            "total_customer_outflow": decimal_to_str(total_customer_outflow),
            "debt_service_ratio": percentage_to_str(dti),
            "residual_income": decimal_to_str(disposable_income),
        },
        "rate_breakdown": {
            "source": rate_source,
            "components": rate_components,
        },
        "eligibility": eligibility,
        "policy_checks": policy_checks,
        "documents": [
            {"name": document, "status": "pending"}
            for document in policy["documents"]
        ],
        "journey_steps": list(policy["journey_steps"]),
        "assumptions": build_assumptions(data, policy, annual_rate, rate_source),
        "schedule": schedule,
        "audit": {
            "policy_version": POLICY_VERSION,
            "formula_version": FORMULA_VERSION,
            "rounding": "ROUND_HALF_UP",
            "generated_at_utc": created_at.isoformat(),
        },
    }

    return result, None
