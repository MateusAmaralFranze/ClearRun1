-- ═══════════════════════════════════════════════════════════
-- ClearRun — Supabase Database Schema
-- Execute este SQL no SQL Editor do Supabase Dashboard
-- ═══════════════════════════════════════════════════════════

-- ─── 1. PROFILES ─────────────────────────────────────────
-- Criado automaticamente quando um usuário faz signup
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar text default '🎮',
  title text default 'Novato',
  title_icon text default '🌱',
  xp integer default 0,
  level integer default 1,
  total_hours numeric(10,1) default 0,
  games_cleared integer default 0,
  total_checkins integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_checkin_date date,
  fav_games text[] default '{}',
  fav_genres text[] default '{}',
  theme text default 'dark',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── 2. GROUPS ───────────────────────────────────────────
create table public.groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  emoji text default '🛡️',
  color text default '#00ff88',
  code text unique not null,
  min_time integer default 30,
  genres text[] default '{}',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- ─── 3. GROUP MEMBERS ────────────────────────────────────
create table public.group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'membro' check (role in ('admin', 'membro')),
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- ─── 4. CHECKINS ─────────────────────────────────────────
create table public.checkins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade not null,
  game text not null,
  platform text not null,
  hours numeric(10,1) default 0,
  is_clear boolean default false,
  rating integer default 0 check (rating >= 0 and rating <= 5),
  note text,
  xp_earned integer default 50,
  created_at timestamptz default now()
);

-- ─── 5. FOLLOWS ──────────────────────────────────────────
create table public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);

-- ─── 6. CAMPAIGNS ────────────────────────────────────────
create table public.campaigns (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  name text not null,
  emoji text default '⚔️',
  games text[] default '{}',
  deadline text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- ─── 7. NOTIFICATIONS ───────────────────────────────────
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('clear', 'join', 'campaign', 'streak', 'follow', 'challenge')),
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════

create index idx_profiles_xp on public.profiles(xp desc);
create index idx_profiles_username on public.profiles(username);
create index idx_groups_code on public.groups(code);
create index idx_group_members_group on public.group_members(group_id);
create index idx_group_members_user on public.group_members(user_id);
create index idx_checkins_user on public.checkins(user_id);
create index idx_checkins_group on public.checkins(group_id);
create index idx_checkins_created on public.checkins(created_at desc);
create index idx_follows_follower on public.follows(follower_id);
create index idx_follows_following on public.follows(following_id);
create index idx_notifications_user on public.notifications(user_id, read);

-- ═══════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    '🎮'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update title based on XP
create or replace function public.get_title(p_xp integer)
returns table(title text, title_icon text) as $$
begin
  return query
  select t.title, t.icon from (values
    (0,     'Novato',              '🌱'),
    (200,   'Beginner',            '🎮'),
    (500,   'Casual Gamer',        '🕹️'),
    (1000,  'Game Hunter',         '🎯'),
    (2500,  'Speedrun Apprentice', '⚡'),
    (5000,  'Clear Machine',       '🏆'),
    (10000, 'Elite Gamer',         '💎'),
    (20000, 'Legendary',           '👑'),
    (50000, 'Mythic',              '🐉')
  ) as t(min_xp, title, icon)
  where t.min_xp <= p_xp
  order by t.min_xp desc
  limit 1;
end;
$$ language plpgsql;

-- Process checkin: update stats, streak, XP
create or replace function public.process_checkin(
  p_user_id uuid,
  p_group_id uuid,
  p_game text,
  p_platform text,
  p_hours numeric,
  p_is_clear boolean,
  p_rating integer,
  p_note text
) returns uuid as $$
declare
  v_xp integer;
  v_today date := current_date;
  v_yesterday date := current_date - 1;
  v_last_date date;
  v_streak integer;
  v_longest integer;
  v_checkin_id uuid;
  v_title_rec record;
begin
  -- Calculate XP
  v_xp := case when p_is_clear then 250 else 50 end;

  -- Insert checkin
  insert into public.checkins (user_id, group_id, game, platform, hours, is_clear, rating, note, xp_earned)
  values (p_user_id, p_group_id, p_game, p_platform, p_hours, p_is_clear, p_rating, p_note, v_xp)
  returning id into v_checkin_id;

  -- Get current streak info
  select last_checkin_date, current_streak, longest_streak
  into v_last_date, v_streak, v_longest
  from public.profiles where id = p_user_id;

  -- Update streak (max 1/day)
  if v_last_date is null or v_last_date < v_today then
    if v_last_date = v_yesterday then
      v_streak := v_streak + 1;
    else
      v_streak := 1;
    end if;
    if v_streak > v_longest then
      v_longest := v_streak;
    end if;
  end if;

  -- Get new title
  select * into v_title_rec from public.get_title(
    (select xp + v_xp from public.profiles where id = p_user_id)
  );

  -- Update profile
  update public.profiles set
    xp = xp + v_xp,
    level = greatest(1, floor((xp + v_xp) / 500) + 1),
    total_hours = total_hours + p_hours,
    total_checkins = total_checkins + 1,
    games_cleared = games_cleared + case when p_is_clear then 1 else 0 end,
    current_streak = v_streak,
    longest_streak = v_longest,
    last_checkin_date = v_today,
    title = v_title_rec.title,
    title_icon = v_title_rec.title_icon,
    updated_at = now()
  where id = p_user_id;

  return v_checkin_id;
end;
$$ language plpgsql security definer;

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.checkins enable row level security;
alter table public.follows enable row level security;
alter table public.campaigns enable row level security;
alter table public.notifications enable row level security;

-- Profiles: anyone can read, only owner can update
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Groups: members can read, creator can update
create policy "Groups are viewable by everyone" on public.groups for select using (true);
create policy "Authenticated users can create groups" on public.groups for insert with check (auth.uid() = created_by);
create policy "Creator can update group" on public.groups for update using (auth.uid() = created_by);

-- Group members: members can view, authenticated can join
create policy "Group members are viewable by everyone" on public.group_members for select using (true);
create policy "Authenticated can join groups" on public.group_members for insert with check (auth.uid() = user_id);
create policy "Members can leave" on public.group_members for delete using (auth.uid() = user_id);

-- Checkins: group members can view, user can create own
create policy "Checkins viewable by everyone" on public.checkins for select using (true);
create policy "Users can create own checkins" on public.checkins for insert with check (auth.uid() = user_id);

-- Follows: anyone can see, user controls own
create policy "Follows are viewable" on public.follows for select using (true);
create policy "Users can follow" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows for delete using (auth.uid() = follower_id);

-- Campaigns: viewable by everyone, group admin creates
create policy "Campaigns are viewable" on public.campaigns for select using (true);
create policy "Users can create campaigns" on public.campaigns for insert with check (auth.uid() = created_by);

-- Notifications: only own
create policy "Users see own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "System can create notifications" on public.notifications for insert with check (true);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- REALTIME — enable for live feeds
-- ═══════════════════════════════════════════════════════════

alter publication supabase_realtime add table public.checkins;
alter publication supabase_realtime add table public.group_members;
alter publication supabase_realtime add table public.notifications;
