import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = "/api/calculate";

function useDebounce(val, ms) {
  const [deb, setDeb] = useState(val);
  useEffect(() => {
    const t = setTimeout(() => setDeb(val), ms);
    return () => clearTimeout(t);
  }, [val, ms]);
  return deb;
}

function fmt(val) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency", currency: "TRY", minimumFractionDigits: 2,
  }).format(Number(val));
}

const compareRows = [
  {
    label:      "Finansman Türü",
    katilim:    "Murabaha (Kâr Payı)",
    geleneksel: "Faizli Kredi",
    note:       "Murabaha'da banka ürünü alıp satar; faizli kredide para ödünç verilir.",
    icon:       "🏦",
  },
  {
    label:      "Maliyet Unsuru",
    katilim:    "Sabit Kâr Payı",
    geleneksel: "Değişken / Sabit Faiz",
    note:       "Kâr payı baştan belirlenir; değişmez. Faiz piyasa koşullarına göre artabilir.",
    icon:       "💹",
  },
  {
    label:      "Sözleşme Yapısı",
    katilim:    "Alım-Satım Sözleşmesi",
    geleneksel: "Kredi Sözleşmesi",
    note:       "Murabaha bir ticaret işlemidir; faizli kredi ise bir borç ilişkisidir.",
    icon:       "📄",
  },
  {
    label:      "Fiyat Şeffaflığı",
    katilim:    "Baştan Belirlenir",
    geleneksel: "Faiz Birikimi Belirsiz",
    note:       "Murabaha'da toplam maliyet sözleşme anında netleşir; sürpriz yoktur.",
    icon:       "🔍",
  },
  {
    label:      "Varlık Bağlantısı",
    katilim:    "Gerçek Varlığa Dayalı",
    geleneksel: "Nakit / Soyut",
    note:       "Her Murabaha işlemi gerçek bir ürün veya varlık üzerine kurulur.",
    icon:       "🏠",
  },
  {
    label:      "Kur / Piyasa Etkisi",
    katilim:    "Daha Az Maruz Kalım",
    geleneksel: "Yüksek Maruz Kalım",
    note:       "Sabit kâr payı, faiz oranı dalgalanmalarından koruma sağlar.",
    icon:       "📉",
  },
  {
    label:      "Dini Uyumluluk",
    katilim:    "Riba-Free ✓",
    geleneksel: "Uyumlu Değil",
    note:       "Riba (faiz) İslam hukukunda yasaktır; kâr payı ise meşru bir kazançtır.",
    icon:       "⚖️",
  },
];

export default function KarsilastirPage() {
  const [form, setForm]     = useState({ product_price: "250000", months: "36", profit_rate: "18" });
  const [result, setResult] = useState(null);
  const debForm             = useDebounce(form, 420);

  const calc = useCallback(async (data) => {
    try {
      const res = await axios.post(API, data);
      setResult(res.data);
    } catch { setResult(null); }
  }, []);

  useEffect(() => { calc(debForm); }, [debForm, calc]);

  const price       = result ? Number(result.product_price) : 0;
  const rate        = result ? Number(result.profit_rate)    : 0;
  const months      = result ? result.months                 : 0;

  const convInterest = price * (rate / 100) * (months / 12);
  const convTotal    = price + convInterest;
  const convMonthly  = months > 0 ? convTotal / months : 0;

  const murTotal    = result ? Number(result.total_payment)   : 0;
  const murMonthly  = result ? Number(result.monthly_payment) : 0;
  const murProfit   = result ? Number(result.total_profit)    : 0;

  const diff        = convTotal - murTotal;
  const diffMonthly = convMonthly - murMonthly;

  return (
    <>
      {/* ── Responsive rules ── */}
      <style>{`
        /* Base: prevent any horizontal overflow */
        .karsi-page { box-sizing: border-box; width: 100%; max-width: 100%; overflow-x: hidden; }

        /* Parameter grid: 3 cols on md+, 1 col on mobile */
        .param-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

        /* Cost cards: side-by-side on md+, stacked on mobile */
        .cost-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

        /* Savings banner inner: row on md+, column on mobile */
        .savings-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }

        /* Structural table: 3-col grid on md+, list on mobile */
        .struct-row-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1px; }
        .struct-col-hide { display: block; }

        /* Monthly big number — fluid */
        .monthly-num { font-size: clamp(1.6rem, 5vw, 2.5rem); font-weight: 900; line-height: 1.05; letter-spacing: -0.03em; }

        /* Cost detail rows */
        .cost-detail { display: flex; flex-direction: column; gap: .3rem; margin-top: .85rem; }
        .cost-detail-row { display: flex; justify-content: space-between; padding: .3rem 0; }

        @media (max-width: 680px) {
          /* Stack param inputs */
          .param-grid { grid-template-columns: 1fr; gap: .75rem; }

          /* Stack cost cards */
          .cost-grid  { grid-template-columns: 1fr; }

          /* Savings banner: column */
          .savings-inner { flex-direction: column; align-items: flex-start; }

          /* Structural table: hide geleneksel column, use card-style rows */
          .struct-col-hide { display: none; }
          .struct-row-grid { grid-template-columns: 1fr 1fr; }

          /* Scale down monthly number */
          .monthly-num { font-size: clamp(1.4rem, 7vw, 2rem); }
        }

        @media (max-width: 400px) {
          .monthly-num { font-size: 1.35rem; }
        }
      `}</style>

      <div className="page karsi-page">
        {/* ── Page Header ── */}
        <div style={{ marginBottom: "2rem" }}>
          <div className="section-tag" style={{ marginBottom: ".75rem" }}>Analiz</div>
          <h1 style={{ fontSize: "clamp(1.4rem,4vw,1.9rem)", fontWeight: 800, letterSpacing: "-.02em" }}>
            Karşılaştırma
          </h1>
          <p style={{ color: "var(--color-slate-400)", marginTop: ".4rem", fontSize: ".92rem", maxWidth: "520px" }}>
            Katılım finansmanı ile geleneksel krediyi aynı senaryo üzerinden karşılaştırın.
          </p>
        </div>

        {/* ── Scenario Inputs ── */}
        <div className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem", minWidth: 0 }}>
          <p style={{
            fontSize: ".68rem", color: "var(--color-slate-500)", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: ".1em", marginBottom: ".85rem",
          }}>
            Senaryo Parametreleri
          </p>
          <div className="param-grid">
            {[
              { name: "product_price", label: "Ürün Fiyatı (₺)",     placeholder: "250.000" },
              { name: "months",        label: "Vade (Ay)",             placeholder: "36"      },
              { name: "profit_rate",   label: "Kâr / Faiz Oranı (%)", placeholder: "18"      },
            ].map((f) => (
              <div key={f.name} style={{ minWidth: 0 }}>
                <label className="label">{f.label}</label>
                <input
                  name={f.name} type="number" placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={(e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))}
                  className="input"
                  style={{ minWidth: 0, width: "100%" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Cost Comparison Cards ── */}
        {result && (
          <>
            <div className="cost-grid" style={{ marginBottom: "1rem" }}>
              {/* Katılım card */}
              <div className="card card-lift" style={{
                padding: "1.5rem", minWidth: 0,
                borderColor: "rgba(52,211,153,.25)",
                background: "linear-gradient(160deg, rgba(16,185,129,.09) 0%, rgba(17,31,53,.95) 100%)",
              }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: ".4rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: ".45rem" }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--color-emerald-400)", display: "block", flexShrink: 0 }} />
                    <p style={{ fontSize: ".68rem", fontWeight: 700, color: "var(--color-emerald-400)", textTransform: "uppercase", letterSpacing: ".1em" }}>
                      Katılım Finansmanı
                    </p>
                  </div>
                  <span className="badge badge-green">Riba-Free</span>
                </div>

                {/* Big monthly */}
                <p className="grad monthly-num">
                  {fmt(murMonthly)}
                  <span style={{ fontSize: ".85rem", fontWeight: 500, color: "var(--color-slate-400)", WebkitTextFillColor: "var(--color-slate-400)" }}>/ay</span>
                </p>

                {/* Detail rows */}
                <div className="cost-detail">
                  {[
                    { label: "Toplam Ödenecek", val: fmt(murTotal) },
                    { label: "Kâr Payı",         val: fmt(murProfit) },
                    { label: "Anapara",           val: fmt(result.product_price) },
                  ].map((r, i, arr) => (
                    <div key={i} className="cost-detail-row"
                      style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(148,163,184,.06)" : "none" }}>
                      <span style={{ fontSize: ".76rem", color: "var(--color-slate-500)" }}>{r.label}</span>
                      <span style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--color-slate-200)" }}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geleneksel card */}
              <div className="card card-lift" style={{
                padding: "1.5rem", minWidth: 0,
                borderColor: "rgba(248,113,113,.2)",
                background: "linear-gradient(160deg, rgba(248,113,113,.07) 0%, rgba(17,31,53,.95) 100%)",
              }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: ".4rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: ".45rem" }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#f87171", display: "block", flexShrink: 0 }} />
                    <p style={{ fontSize: ".68rem", fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: ".1em" }}>
                      Geleneksel Kredi
                    </p>
                  </div>
                  <span className="badge badge-red">Faizli</span>
                </div>

                {/* Big monthly */}
                <p className="grad-red monthly-num">
                  {fmt(convMonthly)}
                  <span style={{ fontSize: ".85rem", fontWeight: 500, color: "var(--color-slate-400)", WebkitTextFillColor: "var(--color-slate-400)" }}>/ay</span>
                </p>

                {/* Detail rows */}
                <div className="cost-detail">
                  {[
                    { label: "Toplam Ödenecek", val: fmt(convTotal) },
                    { label: "Faiz Tutarı",      val: fmt(convInterest) },
                    { label: "Anapara",           val: fmt(price) },
                  ].map((r, i, arr) => (
                    <div key={i} className="cost-detail-row"
                      style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(148,163,184,.06)" : "none" }}>
                      <span style={{ fontSize: ".76rem", color: "var(--color-slate-500)" }}>{r.label}</span>
                      <span style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--color-slate-200)" }}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Savings Banner ── */}
            <div style={{
              marginBottom: "1.5rem", padding: "1.25rem 1.5rem", minWidth: 0,
              background: diff > 0 ? "rgba(16,185,129,.07)" : "rgba(248,113,113,.05)",
              border: `1px solid ${diff > 0 ? "rgba(16,185,129,.2)" : "rgba(248,113,113,.18)"}`,
              borderRadius: "1rem",
            }}>
              <div className="savings-inner">
                <div style={{ minWidth: 0 }}>
                  {diff > 0 && (
                    <>
                      <p style={{ fontSize: ".7rem", color: "var(--color-emerald-500)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".3rem" }}>
                        Murabaha ile tasarruf
                      </p>
                      <p style={{ fontSize: "clamp(1.2rem,4vw,1.5rem)", fontWeight: 800, color: "var(--color-emerald-400)" }}>
                        {fmt(diff)} toplam
                      </p>
                      <p style={{ fontSize: ".82rem", color: "var(--color-slate-400)", marginTop: ".15rem" }}>
                        Aylık {fmt(Math.abs(diffMonthly))} daha az ödeme
                      </p>
                    </>
                  )}
                  {diff < 0 && (
                    <>
                      <p style={{ fontSize: ".7rem", color: "#f87171", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".3rem" }}>
                        Bu senaryoda geleneksel daha ucuz
                      </p>
                      <p style={{ fontSize: "clamp(1.2rem,4vw,1.5rem)", fontWeight: 800, color: "#f87171" }}>
                        {fmt(Math.abs(diff))} fark
                      </p>
                    </>
                  )}
                  {diff === 0 && (
                    <p style={{ fontSize: "1rem", color: "var(--color-slate-300)", fontWeight: 600 }}>
                      Her iki model de eşit toplam maliyet üretiyor.
                    </p>
                  )}
                </div>
                {diff > 0 && (
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: ".72rem", color: "var(--color-slate-500)", marginBottom: ".2rem" }}>Tasarruf Oranı</p>
                    <p style={{ fontSize: "clamp(1.5rem,5vw,2rem)", fontWeight: 800, color: "var(--color-emerald-400)" }}>
                      {((diff / convTotal) * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Structural Comparison Table ── */}
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.25rem", minWidth: 0 }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Yapısal Karşılaştırma</h2>
            <p style={{ fontSize: ".8rem", color: "var(--color-slate-500)", marginTop: ".3rem" }}>
              İki finansman modelinin temel farkları
            </p>
          </div>

          {/* Column headers */}
          <div className="struct-row-grid" style={{ marginBottom: ".4rem" }}>
            {["Kriter", "Katılım Finansmanı", "Geleneksel Kredi"].map((h, i) => (
              <div key={i}
                className={i === 2 ? "struct-col-hide" : ""}
                style={{
                  padding: ".45rem .75rem",
                  fontSize: ".66rem", fontWeight: 700,
                  color: i === 1 ? "var(--color-emerald-500)" : i === 2 ? "#f87171" : "var(--color-slate-500)",
                  textTransform: "uppercase", letterSpacing: ".08em",
                }}>
                {h}
              </div>
            ))}
          </div>

          {/* Data rows */}
          {compareRows.map((row, i) => (
            <div key={i}>
              <div
                className="struct-row-grid"
                style={{
                  background: i % 2 === 0 ? "rgba(6,14,26,.35)" : "transparent",
                  borderRadius: ".5rem", overflow: "hidden",
                  transition: "background .15s", cursor: "default",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(16,185,129,.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "rgba(6,14,26,.35)" : "transparent")}
              >
                {/* Kriter */}
                <div style={{ padding: ".65rem .75rem", display: "flex", alignItems: "center", gap: ".45rem", minWidth: 0 }}>
                  <span style={{ fontSize: ".85rem", flexShrink: 0 }}>{row.icon}</span>
                  <span style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--color-slate-300)", wordBreak: "break-word" }}>
                    {row.label}
                  </span>
                </div>
                {/* Katılım */}
                <div style={{ padding: ".65rem .75rem", fontSize: ".8rem", fontWeight: 600, color: "var(--color-emerald-400)", wordBreak: "break-word", minWidth: 0 }}>
                  {row.katilim}
                </div>
                {/* Geleneksel — hidden on mobile via class */}
                <div className="struct-col-hide" style={{ padding: ".65rem .75rem", fontSize: ".8rem", color: "#f87171", fontWeight: 500, wordBreak: "break-word", minWidth: 0 }}>
                  {row.geleneksel}
                </div>
              </div>

              {/* Per-row note */}
              <div style={{
                padding: ".3rem .75rem .5rem calc(.85rem + .45rem + .75rem)",
                fontSize: ".73rem", color: "var(--color-slate-600)", lineHeight: 1.55,
              }}>
                {row.note}
              </div>
            </div>
          ))}

          {/* Mobile: show geleneksel as a note below table */}
          <div className="struct-mobile-note">
            <p style={{ fontSize: ".7rem", color: "var(--color-slate-600)", marginTop: ".75rem", padding: ".5rem .75rem", background: "rgba(248,113,113,.04)", borderRadius: ".5rem", border: "1px solid rgba(248,113,113,.08)" }}>
              <span style={{ color: "#f87171", fontWeight: 700 }}>Geleneksel Kredi Karşılıkları:</span>{" "}
              {compareRows.map((r) => r.geleneksel).join(" · ")}
            </p>
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <div className="info-card">
          <p style={{ fontSize: ".78rem", color: "var(--color-slate-400)", lineHeight: 1.75 }}>
            <strong style={{ color: "var(--color-slate-300)" }}>Not:</strong>{" "}
            Geleneksel kredi karşılaştırması, aynı vade ve oran üzerinden{" "}
            <em>basit faiz</em> yöntemiyle modellenmiştir. Gerçek kredi ürünleri bileşik faiz,
            masraf ve erken ödeme cezası içerebilir. Bu uygulama yalnızca{" "}
            <strong style={{ color: "var(--color-emerald-400)" }}>eğitim amaçlıdır</strong>.
          </p>
        </div>

        {/* Mobile note visibility */}
        <style>{`
          .struct-mobile-note { display: none; }
          @media (max-width: 680px) {
            .struct-mobile-note { display: block; }
          }
        `}</style>
      </div>
    </>
  );
}
