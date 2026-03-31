const sections = [
  {
    tag: "Temel Kavram",
    title: "Murabaha Nedir?",
    icon: "🏛️",
    content: `Murabaha, İslam hukukuna dayalı katılım bankacılığının en yaygın finansman aracıdır.
    Kelime olarak "kâr üzerine satış" anlamına gelir. Murabaha işleminde banka, müşterinin
    talep ettiği ürünü satın alır ve önceden belirlenmiş bir kâr payıyla müşteriye satar.
    
    Temel fark şudur: Banka parayı ödünç vermez, ürünü alır ve satar. Bu nedenle işlem
    faize değil, meşru kâra dayanır.`,
    bullets: [
      "Banka ürünü önce kendi adına satın alır.",
      "Maliyet + kâr payı müşteriye açıkça bildirilir.",
      "Müşteri vade boyunca sabit taksit öder.",
      "Sözleşme sonunda mülkiyet müşteriye geçer.",
    ],
  },
  {
    tag: "Fark Ne?",
    title: "Kâr Payı ve Faiz Arasındaki Fark",
    icon: "⚖️",
    content: `Faiz, zaman üzerinden hesaplanan ve kullanılan para miktarına orantılı bir getiridir.
    İslam hukukunda bu durum "riba" (fazlalık) olarak tanımlanır ve haram sayılır.
    
    Kâr payı ise bir alım-satım işleminin meşru getirisidir. Banka gerçek bir ürünü
    alıp satarak kâr elde eder — bu, ticaretten kazanılan helal bir kazançtır.`,
    bullets: [
      "Faiz → zaman + para üzerinden birikim",
      "Kâr Payı → gerçek varlık üzerinden kazanç",
      "Faiz artabilir, kâr sabit ve öngörülüdür",
      "Riba haramdır, meşru kâr helaldir",
    ],
  },
  {
    tag: "Prensip",
    title: "Faizsiz Finansmanın Mantığı",
    icon: "💡",
    content: `Katılım bankacılığının temel prensibi risk ve getirinin paylaşılmasıdır.
    Geleneksel bankacılıkta banka her koşulda faizini alır — risk tamamen borçluya aittir.
    Katılım bankacılığında ise banka gerçek bir işlemin tarafı olur, dolayısıyla riske ortak olur.
    
    Bu yapı ekonomik adaleti, şeffaflığı ve reel ekonomiye bağlanmayı ön plana çıkarır.`,
    bullets: [
      "Risk ve getiri paylaşımı esastır",
      "Her işlem gerçek bir varlığa dayanır",
      "Para soyut değil, araçtır",
      "Şeffaflık sözleşmenin temel koşuludur",
    ],
  },
  {
    tag: "Türkiye",
    title: "Türkiye'deki Katılım Bankaları",
    icon: "🇹🇷",
    content: `Türkiye'de katılım bankacılığı 1985 yılında "özel finans kurumları" adı altında
    başlamış, zamanla düzenli bir sektöre dönüşmüştür. Bugün Kuveyt Türk, Ziraat Katılım,
    Vakıf Katılım ve Türkiye Finans gibi kurumlar bu alanda faaliyet göstermektedir.
    
    BDDK denetimine tabi olan katılım bankaları, geleneksel bankalarla aynı mevduat güvencesi
    ve yasal çerçeve kapsamındadır.`,
    bullets: [
      "1985: Özel finans kurumları başladı",
      "2005: 'Katılım Bankası' yasal statüsü verildi",
      "BDDK denetimine tabidir",
      "TMSF güvencesi kapsamındadır",
    ],
  },
];

export default function NedirPage() {
  return (
    <div className="page-sm">
      {/* Header */}
      <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
        <div className="section-tag" style={{ marginBottom: ".75rem" }}>Eğitici İçerik</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: ".75rem" }}>
          Katılım Bankacılığı Nedir?
        </h1>
        <p style={{ color: "var(--color-slate-400)", lineHeight: 1.7, fontSize: ".95rem" }}>
          Faizsiz finansmanın temel kavramlarını, Murabaha modelini ve geleneksel bankacılıktan
          farkını öğrenin.
        </p>
      </div>

      {/* Content sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {sections.map((s, i) => (
          <div key={i} className={`card anim-up anim-delay-${i % 4}`} style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              {/* Icon */}
              <div style={{
                width: "48px", height: "48px", flexShrink: 0,
                borderRadius: ".875rem", background: "rgba(16,185,129,.1)",
                border: "1px solid rgba(16,185,129,.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.4rem",
              }}>
                {s.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".5rem" }}>
                  <span className="badge badge-green">{s.tag}</span>
                </div>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: ".75rem" }}>{s.title}</h2>
                <p style={{ color: "var(--color-slate-400)", lineHeight: 1.75, fontSize: ".9rem", marginBottom: "1rem", whiteSpace: "pre-line" }}>
                  {s.content}
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
                  {s.bullets.map((b, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: ".5rem", fontSize: ".875rem", color: "var(--color-slate-300)" }}>
                      <span style={{ color: "var(--color-emerald-400)", marginTop: ".1rem", flexShrink: 0 }}>✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick reference box */}
      <div style={{
        marginTop: "2rem", padding: "1.5rem",
        background: "var(--color-navy-800)",
        border: "1px solid rgba(16,185,129,.15)",
        borderRadius: "1rem",
      }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-emerald-400)" }}>
          📖 Hızlı Referans — KataPlan'da Kullanılan Formül
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem" }}>
          {[
            { label: "Toplam Maliyet",    formula: "Fiyat + (Fiyat × Kâr%)" },
            { label: "Aylık Taksit",      formula: "Toplam Maliyet ÷ Vade" },
            { label: "Toplam Kâr",        formula: "Fiyat × (Kâr% / 100)" },
            { label: "Kalan Bakiye",      formula: "Önceki Bakiye − Taksit" },
          ].map((r, i) => (
            <div key={i} style={{ padding: ".75rem 1rem", background: "rgba(10,22,40,.5)", borderRadius: ".625rem" }}>
              <p style={{ fontSize: ".72rem", color: "var(--color-slate-500)", marginBottom: ".25rem" }}>{r.label}</p>
              <code style={{ fontSize: ".83rem", color: "var(--color-emerald-400)" }}>{r.formula}</code>
            </div>
          ))}
        </div>
        <p style={{ fontSize: ".75rem", color: "var(--color-slate-600)", marginTop: "1rem" }}>
          Tüm hesaplamalar Python <code>decimal</code> modülü ile yapılır; kayan nokta hatası içermez.
        </p>
      </div>
    </div>
  );
}
