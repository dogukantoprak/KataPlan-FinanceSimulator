import { Link } from "react-router-dom";

const features = [
  {
    icon: "🏦",
    title: "Faizsiz Finansman",
    desc: "Murabaha modeli ile faiz yerine kâr payı esasıyla çalışan şeffaf bir finansman yapısı.",
  },
  {
    icon: "📊",
    title: "Gerçek Zamanlı Hesaplama",
    desc: "Ürün fiyatı, vade ve kâr oranını girerek anında aylık taksit planınızı görün.",
  },
  {
    icon: "⚖️",
    title: "Karşılaştırmalı Analiz",
    desc: "Katılım finansmanı ile geleneksel kredi arasındaki farkı sayılarla inceleyin.",
  },
  {
    icon: "📚",
    title: "Eğitici İçerik",
    desc: "Murabaha, kâr payı ve katılım bankacılığının temel kavramlarını öğrenin.",
  },
];

const stats = [
  { value: "0%", label: "Faiz Oranı" },
  { value: "100%", label: "Şeffaf Fiyatlama" },
  { value: "Murabaha", label: "Finansman Modeli" },
];

export default function AnaSayfa() {
  return (
    <div>
      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(148,163,184,.08)" }}>
        <div className="hero-glow" />
        <div className="page" style={{ paddingTop: "4rem", paddingBottom: "4rem", position: "relative" }}>
          <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
            <div className="section-tag anim-up" style={{ marginBottom: "1.5rem" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-emerald-400)" }} />
              Katılım Finansmanı Simülatörü
            </div>

            <h1 className="anim-up anim-delay-1" style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-.03em", marginBottom: "1.25rem" }}>
              Faizsiz Finansmanı{" "}
              <span className="grad">Simüle Et</span>
            </h1>

            <p className="anim-up anim-delay-2" style={{ fontSize: "1.05rem", color: "var(--color-slate-400)", lineHeight: 1.7, marginBottom: "2.25rem" }}>
              KataPlan, Murabaha esaslı katılım finansmanını hesaplamanızı, geleneksel krediyle karşılaştırmanızı
              ve katılım bankacılığının temellerini öğrenmenizi sağlar.
            </p>

            <div className="anim-up anim-delay-3" style={{ display: "flex", gap: ".75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/hesapla" className="btn-primary" style={{ fontSize: "1rem", padding: ".8rem 2rem" }}>
                Hesaplamayı Başlat →
              </Link>
              <Link to="/nedir" className="btn-ghost" style={{ fontSize: "1rem", padding: ".8rem 1.75rem" }}>
                Nasıl Çalışır?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={{ background: "var(--color-navy-800)", borderBottom: "1px solid rgba(148,163,184,.08)" }}>
        <div className="page" style={{ paddingTop: "1.25rem", paddingBottom: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-emerald-400)", lineHeight: 1.1 }}>{s.value}</p>
                <p style={{ fontSize: ".78rem", color: "var(--color-slate-400)", marginTop: ".2rem" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What is Participation Finance ── */}
      <section className="page" style={{ paddingBottom: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
          <div className="anim-up">
            <div className="section-tag" style={{ marginBottom: "1rem" }}>Temel Kavramlar</div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 700, lineHeight: 1.2, marginBottom: "1rem" }}>
              Katılım Finansmanı Neden Farklı?
            </h2>
            <p style={{ color: "var(--color-slate-400)", lineHeight: 1.75, marginBottom: "1rem" }}>
              Geleneksel bankacılıkta faiz, zaman üzerinden hesaplanan sabit bir maliyet unsurudur.
              Katılım bankacılığında ise banka bir ürünü satın alıp müşteriye kâr payıyla satar.
              Bu yapıya <strong style={{ color: "var(--color-emerald-400)" }}>Murabaha</strong> adı verilir.
            </p>
            <p style={{ color: "var(--color-slate-400)", lineHeight: 1.75, marginBottom: "1.5rem" }}>
              Her iki taraf da maliyetin ne olduğunu baştan bilir. Gizli ücret yoktur,
              faiz birikimi yoktur. Fiyat sabit, şeffaf ve önceden belirlidir.
            </p>
            <Link to="/nedir" className="btn-ghost" style={{ display: "inline-flex" }}>
              Daha Fazla Öğren →
            </Link>
          </div>

          {/* Formula Card */}
          <div className="card anim-up anim-delay-1" style={{ padding: "1.75rem" }}>
            <p style={{ fontSize: ".75rem", color: "var(--color-slate-500)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "1.25rem" }}>
              Murabaha Formülü
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { label: "Toplam Maliyet", formula: "Ürün Fiyatı × (1 + Kâr Oranı / 100)" },
                { label: "Aylık Taksit",   formula: "Toplam Maliyet ÷ Vade (Ay)" },
                { label: "Toplam Kâr",     formula: "Toplam Maliyet − Ürün Fiyatı" },
              ].map((row, i) => (
                <div key={i} style={{ padding: "1rem", background: "rgba(10,22,40,.6)", borderRadius: ".75rem", border: "1px solid rgba(148,163,184,.08)" }}>
                  <p style={{ fontSize: ".75rem", color: "var(--color-slate-500)", marginBottom: ".35rem" }}>{row.label}</p>
                  <p style={{ fontSize: ".9rem", color: "var(--color-emerald-400)", fontFamily: "monospace", fontWeight: 600 }}>{row.formula}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1.25rem", padding: ".75rem", background: "rgba(16,185,129,.08)", borderRadius: ".5rem", border: "1px solid rgba(16,185,129,.15)" }}>
              <p style={{ fontSize: ".78rem", color: "var(--color-emerald-400)" }}>
                ✓ Tüm hesaplamalar Python <code>decimal</code> modülüyle yapılır. Kayan nokta hatası yoktur.
              </p>
            </div>
          </div>
        </div>

        {/* Responsive grid fix */}
        <style>{`@media(max-width:640px){ .hero-two-col { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      <div className="divider" style={{ margin: "0 1.25rem" }} />

      {/* ── Feature Cards ── */}
      <section className="page">
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div className="section-tag" style={{ marginBottom: "1rem" }}>Özellikler</div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700 }}>KataPlan ile Neler Yapabilirsiniz?</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1rem" }}>
          {features.map((f, i) => (
            <div key={i} className={`card anim-up anim-delay-${i + 1}`} style={{ padding: "1.5rem" }}>
              <span style={{ fontSize: "2rem", display: "block", marginBottom: ".9rem" }}>{f.icon}</span>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: ".5rem" }}>{f.title}</h3>
              <p style={{ fontSize: ".85rem", color: "var(--color-slate-400)", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: "var(--color-navy-800)", marginTop: "1rem" }}>
        <div className="page" style={{ textAlign: "center", paddingTop: "3rem", paddingBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.7rem", fontWeight: 700, marginBottom: ".75rem" }}>Simülasyonu Deneyin</h2>
          <p style={{ color: "var(--color-slate-400)", marginBottom: "1.75rem" }}>
            Kendi finansman senaryonuzu girin ve sonuçları anında görün.
          </p>
          <Link to="/hesapla" className="btn-primary" style={{ fontSize: "1rem", padding: ".85rem 2.25rem" }}>
            Finansman Hesapla →
          </Link>
        </div>
      </section>
    </div>
  );
}
