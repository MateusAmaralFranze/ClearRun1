import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PF, BF, pb } from "../../constants/colors";
import { NOTIFS, GENRES, GAME_CATALOG, getGamesForGenres, MINTIMES, PLATFORMS, AVATARS, processCheckin, getActiveChallenge, buildGlobalRanking, SUGGESTED_PLAYERS } from "../../constants/mockData";
import { genCode } from "../../utils/helpers";
import { useTheme, XPBar as XP, Stars, Blink, SectionTitle as ST, Fade as F, Btn, Tag, OnlineDot as Dot } from "../ui";

const GCOLORS=["#00ff88","#00e5ff","#ff00aa","#ffe600","#ff8800"];

/* Responsive CSS */
const RS = () => (
  <style>{`
    .cr-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
    .cr-grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
    .cr-badges{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
    .cr-page{padding:20px 16px;max-width:800px;margin:0 auto;width:100%}
    .cr-page-sm{padding:20px 16px;max-width:600px;margin:0 auto;width:100%}
    @media(max-width:600px){
      .cr-grid3{grid-template-columns:1fr}
      .cr-grid2{grid-template-columns:1fr}
      .cr-badges{grid-template-columns:repeat(2,1fr)}
      .cr-page,.cr-page-sm{padding:12px 10px}
    }
  `}</style>
);

/* ═══════════════════════════════════════════
   Game Picker — React Portal modal
   ═══════════════════════════════════════════ */
const GamePickerModal = ({ games, value, onSelect, onClose, c }) => {
  const [search, setSearch] = useState("");
  const filtered = search ? games.filter(g => g.toLowerCase().includes(search.toLowerCase())) : games;
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, background: c.bg, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 16px", background: c.c1, borderBottom: `2px solid ${c.bd}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button onClick={onClose} style={{ fontFamily: PF, fontSize: 9, padding: "8px 14px", background: "transparent", color: c.t2, border: `2px solid ${c.bd}`, cursor: "pointer" }}>✕</button>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Pesquisar jogo..." autoFocus style={{ flex: 1, fontFamily: BF, fontSize: 20, padding: "10px 14px", background: c.bg, color: c.t1, border: `2px solid ${c.nG}`, outline: "none" }} />
      </div>
      <div style={{ padding: "8px 16px", fontFamily: BF, fontSize: 15, color: c.t2, flexShrink: 0, borderBottom: `1px solid ${c.bd}33` }}>{filtered.length} jogo{filtered.length !== 1 ? "s" : ""}{search && ` para "${search}"`}</div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 80px" }}>
        {filtered.length === 0 ? <div style={{ textAlign: "center", padding: "40px 20px", fontFamily: BF, fontSize: 18, color: c.t2 }}><div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>Nenhum jogo encontrado.</div>
        : filtered.map(g => (
          <div key={g} onClick={() => onSelect(g)} style={{ padding: "13px 16px", fontFamily: BF, fontSize: 18, cursor: "pointer", color: value === g ? c.nG : c.t1, background: value === g ? c.nG + "15" : c.c1, border: `2px solid ${value === g ? c.nG : c.bd}`, marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
            <span>{g}</span>{value === g && <span style={{ color: c.nG, fontFamily: PF, fontSize: 10 }}>✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

const GamePicker = ({ games, value, onChange, placeholder }) => {
  const { C: c } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      <button type="button" onClick={() => setOpen(true)} style={{ width: "100%", padding: "12px 14px", fontFamily: BF, fontSize: 18, textAlign: "left", background: c.c1, color: value ? c.t1 : c.t2, border: `2px solid ${value ? c.nG : c.bd}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{value || (placeholder || "🔍 Toque para selecionar o jogo...")}</span>
        {value ? <span onClick={e => { e.stopPropagation(); onChange(""); }} style={{ color: c.t2, padding: "0 4px" }}>✕</span> : <span style={{ color: c.t2 }}>▼</span>}
      </button>
      {open && createPortal(<GamePickerModal games={games} value={value} onSelect={g => { onChange(g); setOpen(false); }} onClose={() => setOpen(false)} c={c} />, document.body)}
    </div>
  );
};

/* ═══════════════════════════════════════════
   PAGE — Home (updated with quick access)
   ═══════════════════════════════════════════ */
export const Home = ({ go, user, groups, stats }) => {
  const { C: c } = useTheme();
  const challenges = getActiveChallenge(stats);
  return (
    <div className="cr-page"><RS />
      <F delay={80}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: PF, fontSize: 14, color: c.nG, margin: 0, textShadow: `0 0 12px ${c.nG}44` }}>Fala, {user.username}! <Blink /></h1>
          <p style={{ fontFamily: BF, fontSize: 18, color: c.t2, margin: "6px 0 0" }}>{user.titleIcon} {user.title} · Nível {user.level}</p>
          <div style={{ marginTop: 8, maxWidth: 350 }}><XP cur={user.xp} max={user.xpNext} /></div>
          <div style={{ fontFamily: BF, fontSize: 13, color: c.t2, marginTop: 2 }}>Próximo título: {user.nextTitle} ({user.nextTitleXp} XP)</div>
        </div>
      </F>

      {/* Quick access buttons */}
      <F delay={120}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          {[
            { i: "🏅", l: "Ranking", p: "ranking" },
            { i: "⚔️", l: "Desafios", p: "challenges" },
            { i: "👥", l: "Social", p: "social" },
            { i: "🛡️", l: "Grupos", p: "groups" },
          ].map(b => (
            <button key={b.p} onClick={() => go(b.p)} style={{ flex: "0 0 auto", padding: "10px 16px", fontFamily: PF, fontSize: 8, background: c.c1, color: c.nG, border: pb(c, c.nG), cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 16 }}>{b.i}</span>{b.l}
            </button>
          ))}
        </div>
      </F>

      <F delay={160}>
        <div className="cr-grid3" style={{ marginBottom: 24 }}>
          {[
            { l: "Zerados", v: user.gamesCleared, i: "🏆", cl: c.nY },
            { l: "Horas", v: user.totalHours, i: "⏱️", cl: c.nC },
            { l: "Streak", v: user.currentStreak + "d", i: "🔥", cl: c.nO },
          ].map((s, i) => (
            <div key={i} style={{ background: c.c1, border: pb(c), padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.i}</div>
              <div style={{ fontFamily: PF, fontSize: 14, color: s.cl, textShadow: `0 0 8px ${s.cl}44` }}>{s.v}</div>
              <div style={{ fontFamily: BF, fontSize: 14, color: c.t2, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </F>

      {/* Weekly challenges preview */}
      <F delay={200}>
        <ST icon="⚔️" title="DESAFIOS DA SEMANA" />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
          {challenges.slice(0, 2).map(ch => (
            <div key={ch.id} onClick={() => go("challenges")} style={{ background: c.c1, border: pb(c, ch.completed ? c.nG : c.bd), padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22 }}>{ch.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: BF, fontSize: 16, color: ch.completed ? c.nG : c.t1 }}>{ch.name}</div>
                <div style={{ marginTop: 4 }}><XP cur={ch.progress} max={ch.target} color={ch.completed ? c.nG : c.nC} h={6} label={false} /></div>
              </div>
              <div style={{ fontFamily: PF, fontSize: 9, color: ch.completed ? c.nG : c.t2 }}>{ch.completed ? "✓" : `${ch.progress}/${ch.target}`}</div>
            </div>
          ))}
        </div>
      </F>

      <F delay={240}>
        <ST icon="🛡️" title="SEUS GRUPOS" />
        {groups.length === 0 ? (
          <div style={{ background: c.c1, border: pb(c), padding: 20, textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontFamily: BF, fontSize: 18, color: c.t2 }}>Nenhum grupo. <span onClick={() => go("groups")} style={{ color: c.nG, cursor: "pointer", textDecoration: "underline" }}>Crie um!</span></div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {groups.map(g => (
              <div key={g.id} onClick={() => go("groupDetail", { groupId: g.id })} style={{ background: c.c1, border: pb(c), padding: 14, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: PF, fontSize: 10, color: g.color }}>{g.emoji} {g.name}</span>
                    {g.role === "admin" && <Tag color={c.nY}>ADMIN</Tag>}
                  </div>
                  <span style={{ fontFamily: BF, fontSize: 14, color: c.t2 }}>👥{g.members.length}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </F>

      <F delay={320}>
        <ST icon="📡" title="ATIVIDADE RECENTE" />
        {(() => {
          const feeds = groups.flatMap(g => g.feed.slice(0, 3).map(f => ({ ...f, gn: g.name, gc: g.color }))).slice(0, 6);
          if (feeds.length === 0) return <div style={{ background: c.c1, border: pb(c), padding: 16, textAlign: "center" }}><div style={{ fontFamily: BF, fontSize: 16, color: c.t2 }}>Faça seu primeiro check-in!</div></div>;
          return <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>{feeds.map((f, i) => (
            <div key={i} style={{ background: c.c1, border: pb(c), padding: "10px 12px", display: "flex", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{f.avatar}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: BF, fontSize: 16, color: c.t1 }}><span style={{ color: c.nC }}>{f.user}</span> {f.action === "zerou" ? <span>zerou <span style={{ color: c.nG }}>{f.game}</span></span> : <span>check-in <span style={{ color: c.nY }}>{f.game}</span></span>} <span style={{ fontFamily: PF, fontSize: 7, color: f.gc, opacity: .7 }}>{f.gn}</span></div>
                {f.note && <div style={{ fontFamily: BF, fontSize: 14, color: c.t2, fontStyle: "italic" }}>"{f.note}"</div>}
                <div style={{ fontFamily: BF, fontSize: 12, color: c.t2, opacity: .6 }}>{f.time}</div>
              </div>
            </div>
          ))}</div>;
        })()}
      </F>
    </div>
  );
};

/* ═══════════════════════════════════════════
   PAGE — Global Ranking
   ═══════════════════════════════════════════ */
export const GlobalRanking = ({ user, stats, go }) => {
  const { C: c } = useTheme();
  const [tab, setTab] = useState("xp");
  const ranking = buildGlobalRanking(user, stats);
  const sorted = tab === "xp" ? [...ranking].sort((a, b) => b.xp - a.xp) : tab === "clears" ? [...ranking].sort((a, b) => b.clears - a.clears) : [...ranking].sort((a, b) => b.streak - a.streak);
  const myPos = sorted.findIndex(p => p.isMe) + 1;

  return (
    <div className="cr-page"><RS />
      <F delay={50}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 40 }}>🏅</span>
          <h1 style={{ fontFamily: PF, fontSize: 14, color: c.nG, margin: "8px 0 4px" }}>RANKING GLOBAL</h1>
          <p style={{ fontFamily: BF, fontSize: 18, color: c.t2 }}>Sua posição: <span style={{ color: c.nY, fontFamily: PF, fontSize: 14 }}>#{myPos}</span></p>
        </div>
      </F>

      <F delay={100}>
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          {[{ k: "xp", l: "⚡ XP" }, { k: "clears", l: "🏆 Clears" }, { k: "streak", l: "🔥 Streak" }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, fontFamily: PF, fontSize: 8, padding: "10px 4px", background: tab === t.k ? c.nG + "18" : "transparent", color: tab === t.k ? c.nG : c.t2, border: pb(c, tab === t.k ? c.nG : c.bd), cursor: "pointer" }}>{t.l}</button>
          ))}
        </div>
      </F>

      <F delay={150}>
        {/* Top 3 podium */}
        {sorted.length >= 3 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 8, marginBottom: 20 }}>
            {[sorted[1], sorted[0], sorted[2]].map((p, i) => {
              const heights = [100, 130, 80];
              const medals = ["🥈", "🥇", "🥉"];
              const colors2 = ["#c0c0c0", c.nY, "#cd7f32"];
              return (
                <div key={p.user} style={{ textAlign: "center", width: i === 1 ? 110 : 90 }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{p.avatar}</div>
                  <div style={{ fontFamily: PF, fontSize: 8, color: p.isMe ? c.nG : c.t1, marginBottom: 4 }}>{p.user.slice(0, 12)}</div>
                  <div style={{ height: heights[i], background: colors2[i] + "22", border: `2px solid ${colors2[i]}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <span style={{ fontSize: 22 }}>{medals[i]}</span>
                    <span style={{ fontFamily: PF, fontSize: 10, color: colors2[i] }}>{tab === "xp" ? p.xp : tab === "clears" ? p.clears : p.streak}{tab === "streak" ? "d" : ""}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full list */}
        <div style={{ background: c.c1, border: pb(c), overflow: "hidden" }}>
          {sorted.map((p, i) => (
            <div key={p.user} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: i < sorted.length - 1 ? pb(c, c.bd, 1) : "none", background: p.isMe ? c.nG + "0a" : "transparent" }}>
              <span style={{ fontFamily: PF, fontSize: 11, width: 32, textAlign: "center", color: i < 3 ? [c.nY, "#c0c0c0", c.nO][i] : c.t2 }}>#{i + 1}</span>
              <span style={{ fontSize: 20 }}>{p.avatar}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: BF, fontSize: 17, color: p.isMe ? c.nG : c.t1 }}>{p.user} {p.isMe && <Tag color={c.nG}>VOCÊ</Tag>}</div>
                <div style={{ fontFamily: BF, fontSize: 13, color: c.t2 }}>Lvl {p.level} · {p.title}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: PF, fontSize: 11, color: c.nG }}>{tab === "xp" ? p.xp : tab === "clears" ? p.clears : p.streak}{tab === "streak" ? "d" : ""}</div>
                <div style={{ fontFamily: BF, fontSize: 12, color: c.t2 }}>{tab === "xp" ? "XP" : tab === "clears" ? "clears" : "streak"}</div>
              </div>
            </div>
          ))}
        </div>
      </F>
    </div>
  );
};

/* ═══════════════════════════════════════════
   PAGE — Weekly Challenges
   ═══════════════════════════════════════════ */
export const WeeklyChallenges = ({ user, stats, go }) => {
  const { C: c } = useTheme();
  const challenges = getActiveChallenge(stats);
  return (
    <div className="cr-page-sm"><RS />
      <F delay={50}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 40 }}>⚔️</span>
          <h1 style={{ fontFamily: PF, fontSize: 13, color: c.nG, margin: "8px 0 4px" }}>DESAFIOS DA SEMANA</h1>
          <p style={{ fontFamily: BF, fontSize: 18, color: c.t2 }}>Complete desafios e ganhe XP bônus!</p>
        </div>
      </F>

      <F delay={100}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {challenges.map(ch => (
            <div key={ch.id} style={{ background: c.c1, border: pb(c, ch.completed ? c.nG : c.bd), padding: 18, position: "relative", overflow: "hidden" }}>
              {ch.completed && <div style={{ position: "absolute", inset: 0, background: `${c.nG}06`, pointerEvents: "none" }} />}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 32 }}>{ch.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: PF, fontSize: 10, color: ch.completed ? c.nG : c.t1, marginBottom: 4 }}>
                    {ch.name} {ch.completed && <Tag color={c.nG}>COMPLETO</Tag>}
                  </div>
                  <div style={{ fontFamily: BF, fontSize: 16, color: c.t2 }}>{ch.desc}</div>
                  <div style={{ marginTop: 8 }}><XP cur={ch.progress} max={ch.target} color={ch.completed ? c.nG : c.nC} h={10} label={false} /></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontFamily: BF, fontSize: 14, color: c.t2 }}>{ch.progress}/{ch.target}</span>
                    <span style={{ fontFamily: PF, fontSize: 9, color: c.nY }}>+{ch.xpReward} XP</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </F>

      <F delay={200}>
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <div style={{ fontFamily: BF, fontSize: 15, color: c.t2, marginBottom: 8 }}>Novos desafios toda semana!</div>
          <button onClick={() => go("home")} style={{ fontFamily: PF, fontSize: 9, padding: "10px 20px", background: "transparent", color: c.t2, border: pb(c), cursor: "pointer" }}>← VOLTAR</button>
        </div>
      </F>
    </div>
  );
};

/* ═══════════════════════════════════════════
   PAGE — Social (follow/friends)
   ═══════════════════════════════════════════ */
export const Social = ({ user, social, setSocial, go }) => {
  const { C: c } = useTheme();
  const follow = (username) => setSocial(prev => ({ ...prev, following: [...prev.following.filter(f => f !== username), username] }));
  const unfollow = (username) => setSocial(prev => ({ ...prev, following: prev.following.filter(f => f !== username) }));

  return (
    <div className="cr-page-sm"><RS />
      <F delay={50}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 40 }}>👥</span>
          <h1 style={{ fontFamily: PF, fontSize: 13, color: c.nG, margin: "8px 0 4px" }}>SOCIAL</h1>
          <p style={{ fontFamily: BF, fontSize: 18, color: c.t2 }}>Seguindo: <span style={{ color: c.nG }}>{social.following.length}</span></p>
        </div>
      </F>

      {/* Following list */}
      {social.following.length > 0 && (
        <F delay={100}>
          <ST icon="⭐" title="SEGUINDO" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {social.following.map(username => {
              const p = SUGGESTED_PLAYERS.find(sp => sp.user === username);
              if (!p) return null;
              return (
                <div key={p.user} style={{ background: c.c1, border: pb(c), padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{p.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: BF, fontSize: 17, color: c.t1 }}>{p.user}</div>
                    <div style={{ fontFamily: BF, fontSize: 14, color: c.t2 }}>{p.title} · {p.clears} clears</div>
                  </div>
                  <button onClick={() => unfollow(p.user)} style={{ fontFamily: PF, fontSize: 7, padding: "6px 10px", background: c.red + "18", color: c.red, border: pb(c, c.red), cursor: "pointer" }}>DEIXAR</button>
                </div>
              );
            })}
          </div>
        </F>
      )}

      {/* Suggested */}
      <F delay={150}>
        <ST icon="🔍" title="JOGADORES SUGERIDOS" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SUGGESTED_PLAYERS.filter(p => p.user !== user.username).map(p => {
            const isFollowing = social.following.includes(p.user);
            return (
              <div key={p.user} style={{ background: c.c1, border: pb(c), padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>{p.avatar}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: BF, fontSize: 17, color: c.t1 }}>{p.user}</div>
                  <div style={{ fontFamily: BF, fontSize: 14, color: c.t2 }}>{p.title} · {p.xp} XP · {p.clears} clears</div>
                </div>
                <button onClick={() => isFollowing ? unfollow(p.user) : follow(p.user)} style={{ fontFamily: PF, fontSize: 7, padding: "6px 10px", background: isFollowing ? "transparent" : c.nG + "18", color: isFollowing ? c.t2 : c.nG, border: pb(c, isFollowing ? c.bd : c.nG), cursor: "pointer" }}>
                  {isFollowing ? "SEGUINDO ✓" : "SEGUIR"}
                </button>
              </div>
            );
          })}
        </div>
      </F>

      <F delay={200}>
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button onClick={() => go("home")} style={{ fontFamily: PF, fontSize: 9, padding: "10px 20px", background: "transparent", color: c.t2, border: pb(c), cursor: "pointer" }}>← VOLTAR</button>
        </div>
      </F>
    </div>
  );
};

/* ═══════════════════════════════════════════
   PAGE — Share Card (clear celebration)
   ═══════════════════════════════════════════ */
export const ShareCard = ({ user, stats, clearData, go }) => {
  const { C: c } = useTheme();
  const data = clearData || (user.clears[0] ? { game: user.clears[0].game, hours: user.clears[0].hours, rating: user.clears[0].r } : { game: "ClearRun", hours: 0, rating: 5 });

  return (
    <div className="cr-page-sm"><RS />
      <F delay={50}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h1 style={{ fontFamily: PF, fontSize: 13, color: c.nG, margin: "0 0 8px" }}>COMPARTILHAR CLEAR</h1>
          <p style={{ fontFamily: BF, fontSize: 16, color: c.t2 }}>Salve ou tire um screenshot para postar!</p>
        </div>
      </F>

      {/* The card */}
      <F delay={100}>
        <div style={{
          background: `linear-gradient(135deg, ${c.c1}, ${c.c2})`,
          border: pb(c, c.nG),
          padding: 28,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          maxWidth: 400,
          margin: "0 auto",
        }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 30% 20%, ${c.nG}10 0%, transparent 60%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 12, right: 14, fontFamily: PF, fontSize: 7, color: c.t2, opacity: .5 }}>clearrun.gg</div>

          <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
          <div style={{ fontFamily: PF, fontSize: 11, color: c.nY, marginBottom: 12, textShadow: `0 0 10px ${c.nY}44` }}>GAME CLEAR!</div>

          <div style={{ fontFamily: PF, fontSize: 14, color: c.nG, marginBottom: 6, textShadow: `0 0 8px ${c.nG}44` }}>{data.game}</div>

          {data.hours > 0 && <div style={{ fontFamily: BF, fontSize: 18, color: c.t2, marginBottom: 4 }}>{data.hours}h de gameplay</div>}
          {data.rating > 0 && <div style={{ color: c.nY, fontSize: 16, marginBottom: 12, letterSpacing: 4 }}><Stars n={data.rating} /></div>}

          <div style={{ height: 1, borderBottom: `1px dashed ${c.bd}`, margin: "12px auto", width: "60%" }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 12 }}>
            <div style={{ width: 40, height: 40, background: c.bg, border: pb(c, c.nG), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{user.avatar}</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: PF, fontSize: 10, color: c.nG }}>{user.username}</div>
              <div style={{ fontFamily: BF, fontSize: 14, color: c.t2 }}>Lvl {user.level} · {user.titleIcon} {user.title}</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14, fontFamily: BF, fontSize: 14, color: c.t2 }}>
            <span>🏆 {user.gamesCleared} clears</span>
            <span>🔥 {user.currentStreak}d streak</span>
            <span>⏱️ {user.totalHours}h</span>
          </div>
        </div>
      </F>

      <F delay={200}>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
          <button onClick={() => go("home")} style={{ fontFamily: PF, fontSize: 9, padding: "10px 20px", background: "transparent", color: c.t2, border: pb(c), cursor: "pointer" }}>← VOLTAR</button>
          <button onClick={() => go("profile")} style={{ fontFamily: PF, fontSize: 9, padding: "10px 20px", background: c.nG + "18", color: c.nG, border: pb(c, c.nG), cursor: "pointer" }}>VER PERFIL</button>
        </div>
      </F>
    </div>
  );
};

/* ═══════════════════════════════════════════
   PAGE — Group Detail
   ═══════════════════════════════════════════ */
export const GroupDetail = ({ groupId, go, groups, setGroups, user }) => {
  const { C: c } = useTheme();
  const g = groups.find(x => x.id === groupId);
  const [tab, setTab] = useState("feed");
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!g) return null;
  const sorted = [...g.members].sort((a, b) => b.clears - a.clears);
  const copy = t => { navigator.clipboard.writeText(t).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="cr-page"><RS />
      <F delay={50}><button onClick={() => go("groups")} style={{ fontFamily: PF, fontSize: 8, padding: "6px 12px", background: "transparent", color: c.t2, border: pb(c), cursor: "pointer", marginBottom: 12 }}>← VOLTAR</button></F>
      <F delay={100}>
        <div style={{ background: c.c1, border: pb(c, g.color), padding: 20, marginBottom: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${g.color}10 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
            <div>
              <h1 style={{ fontFamily: PF, fontSize: 13, color: g.color, margin: 0 }}>{g.emoji} {g.name}</h1>
              <div style={{ fontFamily: BF, fontSize: 16, color: c.t2, marginTop: 6 }}>👥 {g.members.length} · {g.genres.join(" · ")}</div>
              <div style={{ fontFamily: BF, fontSize: 14, color: c.t2, marginTop: 2 }}>⏱️ Mín. {MINTIMES.find(t => t.v === g.minTime)?.l}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setShowCode(!showCode)} style={{ fontFamily: PF, fontSize: 7, padding: "6px 10px", background: c.nC + "18", color: c.nC, border: pb(c, c.nC), cursor: "pointer" }}>🔑</button>
              <button onClick={() => go("groupCheckin", { groupId: g.id })} style={{ fontFamily: PF, fontSize: 7, padding: "6px 10px", background: c.nG + "18", color: c.nG, border: pb(c, c.nG), cursor: "pointer" }}>✅ CHECK-IN</button>
            </div>
          </div>
          {showCode && <div style={{ marginTop: 12, padding: 10, background: c.bg, border: pb(c) }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><div style={{ fontFamily: PF, fontSize: 16, color: c.nY, letterSpacing: 6, flex: 1, textAlign: "center" }}>{g.code}</div><button onClick={() => copy(g.code)} style={{ fontFamily: PF, fontSize: 7, padding: "6px 10px", background: copied ? c.nG + "22" : "transparent", color: copied ? c.nG : c.t2, border: pb(c, copied ? c.nG : c.bd), cursor: "pointer" }}>{copied ? "✓" : "COPIAR"}</button></div></div>}
        </div>
      </F>

      <F delay={150}><div style={{ display: "flex", gap: 4, marginBottom: 16 }}>{[{ k: "feed", l: "📡 Feed" }, { k: "ranking", l: "🏅 Ranking" }, { k: "campaigns", l: "⚔️ Campanhas" }, { k: "members", l: "👥 Membros" }].map(t => <button key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, fontFamily: PF, fontSize: 7, padding: "10px 4px", background: tab === t.k ? g.color + "18" : "transparent", color: tab === t.k ? g.color : c.t2, border: pb(c, tab === t.k ? g.color : c.bd), cursor: "pointer" }}>{t.l}</button>)}</div></F>

      {tab === "feed" && <F delay={50}>{g.feed.length === 0 ? <div style={{ background: c.c1, border: pb(c), padding: 16, textAlign: "center" }}><div style={{ fontFamily: BF, fontSize: 16, color: c.t2 }}>Faça o primeiro check-in!</div></div> : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{g.feed.map((f, i) => <div key={i} style={{ background: c.c1, border: pb(c), padding: "10px 12px", display: "flex", gap: 10 }}><span style={{ fontSize: 22 }}>{f.avatar}</span><div style={{ flex: 1 }}><div style={{ fontFamily: BF, fontSize: 16, color: c.t1 }}><span style={{ color: c.nC }}>{f.user}</span> {f.action === "zerou" ? <span>zerou <span style={{ color: c.nG }}>{f.game}</span> {f.emoji}</span> : <span>check-in <span style={{ color: c.nY }}>{f.game}</span> {f.emoji}</span>}</div>{f.note && <div style={{ fontFamily: BF, fontSize: 14, color: c.t2, fontStyle: "italic" }}>"{f.note}"</div>}<div style={{ fontFamily: BF, fontSize: 12, color: c.t2, opacity: .6 }}>{f.time} · +{f.xp}XP</div></div></div>)}</div>}</F>}
      {tab === "ranking" && <F delay={50}><div style={{ background: c.c1, border: pb(c), overflow: "hidden" }}>{sorted.map((m, i) => <div key={m.user} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: i < sorted.length - 1 ? pb(c, c.bd, 1) : "none" }}><span style={{ fontFamily: PF, fontSize: 11, width: 28, textAlign: "center", color: i === 0 ? c.nY : i === 1 ? "#c0c0c0" : i === 2 ? c.nO : c.t2 }}>{i === 0 ? "👑" : `#${i + 1}`}</span><span style={{ fontSize: 20 }}>{m.avatar}</span><div style={{ flex: 1 }}><div style={{ fontFamily: BF, fontSize: 17, color: c.t1, display: "flex", alignItems: "center", gap: 6 }}>{m.user} <Dot on={m.online} /></div><div style={{ fontFamily: BF, fontSize: 13, color: c.t2 }}>{m.hours}h · 🔥{m.streak}d</div></div><div style={{ fontFamily: PF, fontSize: 11, color: c.nG }}>{m.clears}</div></div>)}</div></F>}
      {tab === "campaigns" && <F delay={50}>{g.campaigns.length === 0 ? <div style={{ background: c.c1, border: pb(c), padding: 16, textAlign: "center" }}><div style={{ fontFamily: BF, fontSize: 16, color: c.t2 }}>Nenhuma campanha</div></div> : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{g.campaigns.map(cp => { const dn = cp.progress === cp.total; return <div key={cp.id} style={{ background: c.c1, border: pb(c, dn ? c.nY : c.bd), padding: 14 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontFamily: PF, fontSize: 9, color: dn ? c.nY : g.color }}>{cp.emoji} {cp.name}</span><span style={{ fontFamily: BF, fontSize: 14, color: c.t2 }}>{cp.deadline}</span></div><div style={{ marginTop: 8 }}><XP cur={cp.progress} max={cp.total} color={dn ? c.nY : g.color} h={8} label={false} /></div>{cp.games.map((gm, gi) => <div key={gi} style={{ fontFamily: BF, fontSize: 15, color: c.t1, padding: "2px 0 2px 8px" }}>{gi < cp.progress ? "✅" : "⬜"} {gm}</div>)}</div>; })}</div>}</F>}
      {tab === "members" && <F delay={50}><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{g.members.map(m => <div key={m.user} style={{ background: c.c1, border: pb(c), padding: 12, display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontSize: 24 }}>{m.avatar}</span><div style={{ flex: 1 }}><div style={{ fontFamily: BF, fontSize: 17, color: c.t1, display: "flex", alignItems: "center", gap: 6 }}>{m.user} <Dot on={m.online} /></div><div style={{ fontFamily: BF, fontSize: 14, color: c.t2 }}>{m.clears} clears · {m.hours}h · 🔥{m.streak}d</div></div></div>)}</div></F>}
    </div>
  );
};

/* ═══════════════════════════════════════════
   PAGE — Group Check-In
   ═══════════════════════════════════════════ */
export const GroupCheckin = ({ groupId, go, groups, setGroups, user, stats, setStats }) => {
  const { C: c } = useTheme();
  const g = groups.find(x => x.id === groupId);
  const [type, setType] = useState("");
  const [game, setGame] = useState("");
  const [plat, setPlat] = useState("");
  const [hours, setHours] = useState("");
  const [note, setNote] = useState("");
  const [rating, setRating] = useState(0);
  const [success, setSuccess] = useState(false);
  if (!g) return null;
  const allGames = getGamesForGenres(g.genres);
  const canSubmit = type && game && plat;
  const submit = () => {
    if (!canSubmit) return;
    const isClear = type === "clear";
    const feedEntry = { user: user.username, avatar: user.avatar, action: isClear ? "zerou" : "check-in", game, time: "agora", emoji: isClear ? "🏆" : "✅", xp: isClear ? 250 : 50 };
    if (note) feedEntry.note = note;
    setGroups(prev => prev.map(gr => gr.id === g.id ? { ...gr, feed: [feedEntry, ...gr.feed] } : gr));
    const newStats = processCheckin(stats, hours, isClear, isClear ? { game, plat, rating } : null);
    setStats(newStats);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      if (isClear) go("shareCard", { clearData: { game, hours: parseFloat(hours) || 0, rating } });
      else go("groupDetail", { groupId: g.id });
    }, 2000);
  };

  return (
    <div className="cr-page-sm"><RS />
      {success && <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(10,10,26,0.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "fadeIn .3s" }}><div style={{ fontSize: 64, marginBottom: 16 }}>{type === "clear" ? "🏆" : "✅"}</div><div style={{ fontFamily: PF, fontSize: 14, color: type === "clear" ? c.nY : c.nG, marginBottom: 8 }}>{type === "clear" ? "GAME CLEAR!" : "CHECK-IN!"}</div><div style={{ fontFamily: BF, fontSize: 22, color: c.t1 }}>{game}</div><div style={{ fontFamily: BF, fontSize: 16, color: g.color, marginTop: 4 }}>em {g.name}</div><div style={{ fontFamily: BF, fontSize: 18, color: c.nG, marginTop: 12 }}>+{type === "clear" ? 250 : 50} XP</div><style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style></div>}
      <F delay={50}><button onClick={() => go("groupDetail", { groupId: g.id })} style={{ fontFamily: PF, fontSize: 8, padding: "6px 12px", background: "transparent", color: c.t2, border: pb(c), cursor: "pointer", marginBottom: 12 }}>← {g.name}</button></F>
      <F delay={80}><div style={{ textAlign: "center", marginBottom: 24 }}><span style={{ fontSize: 32 }}>📝</span><h1 style={{ fontFamily: PF, fontSize: 12, color: g.color, margin: "6px 0 0" }}>CHECK-IN</h1><p style={{ fontFamily: BF, fontSize: 16, color: c.t2, marginTop: 4 }}>em <span style={{ color: g.color }}>{g.name}</span> · Mín. {MINTIMES.find(t => t.v === g.minTime)?.l}</p></div></F>
      <F delay={120}><ST icon="🎯" title="TIPO" /><div style={{ display: "flex", gap: 10, marginBottom: 20 }}><Btn active={type === "checkin"} onClick={() => setType("checkin")} color={c.nC}>✅ CHECK-IN</Btn><Btn active={type === "clear"} onClick={() => setType("clear")} color={c.nY}>🏆 CLEAR</Btn></div></F>
      <F delay={160}><ST icon="🎮" title="JOGO" /><GamePicker games={allGames} value={game} onChange={setGame} /></F>
      <F delay={200}><ST icon="🖥️" title="PLATAFORMA" /><div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>{PLATFORMS.map(p => <Btn key={p} active={plat === p} onClick={() => setPlat(p)} color={c.nM}>{p}</Btn>)}</div></F>
      <F delay={240}><ST icon="⏱️" title="HORAS (opcional)" /><input type="number" value={hours} onChange={e => setHours(e.target.value)} placeholder="Ex: 2" min="0" style={{ width: "100%", fontFamily: BF, fontSize: 18, padding: "10px 12px", background: c.c1, color: c.t1, border: pb(c), outline: "none", marginBottom: 20 }} /></F>
      {type === "clear" && <F delay={260}><ST icon="⭐" title="NOTA" /><div style={{ display: "flex", gap: 8, marginBottom: 20 }}>{[1, 2, 3, 4, 5].map(s => <span key={s} onClick={() => setRating(s)} style={{ fontSize: 24, cursor: "pointer", color: s <= rating ? c.nY : c.bd }}>★</span>)}</div></F>}
      <F delay={280}><ST icon="💬" title="COMENTÁRIO (opcional)" /><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Como tá a gameplay?" rows={2} style={{ width: "100%", fontFamily: BF, fontSize: 18, padding: "10px 12px", background: c.c1, color: c.t1, border: pb(c), outline: "none", resize: "vertical", marginBottom: 24 }} /></F>
      <F delay={320}><button onClick={submit} disabled={!canSubmit} style={{ width: "100%", fontFamily: PF, fontSize: 11, padding: "14px", background: canSubmit ? c.nG + "18" : c.c1, color: canSubmit ? c.nG : c.t2, border: pb(c, canSubmit ? c.nG : c.bd), cursor: canSubmit ? "pointer" : "not-allowed" }}>{type === "clear" ? "🏆 REGISTRAR CLEAR" : "✅ REGISTRAR CHECK-IN"}</button></F>
    </div>
  );
};

/* ═══════════════════════════════════════════
   PAGE — Groups Hub
   ═══════════════════════════════════════════ */
export const GroupsHub = ({ go, groups }) => {
  const { C: c } = useTheme();
  return (
    <div className="cr-page"><RS />
      <F delay={50}><h1 style={{ fontFamily: PF, fontSize: 14, color: c.nG, margin: "0 0 6px" }}>🛡️ MEUS GRUPOS</h1><p style={{ fontFamily: BF, fontSize: 18, color: c.t2, marginBottom: 24 }}>Grupos privados de competição</p></F>
      <F delay={100}><div style={{ display: "flex", gap: 10, marginBottom: 24 }}>{[{ i: "➕", l: "CRIAR", s: "Novo grupo", cl: c.nG, t: "createGroup" }, { i: "🔑", l: "ENTRAR", s: "Com código", cl: c.nC, t: "joinGroup" }].map(a => <button key={a.t} onClick={() => go(a.t)} style={{ flex: 1, padding: "18px 12px", background: c.c1, border: pb(c, a.cl), cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}><span style={{ fontSize: 26 }}>{a.i}</span><span style={{ fontFamily: PF, fontSize: 9, color: a.cl }}>{a.l}</span><span style={{ fontFamily: BF, fontSize: 14, color: c.t2 }}>{a.s}</span></button>)}</div></F>
      <F delay={180}><ST icon="🛡️" title={`GRUPOS (${groups.length})`} /><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{groups.map(g => <div key={g.id} onClick={() => go("groupDetail", { groupId: g.id })} style={{ background: c.c1, border: pb(c), padding: 14, cursor: "pointer" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontFamily: PF, fontSize: 10, color: g.color }}>{g.emoji} {g.name}</span>{g.role === "admin" && <Tag color={c.nY}>ADMIN</Tag>}</div><span style={{ fontFamily: BF, fontSize: 14, color: c.t2 }}>👥{g.members.length}</span></div><div style={{ fontFamily: BF, fontSize: 14, color: c.t2 }}>{g.genres.slice(0, 3).join(", ")}</div></div>)}</div></F>
    </div>
  );
};

/* ═══════════════════════════════════════════
   PAGE — Create Group
   ═══════════════════════════════════════════ */
export const CreateGroup = ({ go, groups, setGroups, user }) => {
  const { C: c } = useTheme();
  const [name, setName] = useState(""); const [genres, setGenres] = useState([]); const [minT, setMinT] = useState(30); const [invite, setInvite] = useState(null); const [copied, setCopied] = useState(null);
  const ok = name.trim().length >= 2 && genres.length >= 1;
  const create = () => { if (!ok) return; const code = genCode(); const gl = genres.map(gId => { const gn = GENRES.find(x => x.id === gId); return gn ? gn.i + " " + gn.l : gId; }); const ng = { id: "g_" + Date.now(), name: name.trim(), emoji: GENRES.find(x => x.id === genres[0])?.i || "🛡️", color: GCOLORS[groups.length % GCOLORS.length], role: "admin", minTime: minT, genres: gl, code, members: [{ user: user.username, avatar: user.avatar, clears: 0, hours: 0, streak: 0, online: true }], campaigns: [], feed: [] }; setGroups(prev => [...prev, ng]); setInvite(code); };
  const copy = (t, k) => { navigator.clipboard.writeText(t).catch(() => {}); setCopied(k); setTimeout(() => setCopied(null), 2000); };

  if (invite) return <div className="cr-page-sm"><RS /><F delay={50}><div style={{ background: c.c1, border: pb(c, c.nG), padding: 28, textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div><h2 style={{ fontFamily: PF, fontSize: 12, color: c.nG, margin: "0 0 6px" }}>GRUPO CRIADO!</h2><p style={{ fontFamily: BF, fontSize: 18, color: c.t2, marginBottom: 20 }}>Compartilhe com amigos</p><div style={{ marginBottom: 16 }}><div style={{ fontFamily: BF, fontSize: 14, color: c.t2, marginBottom: 6, textAlign: "left" }}>Código:</div><div style={{ display: "flex", gap: 8 }}><div style={{ flex: 1, fontFamily: PF, fontSize: 18, color: c.nY, background: c.bg, border: pb(c), padding: "12px", letterSpacing: 6, textAlign: "center" }}>{invite}</div><button onClick={() => copy(invite, "c")} style={{ fontFamily: PF, fontSize: 8, padding: "12px 14px", background: copied === "c" ? c.nG + "22" : "transparent", color: copied === "c" ? c.nG : c.t2, border: pb(c, copied === "c" ? c.nG : c.bd), cursor: "pointer" }}>{copied === "c" ? "✓" : "COPIAR"}</button></div></div><button onClick={() => go("groups")} style={{ width: "100%", fontFamily: PF, fontSize: 10, padding: "14px", background: c.nG + "18", color: c.nG, border: pb(c, c.nG), cursor: "pointer" }}>IR PARA GRUPOS →</button></div></F></div>;

  return <div className="cr-page-sm"><RS /><F delay={50}><button onClick={() => go("groups")} style={{ fontFamily: PF, fontSize: 8, padding: "6px 12px", background: "transparent", color: c.t2, border: pb(c), cursor: "pointer", marginBottom: 12 }}>← VOLTAR</button><div style={{ textAlign: "center", marginBottom: 24 }}><span style={{ fontSize: 32 }}>🛡️</span><h1 style={{ fontFamily: PF, fontSize: 13, color: c.nG, margin: "6px 0 0" }}>NOVO GRUPO</h1></div></F>
  <F delay={100}><ST icon="✏️" title="NOME" /><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Squad dos Gamers" maxLength={30} style={{ width: "100%", fontFamily: BF, fontSize: 20, padding: "12px", background: c.c1, color: c.t1, border: pb(c, name.trim() ? c.nG : c.bd), outline: "none", marginBottom: 20 }} /></F>
  <F delay={150}><ST icon="🎮" title="GÊNEROS" /><div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>{GENRES.map(gn => <button key={gn.id} onClick={() => setGenres(p => p.includes(gn.id) ? p.filter(x => x !== gn.id) : [...p, gn.id])} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 10px", fontFamily: BF, fontSize: 16, background: genres.includes(gn.id) ? c.nG + "18" : c.c1, color: genres.includes(gn.id) ? c.nG : c.t2, border: pb(c, genres.includes(gn.id) ? c.nG : c.bd), cursor: "pointer" }}><span>{gn.i}</span>{gn.l}</button>)}</div></F>
  <F delay={200}><ST icon="⏱️" title="TEMPO MÍNIMO" /><div style={{ display: "flex", gap: 6, marginBottom: 24 }}>{MINTIMES.map(t => <button key={t.v} onClick={() => setMinT(t.v)} style={{ flex: 1, padding: "10px 6px", fontFamily: PF, fontSize: 8, background: minT === t.v ? c.nC + "18" : c.c1, color: minT === t.v ? c.nC : c.t2, border: pb(c, minT === t.v ? c.nC : c.bd), cursor: "pointer" }}>{t.l}</button>)}</div></F>
  <F delay={280}><button onClick={create} disabled={!ok} style={{ width: "100%", fontFamily: PF, fontSize: 11, padding: "14px", background: ok ? c.nG + "18" : c.c1, color: ok ? c.nG : c.t2, border: pb(c, ok ? c.nG : c.bd), cursor: ok ? "pointer" : "not-allowed" }}>🛡️ CRIAR GRUPO</button></F></div>;
};

/* ═══════════════════════════════════════════
   PAGE — Join Group
   ═══════════════════════════════════════════ */
export const JoinGroup = ({ go, groups, setGroups, user }) => {
  const { C: c } = useTheme();
  const [input, setInput] = useState(""); const [found, setFound] = useState(null); const [err, setErr] = useState(false); const [joined, setJoined] = useState(false); const [loading, setLoading] = useState(false);
  const search = () => { if (input.trim().length < 3) return; setLoading(true); setErr(false); setFound(null); setTimeout(() => { const code = input.trim().toUpperCase().replace(/.*\/join\//, "").slice(0, 6); const g = groups.find(x => x.code === code); if (g) setFound({ ...g, alreadyMember: g.members.some(m => m.user === user.username) }); else setFound(null); setErr(!g); setLoading(false); }, 400); };
  const join = () => { if (!found || found.alreadyMember) return; setGroups(prev => prev.map(g => g.code === found.code ? { ...g, members: [...g.members, { user: user.username, avatar: user.avatar, clears: 0, hours: 0, streak: 0, online: true }] } : g)); setJoined(true); setTimeout(() => go("groups"), 2000); };

  return <div className="cr-page-sm"><RS />
    {joined && <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(10,10,26,0.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "fadeIn .3s" }}><div style={{ fontSize: 56, marginBottom: 12 }}>🎊</div><div style={{ fontFamily: PF, fontSize: 13, color: c.nG }}>BEM-VINDO!</div><div style={{ fontFamily: BF, fontSize: 20, color: c.t1, marginTop: 6 }}>Entrou em {found?.name}</div><style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style></div>}
    <F delay={50}><button onClick={() => go("groups")} style={{ fontFamily: PF, fontSize: 8, padding: "6px 12px", background: "transparent", color: c.t2, border: pb(c), cursor: "pointer", marginBottom: 12 }}>← VOLTAR</button><div style={{ textAlign: "center", marginBottom: 24 }}><span style={{ fontSize: 32 }}>🔑</span><h1 style={{ fontFamily: PF, fontSize: 13, color: c.nC, margin: "6px 0 0" }}>ENTRAR EM GRUPO</h1></div></F>
    <F delay={100}><ST icon="📋" title="CÓDIGO OU LINK" /><div style={{ display: "flex", gap: 8, marginBottom: 8 }}><input type="text" value={input} onChange={e => { setInput(e.target.value.toUpperCase()); setErr(false); setFound(null); }} placeholder="Ex: MTRVN1" maxLength={50} style={{ flex: 1, fontFamily: PF, fontSize: 12, padding: "12px", background: c.c1, color: c.nY, border: pb(c, err ? c.red : c.bd), outline: "none", letterSpacing: 3 }} onKeyDown={e => e.key === "Enter" && search()} /><button onClick={search} disabled={input.trim().length < 3 || loading} style={{ fontFamily: PF, fontSize: 9, padding: "12px 16px", background: c.nC + "18", color: c.nC, border: pb(c, c.nC), cursor: input.trim().length < 3 || loading ? "not-allowed" : "pointer", opacity: input.trim().length < 3 || loading ? .4 : 1 }}>{loading ? "..." : "BUSCAR"}</button></div>{err && <div style={{ fontFamily: BF, fontSize: 15, color: c.red, padding: "6px 10px", background: c.red + "10", border: pb(c, c.red, 1), marginBottom: 12 }}>❌ Não encontrado.</div>}</F>
    {found && !joined && <F delay={0}><div style={{ background: c.c1, border: pb(c, c.nG), padding: 18, marginBottom: 20 }}><div style={{ fontFamily: PF, fontSize: 11, color: c.nG, marginBottom: 10 }}>{found.emoji} {found.name}</div><div style={{ fontFamily: BF, fontSize: 16, color: c.t1, display: "flex", flexDirection: "column", gap: 4 }}><span>👥 {found.members.length} membros</span><span>🎮 {found.genres.join(" · ")}</span><span>⏱️ Mín: {MINTIMES.find(t => t.v === found.minTime)?.l || found.minTime + "min"}</span></div>{found.alreadyMember ? <div style={{ fontFamily: BF, fontSize: 15, color: c.nY, marginTop: 12, textAlign: "center" }}>⚠️ Você já está neste grupo</div> : <button onClick={join} style={{ width: "100%", fontFamily: PF, fontSize: 10, padding: "12px", marginTop: 12, background: c.nG + "18", color: c.nG, border: pb(c, c.nG), cursor: "pointer" }}>✅ ENTRAR</button>}</div></F>}
  </div>;
};

/* ═══════════════════════════════════════════
   PAGE — Profile (updated with share + public)
   ═══════════════════════════════════════════ */
export const Profile = ({ user, go, groups, stats }) => {
  const { C: c } = useTheme();
  return (
    <div className="cr-page"><RS />
      <F delay={80}>
        <div style={{ background: c.c1, border: pb(c, c.nG), padding: 22, textAlign: "center", marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${c.nG}08 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ width: 64, height: 64, margin: "0 auto 10px", background: c.bg, border: pb(c, c.nG), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{user.avatar}</div>
          <h2 style={{ fontFamily: PF, fontSize: 13, color: c.nG, margin: 0 }}>{user.username}</h2>
          <div style={{ fontFamily: BF, fontSize: 17, color: c.nC, marginTop: 4 }}>{user.titleIcon} {user.title}</div>
          <div style={{ fontFamily: PF, fontSize: 10, color: c.nY, marginTop: 8 }}>LVL {user.level} · {user.totalXp} XP total</div>
          <div style={{ maxWidth: 280, margin: "8px auto 0" }}><XP cur={user.xp} max={user.xpNext} /></div>
          <div style={{ fontFamily: BF, fontSize: 13, color: c.t2, marginTop: 4 }}>Próximo: {user.nextTitle}</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
            <button onClick={() => go("settings")} style={{ fontFamily: PF, fontSize: 7, padding: "6px 12px", background: "transparent", color: c.t2, border: pb(c), cursor: "pointer" }}>⚙️ EDITAR</button>
            <button onClick={() => go("shareCard")} style={{ fontFamily: PF, fontSize: 7, padding: "6px 12px", background: c.nG + "18", color: c.nG, border: pb(c, c.nG), cursor: "pointer" }}>📤 COMPARTILHAR</button>
          </div>
        </div>
      </F>

      <F delay={160}><div className="cr-grid2" style={{ marginBottom: 24 }}>{[{ l: "Zerados", v: user.gamesCleared, i: "🏆" }, { l: "Horas", v: user.totalHours + "h", i: "⏱️" }, { l: "Streak", v: user.currentStreak + "d", i: "🔥" }, { l: "Check-ins", v: user.totalCheckins, i: "📋" }].map((s, i) => <div key={i} style={{ background: c.c1, border: pb(c), padding: 12, display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 22 }}>{s.i}</span><div><div style={{ fontFamily: PF, fontSize: 12, color: c.t1 }}>{s.v}</div><div style={{ fontFamily: BF, fontSize: 14, color: c.t2 }}>{s.l}</div></div></div>)}</div></F>

      <F delay={240}><ST icon="🎖️" title="CONQUISTAS" />{user.badges.length === 0 ? <div style={{ background: c.c1, border: pb(c), padding: 16, textAlign: "center", marginBottom: 24 }}><div style={{ fontFamily: BF, fontSize: 16, color: c.t2 }}>🎖️ Jogue para desbloquear!</div></div> : <div className="cr-badges" style={{ marginBottom: 24 }}>{user.allBadges.map((b, i) => <div key={i} style={{ background: c.c1, border: pb(c, b.unlocked ? c.nG : c.bd), padding: 12, textAlign: "center", opacity: b.unlocked ? 1 : .35 }}><div style={{ fontSize: 26, marginBottom: 4 }}>{b.i}</div><div style={{ fontFamily: PF, fontSize: 7, color: b.unlocked ? c.nC : c.t2, lineHeight: 1.5 }}>{b.n}</div><div style={{ fontFamily: BF, fontSize: 12, color: c.t2, marginTop: 2 }}>{b.d}</div></div>)}</div>}</F>

      <F delay={320}><ST icon="🎮" title="ÚLTIMOS CLEARS" />{user.clears.length === 0 ? <div style={{ background: c.c1, border: pb(c), padding: 16, textAlign: "center", marginBottom: 24 }}><div style={{ fontFamily: BF, fontSize: 16, color: c.t2 }}>🎮 Zere um jogo!</div></div> : <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>{user.clears.map((g, i) => <div key={i} style={{ background: c.c1, border: pb(c), padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontFamily: PF, fontSize: 9, color: c.nG }}>{g.game}</div><div style={{ fontFamily: BF, fontSize: 14, color: c.t2, marginTop: 2 }}>{g.plat} · {g.hours}h · {g.date}</div></div><div style={{ color: c.nY, fontSize: 12 }}><Stars n={g.r} /></div></div>)}</div>}</F>
    </div>
  );
};

/* ═══════════════════════════════════════════
   PAGE — Settings (draft → save)
   ═══════════════════════════════════════════ */
export const Settings = ({ settings, setSettings, go }) => {
  const { C: c, dark, setDark } = useTheme();
  const [draft, setDraft] = useState({ ...settings });
  const [draftDark, setDraftDark] = useState(dark);
  const [saved, setSaved] = useState(false);
  const hasChanges = draft.displayName !== settings.displayName || draft.avatar !== settings.avatar || draft.favGames?.join() !== settings.favGames?.join() || draftDark !== dark;
  const save = () => { setSettings({ ...draft }); setDark(draftDark); setSaved(true); setTimeout(() => setSaved(false), 1500); };
  const allGames = Object.values(GAME_CATALOG).flat().filter((v, i, a) => a.indexOf(v) === i).sort();

  return <div className="cr-page-sm"><RS />
    <F delay={50}><h1 style={{ fontFamily: PF, fontSize: 13, color: c.nG, margin: "0 0 24px" }}>⚙️ CONFIGURAÇÕES</h1></F>
    <F delay={100}><ST icon="😀" title="AVATAR" /><div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>{AVATARS.map(a => <button key={a} onClick={() => setDraft(s => ({ ...s, avatar: a }))} style={{ width: 44, height: 44, fontSize: 22, background: draft.avatar === a ? c.nG + "22" : c.c1, border: pb(c, draft.avatar === a ? c.nG : c.bd), cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{a}</button>)}</div></F>
    <F delay={150}><ST icon="✏️" title="NOME" /><input type="text" value={draft.displayName} onChange={e => setDraft(s => ({ ...s, displayName: e.target.value }))} maxLength={20} style={{ width: "100%", fontFamily: BF, fontSize: 20, padding: "12px", background: c.c1, color: c.t1, border: pb(c, c.bd), outline: "none", marginBottom: 24 }} /></F>
    <F delay={200}><ST icon="🎨" title="TEMA" /><div style={{ display: "flex", gap: 10, marginBottom: 24 }}><button onClick={() => setDraftDark(true)} style={{ flex: 1, padding: "14px", fontFamily: PF, fontSize: 9, background: draftDark ? c.nG + "18" : c.c1, color: draftDark ? c.nG : c.t2, border: pb(c, draftDark ? c.nG : c.bd), cursor: "pointer" }}>🌙 ESCURO</button><button onClick={() => setDraftDark(false)} style={{ flex: 1, padding: "14px", fontFamily: PF, fontSize: 9, background: !draftDark ? c.nG + "18" : c.c1, color: !draftDark ? c.nG : c.t2, border: pb(c, !draftDark ? c.nG : c.bd), cursor: "pointer" }}>☀️ CLARO</button></div></F>
    <F delay={250}><ST icon="❤️" title="JOGOS FAVORITOS" /><GamePicker games={allGames} value="" onChange={g => { if (g && !draft.favGames?.includes(g)) setDraft(s => ({ ...s, favGames: [...(s.favGames || []), g] })); }} placeholder="🔍 Adicionar favorito..." />{draft.favGames?.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>{draft.favGames.map(g => <button key={g} onClick={() => setDraft(s => ({ ...s, favGames: s.favGames.filter(x => x !== g) }))} style={{ padding: "5px 10px", fontFamily: BF, fontSize: 14, background: c.nM + "18", color: c.nM, border: pb(c, c.nM), cursor: "pointer" }}>{g} ✕</button>)}</div>}</F>
    <F delay={300}><button onClick={save} disabled={!hasChanges && !saved} style={{ width: "100%", fontFamily: PF, fontSize: 11, padding: "14px", background: saved ? c.nG + "22" : hasChanges ? c.nG + "18" : c.c1, color: saved ? c.nG : hasChanges ? c.nG : c.t2, border: pb(c, saved || hasChanges ? c.nG : c.bd), cursor: hasChanges ? "pointer" : "default" }}>{saved ? "✓ SALVO!" : hasChanges ? "💾 SALVAR" : "💾 SALVAR"}</button>{hasChanges && !saved && <p style={{ fontFamily: BF, fontSize: 14, color: c.nY, textAlign: "center", marginTop: 8 }}>⚠️ Alterações não salvas</p>}</F>
  </div>;
};

/* ═══════════════════════════════════════════
   PAGE — Notifications
   ═══════════════════════════════════════════ */
export const Notifs = () => {
  const { C: c } = useTheme();
  const icons = { clear: "🏆", join: "👋", campaign: "🎉", streak: "🔥" };
  return <div className="cr-page-sm"><RS />
    <F delay={50}><h1 style={{ fontFamily: PF, fontSize: 13, color: c.nG, margin: "0 0 20px" }}>🔔 NOTIFICAÇÕES</h1></F>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{NOTIFS.map((n, i) => <F key={n.id} delay={100 + i * 60}><div style={{ background: n.read ? c.c1 : c.c2, border: pb(c, n.read ? c.bd : c.nG), padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}><span style={{ fontSize: 22 }}>{icons[n.type] || "📌"}</span><div style={{ flex: 1 }}><div style={{ fontFamily: BF, fontSize: 16, color: n.read ? c.t2 : c.t1 }}>{n.msg}</div><div style={{ fontFamily: BF, fontSize: 13, color: c.t2, opacity: .6, marginTop: 2 }}>{n.time} atrás</div></div>{!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.nG, boxShadow: `0 0 6px ${c.nG}` }} />}</div></F>)}</div>
  </div>;
};
