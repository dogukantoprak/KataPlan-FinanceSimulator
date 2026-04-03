import axios from "axios";

const STORAGE_KEY = "kataplan.savedScenarios.v2";
const CATALOG_API = "/api/products";
const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
});
const dateTimeFormatter = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
});

let productCatalogCache = null;
let productCatalogPromise = null;

export const STATUS_META = {
  eligible: {
    label: "Gösterim Amaçlı Uygun",
    className: "badge-green",
    tone: "var(--color-emerald-400)",
  },
  review: {
    label: "Manuel İnceleme",
    className: "badge-blue",
    tone: "#60a5fa",
  },
  not_eligible: {
    label: "Uygunluk Sorunu",
    className: "badge-red",
    tone: "#f87171",
  },
};

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0));
}

export function formatPercent(value) {
  return `%${Number(value || 0).toFixed(2)}`;
}

export function formatDateTime(value) {
  if (!value) return "-";
  return dateTimeFormatter.format(new Date(value));
}

export function buildFormFromProduct(product) {
  const defaults = product?.defaults || {};
  return {
    product_type: product?.id || "vehicle",
    asset_condition: defaults.asset_condition || "new",
    asset_price: defaults.asset_price || "",
    down_payment: defaults.down_payment || "0",
    months: String(defaults.months || 12),
    monthly_income: defaults.monthly_income || "",
    existing_commitments: defaults.existing_commitments || "0",
    channel: defaults.channel || "mobile",
    customer_segment: defaults.customer_segment || "standard",
    manual_profit_rate: "",
  };
}

export function mergeFormWithQuery(baseForm, searchParams) {
  const next = { ...baseForm };
  [
    "product_type",
    "asset_condition",
    "asset_price",
    "down_payment",
    "months",
    "monthly_income",
    "existing_commitments",
    "channel",
    "customer_segment",
    "manual_profit_rate",
  ].forEach((key) => {
    const value = searchParams.get(key);
    if (value !== null) next[key] = value;
  });
  return next;
}

export function buildQueryString(form) {
  const params = new URLSearchParams();
  Object.entries(form || {}).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.set(key, value);
    }
  });
  return params;
}

export function buildFormStateKey(form) {
  return buildQueryString(form).toString();
}

export function isQuoteFormReady(form) {
  return Boolean(form?.asset_price && form?.months && form?.monthly_income);
}

export async function fetchProductCatalog() {
  if (productCatalogCache) {
    return productCatalogCache;
  }

  if (!productCatalogPromise) {
    productCatalogPromise = axios
      .get(CATALOG_API)
      .then(({ data }) => {
        productCatalogCache = data;
        return data;
      })
      .finally(() => {
        productCatalogPromise = null;
      });
  }

  return productCatalogPromise;
}

export function isRequestCanceled(error) {
  return axios.isCancel?.(error) || error?.code === "ERR_CANCELED";
}

export function loadSavedScenarios() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistScenario(entry) {
  const current = loadSavedScenarios();
  const next = [entry, ...current].slice(0, 8);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function removeSavedScenario(id) {
  const next = loadSavedScenarios().filter((item) => item.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function createScenarioEntry(form, quote) {
  return {
    id: `${Date.now()}`,
    name: `${quote?.request?.product_label || "Senaryo"} / ${formatCurrency(
      quote?.pricing?.monthly_installment
    )}`,
    savedAt: new Date().toISOString(),
    form,
    quote,
  };
}

export function computeBenchmark(quote, benchmarkInput) {
  if (!quote?.pricing) return null;

  const financedAmount = Number(quote.pricing.financed_amount || 0);
  const months = Number(quote.pricing.term_months || 0);
  const annualRate = Number(benchmarkInput?.annual_rate || 0);
  const fee = Number(benchmarkInput?.fee || 0);
  const monthlyIncome = Number(quote.request?.monthly_income || 0);
  const commitments = Number(quote.request?.existing_commitments || 0);

  const interest = financedAmount * (annualRate / 100) * (months / 12);
  const total = financedAmount + interest + fee;
  const monthly = months ? total / months : 0;
  const dti = monthlyIncome ? ((commitments + monthly) / monthlyIncome) * 100 : 0;

  return {
    annual_rate: annualRate,
    fee,
    interest,
    total,
    monthly,
    dti,
    delta_total: total - Number(quote.pricing.total_sale_price || 0),
    delta_monthly: monthly - Number(quote.pricing.monthly_installment || 0),
  };
}

export function printProposal(quote) {
  if (!quote) return;

  const status = STATUS_META[quote.eligibility?.status] || STATUS_META.review;
  const popup = window.open("", "_blank", "noopener,noreferrer,width=1024,height=900");
  if (!popup) return;

  const checks = (quote.policy_checks || [])
    .map(
      (item) => `
        <tr>
          <td>${item.label}</td>
          <td>${item.status}</td>
          <td>${item.details}</td>
        </tr>`
    )
    .join("");

  const documents = (quote.documents || [])
    .map((item) => `<li>${item.name}</li>`)
    .join("");

  const assumptions = (quote.assumptions || [])
    .map((item) => `<li>${item}</li>`)
    .join("");

  popup.document.write(`<!doctype html>
    <html lang="tr">
      <head>
        <meta charset="utf-8" />
        <title>${quote.request.product_label} Teklif Özeti</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
          h1, h2 { margin: 0 0 12px; }
          .muted { color: #475569; }
          .top { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 24px; }
          .card { border: 1px solid #cbd5e1; border-radius: 16px; padding: 18px; margin-bottom: 18px; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
          .metric { background: #f8fafc; border-radius: 12px; padding: 12px; }
          .metric strong { display: block; margin-top: 6px; font-size: 18px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border-bottom: 1px solid #e2e8f0; text-align: left; padding: 10px 8px; }
          ul { margin: 0; padding-left: 18px; }
          .status { color: ${status.tone}; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="top">
          <div>
            <h1>KataPlan Teklif Özeti</h1>
            <div class="muted">${quote.request.product_label}</div>
            <div class="muted">Referans: ${quote.quote.offer_reference}</div>
          </div>
          <div>
            <div class="muted">Oluşturulma: ${formatDateTime(quote.quote.created_at)}</div>
            <div class="muted">Geçerlilik: ${formatDateTime(quote.quote.valid_until)}</div>
            <div class="status">${status.label}</div>
          </div>
        </div>

        <div class="card">
          <h2>Fiyatlama Özeti</h2>
          <div class="grid">
            <div class="metric"><span>Aylık taksit</span><strong>${formatCurrency(
              quote.pricing.monthly_installment
            )}</strong></div>
            <div class="metric"><span>Finanse tutar</span><strong>${formatCurrency(
              quote.pricing.financed_amount
            )}</strong></div>
            <div class="metric"><span>Toplam satış bedeli</span><strong>${formatCurrency(
              quote.pricing.total_sale_price
            )}</strong></div>
            <div class="metric"><span>Peşinat</span><strong>${formatCurrency(
              quote.pricing.down_payment
            )}</strong></div>
            <div class="metric"><span>Yıllık kâr oranı</span><strong>${formatPercent(
              quote.pricing.annual_profit_rate
            )}</strong></div>
            <div class="metric"><span>Ödenebilirlik oranı</span><strong>${formatPercent(
              quote.pricing.debt_service_ratio
            )}</strong></div>
          </div>
        </div>

        <div class="card">
          <h2>Kural Motoru Sonuçları</h2>
          <table>
            <thead><tr><th>Kural</th><th>Durum</th><th>Açıklama</th></tr></thead>
            <tbody>${checks}</tbody>
          </table>
        </div>

        <div class="card">
          <h2>İşlem Adımları</h2>
          <ul>${documents}</ul>
        </div>

        <div class="card">
          <h2>Varsayımlar</h2>
          <ul>${assumptions}</ul>
        </div>
      </body>
    </html>`);

  popup.document.close();
  popup.focus();
  window.setTimeout(() => popup.print(), 250);
}
