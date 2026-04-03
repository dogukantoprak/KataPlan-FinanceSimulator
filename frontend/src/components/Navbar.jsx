import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const links = [
    { to: "/",             label: t("nav.home") },
    { to: "/hesapla",      label: t("nav.calculate") },
    { to: "/karsilastir",  label: t("nav.compare") },
    { to: "/nedir",        label: "Katılım Bankacılığı" },
    { to: "/hakkinda",     label: t("nav.about") },
  ];

  const toggleLanguage = () => {
    const nextLang = i18n.language === "tr" ? "en" : "tr";
    i18n.changeLanguage(nextLang);
  };

  const LangButton = () => (
    <button onClick={toggleLanguage} style={{
      background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.2)",
      color: "var(--color-emerald-400)", padding: ".35rem .6rem", borderRadius: ".5rem",
      fontSize: ".75rem", fontWeight: 700, cursor: "pointer", marginLeft: ".5rem"
    }}>
      {i18n.language.toUpperCase()}
    </button>
  );

  return (
    <nav className="navbar">
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "0 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          {/* Brand */}
          <NavLink to="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-.02em" }}>
              Kata<span className="grad">Plan</span>
            </span>
          </NavLink>

          {/* Desktop nav */}
          <div style={{ display: "flex", gap: ".25rem", alignItems: "center" }}
               className="desktop-nav">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              >
                {l.label}
              </NavLink>
            ))}
            <LangButton />
          </div>

          {/* Mobile hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} className="mobile-only-flex">
            <div className="mobile-lang-wrapper" style={{ display: "none" }}><LangButton /></div>
            <button
              onClick={() => setOpen((o) => !o)}
              className="mobile-menu-btn"
              aria-label="Menü"
              style={{
                display: "none", flexDirection: "column", gap: "4px",
                background: "none", border: "none", cursor: "pointer", padding: "6px",
              }}
            >
              {[0,1,2].map((i) => (
                <span key={i} style={{ display: "block", width: "22px", height: "2px", background: "#94a3b8", borderRadius: "2px" }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div style={{ paddingBottom: "1rem", borderTop: "1px solid rgba(148,163,184,.1)", paddingTop: ".75rem" }}>
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                onClick={() => setOpen(false)}
                style={{ display: "block", marginBottom: ".25rem" }}
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .mobile-lang-wrapper { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
