import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AnaSayfa       from "./pages/AnaSayfa";
import HesaplaPage    from "./pages/HesaplaPage";
import KarsilastirPage from "./pages/KarsilastirPage";
import NedirPage      from "./pages/NedirPage";
import HakkindaPage   from "./pages/HakkindaPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"            element={<AnaSayfa />} />
        <Route path="/hesapla"     element={<HesaplaPage />} />
        <Route path="/karsilastir" element={<KarsilastirPage />} />
        <Route path="/nedir"       element={<NedirPage />} />
        <Route path="/hakkinda"    element={<HakkindaPage />} />
        {/* 404 */}
        <Route path="*" element={
          <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</p>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: ".5rem" }}>Sayfa Bulunamadı</h2>
            <a href="/" style={{ color: "var(--color-emerald-400)" }}>Ana Sayfaya Dön</a>
          </div>
        } />
      </Routes>

      {/* Global footer */}
      <footer style={{ borderTop: "1px solid rgba(148,163,184,.08)", padding: "1.25rem", textAlign: "center" }}>
        <p style={{ fontSize: ".78rem", color: "var(--color-slate-600)" }}>
          KataPlan © {new Date().getFullYear()} — Eğitim Amaçlı Portfolyo Projesi. Finansal Tavsiye Değildir.
        </p>
      </footer>
    </BrowserRouter>
  );
}
