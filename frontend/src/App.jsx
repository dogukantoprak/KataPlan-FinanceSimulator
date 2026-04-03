import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "./components/Navbar";
import AnaSayfa from "./pages/AnaSayfa";
import HesaplaPage from "./pages/HesaplaPage";
import KarsilastirPage from "./pages/KarsilastirPage";
import NedirPage from "./pages/NedirPage";
import HakkindaPage from "./pages/HakkindaPage";

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}

function NotFound() {
  return (
    <div className="page" style={{ textAlign: "center" }}>
      <div className="card" style={{ padding: "2rem" }}>
        <div className="section-tag" style={{ marginBottom: "1rem" }}>404</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 850, marginBottom: ".5rem" }}>Sayfa bulunamadı</h1>
        <p className="soft-copy" style={{ marginBottom: "1rem" }}>
          Bu rota mevcut değil. Ana sayfaya dönerek teklif akışına devam edebilirsiniz.
        </p>
        <a href="/" className="btn-primary">Ana Sayfaya Dön</a>
      </div>
    </div>
  );
}

export default function App() {
  const { t } = useTranslation();

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<AnaSayfa />} />
        <Route path="/hesapla" element={<HesaplaPage />} />
        <Route path="/karsilastir" element={<KarsilastirPage />} />
        <Route path="/nedir" element={<NedirPage />} />
        <Route path="/hakkinda" element={<HakkindaPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <footer style={{ borderTop: "1px solid rgba(148, 163, 184, .08)", padding: "1.25rem", textAlign: "center" }}>
        <p style={{ fontSize: ".78rem", color: "var(--muted-2)" }}>
          {t("app.footer", { year: new Date().getFullYear() })}
        </p>
      </footer>
    </BrowserRouter>
  );
}
