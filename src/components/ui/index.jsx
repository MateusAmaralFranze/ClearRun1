import { useState, useEffect, createContext, useContext } from "react";
import { PF, BF, pb } from "../../constants/colors";

export const ThemeCtx = createContext();
export const useTheme = () => useContext(ThemeCtx);

export const Scanlines = () => (
  <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:9999,
    background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)" }} />
);

export const XPBar = ({ cur, max, color, h = 14, label = true }) => {
  const { C: c } = useTheme();
  const cl = color || c.nG;
  const p = Math.min((cur / max) * 100, 100);
  return (
    <div style={{ width: "100%" }}>
      <div style={{ width:"100%", height:h, background:c.xpBg, border:pb(c,c.bd), position:"relative", overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${p}%`, background:cl, boxShadow:`0 0 8px ${cl}66`, transition:"width 1s ease" }} />
        <div style={{ position:"absolute", inset:0, background:"repeating-linear-gradient(90deg,transparent,transparent 6px,rgba(0,0,0,0.15) 6px,rgba(0,0,0,0.15) 8px)" }} />
      </div>
      {label && <div style={{ fontFamily:BF, fontSize:14, color:c.t2, marginTop:4, textAlign:"right" }}>{cur}/{max} XP</div>}
    </div>
  );
};

export const Stars = ({ n }) => <span style={{ letterSpacing:2 }}>{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;

export const Blink = () => {
  const { C: c } = useTheme();
  const [on, s] = useState(true);
  useEffect(() => { const t = setInterval(() => s(v => !v), 530); return () => clearInterval(t); }, []);
  return <span style={{ color: c.nG, opacity: on ? 1 : 0 }}>█</span>;
};

export const SectionTitle = ({ icon, title }) => {
  const { C: c } = useTheme();
  return (
    <div style={{ fontFamily:PF, fontSize:10, color:c.t2, marginBottom:12, display:"flex", alignItems:"center", gap:8, letterSpacing:2 }}>
      <span style={{ fontSize:16 }}>{icon}</span>{title}
      <div style={{ flex:1, height:1, borderBottom:`1px dashed ${c.bd}`, marginLeft:8 }} />
    </div>
  );
};

export const Fade = ({ children, delay = 0 }) => {
  const [v, s] = useState(false);
  useEffect(() => { const t = setTimeout(() => s(true), delay); return () => clearTimeout(t); }, [delay]);
  return <div style={{ opacity:v?1:0, transform:v?"translateY(0)":"translateY(16px)", transition:"opacity 0.45s ease,transform 0.45s ease" }}>{children}</div>;
};

export const Btn = ({ children, onClick, active, color, disabled }) => {
  const { C: c } = useTheme();
  const cl = color || c.nG;
  return <button onClick={onClick} disabled={disabled} style={{ fontFamily:PF, fontSize:9, padding:"10px 16px", background:active?cl+"22":"transparent", color:active?cl:c.t2, border:pb(c,active?cl:c.bd), cursor:disabled?"not-allowed":"pointer", transition:"all 0.2s", opacity:disabled?.4:1 }}>{children}</button>;
};

export const Tag = ({ children, color }) => {
  const { C: c } = useTheme();
  const cl = color || c.nG;
  return <span style={{ fontFamily:PF, fontSize:7, color:cl, background:cl+"15", padding:"3px 6px", border:pb(c,cl,1) }}>{children}</span>;
};

export const OnlineDot = ({ on }) => {
  const { C: c } = useTheme();
  return <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:on?c.nG:c.bd, boxShadow:on?`0 0 6px ${c.nG}`:"" }} />;
};
