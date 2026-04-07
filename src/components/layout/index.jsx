import { PF, pb } from "../../constants/colors";
import { useTheme } from "../ui";

export const NavBar = ({ page, go, notifCount }) => {
  const { C: c } = useTheme();
  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 12px", background: c.c1, borderBottom: pb(c),
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }} onClick={() => go("home")}>
        <span style={{ fontSize: 18 }}>🏁</span>
        <span style={{ fontFamily: PF, fontSize: 10, color: c.nG, textShadow: `0 0 10px ${c.nG}55`, letterSpacing: 2 }}>ClearRun</span>
      </div>
      <div style={{ display: "flex", gap: 3, alignItems: "center", flexWrap: "nowrap", overflow: "hidden" }}>
        {[
          { k: "home", l: "HOME", i: "🕹️" },
          { k: "groups", l: "GRUPOS", i: "🛡️" },
          { k: "profile", l: "PERFIL", i: "👤" },
          { k: "settings", l: "", i: "⚙️" },
        ].map(it => (
          <button key={it.k} onClick={() => go(it.k)} style={{
            fontFamily: PF, fontSize: 7, padding: "7px 8px",
            background: page === it.k ? c.nG + "18" : "transparent",
            color: page === it.k ? c.nG : c.t2,
            border: pb(c, page === it.k ? c.nG : "transparent"),
            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
          }}>
            <span>{it.i}</span>
            {it.l && <span className="nav-label" style={{ marginLeft: 4 }}>{it.l}</span>}
          </button>
        ))}
        <button onClick={() => go("notifs")} style={{
          fontFamily: PF, fontSize: 7, padding: "7px 8px",
          background: page === "notifs" ? c.nG + "18" : "transparent",
          color: page === "notifs" ? c.nG : c.t2,
          border: pb(c, page === "notifs" ? c.nG : "transparent"),
          cursor: "pointer", position: "relative", flexShrink: 0,
        }}>
          🔔
          {notifCount > 0 && (
            <span style={{
              position: "absolute", top: -2, right: -2,
              background: c.red, color: "#fff", fontFamily: PF, fontSize: 6,
              padding: "2px 4px", borderRadius: 2,
            }}>{notifCount}</span>
          )}
        </button>
      </div>
      <style>{`@media(max-width:600px){.nav-label{display:none!important;}}`}</style>
    </nav>
  );
};

export const BottomBar = ({ page, go }) => {
  const { C: c } = useTheme();
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: c.c1, borderTop: pb(c),
      display: "flex", justifyContent: "space-around",
      padding: "8px 0 max(12px, env(safe-area-inset-bottom))",
      zIndex: 100,
    }}>
      {[
        { k: "home", i: "🕹️", l: "Home" },
        { k: "groups", i: "🛡️", l: "Grupos" },
        { k: "profile", i: "👤", l: "Perfil" },
      ].map(it => (
        <button key={it.k} onClick={() => go(it.k)} style={{
          background: "transparent", border: "none",
          padding: "6px 16px", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        }}>
          <span style={{ fontSize: 20 }}>{it.i}</span>
          <span style={{ fontFamily: PF, fontSize: 7, color: page === it.k ? c.nG : c.t2 }}>{it.l}</span>
        </button>
      ))}
    </div>
  );
};
