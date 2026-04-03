import os
import sys
import unittest
import importlib


CURRENT_DIR = os.path.dirname(__file__)
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)


from app import app  # noqa: E402
from logic import calculate_financing_quote, get_product_catalog  # noqa: E402


class FinancingApiTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_products_catalog_includes_vehicle(self):
        response = self.client.get("/api/products")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        product_ids = {item["id"] for item in payload["products"]}
        self.assertIn("vehicle", product_ids)
        self.assertIn("mobile", {item["id"] for item in payload["channels"]})

    def test_calculate_generates_indicative_quote(self):
        response = self.client.post(
            "/api/calculate",
            json={
                "product_type": "vehicle",
                "asset_condition": "new",
                "asset_price": 950000,
                "down_payment": 250000,
                "months": 24,
                "monthly_income": 135000,
                "existing_commitments": 10000,
                "channel": "mobile",
                "customer_segment": "salary",
            },
        )
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["eligibility"]["status"], "eligible")
        self.assertEqual(payload["request"]["product_type"], "vehicle")
        self.assertEqual(len(payload["schedule"]), 24)

    def test_vehicle_policy_rejects_low_down_payment(self):
        result, errors = calculate_financing_quote(
            {
                "product_type": "vehicle",
                "asset_condition": "used",
                "asset_price": 800000,
                "down_payment": 100000,
                "months": 24,
                "monthly_income": 100000,
                "existing_commitments": 10000,
                "channel": "mobile",
                "customer_segment": "standard",
            }
        )
        self.assertIsNone(result)
        self.assertTrue(any("minimum peşinat oranı" in error.lower() for error in errors))

    def test_vehicle_policy_rejects_used_vehicle_term_above_limit(self):
        response = self.client.post(
            "/api/calculate",
            json={
                "product_type": "vehicle",
                "asset_condition": "used",
                "asset_price": 650000,
                "down_payment": 200000,
                "months": 48,
                "monthly_income": 95000,
                "existing_commitments": 7000,
                "channel": "branch",
                "customer_segment": "standard",
            },
        )
        self.assertEqual(response.status_code, 422)
        self.assertIn("vade en fazla 36 ay", response.get_json()["errors"][0].lower())

    def test_openapi_document_exposes_calculate_path(self):
        response = self.client.get("/api/openapi.json")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertIn("/api/calculate", payload["paths"])


class CatalogTests(unittest.TestCase):
    def test_catalog_is_cached_and_has_multiple_products(self):
        catalog = get_product_catalog()
        self.assertGreaterEqual(len(catalog["products"]), 4)
        vehicle = next(item for item in catalog["products"] if item["id"] == "vehicle")
        self.assertEqual(vehicle["constraints"]["max_months"]["new"], 48)

    def test_backend_app_is_importable_as_package_module(self):
        repo_root = os.path.dirname(CURRENT_DIR)
        if repo_root not in sys.path:
            sys.path.insert(0, repo_root)

        backend_app = importlib.import_module("backend.app")
        self.assertTrue(hasattr(backend_app, "app"))


if __name__ == "__main__":
    unittest.main()
