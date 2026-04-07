import { useEffect, useRef } from "react";
import { DARK, ACCENT } from "../constants/colors";
import { easeIn, easeBack, hx, snap, rnd } from "../utils/helpers";

const C = { ...DARK, ...ACCENT };

const PH = { P: 400, S: 1400, G: 1800, T: 2600, F: 4000, D: 4700 };
const AC = [C.nG, C.nC, C.nY, C.nM];

export const SplashScreen = ({ onFinish }) => {
  const ref = useRef(null), af = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const W = (cv.width = cv.offsetWidth * 2);
    const H = (cv.height = cv.offsetHeight * 2);
    const cx = W / 2, cy = H / 2;

    const pts = Array.from({ length: 60 }, () => {
      const a = Math.random() * Math.PI * 2, d = 300 + Math.random() * 500;
      const sx = cx + Math.cos(a) * d, sy = cy + Math.sin(a) * d;
      return { sx, sy, x: sx, y: sy, tx: cx + (Math.random() - 0.5) * 180, ty: cy + (Math.random() - 0.5) * 60, sz: 3 + Math.random() * 6, sp: 0.01 + Math.random() * 0.025, p: 0, c: rnd(AC), a: 0.6 + Math.random() * 0.4, tr: [] };
    });
    const burst = [];
    let st = null;

    const anim = (ts) => {
      if (!st) st = ts;
      const t = ts - st;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2);

      if (t > PH.P && t < PH.S + 400) {
        const pT = t - PH.P;
        pts.forEach(p => {
          p.p = Math.min(1, pT * p.sp * 0.0018);
          const e = easeIn(p.p);
          p.x = p.sx + (p.tx - p.sx) * e;
          p.y = p.sy + (p.ty - p.sy) * e;
          p.tr.push({ x: p.x, y: p.y }); if (p.tr.length > 8) p.tr.shift();
          p.tr.forEach((pt, i) => {
            const a2 = (i / p.tr.length) * 0.3 * p.a;
            ctx.fillStyle = p.c + hx(a2);
            ctx.fillRect(snap(pt.x), snap(pt.y), p.sz * (i / p.tr.length) * 0.6, p.sz * (i / p.tr.length) * 0.6);
          });
          ctx.globalAlpha = p.a * (1 - p.p * 0.3);
          ctx.fillStyle = p.c;
          ctx.fillRect(snap(p.x), snap(p.y), p.sz, p.sz);
          ctx.globalAlpha = 1;
        });
      }

      if (t > PH.S) {
        const sT = t - PH.S, sc = Math.min(1, sT / 350) < 1 ? easeBack(sT / 350) : 1;
        let shx = 0, shy = 0;
        if (sT < 200) { const i2 = (1 - sT / 200) * 12; shx = (Math.random() - 0.5) * i2; shy = (Math.random() - 0.5) * i2; }
        ctx.save(); ctx.translate(cx + shx, cy + shy); ctx.scale(sc, sc);
        if (sT < 20 && burst.length === 0) for (let i = 0; i < 40; i++) { const a = Math.random() * Math.PI * 2, s = 4 + Math.random() * 10; burst.push({ x: 0, y: 0, vx: Math.cos(a) * s, vy: Math.sin(a) * s, sz: 2 + Math.random() * 5, life: 1, dc: 0.015 + Math.random() * 0.025, c: rnd(AC.slice(0, 3)) }); }
        if (t > PH.G) { const gT = t - PH.G, pu = 0.4 + Math.sin(gT * 0.005) * 0.15, gA = Math.min(1, gT / 600) * pu; const g = ctx.createRadialGradient(0, 0, 20, 0, 0, 350); g.addColorStop(0, C.nG + hx(gA * 0.7)); g.addColorStop(0.5, C.nG + hx(gA * 0.2)); g.addColorStop(1, "transparent"); ctx.fillStyle = g; ctx.fillRect(-400, -200, 800, 400); }
        const fs = Math.min(W * 0.065, 72);
        ctx.font = `${fs}px 'Press Start 2P'`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = "#003322"; ctx.fillText("ClearRun", 4, 6);
        ctx.fillStyle = "#004433"; ctx.fillText("ClearRun", 2, 3);
        ctx.fillStyle = C.nG; ctx.shadowColor = C.nG;
        ctx.shadowBlur = t > PH.G ? 20 + Math.sin((t - PH.G) * 0.006) * 10 : 0;
        ctx.fillText("ClearRun", 0, 0); ctx.shadowBlur = 0;
        if (t > PH.G) { ctx.globalAlpha = Math.min(1, (t - PH.G) / 400); ctx.font = `${fs * 0.65}px serif`; ctx.fillText("🏁", 0, -fs * 1.1); ctx.globalAlpha = 1; }
        ctx.font = `${fs}px 'Press Start 2P'`; const fw = ctx.measureText("ClearRun").width;
        if (t > PH.G) { const lp = Math.min(1, (t - PH.G) / 500); ctx.strokeStyle = C.nG; ctx.lineWidth = 3; ctx.shadowColor = C.nG; ctx.shadowBlur = 8; ctx.beginPath(); ctx.moveTo(-fw / 2, fs * 0.55); ctx.lineTo(-fw / 2 + fw * lp, fs * 0.55); ctx.stroke(); ctx.shadowBlur = 0; }
        ctx.restore();
        burst.forEach(b => { b.x += b.vx; b.y += b.vy; b.vx *= 0.96; b.vy *= 0.96; b.life -= b.dc; if (b.life > 0) { ctx.globalAlpha = b.life; ctx.fillStyle = b.c; ctx.fillRect(snap(cx + b.x), snap(cy + b.y), b.sz, b.sz); ctx.globalAlpha = 1; } });
      }

      if (t > PH.T) { ctx.globalAlpha = Math.min(1, (t - PH.T) / 500); ctx.font = `${Math.min(W * 0.018, 18)}px 'VT323'`; ctx.fillStyle = C.t2; ctx.textAlign = "center"; ctx.fillText("Zere jogos. Desafie amigos. Suba no ranking.", cx, cy + 70); ctx.globalAlpha = 1; }
      if (t > PH.S && t < PH.S + 120) { ctx.fillStyle = `rgba(0,255,136,${(1 - (t - PH.S) / 120) * 0.35})`; ctx.fillRect(0, 0, W, H); }
      if (t > PH.F) { ctx.fillStyle = `rgba(10,10,26,${Math.min(1, (t - PH.F) / 700)})`; ctx.fillRect(0, 0, W, H); }
      t < PH.D ? (af.current = requestAnimationFrame(anim)) : onFinish();
    };

    document.fonts.ready.then(() => setTimeout(() => { af.current = requestAnimationFrame(anim); }, 200));
    return () => { if (af.current) cancelAnimationFrame(af.current); };
  }, [onFinish]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <canvas ref={ref} style={{ width: "100%", height: "100%", display: "block", imageRendering: "pixelated" }} />
    </div>
  );
};
