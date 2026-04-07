export const defaultSettings = {
  displayName: "PixelHunter_99",
  avatar: "🎮",
  dark: true,
  favGames: [],
  favGenres: [],
};

export const defaultStats = {
  totalHours: 0,
  gamesCleared: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastCheckinDate: null,
  xp: 0,
  clears: [],
  totalCheckins: 0,
  joinDate: new Date().toISOString().slice(0, 10),
};

/* ═══════════════════════════════════════════
   TITLES & LEVELS — expanded progression
   ═══════════════════════════════════════════ */
const TITLES = [
  { minXp: 0,     label: "Novato",               icon: "🌱" },
  { minXp: 200,   label: "Beginner",             icon: "🎮" },
  { minXp: 500,   label: "Casual Gamer",         icon: "🕹️" },
  { minXp: 1000,  label: "Game Hunter",          icon: "🎯" },
  { minXp: 2500,  label: "Speedrun Apprentice",  icon: "⚡" },
  { minXp: 5000,  label: "Clear Machine",        icon: "🏆" },
  { minXp: 10000, label: "Elite Gamer",          icon: "💎" },
  { minXp: 20000, label: "Legendary",            icon: "👑" },
  { minXp: 50000, label: "Mythic",               icon: "🐉" },
];

const getTitle = (xp) => {
  for (let i = TITLES.length - 1; i >= 0; i--) {
    if (xp >= TITLES[i].minXp) return TITLES[i];
  }
  return TITLES[0];
};

const getNextTitle = (xp) => {
  for (let i = 0; i < TITLES.length; i++) {
    if (TITLES[i].minXp > xp) return TITLES[i];
  }
  return null;
};

/* ═══════════════════════════════════════════
   BADGES — dynamic achievements
   ═══════════════════════════════════════════ */
const ALL_BADGES = [
  { id: "first_clear",  i: "🏆", n: "First Clear",    d: "Zerou seu primeiro jogo",    check: s => s.gamesCleared >= 1 },
  { id: "5h",           i: "⚡", n: "5 Horas",         d: "5+ horas jogadas",           check: s => s.totalHours >= 5 },
  { id: "streak3",      i: "🔥", n: "Em Chamas",       d: "3 dias de streak",           check: s => s.currentStreak >= 3 },
  { id: "streak7",      i: "💪", n: "Imparável",       d: "7 dias de streak",           check: s => s.longestStreak >= 7 },
  { id: "streak30",     i: "🌟", n: "Lenda",           d: "30 dias de streak",          check: s => s.longestStreak >= 30 },
  { id: "clear3",       i: "💀", n: "Caçador",         d: "Zerou 3 jogos",              check: s => s.gamesCleared >= 3 },
  { id: "clear5",       i: "👑", n: "Platinum King",   d: "Zerou 5 jogos",              check: s => s.gamesCleared >= 5 },
  { id: "clear10",      i: "🐉", n: "Dragão",          d: "Zerou 10 jogos",             check: s => s.gamesCleared >= 10 },
  { id: "50h",          i: "🌙", n: "Night Owl",       d: "50+ horas jogadas",          check: s => s.totalHours >= 50 },
  { id: "100h",         i: "⏰", n: "Centurião",       d: "100+ horas jogadas",         check: s => s.totalHours >= 100 },
  { id: "10checkins",   i: "📋", n: "Frequente",       d: "10 check-ins",               check: s => s.totalCheckins >= 10 },
  { id: "50checkins",   i: "🏅", n: "Veterano",        d: "50 check-ins",               check: s => s.totalCheckins >= 50 },
];

export const makeUser = (s, stats) => {
  const title = getTitle(stats.xp);
  const nextTitle = getNextTitle(stats.xp);
  const level = Math.max(1, Math.floor(stats.xp / 500) + 1);
  return {
    username: s.displayName, avatar: s.avatar,
    level,
    xp: stats.xp % 500,
    xpNext: 500,
    totalXp: stats.xp,
    title: title.label,
    titleIcon: title.icon,
    nextTitle: nextTitle ? nextTitle.label : "MAX",
    nextTitleXp: nextTitle ? nextTitle.minXp : stats.xp,
    gamesCleared: stats.gamesCleared,
    totalHours: stats.totalHours,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    totalCheckins: stats.totalCheckins || 0,
    joinDate: stats.joinDate || "2026-01-01",
    badges: ALL_BADGES.filter(b => b.check(stats)).map(b => ({ i: b.i, n: b.n, d: b.d })),
    allBadges: ALL_BADGES.map(b => ({ ...b, unlocked: b.check(stats) })),
    clears: stats.clears.slice(0, 10),
    favGames: s.favGames || [],
    favGenres: s.favGenres || [],
  };
};

/* ═══════════════════════════════════════════
   WEEKLY CHALLENGES
   ═══════════════════════════════════════════ */
export const WEEKLY_CHALLENGES = [
  { id: "wk1", name: "Marathon Runner",    desc: "Faça 5 check-ins esta semana",       icon: "🏃", target: 5,  type: "checkins",  xpReward: 300 },
  { id: "wk2", name: "Clear Spree",        desc: "Zere 2 jogos esta semana",           icon: "🏆", target: 2,  type: "clears",    xpReward: 500 },
  { id: "wk3", name: "Dedicação Total",    desc: "Jogue 10 horas esta semana",         icon: "⏱️", target: 10, type: "hours",     xpReward: 400 },
  { id: "wk4", name: "Streak Master",      desc: "Mantenha streak por 7 dias",         icon: "🔥", target: 7,  type: "streak",    xpReward: 600 },
  { id: "wk5", name: "Social Gamer",       desc: "Faça 3 check-ins com comentário",    icon: "💬", target: 3,  type: "comments",  xpReward: 250 },
];

export const getActiveChallenge = (stats) => {
  const challenges = WEEKLY_CHALLENGES.slice(0, 3);
  return challenges.map(ch => {
    let progress = 0;
    if (ch.type === "checkins") progress = Math.min(ch.target, stats.totalCheckins || 0);
    if (ch.type === "clears") progress = Math.min(ch.target, stats.gamesCleared || 0);
    if (ch.type === "hours") progress = Math.min(ch.target, stats.totalHours || 0);
    if (ch.type === "streak") progress = Math.min(ch.target, stats.currentStreak || 0);
    return { ...ch, progress, completed: progress >= ch.target };
  });
};

/* ═══════════════════════════════════════════
   GLOBAL RANKING (simulated other players)
   ═══════════════════════════════════════════ */
export const GLOBAL_PLAYERS = [
  { user: "DragonSlayer",    avatar: "🐉", xp: 28500, level: 57, clears: 38, streak: 45, title: "Legendary" },
  { user: "SpeedQueen",      avatar: "⚡", xp: 21200, level: 43, clears: 28, streak: 22, title: "Legendary" },
  { user: "RetroKing",       avatar: "👑", xp: 18700, level: 38, clears: 24, streak: 31, title: "Elite Gamer" },
  { user: "NeonGirl",        avatar: "🌸", xp: 14300, level: 29, clears: 19, streak: 15, title: "Elite Gamer" },
  { user: "DarkSlayer_X",    avatar: "🗡️", xp: 12800, level: 26, clears: 17, streak: 18, title: "Elite Gamer" },
  { user: "PixelNinja",      avatar: "🥷", xp: 9500,  level: 20, clears: 12, streak: 10, title: "Clear Machine" },
  { user: "GhostPlayer",     avatar: "👻", xp: 7200,  level: 15, clears: 9,  streak: 8,  title: "Clear Machine" },
  { user: "CasualCarla",     avatar: "🌙", xp: 4800,  level: 10, clears: 6,  streak: 5,  title: "Speedrun Apprentice" },
  { user: "BotBoy",          avatar: "🤖", xp: 3100,  level: 7,  clears: 4,  streak: 3,  title: "Game Hunter" },
  { user: "NewbieNick",      avatar: "🌱", xp: 800,   level: 2,  clears: 1,  streak: 1,  title: "Beginner" },
];

export const buildGlobalRanking = (user, stats) => {
  const me = { user: user.username, avatar: user.avatar, xp: stats.xp, level: user.level, clears: stats.gamesCleared, streak: stats.currentStreak, title: user.title, isMe: true };
  const all = [...GLOBAL_PLAYERS, me].sort((a, b) => b.xp - a.xp);
  return all.map((p, i) => ({ ...p, pos: i + 1 }));
};

/* ═══════════════════════════════════════════
   SOCIAL — friends/following system
   ═══════════════════════════════════════════ */
export const defaultSocial = {
  following: [],
  followers: [],
};

export const SUGGESTED_PLAYERS = [
  { user: "SpeedQueen",   avatar: "⚡", title: "Legendary",      xp: 21200, clears: 28 },
  { user: "RetroKing",    avatar: "👑", title: "Elite Gamer",    xp: 18700, clears: 24 },
  { user: "NeonGirl",     avatar: "🌸", title: "Elite Gamer",    xp: 14300, clears: 19 },
  { user: "DarkSlayer_X", avatar: "🗡️", title: "Elite Gamer",    xp: 12800, clears: 17 },
  { user: "PixelNinja",   avatar: "🥷", title: "Clear Machine",  xp: 9500,  clears: 12 },
  { user: "GhostPlayer",  avatar: "👻", title: "Clear Machine",  xp: 7200,  clears: 9 },
];

/* ═══════════════════════════════════════════
   DEFAULT GROUPS (genre-based)
   ═══════════════════════════════════════════ */
const GCOLORS = ["#00ff88","#00e5ff","#ff00aa","#ffe600","#ff8800"];

export const DEFAULT_GROUPS = [
  {
    id: "g1", name: "Metroidvania Masters", emoji: "🦇", color: GCOLORS[0], role: "admin", minTime: 30,
    genres: ["🦇 Metroidvania", "💎 Indie", "🍄 Plataforma"], code: "MTRVN1",
    members: [
      { user: "PixelHunter_99", avatar: "🎮", clears: 6, hours: 89, streak: 7, online: true },
      { user: "SpeedQueen", avatar: "⚡", clears: 5, hours: 42, streak: 3, online: true },
      { user: "NeonGirl", avatar: "🌸", clears: 3, hours: 61, streak: 0, online: false },
      { user: "DarkSlayer_X", avatar: "🗡️", clears: 4, hours: 78, streak: 5, online: false },
    ],
    campaigns: [
      { id: 1, name: "Metroidvania Marathon", emoji: "🦇", games: ["Hollow Knight","Celeste","Hades","Dead Cells","Cuphead"], progress: 3, total: 5, deadline: "30 Abr", leader: "PixelHunter_99" },
    ],
    feed: [
      { user: "PixelHunter_99", avatar: "🎮", action: "zerou", game: "Hades", time: "2h", emoji: "🔥", xp: 250 },
      { user: "SpeedQueen", avatar: "⚡", action: "check-in", game: "Cuphead", time: "5h", emoji: "🎪", note: "King Dice derrotado!", xp: 50 },
      { user: "DarkSlayer_X", avatar: "🗡️", action: "zerou", game: "Celeste", time: "1d", emoji: "🏔️", xp: 250 },
    ],
  },
  {
    id: "g2", name: "RPG Legends", emoji: "🧙", color: GCOLORS[3], role: "membro", minTime: 60,
    genres: ["🧙 RPG", "⚔️ Ação", "👾 Retrô"], code: "RPG4VR",
    members: [
      { user: "RetroKing", avatar: "👑", clears: 8, hours: 62, streak: 12, online: true },
      { user: "PixelHunter_99", avatar: "🎮", clears: 4, hours: 58, streak: 7, online: true },
      { user: "SpeedQueen", avatar: "⚡", clears: 3, hours: 40, streak: 0, online: false },
    ],
    campaigns: [
      { id: 3, name: "RPG Clássicos", emoji: "🧙", games: ["Super Mario RPG","Zelda: ALttP","Chrono Trigger","FF VI"], progress: 4, total: 4, deadline: "Completa!", leader: "RetroKing" },
    ],
    feed: [
      { user: "RetroKing", avatar: "👑", action: "zerou", game: "FF VI", time: "3d", emoji: "⚔️", xp: 250 },
      { user: "PixelHunter_99", avatar: "🎮", action: "zerou", game: "Chrono Trigger", time: "5d", emoji: "⏰", xp: 250 },
    ],
  },
  {
    id: "g3", name: "FPS Arena", emoji: "🔫", color: GCOLORS[2], role: "membro", minTime: 60,
    genres: ["🔫 FPS", "⚔️ Ação", "💀 Soulslike"], code: "FPS420",
    members: [
      { user: "DarkSlayer_X", avatar: "🗡️", clears: 2, hours: 120, streak: 10, online: true },
      { user: "PixelHunter_99", avatar: "🎮", clears: 0, hours: 45, streak: 3, online: true },
      { user: "NeonGirl", avatar: "🌸", clears: 0, hours: 30, streak: 0, online: false },
    ],
    campaigns: [
      { id: 4, name: "Soulsborne Run", emoji: "💀", games: ["Dark Souls","Elden Ring","Sekiro"], progress: 1, total: 3, deadline: "15 Jun", leader: "DarkSlayer_X" },
    ],
    feed: [
      { user: "DarkSlayer_X", avatar: "🗡️", action: "zerou", game: "Elden Ring", time: "2h", emoji: "💀", xp: 250 },
      { user: "PixelHunter_99", avatar: "🎮", action: "check-in", game: "Dark Souls", time: "1d", emoji: "🔥", note: "O&S finalmente!", xp: 50 },
    ],
  },
];

export const NOTIFS = [
  { id: 1, type: "clear", msg: "DarkSlayer_X zerou Elden Ring!", time: "2h", read: false },
  { id: 2, type: "join", msg: "GhostPlayer entrou no RPG Legends", time: "1d", read: false },
  { id: 3, type: "campaign", msg: "RPG Clássicos completa! 🎉", time: "3d", read: true },
  { id: 4, type: "streak", msg: "7 dias de streak! 🔥", time: "5d", read: true },
];

export const GENRES = [
  { id: "action", l: "Ação", i: "⚔️" }, { id: "rpg", l: "RPG", i: "🧙" },
  { id: "indie", l: "Indie", i: "💎" }, { id: "souls", l: "Soulslike", i: "💀" },
  { id: "platform", l: "Plataforma", i: "🍄" }, { id: "metroid", l: "Metroidvania", i: "🦇" },
  { id: "puzzle", l: "Puzzle", i: "🧩" }, { id: "horror", l: "Terror", i: "👻" },
  { id: "fps", l: "FPS", i: "🔫" }, { id: "retro", l: "Retrô", i: "👾" },
  { id: "sandbox", l: "Sandbox", i: "🏗️" }, { id: "racing", l: "Corrida", i: "🏎️" },
  { id: "sports", l: "Esportes", i: "⚽" }, { id: "strategy", l: "Estratégia", i: "♟️" },
  { id: "adventure", l: "Aventura", i: "🗺️" },
];

export const GAME_CATALOG = {
  action: ["God of War","Devil May Cry 5","Bayonetta 3","Nioh 2","Monster Hunter World","Hades","Metal Gear Rising","Astral Chain","Hi-Fi Rush","Sifu","NieR: Automata","Doom Eternal","Ghostrunner","Katana Zero","Titanfall 2"],
  rpg: ["Elden Ring","The Witcher 3","Baldur's Gate 3","Persona 5 Royal","Final Fantasy VII Remake","Chrono Trigger","FF VI","Dragon Quest XI","Divinity: Original Sin 2","Disco Elysium","Xenoblade Chronicles 3","Octopath Traveler","Dark Souls III","Skyrim","Pokémon Legends Arceus","Fire Emblem: Three Houses","Kingdom Hearts III","Ni no Kuni","Tales of Arise","Star Ocean 6"],
  indie: ["Hollow Knight","Celeste","Hades","Dead Cells","Cuphead","Undertale","Stardew Valley","Shovel Knight","Ori and the Blind Forest","Ori and the Will of the Wisps","Blasphemous","Tunic","Outer Wilds","Return of the Obra Dinn","Into the Breach","Baba Is You","Neon White","Inscryption","Slay the Spire","Vampire Survivors","Cult of the Lamb","Spiritfarer","A Short Hike","Katana Zero","Hotline Miami"],
  souls: ["Dark Souls","Dark Souls II","Dark Souls III","Elden Ring","Sekiro","Bloodborne","Demon's Souls","Nioh","Nioh 2","Lies of P","Lords of the Fallen","Mortal Shell","The Surge 2","Blasphemous","Hollow Knight","Salt and Sanctuary","Remnant: From the Ashes","Code Vein","Star Wars Jedi: Survivor","Thymesia"],
  platform: ["Super Mario Bros. Wonder","Celeste","Super Mario Odyssey","Donkey Kong Country: Tropical Freeze","Rayman Legends","Crash Bandicoot 4","Sonic Frontiers","Kirby and the Forgotten Land","Mega Man 11","Shovel Knight","New Super Mario Bros. U","Super Mario World","Sonic Mania","Astro Bot","Ratchet & Clank","Super Meat Boy","Yooka-Laylee","Jak and Daxter","Sackboy","Little Big Planet 3"],
  metroid: ["Hollow Knight","Metroid Dread","Ori and the Blind Forest","Ori and the Will of the Wisps","Blasphemous","Blasphemous 2","Salt and Sanctuary","Dead Cells","Axiom Verge","Axiom Verge 2","Guacamelee!","Guacamelee! 2","The Messenger","Castlevania: SOTN","Super Metroid","Bloodstained: ROTN","Sundered","Grime","Rain World","Ender Lilies","9 Years of Shadows","Astalon","F.I.S.T.","Pronty","Crowsworn"],
  puzzle: ["Portal 2","The Witness","Baba Is You","Return of the Obra Dinn","Talos Principle 2","Cocoon","The Talos Principle","Superliminal","Antichamber","Fez","Inside","Limbo","Viewfinder","Unpacking","A Little to the Left","Tetris Effect","Puyo Puyo Tetris 2","Captain Toad","Gorogoa","Patrick's Parabox"],
  horror: ["Resident Evil 4 Remake","Resident Evil Village","Silent Hill 2 Remake","Alan Wake 2","Dead Space Remake","Amnesia: The Bunker","Outlast","Outlast 2","Phasmophobia","Lethal Company","SOMA","Layers of Fear","Little Nightmares","Little Nightmares II","Visage","Dredge","Signalis","Madison","Tormented Souls","Until Dawn"],
  fps: ["Counter-Strike 2","Valorant","Overwatch 2","Apex Legends","Call of Duty: MW III","Doom Eternal","Titanfall 2","Halo Infinite","Destiny 2","Borderlands 3","Bioshock Infinite","Half-Life: Alyx","Metro Exodus","Far Cry 6","Rainbow Six Siege","Hunt: Showdown","Deep Rock Galactic","Ultrakill","DUSK","Prodeus","Turbo Overkill","Selaco","Ion Fury","Escape from Tarkov","Payday 3"],
  retro: ["Super Mario World","Zelda: ALttP","Chrono Trigger","FF VI","Super Metroid","Mega Man X","Castlevania: SOTN","Sonic the Hedgehog 2","Street Fighter II","Donkey Kong Country 2","Earthbound","Secret of Mana","Contra III","Pac-Man","Tetris","Galaga","Space Invaders","Super Mario Bros. 3","Zelda: Link's Awakening","Punch-Out!!"],
  sandbox: ["Minecraft","Terraria","Stardew Valley","No Man's Sky","Factorio","Satisfactory","Valheim","Subnautica","Don't Starve Together","Astroneer","The Forest","Raft","Grounded","Core Keeper","Vintage Story","Dragon Quest Builders 2","Portal Knights","Creativerse","Starbound","Eco"],
  racing: ["Forza Horizon 5","Gran Turismo 7","Mario Kart 8 Deluxe","Need for Speed Unbound","F1 23","Assetto Corsa Competizione","Dirt Rally 2.0","Wreckfest","Hot Wheels Unleashed","Burnout Paradise","Trackmania","Art of Rally","GRID Legends","Wipeout Omega Collection","Riders Republic"],
  sports: ["EA Sports FC 24","NBA 2K24","Madden NFL 24","MLB The Show 23","Rocket League","Tony Hawk's Pro Skater 1+2","Golf With Your Friends","Windjammers 2","Steep","Ring Fit Adventure","Wii Sports","Mario Strikers","Mario Tennis Aces","Riders Republic","FIFA 23"],
  strategy: ["Civilization VI","Age of Empires IV","XCOM 2","Fire Emblem: Engage","Total War: Warhammer III","Crusader Kings III","Stellaris","Into the Breach","Slay the Spire","Darkest Dungeon II","Triangle Strategy","Advance Wars 1+2","Wargroove","Bad North","Tactical Breach Wizards","Marvel's Midnight Suns","Jagged Alliance 3","Songs of Conquest","Frostpunk 2","Hades II"],
  adventure: ["Zelda: Tears of the Kingdom","Zelda: Breath of the Wild","Red Dead Redemption 2","Ghost of Tsushima","Uncharted 4","The Last of Us Part II","God of War Ragnarök","Spider-Man 2","Horizon Forbidden West","It Takes Two","A Plague Tale: Requiem","Psychonauts 2","Kena: Bridge of Spirits","Sable","Journey","Outer Wilds","Death Stranding","Control","Returnal","Star Wars Jedi: Survivor"],
};

export const getGamesForGenres = (genreIds) => {
  const games = new Set();
  genreIds.forEach(gid => {
    const id = gid.replace(/^[^\w]*\s*/, "").toLowerCase().replace(/ã/g,"a").replace(/é/g,"e").replace(/ó/g,"o");
    const match = GENRES.find(g => g.id === gid || g.l.toLowerCase() === id || gid.toLowerCase().includes(g.l.toLowerCase()) || gid.toLowerCase().includes(g.id));
    if (match && GAME_CATALOG[match.id]) {
      GAME_CATALOG[match.id].forEach(game => games.add(game));
    }
  });
  return [...games].sort((a, b) => a.localeCompare(b));
};

export const MINTIMES = [
  { v: 15, l: "15 min" }, { v: 30, l: "30 min" },
  { v: 60, l: "1 hora" }, { v: 120, l: "2 horas" },
];

export const PLATFORMS = ["PC", "PS5", "Xbox", "Switch", "Mobile"];

export const AVATARS = ["🎮","🕹️","👾","🎯","🏆","⚔️","🗡️","🛡️","🌸","⚡","👑","💀","🔥","🦇","🍄","🧙","🎪","🌙","🤖","🐉"];

/* ═══════════════════════════════════════════
   PERSISTENCE — localStorage
   ═══════════════════════════════════════════ */
const K = { groups: "clearrun_groups", settings: "clearrun_settings", dark: "clearrun_dark", stats: "clearrun_stats", social: "clearrun_social" };

const load = (key) => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; } };
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

export const loadGroups   = () => load(K.groups);
export const saveGroups   = (v) => save(K.groups, v);
export const loadSettings = () => load(K.settings);
export const saveSettings = (v) => save(K.settings, v);
export const loadDark     = () => { const v = load(K.dark); return v !== null ? v : true; };
export const saveDark     = (v) => save(K.dark, v);
export const loadStats    = () => load(K.stats);
export const saveStats    = (v) => save(K.stats, v);
export const loadSocial   = () => load(K.social);
export const saveSocial   = (v) => save(K.social, v);

/* ═══════════════════════════════════════════
   STREAK LOGIC
   ═══════════════════════════════════════════ */
const todayStr = () => new Date().toISOString().slice(0, 10);

export const processCheckin = (stats, hoursPlayed, isClear, clearInfo) => {
  const today = todayStr();
  const newStats = { ...stats };
  const h = parseFloat(hoursPlayed) || 0;
  newStats.totalHours = Math.round((newStats.totalHours + h) * 10) / 10;
  newStats.xp += isClear ? 250 : 50;
  newStats.totalCheckins = (newStats.totalCheckins || 0) + 1;

  if (newStats.lastCheckinDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const ys = yesterday.toISOString().slice(0, 10);
    if (newStats.lastCheckinDate === ys) {
      newStats.currentStreak += 1;
    } else {
      newStats.currentStreak = 1;
    }
    newStats.lastCheckinDate = today;
    if (newStats.currentStreak > newStats.longestStreak) {
      newStats.longestStreak = newStats.currentStreak;
    }
  }

  if (isClear && clearInfo) {
    newStats.gamesCleared += 1;
    newStats.clears = [
      { game: clearInfo.game, plat: clearInfo.plat, hours: h, date: "agora", r: clearInfo.rating || 0 },
      ...newStats.clears,
    ];
  }

  return newStats;
};
