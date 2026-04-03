import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  buildFormStateKey,
  buildFormFromProduct,
  computeBenchmark,
  fetchProductCatalog,
  formatCurrency,
  formatPercent,
  isQuoteFormReady,
  isRequestCanceled,
} from "../lib/kataplan";

const API = "/api/calculate";

const comparisonRows = [
  ["Sözleşme yapısı", "Varlığa dayalı satış ilişkisi", "Nakit finansman varsayımı"],
  ["Maliyet yaklaşımı", "Sabit ve açıklanan kâr", "Faiz ve masraf varsayımı"],
  ["Şeffaflık", "Toplam satış bedeli baştan görünür", "Toplam maliyet varsayıma bağlı değişir"],
  ["İşlem yüzeyi", "Teklif + kurallar + işlem adımları", "Referans maliyet görünümü"],
];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function ComparisonCard({ tone, badge, monthly, total, detailA, detailB }) {
  return (
    <div className={`card compare-surface ${tone}`}>
      <span className={`badge ${tone === "green" ? "badge-green" : "badge-red"}`}>{badge}</span>
      <p className="mini-label">Aylık ödeme</p>
      <h2 className="compare-number">{monthly}</h2>
      <div className="compare-detail-list">
        <div className="summary-row"><span>Toplam maliyet</span><strong>{total}</strong></div>
        <div className="summary-row"><span>{detailA.label}</span><strong>{detailA.value}</strong></div>
        <div className="summary-row"><span>{detailB.label}</span><strong>{detailB.value}</strong></div>
      </div>
    </div>
  );
}

function CompactField({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

export default function KarsilastirPage() {
  const [catalog, setCatalog] = useState(null);
  const [form, setForm] = useState(null);
  const [quote, setQuote] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [referenceInput, setReferenceInput] = useState({ annual_rate: "24.50", fee: "3500" });
  const hasRequestedQuoteRef = useRef(false);
  const lastQuoteRequestKeyRef = useRef("");

  const debouncedForm = useDebounce(form, hasRequestedQuoteRef.current ? 180 : 0);

  useEffect(() => {
    fetchProductCatalog()
      .then((data) => {
        setCatalog(data);
        setForm(buildFormFromProduct(data.products[0]));
      })
      .catch(() => setErrors(["Karşılaştırma altyapısı yüklenemedi."]));
  }, []);

  useEffect(() => {
    if (!isQuoteFormReady(debouncedForm)) {
      setLoading(false);
      return;
    }

    const requestKey = buildFormStateKey(debouncedForm);
    if (requestKey === lastQuoteRequestKeyRef.current) {
      return;
    }

    lastQuoteRequestKeyRef.current = requestKey;
    hasRequestedQuoteRef.current = true;
    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      try {
        const { data } = await axios.post(API, debouncedForm, {
          signal: controller.signal,
        });
        setQuote(data);
        setErrors([]);
      } catch (error) {
        if (isRequestCanceled(error)) return;
        setQuote(null);
        setErrors(error.response?.data?.errors || ["Karşılaştırma üretilemedi."]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => controller.abort();
  }, [debouncedForm]);

  const reference = useMemo(
    () => computeBenchmark(quote, referenceInput),
    [quote, referenceInput]
  );

  if (!catalog || !form) {
    return (
      <div className="page">
        <div className="card" style={{ padding: "2rem" }}>Referans karşılaştırma hazırlanıyor...</div>
      </div>
    );
  }

  const totalSaving = reference ? reference.delta_total * -1 : 0;
  const monthlySaving = reference ? reference.delta_monthly * -1 : 0;
  const positiveScenario = totalSaving >= 0;

  return (
    <div className="page">
      <div className="page-headline">
        <div>
          <div className="section-tag" style={{ marginBottom: ".8rem" }}>Referans Karşılaştırma</div>
          <h1 style={{ fontSize: "clamp(2rem,4vw,2.7rem)", fontWeight: 850 }}>
            Bu teklif neden daha avantajlı?
          </h1>
          <p className="hero-copy">
            Aynı tutar ve vade üzerinden katılım finansmanı teklifini referans bir kredi senaryosuyla
            karşılaştırın. En kritik fark, toplam maliyet ve aylık ödeme düzeyinde tek bakışta görünür olsun.
          </p>
        </div>
        {loading && <div className="inline-note">Karşılaştırma güncelleniyor...</div>}
      </div>

      <div className="card compare-input-card">
        <div className="compact-grid">
          <CompactField label="Ürün">
            <select
              className="input"
              value={form.product_type}
              onChange={(event) => {
                const next = catalog.products.find((item) => item.id === event.target.value);
                if (!next) return;
                setForm(buildFormFromProduct(next));
              }}
            >
              {catalog.products.map((product) => (
                <option key={product.id} value={product.id}>{product.label}</option>
              ))}
            </select>
          </CompactField>
          <CompactField label="Varlık bedeli">
            <input
              className="input"
              type="number"
              value={form.asset_price}
              onChange={(event) => setForm((current) => ({ ...current, asset_price: event.target.value }))}
            />
          </CompactField>
          <CompactField label="Peşinat">
            <input
              className="input"
              type="number"
              value={form.down_payment}
              onChange={(event) => setForm((current) => ({ ...current, down_payment: event.target.value }))}
            />
          </CompactField>
          <CompactField label="Vade">
            <input
              className="input"
              type="number"
              value={form.months}
              onChange={(event) => setForm((current) => ({ ...current, months: event.target.value }))}
            />
          </CompactField>
          <CompactField label="Referans faiz oranı">
            <input
              className="input"
              type="number"
              step="0.01"
              value={referenceInput.annual_rate}
              onChange={(event) => setReferenceInput((current) => ({ ...current, annual_rate: event.target.value }))}
            />
          </CompactField>
          <CompactField label="Referans masraf">
            <input
              className="input"
              type="number"
              value={referenceInput.fee}
              onChange={(event) => setReferenceInput((current) => ({ ...current, fee: event.target.value }))}
            />
          </CompactField>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="card alert-card" style={{ marginTop: "1rem" }}>
          {errors.map((error) => <p key={error} className="error-line">{error}</p>)}
        </div>
      )}

      {quote && reference && (
        <>
          <div className="compare-premium-grid">
            <ComparisonCard
              tone="green"
              badge="Katılım Finansmanı"
              monthly={formatCurrency(quote.pricing.monthly_installment)}
              total={formatCurrency(quote.pricing.total_sale_price)}
              detailA={{ label: "Kâr tutarı", value: formatCurrency(quote.pricing.disclosed_profit) }}
              detailB={{ label: "Ödenebilirlik analizi", value: formatPercent(quote.pricing.debt_service_ratio) }}
            />
            <ComparisonCard
              tone="red"
              badge="Referans Karşılaştırma"
              monthly={formatCurrency(reference.monthly)}
              total={formatCurrency(reference.total)}
              detailA={{ label: "Faiz tutarı", value: formatCurrency(reference.interest) }}
              detailB={{ label: "Ödenebilirlik analizi", value: formatPercent(reference.dti) }}
            />
          </div>

          <div className={`delta-hero ${positiveScenario ? "positive" : "negative"}`}>
            <div className="delta-copy">
              <span className="panel-label" style={{ color: positiveScenario ? "var(--emerald-soft)" : "#f87171" }}>
                Delta Özeti
              </span>
              <h2>
                {positiveScenario ? "Daha düşük toplam maliyet" : "Daha yüksek toplam maliyet"}
              </h2>
              <p>
                {positiveScenario
                  ? "Bu senaryoda katılım finansmanı, referans karşılaştırmaya göre daha avantajlı toplam maliyet üretiyor."
                  : "Bu senaryoda referans karşılaştırma daha düşük maliyet üretiyor; oran ve masraf varsayımlarını tekrar gözden geçirin."}
              </p>
            </div>

            <div className="delta-metrics">
              <div>
                <span>Toplam fark</span>
                <strong>{formatCurrency(Math.abs(totalSaving))}</strong>
              </div>
              <div>
                <span>Aylık fark</span>
                <strong>{formatCurrency(Math.abs(monthlySaving))}</strong>
              </div>
            </div>
          </div>

          <div className="result-grid" style={{ marginTop: "1rem" }}>
            <div className="section-card">
              <p className="panel-label">Temel Farklar</p>
              <div className="structural-list">
                {comparisonRows.map(([label, left, right]) => (
                  <div key={label} className="structural-item">
                    <strong>{label}</strong>
                    <p>Katılım finansmanı: {left}</p>
                    <p>Referans karşılaştırma: {right}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="section-card">
              <p className="panel-label">Kural Motoru Bulguları</p>
              <div className="check-stack compact">
                {quote.policy_checks.map((item) => (
                  <div key={`${item.label}-${item.details}`} className={`check-item ${item.status}`}>
                    <strong>{item.label}</strong>
                    <p>{item.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
