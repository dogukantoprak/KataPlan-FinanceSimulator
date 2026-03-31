const stack = [
  { label: "Frontend",  items: ["React 18", "Vite", "React Router v6", "Tailwind CSS v4", "Axios"] },
  { label: "Backend",   items: ["Python 3", "Flask", "flask-cors", "decimal modülü"] },
  { label: "Mimari",    items: ["REST API", "SPA + Çok Sayfalı Routing", "Bileşen Bazlı Tasarım", "Gerçek Zamanlı Hesaplama"] },
  { label: "Kalite",    items: ["Giriş Doğrulama", "Temiz JSON Cevapları", "Okunabilir Kod", "Dokümanlı README"] },
];

const goals = [
  "Katılım bankacılığı kavramlarını interaktif biçimde öğretmek",
  "Murabaha modelini gerçek bir API ile simüle etmek",
  "Geleneksel ve katılım finansmanı arasındaki farkı sayısal olarak göstermek",
  "Fintech alanında yazılım mühendisliği becerilerini sergilemek",
];

export default function HakkindaPage() {
  return (
    <div className="page-sm">
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div className="section-tag" style={{ marginBottom: ".75rem" }}>Proje</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Hakkında</h1>
        <p style={{ color: "var(--color-slate-400)", marginTop: ".5rem", fontSize: ".95rem" }}>
          KataPlan nedir, neden geliştirildi ve nasıl çalışır?
        </p>
      </div>

      {/* Project overview */}
      <div className="card" style={{ padding: "1.75rem", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
          <div style={{
            width: "52px", height: "52px", flexShrink: 0,
            borderRadius: ".875rem", background: "rgba(16,185,129,.1)",
            border: "1px solid rgba(16,185,129,.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.6rem",
          }}>💼</div>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: ".6rem" }}>Proje Amacı</h2>
            <p style={{ color: "var(--color-slate-400)", lineHeight: 1.75, fontSize: ".9rem", marginBottom: "1rem" }}>
              KataPlan, Murabaha esaslı katılım finansmanını simüle eden eğitici bir web uygulamasıdır.
              Yazılım Mühendisliği 3. sınıf portfolyo projesi olarak geliştirilmiştir.
            </p>
            <p style={{ color: "var(--color-slate-400)", lineHeight: 1.75, fontSize: ".9rem" }}>
              Proje; Flask API, React Router ve Tailwind CSS kullanarak tam yığın (full-stack) geliştirme,
              finansal hesaplama doğruluğu ve ürün odaklı UX tasarımı konularındaki yetkinliği yansıtmaktadır.
            </p>
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="card" style={{ padding: "1.75rem", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Hedefler</h2>
        <ul style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
          {goals.map((g, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: ".6rem", fontSize: ".875rem", color: "var(--color-slate-300)" }}>
              <span style={{ color: "var(--color-emerald-400)", flexShrink: 0, marginTop: ".1rem" }}>→</span>
              {g}
            </li>
          ))}
        </ul>
      </div>

      {/* Tech Stack */}
      <div className="card" style={{ padding: "1.75rem", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1.25rem" }}>Teknoloji Yığını</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {stack.map((s, i) => (
            <div key={i} style={{ padding: "1rem", background: "rgba(10,22,40,.5)", borderRadius: ".75rem" }}>
              <p style={{ fontSize: ".72rem", color: "var(--color-slate-500)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: ".6rem", fontWeight: 600 }}>
                {s.label}
              </p>
              <ul style={{ display: "flex", flexDirection: "column", gap: ".3rem" }}>
                {s.items.map((item, j) => (
                  <li key={j} style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".83rem", color: "var(--color-slate-300)" }}>
                    <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--color-emerald-500)", flexShrink: 0, display: "block" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture note */}
      <div className="card" style={{ padding: "1.75rem", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: ".75rem" }}>Mimari Yapı</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
          {[
            { arrow: "Kullanıcı", desc: "Tarayıcıda React SPA çalışır" },
            { arrow: "React → Flask", desc: "POST /api/calculate — Axios ile JSON gönderilir" },
            { arrow: "Flask",      desc: "Girdi doğrulanır, decimal ile hesaplanır" },
            { arrow: "Flask → React", desc: "Temiz JSON yanıtı döner" },
            { arrow: "React",      desc: "Sonuçlar anlık olarak güncellenir" },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: ".55rem .875rem", background: "rgba(10,22,40,.4)", borderRadius: ".5rem" }}>
              <span style={{ fontSize: ".75rem", color: "var(--color-emerald-400)", minWidth: "110px", fontFamily: "monospace", fontWeight: 600 }}>{row.arrow}</span>
              <span style={{ fontSize: ".83rem", color: "var(--color-slate-400)" }}>{row.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="info-card">
        <p style={{ fontSize: ".8rem", color: "var(--color-slate-400)", lineHeight: 1.7 }}>
          <strong style={{ color: "var(--color-slate-300)" }}>⚠️ Yasal Uyarı:</strong> Bu uygulama yalnızca eğitim
          ve portfolyo amaçlı geliştirilmiştir. Gerçek finansal tavsiye yerine geçmez.
          Hesaplamalar basitleştirilmiş Murabaha modelini temel almaktadır.
          Hiçbir finansal kararı bu uygulamaya dayanarak vermeyin.
        </p>
      </div>

      {/* Footer links */}
      <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <p style={{ fontSize: ".8rem", color: "var(--color-slate-600)" }}>
          Kaynak Kod → GitHub &nbsp;|&nbsp; Portfolyo Projesi &nbsp;|&nbsp; 2026
        </p>
      </div>
    </div>
  );
}
