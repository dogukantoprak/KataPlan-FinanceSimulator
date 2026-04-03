import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
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

/* ── Pure-SVG Donut Chart ── */
function DonutChart({ principal, profit }) {
  const [hovered, setHovered] = useState(null);
  const total = principal + profit;
  const R = 68;
  const C = 2 * Math.PI * R;
  const principalArc = (principal / total) * C;
  const profitArc    = (profit    / total) * C;
  const profitPct    = ((profit    / total) * 100).toFixed(1);
  const principalPct = ((principal / total) * 100).toFixed(1);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
      <svg width="160" height="160" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
        {/* track */}
        <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(148,163,184,.08)" strokeWidth="22" />
        {/* principal arc – blue */}
        <circle cx="80" cy="80" r={R} fill="none"
          stroke={hovered === "profit" ? "rgba(96,165,250,.3)" : "#3b82f6"}
          strokeWidth="22"
          strokeDasharray={`${principalArc} ${C - principalArc}`}
          strokeDashoffset={C * 0.25}
          strokeLinecap="butt"
          style={{ transition: "stroke .3s, opacity .3s", opacity: hovered === "profit" ? .35 : 1 }}
          onMouseEnter={() => setHovered("principal")}
          onMouseLeave={() => setHovered(null)}
        />
        {/* profit arc – emerald */}
        <circle cx="80" cy="80" r={R} fill="none"
          stroke={hovered === "principal" ? "rgba(16,185,129,.3)" : "#10b981"}
          strokeWidth="22"
          strokeDasharray={`${profitArc} ${C - profitArc}`}
          strokeDashoffset={C * 0.25 - principalArc}
          strokeLinecap="butt"
          style={{ transition: "stroke .3s, opacity .3s", opacity: hovered === "principal" ? .35 : 1 }}
          onMouseEnter={() => setHovered("profit")}
          onMouseLeave={() => setHovered(null)}
        />
        {/* center label */}
        <text x="80" y="74" textAnchor="middle" fill="#f1f5f9" fontSize="15" fontWeight="700" fontFamily="Inter,sans-serif">
          {hovered === "principal" ? `${principalPct}%` : hovered === "profit" ? `${profitPct}%` : ""}
        </text>
        <text x="80" y="92" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="Inter,sans-serif">
          {hovered === "principal" ? "Anapara" : hovered === "profit" ? "Kâr Payı" : "Üzerine gelin"}
        </text>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: ".85rem", flex: 1 }}>
        {[
          { label: "Anapara", pct: principalPct, color: "#3b82f6", key: "principal" },
          { label: "Kâr Payı", pct: profitPct,  color: "#10b981", key: "profit"    },
        ].map((item) => (
          <div key={item.key}
            onMouseEnter={() => setHovered(item.key)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: "default" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".3rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".82rem", color: "var(--color-slate-300)", fontWeight: 500 }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, display: "block", flexShrink: 0 }} />
                {item.label}
              </span>
              <span style={{ fontSize: ".82rem", fontWeight: 700, color: item.color }}>{item.pct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Installment Bar Chart (first 12 months) ── */
function BarChart({ installments, maxPayment }) {
  const preview = installments.slice(0, 12);
  const maxBar = Number(maxPayment) * 1.05;

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "72px" }}>
      {preview.map((inst) => {
        const h = (Number(inst.payment) / maxBar) * 72;
        return (
          <div key={inst.month}
            title={`Ay ${inst.month}: ${fmt(inst.payment)}`}
            style={{
              flex: 1, height: `${h}px`,
              background: "linear-gradient(180deg, #10b981 0%, #059669 100%)",
              borderRadius: "3px 3px 0 0",
              opacity: .85,
              transition: "opacity .15s",
              cursor: "default",
              minWidth: "4px",
            }}
            onMouseEnter={(e) => (e.target.style.opacity = "1")}
            onMouseLeave={(e) => (e.target.style.opacity = ".85")}
          />
        );
      })}
    </div>
  );
}

/* ── Empty State ── */
function EmptyState() {
  return (
    <div className="card" style={{ padding: "3.5rem 2rem", textAlign: "center" }}>
      {/* Animated rings */}
      <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto 1.5rem" }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "2px solid rgba(16,185,129,.15)",
        }} />
        <div style={{
          position: "absolute", inset: "8px", borderRadius: "50%",
          border: "2px solid rgba(16,185,129,.25)",
        }} />
        <div style={{
          position: "absolute", inset: "18px", borderRadius: "50%",
          background: "rgba(16,185,129,.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.35rem",
        }}>💰</div>
      </div>
      <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--color-slate-200)", marginBottom: ".4rem" }}>
        Finansman planınızı oluşturun
      </p>
      <p style={{ fontSize: ".85rem", color: "var(--color-slate-500)", lineHeight: 1.6 }}>
        Sol panelden ürün fiyatını girin.<br />Sonuçlar otomatik hesaplanacak.
      </p>
      {/* Mini hint cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".6rem", marginTop: "1.5rem" }}>
        {[
          { icon: "₺", label: "Ürün Fiyatı" },
          { icon: "📅", label: "Vade Seçin" },
          { icon: "%", label: "Kâr Oranı" },
        ].map((h, i) => (
          <div key={i} style={{ padding: ".65rem", background: "rgba(6,14,26,.5)", borderRadius: ".75rem", border: "1px solid rgba(148,163,184,.07)" }}>
            <p style={{ fontSize: "1rem", marginBottom: ".25rem" }}>{h.icon}</p>
            <p style={{ fontSize: ".72rem", color: "var(--color-slate-500)" }}>{h.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HesaplaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [form, setForm] = useState(() => ({
    product_price: searchParams.get("price") || "",
    months: searchParams.get("months") || "12",
    profit_rate: searchParams.get("rate") || "15",
  }));
  
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [tab, setTab]         = useState("plan"); // "plan" | "chart"

  const debForm = useDebounce(form, 420);

  // Sync debounced form to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debForm.product_price) params.set("price", debForm.product_price);
    if (debForm.months) params.set("months", debForm.months);
    if (debForm.profit_rate) params.set("rate", debForm.profit_rate);
    setSearchParams(params, { replace: true });
  }, [debForm, setSearchParams]);

  const calculate = useCallback(async (data) => {
    if (!data.product_price) { setResult(null); setErrors([]); return; }
    setLoading(true);
    try {
      const res = await axios.post(API, data);
      setResult(res.data);
      setErrors([]);
    } catch (err) {
      setErrors(err.response?.data?.errors || ["Sunucuya bağlanılamadı."]);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { calculate(debForm); }, [debForm, calculate]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const displayedInstallments = showAll
    ? result?.installments ?? []
    : result?.installments?.slice(0, 12) ?? [];

  return (
    <div className="page">
      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div className="section-tag" style={{ marginBottom: ".75rem" }}>Murabaha Hesaplama</div>
        <h1 style={{ fontSize: "1.9rem", fontWeight: 800, letterSpacing: "-.02em" }}>Finansman Hesapla</h1>
        <p style={{ color: "var(--color-slate-400)", marginTop: ".4rem", fontSize: ".92rem" }}>
          Ürün fiyatı, vade ve kâr oranını girin — plan anında oluşsun.
        </p>
      </div>

      <div className="calc-outer-grid" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem", alignItems: "start" }}>

        {/* ────── LEFT: Form Panel ────── */}
        <div className="card" style={{ padding: "1.5rem", position: "sticky", top: "72px" }}>
          <p style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--color-slate-500)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: "1.25rem" }}>
            Finansman Parametreleri
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

            {/* Price */}
            <div>
              <label htmlFor="product_price" className="label">Ürün Fiyatı (₺)</label>
              <input id="product_price" name="product_price" type="number" min="0" step="any"
                placeholder="ör. 250.000" value={form.product_price}
                onChange={handleChange} className="input" autoComplete="off" />
            </div>

            {/* Months */}
            <div>
              <label htmlFor="months" className="label">Vade (Ay)</label>
              <input id="months" name="months" type="number" min="1" max="120"
                placeholder="ör. 36" value={form.months}
                onChange={handleChange} className="input" />
              <div style={{ display: "flex", gap: ".35rem", marginTop: ".55rem", flexWrap: "wrap" }}>
                {[12, 24, 36, 48, 60].map((m) => {
                  const active = form.months === String(m);
                  return (
                    <button key={m} onClick={() => setForm((p) => ({ ...p, months: String(m) }))}
                      style={{
                        padding: ".22rem .65rem", borderRadius: ".5rem", fontSize: ".73rem",
                        fontWeight: 600, cursor: "pointer", border: "1px solid",
                        background: active ? "rgba(16,185,129,.15)" : "rgba(148,163,184,.05)",
                        borderColor: active ? "rgba(52,211,153,.4)" : "rgba(148,163,184,.15)",
                        color: active ? "var(--color-emerald-400)" : "var(--color-slate-500)",
                        transition: "all .15s",
                      }}>
                      {m} Ay
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profit rate */}
            <div>
              <label className="label" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Kâr Oranı (%)</span>
                <span style={{ color: "var(--color-emerald-400)", fontWeight: 700, fontSize: ".85rem" }}>
                  %{form.profit_rate || "0"}
                </span>
              </label>
              <input name="profit_rate" type="range" min="0" max="50" step="0.5"
                value={form.profit_rate} onChange={handleChange}
                style={{ width: "100%", accentColor: "var(--color-emerald-500)", cursor: "pointer", marginBottom: ".5rem" }} />
              <input name="profit_rate" type="number" min="0" max="100" step="any"
                value={form.profit_rate} onChange={handleChange} className="input"
                style={{ padding: ".55rem .9rem", fontSize: ".9rem" }} />
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div style={{ marginTop: "1rem", padding: ".75rem", background: "rgba(248,113,113,.07)", border: "1px solid rgba(248,113,113,.18)", borderRadius: ".75rem" }}>
              {errors.map((e, i) => (
                <p key={i} style={{ fontSize: ".8rem", color: "#f87171" }}>• {e}</p>
              ))}
            </div>
          )}

          {/* Loading spinner */}
          {loading && (
            <div style={{ marginTop: ".85rem", display: "flex", alignItems: "center", gap: ".45rem", fontSize: ".8rem", color: "var(--color-slate-500)" }}>
              <span style={{ width: "11px", height: "11px", border: "2px solid var(--color-emerald-500)", borderTopColor: "transparent", borderRadius: "50%", display: "block", flexShrink: 0, animation: "spin 1s linear infinite" }} />
              Hesaplanıyor...
            </div>
          )}

          {/* Quick summary beneath form */}
          {result && (
            <div style={{ marginTop: "1.25rem", padding: "1rem", background: "rgba(16,185,129,.06)", border: "1px solid rgba(16,185,129,.14)", borderRadius: ".875rem" }}>
              <p style={{ fontSize: ".68rem", color: "var(--color-slate-500)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: ".5rem", fontWeight: 600 }}>Özet</p>
              {[
                { label: "Ürün Fiyatı",     val: result.product_price },
                { label: "Toplam Ödenecek", val: result.total_payment },
                { label: "Toplam Kâr",      val: result.total_profit },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: ".3rem", marginBottom: ".3rem", borderBottom: i < 2 ? "1px solid rgba(148,163,184,.06)" : "none" }}>
                  <span style={{ fontSize: ".75rem", color: "var(--color-slate-500)" }}>{row.label}</span>
                  <span style={{ fontSize: ".8rem", fontWeight: 600, color: i === 2 ? "var(--color-emerald-400)" : "var(--color-slate-200)" }}>{fmt(row.val)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ────── RIGHT: Results ────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {!result && !errors.length && <EmptyState />}

          {result && (
            <>
              {/* ── Hero monthly payment ── */}
              <div className="card-glow" style={{ padding: "2rem", textAlign: "center" }}>
                <p style={{ fontSize: ".68rem", fontWeight: 700, color: "var(--color-emerald-500)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: ".65rem" }}>
                  Aylık Taksit
                </p>
                <p className="grad num-pop" style={{ fontSize: "clamp(2.5rem,5vw,3.75rem)", fontWeight: 900, lineHeight: 1, letterSpacing: "-.04em" }}>
                  {fmt(result.monthly_payment)}
                </p>
                <p style={{ fontSize: ".88rem", color: "var(--color-slate-500)", marginTop: ".6rem" }}>
                  {result.months} ay × {fmt(result.monthly_payment)} = {fmt(result.total_payment)}
                </p>

                {/* Inline mini metrics */}
                <div style={{ display: "flex", gap: "1px", justifyContent: "center", marginTop: "1.5rem" }}>
                  {[
                    { label: "Anapara",          val: fmt(result.product_price), color: "#60a5fa"  },
                    { label: "+",                 val: "",                        color: "var(--color-slate-600)", small: true },
                    { label: "Kâr Payı",          val: fmt(result.total_profit),  color: "#34d399"  },
                    { label: "=",                 val: "",                        color: "var(--color-slate-600)", small: true },
                    { label: "Toplam Ödenecek",   val: fmt(result.total_payment), color: "var(--color-slate-100)" },
                  ].map((m, i) => (
                    m.small
                      ? <span key={i} style={{ padding: "0 .4rem", color: m.color, fontWeight: 700, fontSize: "1.1rem", alignSelf: "center" }}>{m.label}</span>
                      : (
                        <div key={i} style={{ padding: ".6rem .8rem", background: "rgba(6,14,26,.5)", borderRadius: ".625rem", textAlign: "center" }}>
                          <p style={{ fontSize: ".65rem", color: "var(--color-slate-500)", marginBottom: ".15rem", whiteSpace: "nowrap" }}>{m.label}</p>
                          <p style={{ fontSize: ".82rem", fontWeight: 700, color: m.color, whiteSpace: "nowrap" }}>{m.val}</p>
                        </div>
                      )
                  ))}
                </div>
              </div>

              {/* ── Stat row ── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: ".75rem" }}>
                {[
                  { label: "Vade",       val: `${result.months} Ay`,   accent: false },
                  { label: "Kâr Oranı", val: `%${result.profit_rate}`, accent: false },
                  { label: "Toplam Kâr",val: fmt(result.total_profit),  accent: true  },
                ].map((s, i) => (
                  <div key={i} className="stat-card card-lift">
                    <p style={{ fontSize: ".68rem", color: "var(--color-slate-500)", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600, marginBottom: ".35rem" }}>{s.label}</p>
                    <p style={{ fontSize: "1.05rem", fontWeight: 800, color: s.accent ? "var(--color-emerald-400)" : "var(--color-slate-100)" }}>{s.val}</p>
                  </div>
                ))}
              </div>

              {/* ── Visualization + Table tabs ── */}
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {/* Tab bar */}
                <div style={{ display: "flex", borderBottom: "1px solid rgba(148,163,184,.08)" }}>
                  {[
                    { key: "plan",  label: "📋 Taksit Planı" },
                    { key: "chart", label: "📊 Görsel Analiz" },
                  ].map((t) => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                      style={{
                        flex: 1, padding: ".85rem", background: "none", border: "none", cursor: "pointer",
                        fontSize: ".83rem", fontWeight: 600,
                        color: tab === t.key ? "var(--color-emerald-400)" : "var(--color-slate-500)",
                        borderBottom: `2px solid ${tab === t.key ? "var(--color-emerald-500)" : "transparent"}`,
                        transition: "color .15s, border-color .15s",
                      }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* TAB: Taksit Planı */}
                {tab === "plan" && (
                  <div style={{ padding: "1.25rem" }}>
                    <div style={{ overflowX: "auto", maxHeight: "340px", overflowY: "auto" }}>
                      <table className="data-table">
                        <thead style={{ position: "sticky", top: 0, background: "var(--color-navy-800)", zIndex: 1 }}>
                          <tr>
                            <th>Ay</th>
                            <th>Ödeme</th>
                            <th>Kalan Bakiye</th>
                            <th>İlerleme</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedInstallments.map((row) => {
                            const total    = Number(result.total_payment);
                            const paid     = total - Number(row.remaining_balance);
                            const paidPct  = Math.min(100, (paid / total) * 100);
                            return (
                              <tr key={row.month}>
                                <td style={{ fontWeight: 600, color: "var(--color-slate-500)", fontSize: ".8rem" }}>
                                  {row.month}
                                </td>
                                <td style={{ fontWeight: 600 }}>{fmt(row.payment)}</td>
                                <td style={{ color: "var(--color-slate-400)" }}>{fmt(row.remaining_balance)}</td>
                                <td style={{ width: "80px" }}>
                                  <div className="progress-track">
                                    <div className="progress-fill"
                                      style={{ width: `${paidPct}%`, background: "var(--color-emerald-500)" }} />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {result.installments.length > 12 && (
                      <button onClick={() => setShowAll((s) => !s)}
                        style={{ marginTop: ".75rem", background: "none", border: "none", color: "var(--color-emerald-400)", fontSize: ".8rem", cursor: "pointer", fontWeight: 600 }}>
                        {showAll ? "↑ Daha Az Göster" : `↓ Tüm ${result.installments.length} Taksitin Tümünü Göster`}
                      </button>
                    )}
                  </div>
                )}

                {/* TAB: Görsel Analiz */}
                {tab === "chart" && (
                  <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
                    {/* Donut */}
                    <div>
                      <p style={{ fontSize: ".75rem", color: "var(--color-slate-500)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "1rem" }}>
                        Maliyet Dağılımı
                      </p>
                      <DonutChart
                        principal={Number(result.product_price)}
                        profit={Number(result.total_profit)}
                      />
                    </div>

                    <div className="divider" />

                    {/* Bar chart */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: ".75rem" }}>
                        <p style={{ fontSize: ".75rem", color: "var(--color-slate-500)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" }}>
                          İlk 12 Ay Ödeme Grafiği
                        </p>
                        <p style={{ fontSize: ".72rem", color: "var(--color-slate-600)" }}>
                          sabit taksit: {fmt(result.monthly_payment)}
                        </p>
                      </div>
                      <BarChart
                        installments={result.installments}
                        maxPayment={result.monthly_payment}
                      />
                      <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginTop: ".5rem" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#10b981" }} />
                        <span style={{ fontSize: ".72rem", color: "var(--color-slate-500)" }}>Aylık taksit (eşit ödeme)</span>
                      </div>
                    </div>

                    <div className="divider" />

                    {/* Principal vs profit comparison bars */}
                    <div>
                      <p style={{ fontSize: ".75rem", color: "var(--color-slate-500)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".75rem" }}>
                        Finansman Bileşenleri
                      </p>
                      {[
                        { label: "Anapara",    val: result.product_price, color: "#3b82f6", total: result.total_payment },
                        { label: "Kâr Payı",   val: result.total_profit,  color: "#10b981", total: result.total_payment },
                      ].map((item, i) => {
                        const pct = (Number(item.val) / Number(item.total) * 100).toFixed(1);
                        return (
                          <div key={i} style={{ marginBottom: ".65rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".3rem" }}>
                              <span style={{ fontSize: ".82rem", color: "var(--color-slate-300)", fontWeight: 500 }}>{item.label}</span>
                              <span style={{ fontSize: ".82rem", fontWeight: 700, color: item.color }}>{fmt(item.val)} ({pct}%)</span>
                            </div>
                            <div className="progress-track" style={{ height: "8px" }}>
                              <div className="progress-fill" style={{ width: `${pct}%`, background: item.color }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .calc-outer-grid {
            grid-template-columns: 1fr !important;
          }
          .calc-outer-grid > div:first-child {
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
}
