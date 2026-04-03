const architecture = [
  "Arayüz ürün, müşteri ve referans karşılaştırma senaryolarını toplar.",
  "Teklif motoru ürün bazlı kuralları çalıştırır ve fiyatlama çıktısı üretir.",
  "Sonuç yüzeyi ödenebilirlik analizi, işlem adımları ve ödeme planını aynı akışta toplar.",
];

const engineering = [
  "React",
  "Flask API",
  "Python",
  "Kural Motoru",
  "OpenAPI",
  "Yerel Kayıt",
];

export default function HakkindaPage() {
  return (
    <div className="page-sm">
      <div style={{ marginBottom: "2rem" }}>
        <div className="section-tag" style={{ marginBottom: ".75rem" }}>Hakkında</div>
        <h1 style={{ fontSize: "clamp(2rem,4vw,2.7rem)", fontWeight: 850 }}>KataPlan</h1>
        <p className="hero-copy">
          KataPlan, katılım finansmanı deneyimini bankacılık ürün mantığıyla görünür kılmak için
          tasarlanmış bir dijital teklif prototipidir. Ana amaç; fiyatlama, ödenebilirlik analizi
          ve işlem akışını tek bir sade yüzeyde birleştirmektir.
        </p>
      </div>

      <div className="card section-card" style={{ marginBottom: "1rem" }}>
        <p className="panel-label">Ürün Perspektifi</p>
        <p className="soft-copy" style={{ lineHeight: 1.82 }}>
          Bu arayüz, basit bir hesap makinesinden daha fazlasını hedefler. Teklif oluşturma sürecini,
          kural görünürlüğünü ve işlem sonrası yol haritasını tek bir deneyimde toplar.
        </p>
      </div>

      <div className="card section-card" style={{ marginBottom: "1rem" }}>
        <p className="panel-label">Mimari Akış</p>
        <ul className="bullet-list">
          {architecture.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>

      <div className="card section-card" style={{ marginBottom: "1rem" }}>
        <p className="panel-label">Teknik Rozetler</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {engineering.map((item) => <span key={item} className="badge badge-blue">{item}</span>)}
        </div>
      </div>

      <div className="info-card">
        Proje eğitim ve portfolyo amacıyla geliştirilmiştir. Gerçek tahsis, uyum, belge doğrulama
        ve operasyon kararlarının yerini tutmaz; ancak ürün kalitesi ve sistem tasarımı açısından
        güçlü bir demo yüzeyi sunar.
      </div>
    </div>
  );
}
