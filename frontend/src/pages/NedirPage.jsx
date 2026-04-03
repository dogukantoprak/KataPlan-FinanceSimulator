const blocks = [
  {
    tag: "Murabaha",
    title: "Varlığa dayalı satış yapısı",
    text: "Katılım finansmanında işlem, doğrudan nakit borç vermekten çok belgelenmiş ürün veya hizmet satışı mantığıyla ele alınır. Toplam satış bedeli ve kâr yapısı baştan görünür hale gelir.",
    bullets: [
      "Gerçek fatura veya hizmet belgesi gerekir.",
      "Toplam maliyet sözleşme öncesinde görünür olur.",
      "Sabit yapılı ve açıklanabilir ödeme planı üretilebilir.",
    ],
  },
  {
    tag: "Şeffaflık",
    title: "Rakamların görünürlüğü neden önemlidir?",
    text: "Yalnızca aylık taksit göstermek yeterli değildir. Peşinat, finanse tutar, kâr, tahsis ücreti ve ödenebilirlik analizi aynı yüzeyde görülmelidir.",
    bullets: [
      "Müşteri beklentisi daha erken yönetilir.",
      "Toplam maliyet daha net anlaşılır.",
      "Operasyon öncesi ön değerlendirme kolaylaşır.",
    ],
  },
  {
    tag: "Kural Motoru",
    title: "Politika görünürlüğü neden değerlidir?",
    text: "Dijital finansman deneyiminde ürün bazlı kuralların kullanıcıya açık şekilde yansıması hem deneyim kalitesini hem de işlem verimliliğini güçlendirir.",
    bullets: [
      "Minimum peşinat kontrolü",
      "Ürüne göre vade limiti",
      "Gelir ve yükümlülük uyumu",
    ],
  },
  {
    tag: "Akış",
    title: "Teklif ekranı neden tek başına yetmez?",
    text: "İşlem adımları, gerekli belgeler ve teklif sonrası yol haritası görünür değilse deneyim eksik kalır. KataPlan bu katmanları aynı akış içinde birleştirir.",
    bullets: [
      "Teklif oluştur",
      "İşlem adımlarını incele",
      "Belgeleri hazırla",
    ],
  },
];

export default function NedirPage() {
  return (
    <div className="page-sm">
      <div style={{ marginBottom: "2rem" }}>
        <div className="section-tag" style={{ marginBottom: ".8rem" }}>Katılım Finansmanı</div>
        <h1 style={{ fontSize: "clamp(2rem,4vw,2.7rem)", fontWeight: 850 }}>
          Bu ürün yaklaşımı nasıl kurgulandı?
        </h1>
        <p className="hero-copy">
          Bu sayfa teorik anlatımdan çok ürün mantığını açıklar: Murabaha yapısı, kural görünürlüğü,
          ödenebilirlik analizi ve işlem akışı KataPlan içinde nasıl temsil ediliyor?
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {blocks.map((block) => (
          <div key={block.title} className="card section-card">
            <div className="section-tag" style={{ marginBottom: ".8rem" }}>{block.tag}</div>
            <h2 style={{ fontSize: "1.15rem", marginBottom: ".55rem" }}>{block.title}</h2>
            <p className="soft-copy" style={{ lineHeight: 1.82, marginBottom: ".9rem" }}>{block.text}</p>
            <ul className="bullet-list">
              {block.bullets.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="info-card" style={{ marginTop: "1.25rem" }}>
        KataPlan gerçek tahsis sistemi değildir; ancak dijital katılım finansmanı ürünlerinde
        hangi metriklerin görünür olması gerektiğini ve müşteri deneyiminin nasıl sadeleştirilebileceğini
        göstermek için tasarlanmıştır.
      </div>
    </div>
  );
}
