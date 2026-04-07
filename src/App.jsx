import { useState, useCallback } from "react";
import { getC } from "./constants/colors";
import {
  defaultSettings, defaultStats, defaultSocial, makeUser, processCheckin, NOTIFS, DEFAULT_GROUPS,
  loadGroups, saveGroups, loadSettings, saveSettings, loadDark, saveDark, loadStats, saveStats,
  loadSocial, saveSocial,
} from "./constants/mockData";
import { Scanlines, ThemeCtx } from "./components/ui";
import { NavBar, BottomBar } from "./components/layout";
import { SplashScreen } from "./components/SplashScreen";
import { Onboarding } from "./components/Onboarding";
import {
  Home, GroupDetail, GroupCheckin, GroupsHub,
  CreateGroup, JoinGroup, Profile, Settings, Notifs,
  GlobalRanking, WeeklyChallenges, Social, ShareCard,
} from "./components/pages";

export default function App() {
  const [splash, setSplash] = useState(true);
  const [page, setPage]     = useState("home");
  const [params, setParams] = useState({});

  const [dark, setDarkState]         = useState(() => loadDark());
  const [settings, setSettingsState] = useState(() => loadSettings() || null);
  const [groups, setGroupsState]     = useState(() => loadGroups() || DEFAULT_GROUPS);
  const [stats, setStatsState]       = useState(() => loadStats() || defaultStats);
  const [social, setSocialState]     = useState(() => loadSocial() || defaultSocial);

  const setDark = (v) => { setDarkState(v); saveDark(v); };
  const setSettings = (v) => { const n = typeof v === "function" ? v(settings) : v; setSettingsState(n); saveSettings(n); };
  const setGroups = (v) => { const n = typeof v === "function" ? v(groups) : v; setGroupsState(n); saveGroups(n); };
  const setStats = (v) => { const n = typeof v === "function" ? v(stats) : v; setStatsState(n); saveStats(n); };
  const setSocial = (v) => { const n = typeof v === "function" ? v(social) : v; setSocialState(n); saveSocial(n); };

  const actualSettings = settings || defaultSettings;
  const colors = getC(dark);
  const user = makeUser(actualSettings, stats);
  const done = useCallback(() => setSplash(false), []);
  const unread = NOTIFS.filter(n => !n.read).length;
  const needsOnboarding = !settings;

  const go = (p, pr = {}) => { setPage(p); setParams(pr); window.scrollTo(0, 0); };
  const handleOnboarding = (data) => { setSettings(data.settings); setDark(data.dark); };

  return (
    <ThemeCtx.Provider value={{ C: colors, dark, setDark }}>
      {splash && <SplashScreen onFinish={done} />}
      {!splash && needsOnboarding && <Onboarding onComplete={handleOnboarding} />}
      {!splash && !needsOnboarding && (
        <>
          <Scanlines />
          <div style={{ minHeight: "100vh", background: colors.bg, color: colors.t1, paddingBottom: 80, transition: "background 0.3s, color 0.3s" }}>
            <NavBar page={page} go={go} notifCount={unread} />
            {page === "home"         && <Home go={go} user={user} groups={groups} stats={stats} />}
            {page === "groups"       && <GroupsHub go={go} groups={groups} />}
            {page === "groupDetail"  && <GroupDetail groupId={params.groupId} go={go} groups={groups} setGroups={setGroups} user={user} />}
            {page === "groupCheckin" && <GroupCheckin groupId={params.groupId} go={go} groups={groups} setGroups={setGroups} user={user} stats={stats} setStats={setStats} />}
            {page === "createGroup"  && <CreateGroup go={go} groups={groups} setGroups={setGroups} user={user} />}
            {page === "joinGroup"    && <JoinGroup go={go} groups={groups} setGroups={setGroups} user={user} />}
            {page === "profile"      && <Profile user={user} go={go} groups={groups} stats={stats} />}
            {page === "settings"     && <Settings settings={actualSettings} setSettings={setSettings} go={go} />}
            {page === "notifs"       && <Notifs />}
            {page === "ranking"      && <GlobalRanking user={user} stats={stats} go={go} />}
            {page === "challenges"   && <WeeklyChallenges user={user} stats={stats} go={go} />}
            {page === "social"       && <Social user={user} social={social} setSocial={setSocial} go={go} />}
            {page === "shareCard"    && <ShareCard user={user} stats={stats} clearData={params.clearData} go={go} />}
            <BottomBar page={page} go={go} />
          </div>
        </>
      )}
    </ThemeCtx.Provider>
  );
}
