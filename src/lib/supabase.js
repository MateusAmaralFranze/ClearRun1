/**
 * ClearRun — Supabase Client
 *
 * Centraliza toda comunicação com o Supabase.
 * Para funcionar, crie um arquivo .env na raiz do projeto:
 *
 *   VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
 *   VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  console.warn("⚠️ ClearRun: Supabase env vars not set. Running in local-only mode.");
}

export const supabase = supabaseUrl && supabaseAnon
  ? createClient(supabaseUrl, supabaseAnon)
  : null;

export const isOnline = () => !!supabase;

/* ═══════════════════════════════════════════
   AUTH
   ═══════════════════════════════════════════ */

export const signInWithDiscord = async () => {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: { redirectTo: window.location.origin },
  });
  if (error) console.error("Auth error:", error);
  return data;
};

export const signInWithGoogle = async () => {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
  if (error) console.error("Auth error:", error);
  return data;
};

export const signOut = async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
};

export const getSession = async () => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
};

export const onAuthChange = (callback) => {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange(callback);
};

/* ═══════════════════════════════════════════
   PROFILES
   ═══════════════════════════════════════════ */

export const getProfile = async (userId) => {
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
};

export const updateProfile = async (userId, updates) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();
  if (error) console.error("Profile update error:", error);
  return data;
};

export const getGlobalRanking = async (orderBy = "xp", limit = 50) => {
  if (!supabase) return [];
  const { data } = await supabase
    .from("profiles")
    .select("id, username, avatar, xp, level, games_cleared, current_streak, title, title_icon")
    .order(orderBy, { ascending: false })
    .limit(limit);
  return data || [];
};

/* ═══════════════════════════════════════════
   GROUPS
   ═══════════════════════════════════════════ */

export const createGroup = async (group) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("groups")
    .insert(group)
    .select()
    .single();
  if (error) console.error("Create group error:", error);
  return data;
};

export const getGroupByCode = async (code) => {
  if (!supabase) return null;
  const { data } = await supabase
    .from("groups")
    .select("*, group_members(user_id, role, profiles(username, avatar))")
    .eq("code", code.toUpperCase())
    .single();
  return data;
};

export const getUserGroups = async (userId) => {
  if (!supabase) return [];
  const { data } = await supabase
    .from("group_members")
    .select("role, groups(*, group_members(count))")
    .eq("user_id", userId);
  return data || [];
};

export const joinGroup = async (groupId, userId) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("group_members")
    .insert({ group_id: groupId, user_id: userId, role: "membro" })
    .select()
    .single();
  if (error) console.error("Join group error:", error);
  return data;
};

export const leaveGroup = async (groupId, userId) => {
  if (!supabase) return null;
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);
  if (error) console.error("Leave group error:", error);
};

/* ═══════════════════════════════════════════
   CHECKINS
   ═══════════════════════════════════════════ */

export const doCheckin = async (userId, groupId, game, platform, hours, isClear, rating, note) => {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("process_checkin", {
    p_user_id: userId,
    p_group_id: groupId,
    p_game: game,
    p_platform: platform,
    p_hours: hours || 0,
    p_is_clear: isClear,
    p_rating: rating || 0,
    p_note: note || null,
  });
  if (error) console.error("Checkin error:", error);
  return data;
};

export const getGroupFeed = async (groupId, limit = 20) => {
  if (!supabase) return [];
  const { data } = await supabase
    .from("checkins")
    .select("*, profiles(username, avatar)")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
};

export const getRecentFeed = async (userId, limit = 10) => {
  if (!supabase) return [];
  // Get feeds from groups the user is in
  const { data: memberData } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId);
  
  if (!memberData || memberData.length === 0) return [];
  
  const groupIds = memberData.map(m => m.group_id);
  const { data } = await supabase
    .from("checkins")
    .select("*, profiles(username, avatar), groups(name, color, emoji)")
    .in("group_id", groupIds)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
};

/* ═══════════════════════════════════════════
   FOLLOWS
   ═══════════════════════════════════════════ */

export const followUser = async (followerId, followingId) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("follows")
    .insert({ follower_id: followerId, following_id: followingId })
    .select()
    .single();
  if (error) console.error("Follow error:", error);
  return data;
};

export const unfollowUser = async (followerId, followingId) => {
  if (!supabase) return null;
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);
  if (error) console.error("Unfollow error:", error);
};

export const getFollowing = async (userId) => {
  if (!supabase) return [];
  const { data } = await supabase
    .from("follows")
    .select("following_id, profiles!follows_following_id_fkey(username, avatar, xp, games_cleared, title)")
    .eq("follower_id", userId);
  return data || [];
};

export const getFollowers = async (userId) => {
  if (!supabase) return [];
  const { data } = await supabase
    .from("follows")
    .select("follower_id, profiles!follows_follower_id_fkey(username, avatar)")
    .eq("following_id", userId);
  return data || [];
};

/* ═══════════════════════════════════════════
   NOTIFICATIONS
   ═══════════════════════════════════════════ */

export const getNotifications = async (userId, limit = 20) => {
  if (!supabase) return [];
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
};

export const markNotifRead = async (notifId) => {
  if (!supabase) return;
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notifId);
};

export const markAllRead = async (userId) => {
  if (!supabase) return;
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
};

/* ═══════════════════════════════════════════
   REALTIME SUBSCRIPTIONS
   ═══════════════════════════════════════════ */

export const subscribeToGroupFeed = (groupId, callback) => {
  if (!supabase) return { unsubscribe: () => {} };
  const channel = supabase
    .channel(`group-feed-${groupId}`)
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "checkins",
      filter: `group_id=eq.${groupId}`,
    }, (payload) => callback(payload.new))
    .subscribe();
  return { unsubscribe: () => supabase.removeChannel(channel) };
};

export const subscribeToNotifications = (userId, callback) => {
  if (!supabase) return { unsubscribe: () => {} };
  const channel = supabase
    .channel(`notifs-${userId}`)
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "notifications",
      filter: `user_id=eq.${userId}`,
    }, (payload) => callback(payload.new))
    .subscribe();
  return { unsubscribe: () => supabase.removeChannel(channel) };
};
