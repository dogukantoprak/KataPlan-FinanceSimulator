import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/hesapla", label: t("nav.calculate") },
    { to: "/karsilastir", label: t("nav.compare") },
    { to: "/nedir", label: "Katılım Finansmanı" },
    { to: "/hakkinda", label: t("nav.about") },
  ];

  return (
    <nav className="navbar">
      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "72px" }}>
          <NavLink to="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: "1.28rem", fontWeight: 850, letterSpacing: "-.03em" }}>
              Kata<span className="grad">Plan</span>
            </span>
          </NavLink>

          <div className="desktop-nav" style={{ display: "flex", gap: ".25rem", alignItems: "center" }}>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              >
                {link.label}
              </NavLink>
            ))}
            <button
              type="button"
              className="lang-toggle"
              onClick={() => i18n.changeLanguage(i18n.language === "tr" ? "en" : "tr")}
            >
              {i18n.language.toUpperCase()}
            </button>
          </div>

          <button type="button" className="mobile-menu-btn" onClick={() => setOpen((current) => !current)}>
            Menü
          </button>
        </div>

        {open && (
          <div className="mobile-nav">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                onClick={() => setOpen(false)}
                style={{ display: "block", marginBottom: ".3rem" }}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
