import { Link } from "react-router-dom";
import heroModel from "../assets/hero.png";

const features = [
  {
    icon: "◉",
    title: "Ödenebilirlik Analizi",
    text: "Gelir, yükümlülük ve taksit dengesi aynı akışta görünür.",
  },
  {
    icon: "△",
    title: "Kural Motoru",
    text: "Ürüne göre peşinat, vade ve uygunluk sınırları çalışır.",
  },
  {
    icon: "↗",
    title: "Referans Karşılaştırma",
    text: "Aynı senaryoda maliyet farkı anında karşılaştırılır.",
  },
  {
    icon: "▣",
    title: "İşlem Adımları",
    text: "Teklif sonrası belgeler ve sonraki adımlar netleşir.",
  },
];

const productSignals = [
  ["Aylık Ödeme", "₺38.420"],
  ["Toplam Maliyet", "₺922.600"],
  ["Kâr Tutarı", "₺118.240"],
];

export default function AnaSayfa() {
  return (
    <div>
      <section className="home-hero-shell">
        <div className="page home-hero-grid">
          <div className="home-copy">
            <div className="section-tag" style={{ marginBottom: "1rem" }}>
              Dijital Katılım Finansmanı
            </div>
            <h1 className="home-title">
              Katılım finansmanı teklifini,
              <span className="grad"> bankacılık kalitesinde </span>
              görünür hale getir.
            </h1>
            <p className="home-subtitle">
              KataPlan; taşıt, eğitim, teknoloji ve konut iyileştirme senaryolarında
              teklif, ödenebilirlik analizi, kural kontrolleri ve referans karşılaştırmayı
              tek bir premium ürün deneyiminde birleştirir.
            </p>

            <div className="hero-actions">
              <Link to="/hesapla" className="btn-primary">Teklif Oluştur</Link>
              <Link to="/karsilastir" className="btn-ghost">Karşılaştırmayı İncele</Link>
            </div>

            <div className="feature-list">
              {features.map((feature) => (
                <div key={feature.title} className="feature-row">
                  <span>{feature.icon}</span>
                  <div>
                    <strong>{feature.title}</strong>
                    <p>{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="preview-orbit preview-orbit-a" />
              <div className="preview-orbit preview-orbit-b" />
              <div className="preview-pill">
                <span>Aylık taksit</span>
                <strong>₺38.420</strong>
              </div>
              <img src={heroModel} alt="KataPlan ürün temsili" className="hero-model" />
              <div className="preview-stats">
                {productSignals.map(([label, value]) => (
                  <div key={label} className="preview-stat">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              <div className="preview-footer">
                <div>
                  <span>Uygunluk skoru</span>
                  <strong>86 / 100</strong>
                </div>
                <div>
                  <span>Durum</span>
                  <strong className="ok">Gösterim Amaçlı Uygun</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page">
        <div className="home-band">
          <div>
            <span className="panel-label">Neden farklı?</span>
            <h2>Hesap makinesi değil, ürün düşüncesi taşıyan finansman deneyimi</h2>
          </div>
          <p>
            Ana odak yalnızca tutar göstermek değil; müşterinin neden uygun olduğunu,
            toplam maliyetin nasıl oluştuğunu ve hangi işlem adımlarının devam ettiğini
            açıklayabilmek.
          </p>
        </div>
      </section>
    </div>
  );
}
