import { useState } from "react";
import { PF, BF, getC, pb } from "../constants/colors";
import { GENRES, GAME_CATALOG, AVATARS } from "../constants/mockData";

const ACCENT_COLORS = [
  { id: "green",   hex: "#00ff88", label: "Verde Neon" },
  { id: "cyan",    hex: "#00e5ff", label: "Ciano" },
  { id: "magenta", hex: "#ff00aa", label: "Magenta" },
  { id: "yellow",  hex: "#ffe600", label: "Amarelo" },
  { id: "orange",  hex: "#ff8800", label: "Laranja" },
];

export const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🎮");
  const [dark, setDark] = useState(true);
  const [favGenres, setFavGenres] = useState([]);
  const [favGames, setFavGames] = useState([]);
  const [gameSearch, setGameSearch] = useState("");
  const [accentColor, setAccentColor] = useState("#00ff88");

  const C = getC(dark);
  const border = (c, w = 2) => `${w}px solid ${c || C.bd}`;

  const toggleGenre = (id) => setFavGenres(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  // Games from selected genres
  const availableGames = [...new Set(favGenres.flatMap(gid => GAME_CATALOG[gid] || []))].sort();
  const filteredGames = gameSearch ? availableGames.filter(g => g.toLowerCase().includes(gameSearch.toLowerCase())) : availableGames;

  const canNext = () => {
    if (step === 0) return name.trim().length >= 2;
    if (step === 1) return true; // avatar always selected
    if (step === 2) return true; // theme always selected
    if (step === 3) return favGenres.length >= 1;
    if (step === 4) return true; // games optional
    return true;
  };

  const finish = () => {
    onComplete({
      settings: {
        displayName: name.trim(),
        avatar,
        dark,
        favGames,
        favGenres,
        accentColor,
      },
      dark,
    });
  };

  const STEPS = [
    // Step 0: Name
    () => (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
        <h2 style={{ fontFamily: PF, fontSize: 14, color: accentColor, margin: "0 0 8px", textShadow: `0 0 12px ${accentColor}44` }}>
          BEM-VINDO AO CLEARRUN!
        </h2>
        <p style={{ fontFamily: BF, fontSize: 20, color: C.t2, marginBottom: 28 }}>
          Vamos personalizar sua experiência
        </p>
        <div style={{ textAlign: "left", maxWidth: 400, margin: "0 auto" }}>
          <label style={{ fontFamily: PF, fontSize: 9, color: C.t2, display: "block", marginBottom: 8 }}>
            COMO QUER SER CHAMADO?
          </label>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Seu nome ou apelido gamer"
            maxLength={20} autoFocus
            style={{ width: "100%", fontFamily: BF, fontSize: 22, padding: "14px", background: C.c1, color: C.t1, border: border(name.trim() ? accentColor : C.bd), outline: "none", textAlign: "center" }}
          />
          <div style={{ fontFamily: BF, fontSize: 13, color: C.t2, marginTop: 6, textAlign: "right" }}>{name.length}/20</div>
        </div>
      </div>
    ),

    // Step 1: Avatar
    () => (
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 80, height: 80, margin: "0 auto 16px", background: C.c1, border: border(accentColor), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>
          {avatar}
        </div>
        <h2 style={{ fontFamily: PF, fontSize: 12, color: accentColor, margin: "0 0 6px" }}>ESCOLHA SEU AVATAR</h2>
        <p style={{ fontFamily: BF, fontSize: 18, color: C.t2, marginBottom: 20 }}>Esse ícone representa você nos grupos</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 400, margin: "0 auto" }}>
          {AVATARS.map(a => (
            <button key={a} onClick={() => setAvatar(a)} style={{
              width: 48, height: 48, fontSize: 24, background: avatar === a ? accentColor + "22" : C.c1,
              border: border(avatar === a ? accentColor : C.bd), cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transform: avatar === a ? "scale(1.15)" : "scale(1)", transition: "all 0.15s",
            }}>{a}</button>
          ))}
        </div>
      </div>
    ),

    // Step 2: Theme + Accent Color
    () => (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎨</div>
        <h2 style={{ fontFamily: PF, fontSize: 12, color: accentColor, margin: "0 0 6px" }}>APARÊNCIA</h2>
        <p style={{ fontFamily: BF, fontSize: 18, color: C.t2, marginBottom: 24 }}>Escolha o tema e a cor de destaque</p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 28 }}>
          <button onClick={() => setDark(true)} style={{
            padding: "18px 28px", fontFamily: PF, fontSize: 10, background: dark ? accentColor + "18" : C.c1,
            color: dark ? accentColor : C.t2, border: border(dark ? accentColor : C.bd), cursor: "pointer",
          }}>🌙 ESCURO</button>
          <button onClick={() => setDark(false)} style={{
            padding: "18px 28px", fontFamily: PF, fontSize: 10, background: !dark ? accentColor + "18" : C.c1,
            color: !dark ? accentColor : C.t2, border: border(!dark ? accentColor : C.bd), cursor: "pointer",
          }}>☀️ CLARO</button>
        </div>

        <label style={{ fontFamily: PF, fontSize: 9, color: C.t2, display: "block", marginBottom: 12 }}>COR DE DESTAQUE</label>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {ACCENT_COLORS.map(ac => (
            <button key={ac.id} onClick={() => setAccentColor(ac.hex)} style={{
              width: 44, height: 44, borderRadius: "50%", background: ac.hex,
              border: accentColor === ac.hex ? `3px solid ${C.t1}` : `3px solid transparent`,
              cursor: "pointer", boxShadow: accentColor === ac.hex ? `0 0 12px ${ac.hex}66` : "none",
              transition: "all 0.2s",
            }} title={ac.label} />
          ))}
        </div>
      </div>
    ),

    // Step 3: Favorite Genres
    () => (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎮</div>
        <h2 style={{ fontFamily: PF, fontSize: 12, color: accentColor, margin: "0 0 6px" }}>GÊNEROS FAVORITOS</h2>
        <p style={{ fontFamily: BF, fontSize: 18, color: C.t2, marginBottom: 20 }}>O que você mais curte jogar?</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 500, margin: "0 auto" }}>
          {GENRES.map(g => (
            <button key={g.id} onClick={() => toggleGenre(g.id)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "9px 14px",
              fontFamily: BF, fontSize: 17, background: favGenres.includes(g.id) ? accentColor + "22" : C.c1,
              color: favGenres.includes(g.id) ? accentColor : C.t2,
              border: border(favGenres.includes(g.id) ? accentColor : C.bd), cursor: "pointer", transition: "all 0.15s",
            }}><span>{g.i}</span> {g.l}</button>
          ))}
        </div>
        {favGenres.length > 0 && (
          <div style={{ fontFamily: BF, fontSize: 15, color: accentColor, marginTop: 12 }}>
            ✓ {favGenres.length} gênero{favGenres.length > 1 ? "s" : ""} selecionado{favGenres.length > 1 ? "s" : ""}
          </div>
        )}
      </div>
    ),

    // Step 4: Favorite Games (from selected genres)
    () => (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
        <h2 style={{ fontFamily: PF, fontSize: 12, color: accentColor, margin: "0 0 6px" }}>JOGOS FAVORITOS</h2>
        <p style={{ fontFamily: BF, fontSize: 18, color: C.t2, marginBottom: 20 }}>Opcional — selecione os que você mais gosta</p>

        <div style={{ maxWidth: 450, margin: "0 auto", textAlign: "left" }}>
          <input
            type="text" value={gameSearch} onChange={e => setGameSearch(e.target.value)}
            placeholder="🔍 Pesquisar jogo..."
            style={{ width: "100%", fontFamily: BF, fontSize: 18, padding: "10px 12px", background: C.c1, color: C.t1, border: border(C.bd), outline: "none", marginBottom: 10 }}
          />

          <div style={{ maxHeight: 220, overflowY: "auto", marginBottom: 12, border: border(C.bd) }}>
            {filteredGames.length === 0 && (
              <div style={{ padding: "20px", fontFamily: BF, fontSize: 16, color: C.t2, textAlign: "center" }}>Nenhum jogo encontrado</div>
            )}
            {filteredGames.slice(0, 60).map(g => (
              <div key={g} onClick={() => setFavGames(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])} style={{
                padding: "10px 14px", fontFamily: BF, fontSize: 17, cursor: "pointer",
                color: favGames.includes(g) ? accentColor : C.t1,
                background: favGames.includes(g) ? accentColor + "12" : "transparent",
                borderBottom: `1px solid ${C.bd}22`,
              }}>
                {favGames.includes(g) ? "✅ " : "⬜ "}{g}
              </div>
            ))}
          </div>

          {favGames.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {favGames.map(g => (
                <span key={g} onClick={() => setFavGames(p => p.filter(x => x !== g))} style={{
                  padding: "4px 10px", fontFamily: BF, fontSize: 14, background: accentColor + "18",
                  color: accentColor, border: border(accentColor, 1), cursor: "pointer",
                }}>{g} ✕</span>
              ))}
            </div>
          )}
        </div>
      </div>
    ),

    // Step 5: Summary
    () => (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏁</div>
        <h2 style={{ fontFamily: PF, fontSize: 13, color: accentColor, margin: "0 0 8px" }}>TUDO PRONTO!</h2>
        <p style={{ fontFamily: BF, fontSize: 18, color: C.t2, marginBottom: 24 }}>Confira seu perfil antes de começar</p>

        <div style={{ background: C.c1, border: border(accentColor), padding: 24, maxWidth: 350, margin: "0 auto", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, margin: "0 auto 10px", background: C.bg, border: border(accentColor), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>{avatar}</div>
          <div style={{ fontFamily: PF, fontSize: 13, color: accentColor }}>{name.trim()}</div>
          <div style={{ fontFamily: BF, fontSize: 16, color: C.t2, marginTop: 6 }}>
            {dark ? "🌙 Tema Escuro" : "☀️ Tema Claro"}
          </div>
          <div style={{ fontFamily: BF, fontSize: 15, color: C.t2, marginTop: 4 }}>
            🎮 {favGenres.map(id => GENRES.find(g => g.id === id)?.i).filter(Boolean).join(" ")} · {favGenres.length} gênero{favGenres.length > 1 ? "s" : ""}
          </div>
          {favGames.length > 0 && (
            <div style={{ fontFamily: BF, fontSize: 14, color: C.t2, marginTop: 4 }}>
              ⭐ {favGames.length} jogo{favGames.length > 1 ? "s" : ""} favorito{favGames.length > 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    ),
  ];

  const totalSteps = STEPS.length;
  const isLast = step === totalSteps - 1;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.t1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 16px", transition: "background 0.3s", overflowY: "auto" }}>
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 8, height: 8, borderRadius: 4,
            background: i <= step ? accentColor : C.bd,
            transition: "all 0.3s",
          }} />
        ))}
      </div>

      {/* Step content */}
      <div style={{ width: "100%", maxWidth: 550 }}>
        {STEPS[step]()}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} style={{
            fontFamily: PF, fontSize: 9, padding: "12px 24px",
            background: "transparent", color: C.t2, border: border(C.bd), cursor: "pointer",
          }}>← VOLTAR</button>
        )}
        <button
          onClick={() => isLast ? finish() : setStep(s => s + 1)}
          disabled={!canNext()}
          style={{
            fontFamily: PF, fontSize: 10, padding: "12px 32px",
            background: canNext() ? accentColor + "18" : C.c1,
            color: canNext() ? accentColor : C.t2,
            border: border(canNext() ? accentColor : C.bd),
            cursor: canNext() ? "pointer" : "not-allowed",
            textShadow: canNext() ? `0 0 8px ${accentColor}44` : "none",
            transition: "all 0.2s",
          }}
        >
          {isLast ? "🚀 COMEÇAR!" : "PRÓXIMO →"}
        </button>
      </div>
    </div>
  );
};
