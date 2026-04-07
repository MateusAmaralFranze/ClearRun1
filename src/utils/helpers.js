export const easeIn = (t) => t * t * t;
export const easeBack = (t) => {
  const c = 2.7;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};
export const hx = (a) => Math.floor(a * 255).toString(16).padStart(2, "0");
export const snap = (v) => Math.floor(v / 2) * 2;
export const rnd = (a) => a[Math.floor(Math.random() * a.length)];
export const genCode = () => {
  const ch = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 6; i++) c += ch[Math.floor(Math.random() * ch.length)];
  return c;
};
