export const PF = "'Press Start 2P', monospace";
export const BF = "'VT323', monospace";

export const DARK = {
  bg: "#0a0a1a", c1: "#12122a", c2: "#1a1a3a", bd: "#2a2a5a",
  t1: "#e0e0ff", t2: "#8888bb", xpBg: "#1a1a3a",
};

export const LIGHT = {
  bg: "#f0f0f5", c1: "#ffffff", c2: "#e8e8f0", bd: "#c0c0d8",
  t1: "#1a1a2e", t2: "#6666aa", xpBg: "#d0d0e0",
};

export const ACCENT = {
  nG: "#00ff88", nC: "#00e5ff", nM: "#ff00aa",
  nY: "#ffe600", nO: "#ff8800", red: "#ff4444",
};

export const getC = (dark) => ({ ...(dark ? DARK : LIGHT), ...ACCENT });
export const pb = (C, c, w = 2) => `${w}px solid ${c || C.bd}`;
