import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  STATUS_META,
  buildFormStateKey,
  buildFormFromProduct,
  buildQueryString,
  createScenarioEntry,
  fetchProductCatalog,
  formatCurrency,
  formatDateTime,
  formatPercent,
  isQuoteFormReady,
  isRequestCanceled,
  loadSavedScenarios,
  mergeFormWithQuery,
  persistScenario,
  printProposal,
  removeSavedScenario,
} from "../lib/kataplan";

const API = "/api/calculate";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function CompactField({ label, children, wide }) {
  return (
    <div style={{ gridColumn: wide ? "1 / -1" : undefined }}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function MoneyCard({ label, value, accent, large }) {
  return (
    <div className={`money-card ${large ? "primary" : ""}`}>
      <span>{label}</span>
      <strong style={{ color: accent || "var(--text)" }}>{value}</strong>
    </div>
  );
}

export default function HesaplaPage() {
  const [, setSearchParams] = useSearchParams();
  const [catalog, setCatalog] = useState(null);
  const [form, setForm] = useState(null);
  const [quote, setQuote] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState(() => loadSavedScenarios());
  const [activeTab, setActiveTab] = useState("summary");
  const [notice, setNotice] = useState("");
  const [showAllSchedule, setShowAllSchedule] = useState(false);
  const initialParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const hasRequestedQuoteRef = useRef(false);
  const lastQuoteRequestKeyRef = useRef("");
  const lastSearchKeyRef = useRef("");

  const debouncedForm = useDebounce(form, hasRequestedQuoteRef.current ? 180 : 0);

  useEffect(() => {
    fetchProductCatalog()
      .then((data) => {
        setCatalog(data);
        const productId = initialParams.get("product_type") || data.products[0]?.id;
        const selected = data.products.find((item) => item.id === productId) || data.products[0];
        setForm(mergeFormWithQuery(buildFormFromProduct(selected), initialParams));
      })
      .catch(() => setErrors(["Ürün kataloğu yüklenemedi."]));
  }, [initialParams]);

  const selectedProduct = useMemo(() => {
    if (!catalog || !form) return null;
    return catalog.products.find((item) => item.id === form.product_type) || catalog.products[0];
  }, [catalog, form]);

  useEffect(() => {
    const searchForm = debouncedForm || form;
    if (!searchForm) return;

    const nextSearchKey = buildFormStateKey(searchForm);
    if (nextSearchKey === lastSearchKeyRef.current) return;

    lastSearchKeyRef.current = nextSearchKey;
    setSearchParams(buildQueryString(searchForm), { replace: true });
  }, [debouncedForm, form, setSearchParams]);

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
        setErrors(error.response?.data?.errors || ["Teklif oluşturulamadı."]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => controller.abort();
  }, [debouncedForm]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleProductSelect = (productId) => {
    const product = catalog?.products?.find((item) => item.id === productId);
    if (!product) return;
    setForm(buildFormFromProduct(product));
    setErrors([]);
    setActiveTab("summary");
    setShowAllSchedule(false);
  };

  const saveScenario = () => {
    if (!quote || !form) return;
    setSavedScenarios(persistScenario(createScenarioEntry(form, quote)));
    setNotice("Senaryo kaydedildi.");
  };

  const loadScenario = (entry) => {
    setForm(entry.form);
    setQuote(entry.quote);
    setActiveTab("summary");
    setShowAllSchedule(false);
    setNotice("Kaydedilmiş senaryo yüklendi.");
  };

  const scheduleRows = showAllSchedule ? quote?.schedule || [] : (quote?.schedule || []).slice(0, 12);
  const statusMeta = STATUS_META[quote?.eligibility?.status] || STATUS_META.review;

  if (!form || !selectedProduct) {
    return (
      <div className="page">
        <div className="card" style={{ padding: "2rem" }}>Finansman deneyimi hazırlanıyor...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-headline">
        <div>
          <div className="section-tag" style={{ marginBottom: ".8rem" }}>Teklif Akışı</div>
          <h1 style={{ fontSize: "clamp(2rem,4vw,2.7rem)", fontWeight: 850 }}>
            Dijital teklif ve ödenebilirlik analizi
          </h1>
          <p className="hero-copy">
            Değeri değiştirin, sistem anında yeni teklif oluştursun. Kural Motoru,
            ödenebilirlik sinyalleri ve işlem adımları aynı yüzeyde görünür kalsın.
          </p>
        </div>
        {loading && <div className="inline-note">Teklif güncelleniyor...</div>}
      </div>

      <div className="quote-layout">
        <aside className="form-rail">
          <div className="card form-card">
            <p className="panel-label">Ürün Seçimi</p>
            <div className="product-segments">
              {catalog.products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className={`segment-btn ${form.product_type === product.id ? "active" : ""}`}
                  onClick={() => handleProductSelect(product.id)}
                >
                  {product.short_label}
                </button>
              ))}
            </div>

            <div className="form-group">
              <p className="group-title">Finansman Bilgileri</p>
              <div className="compact-grid">
                <CompactField label={selectedProduct.asset_label}>
                  <input className="input" name="asset_price" type="number" value={form.asset_price} onChange={handleChange} />
                </CompactField>
                <CompactField label="Peşinat">
                  <input className="input" name="down_payment" type="number" value={form.down_payment} onChange={handleChange} />
                </CompactField>
                <CompactField label="Vade (Ay)">
                  <input className="input" name="months" type="number" value={form.months} onChange={handleChange} />
                </CompactField>
                <CompactField label="Varlık Türü">
                  <select className="input" name="asset_condition" value={form.asset_condition} onChange={handleChange} disabled={form.product_type !== "vehicle"}>
                    <option value={form.product_type === "vehicle" ? "new" : "standard"}>
                      {form.product_type === "vehicle" ? "Sıfır" : "Standart"}
                    </option>
                    {form.product_type === "vehicle" && <option value="used">İkinci El</option>}
                  </select>
                </CompactField>
              </div>
            </div>

            <div className="form-group">
              <p className="group-title">Müşteri Profili</p>
              <div className="compact-grid">
                <CompactField label="Aylık Gelir">
                  <input className="input" name="monthly_income" type="number" value={form.monthly_income} onChange={handleChange} />
                </CompactField>
                <CompactField label="Mevcut Yükümlülük">
                  <input className="input" name="existing_commitments" type="number" value={form.existing_commitments} onChange={handleChange} />
                </CompactField>
                <CompactField label="Kanal">
                  <select className="input" name="channel" value={form.channel} onChange={handleChange}>
                    {catalog.channels.map((channel) => (
                      <option key={channel.id} value={channel.id}>{channel.label}</option>
                    ))}
                  </select>
                </CompactField>
                <CompactField label="Müşteri Segmenti">
                  <select className="input" name="customer_segment" value={form.customer_segment} onChange={handleChange}>
                    {catalog.customer_segments.map((segment) => (
                      <option key={segment.id} value={segment.id}>{segment.label}</option>
                    ))}
                  </select>
                </CompactField>
                <CompactField label="Opsiyonel Yıllık Kâr Oranı" wide>
                  <input
                    className="input"
                    name="manual_profit_rate"
                    type="number"
                    step="0.01"
                    value={form.manual_profit_rate}
                    onChange={handleChange}
                    placeholder="Boş bırakılırsa sistem oranı kullanılır"
                  />
                </CompactField>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-primary" onClick={saveScenario} disabled={!quote}>
                Senaryoyu Kaydet
              </button>
              <button type="button" className="btn-ghost" onClick={() => printProposal(quote)} disabled={!quote}>
                Teklifi Yazdır / PDF
              </button>
            </div>

            {notice && <div className="inline-note">{notice}</div>}
          </div>

          <div className="card saved-card">
            <p className="panel-label">Kaydedilmiş Senaryolar</p>
            {savedScenarios.length === 0 && <p className="soft-copy">Henüz kaydedilmiş senaryo yok.</p>}
            <div className="saved-list">
              {savedScenarios.map((entry) => (
                <div key={entry.id} className="saved-item">
                  <div>
                    <strong>{entry.name}</strong>
                    <p>{formatDateTime(entry.savedAt)}</p>
                  </div>
                  <div className="saved-actions">
                    <button type="button" className="btn-ghost btn-sm" onClick={() => loadScenario(entry)}>
                      Yükle
                    </button>
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      onClick={() => setSavedScenarios(removeSavedScenario(entry.id))}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="result-rail">
          {errors.length > 0 && (
            <div className="card alert-card">
              <p className="panel-label" style={{ color: "#f87171" }}>Kontrol Edilmesi Gerekenler</p>
              {errors.map((error) => <p key={error} className="error-line">{error}</p>)}
            </div>
          )}

          {!quote && !errors.length && (
            <div className="card result-placeholder">
              Varlık bedeli, peşinat ve gelir bilgilerini girin. Teklif sonuçları otomatik olarak burada oluşacaktır.
            </div>
          )}

          {quote && (
            <>
              <div className="card premium-quote-card">
                <div className="quote-topline">
                  <span className={`badge ${statusMeta.className}`}>{statusMeta.label}</span>
                  <span className="soft-copy">{quote.quote.offer_reference}</span>
                </div>

                <div className="quote-spotlight">
                  <MoneyCard
                    label="Aylık ödeme"
                    value={formatCurrency(quote.pricing.monthly_installment)}
                    accent="var(--color-emerald-300)"
                    large
                  />
                  <MoneyCard
                    label="Toplam maliyet"
                    value={formatCurrency(quote.pricing.total_sale_price)}
                  />
                  <MoneyCard
                    label="Kâr tutarı"
                    value={formatCurrency(quote.pricing.disclosed_profit)}
                    accent="var(--color-emerald-400)"
                  />
                </div>

                <div className="quote-secondary-metrics">
                  <div>
                    <span>Finanse tutar</span>
                    <strong>{formatCurrency(quote.pricing.financed_amount)}</strong>
                  </div>
                  <div>
                    <span>Ödenebilirlik analizi</span>
                    <strong>{formatPercent(quote.pricing.debt_service_ratio)}</strong>
                  </div>
                  <div>
                    <span>Net kullanılabilir gelir</span>
                    <strong>{formatCurrency(quote.pricing.residual_income)}</strong>
                  </div>
                </div>

                <p className="hero-copy quote-summary-copy">{quote.eligibility.summary}</p>
              </div>

              <div className="card result-panel">
                <div className="tab-strip">
                  {[
                    ["summary", "Teklif Özeti"],
                    ["process", "İşlem Adımları"],
                    ["schedule", "Ödeme Planı"],
                  ].map(([key, label]) => (
                    <button key={key} type="button" className={activeTab === key ? "active" : ""} onClick={() => setActiveTab(key)}>
                      {label}
                    </button>
                  ))}
                </div>

                {activeTab === "summary" && (
                  <div className="result-grid">
                    <div className="section-card">
                      <p className="panel-label">Fiyatlama Detayı</p>
                      <div className="summary-row"><span>Varlık bedeli</span><strong>{formatCurrency(quote.pricing.asset_price)}</strong></div>
                      <div className="summary-row"><span>Peşinat</span><strong>{formatCurrency(quote.pricing.down_payment)}</strong></div>
                      <div className="summary-row"><span>Tahsis ücreti</span><strong>{formatCurrency(quote.pricing.arrangement_fee)}</strong></div>
                      <div className="summary-row"><span>Toplam müşteri çıkışı</span><strong>{formatCurrency(quote.pricing.total_customer_outflow)}</strong></div>
                    </div>

                    <div className="section-card">
                      <p className="panel-label">Kural Motoru</p>
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
                )}

                {activeTab === "process" && (
                  <div className="result-grid">
                    <div className="section-card">
                      <p className="panel-label">İşlem Adımları</p>
                      <div className="timeline-list">
                        {quote.journey_steps.map((item, index) => (
                          <div key={item} className="timeline-item">
                            <span>{index + 1}</span>
                            <p>{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="section-card">
                      <p className="panel-label">Gerekli Belgeler</p>
                      <div className="doc-list">
                        {quote.documents.map((item) => (
                          <label key={item.name} className="doc-item">
                            <input type="checkbox" />
                            <span>{item.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="section-card">
                      <p className="panel-label">Varsayımlar</p>
                      <ul className="bullet-list">
                        {quote.assumptions.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "schedule" && (
                  <div className="section-card">
                    <div className="table-responsive-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Ay</th>
                            <th>Vade tarihi</th>
                            <th>Taksit</th>
                            <th>Kalan bakiye</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scheduleRows.map((row) => (
                            <tr key={row.month}>
                              <td>{row.month}</td>
                              <td>{row.due_date}</td>
                              <td>{formatCurrency(row.payment)}</td>
                              <td>{formatCurrency(row.remaining_balance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {quote.schedule.length > 12 && (
                      <button type="button" className="btn-ghost" onClick={() => setShowAllSchedule((current) => !current)}>
                        {showAllSchedule ? "Daha Az Göster" : `Tüm ${quote.schedule.length} taksiti göster`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
