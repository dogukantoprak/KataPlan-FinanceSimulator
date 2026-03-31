import { NavLink } from "react-router-dom";
import { useState } from "react";

const links = [
  { to: "/",             label: "Ana Sayfa" },
  { to: "/hesapla",      label: "Finansman Hesapla" },
  { to: "/karsilastir",  label: "Karşılaştırma" },
  { to: "/nedir",        label: "Katılım Bankacılığı" },
  { to: "/hakkinda",     label: "Hakkında" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

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
          </div>

          {/* Mobile hamburger */}
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
        }
      `}</style>
    </nav>
  );
}
