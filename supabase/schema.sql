-- =====================================================================
-- Life Audit database setup
-- Paste this whole file into Supabase -> SQL Editor -> Run.
-- It is safe to run more than once.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  plan text not null default 'free' check (plan in ('free', 'premium', 'pro')),
  timezone text not null default 'UTC',
  week_start smallint not null default 1 check (week_start between 0 and 6),
  date_format text not null default 'DD/MM/YYYY',
  theme text not null default 'light',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- Personal data (every row belongs to one user) ----------
create table if not exists public.life_areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  icon text,
  color text not null default '#C2255C',
  weight smallint not null default 3 check (weight between 1 and 5),
  success_definition text,
  show_on_dashboard boolean not null default true,
  is_default boolean not null default false,
  sort_order int not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  area_id uuid references public.life_areas (id) on delete set null,
  parent_goal_id uuid references public.goals (id) on delete set null,
  title text not null,
  description text,
  horizon text not null default 'yearly' check (horizon in ('yearly', 'half_year', 'quarterly', 'monthly', 'weekly', 'milestone')),
  start_date date,
  deadline date,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'dropped')),
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal_id uuid not null references public.goals (id) on delete cascade,
  title text not null,
  due_date date,
  sort_order int not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  area_id uuid references public.life_areas (id) on delete set null,
  goal_id uuid references public.goals (id) on delete set null,
  milestone_id uuid references public.milestones (id) on delete set null,
  parent_task_id uuid references public.tasks (id) on delete cascade,
  title text not null,
  description text,
  task_type text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  start_date date,
  due_date date,
  estimated_minutes int,
  actual_minutes int,
  status text not null default 'todo' check (status in ('todo', 'done')),
  notes text,
  recurrence_rule text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists tasks_user_due on public.tasks (user_id, due_date);

create table if not exists public.schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  area_id uuid references public.life_areas (id) on delete set null,
  task_id uuid references public.tasks (id) on delete set null,
  date date not null,
  start_time time not null,
  end_time time not null,
  title text not null,
  priority text not null default 'medium',
  notes text,
  reminder_minutes int,
  recurrence_rule text,
  created_at timestamptz not null default now()
);

create table if not exists public.block_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  block_id uuid not null unique references public.schedule_blocks (id) on delete cascade,
  status text not null check (status in ('done', 'partial', 'skipped')),
  actual_minutes int,
  actual_note text,
  skip_reason text,
  next_action text check (next_action in ('reschedule', 'postpone', 'carry_forward', 'cancel')),
  rescheduled_to date,
  created_at timestamptz not null default now()
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  area_id uuid references public.life_areas (id) on delete set null,
  title text not null,
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly', 'monthly', 'custom')),
  frequency_config jsonb,
  reminder_time time,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  date date not null,
  done boolean not null default true,
  note text,
  unique (habit_id, date)
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  body text,
  went_well text,
  could_be_better text,
  learned text,
  feeling text,
  highlights text,
  created_at timestamptz not null default now()
);

create table if not exists public.gratitude_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  text text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  period text not null check (period in ('weekly', 'monthly', 'yearly')),
  period_start date not null,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  area_id uuid references public.life_areas (id) on delete set null,
  title text not null,
  date date not null,
  start_time time,
  end_time time,
  kind text,
  recurrence_rule text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  related_type text,
  related_id uuid,
  scheduled_for timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email_enabled boolean not null default false,
  push_enabled boolean not null default false,
  browser_enabled boolean not null default true,
  quiet_hours_start time,
  quiet_hours_end time,
  reminder_frequency text not null default 'normal'
);

create table if not exists public.dashboard_widgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  widget_key text not null,
  position int not null default 0,
  visible boolean not null default true,
  unique (user_id, widget_key)
);

-- Written only by the payment provider's webhook (server key), never by the browser.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null,
  provider_customer_id text,
  plan text not null,
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- A user asking for their account to be deleted (processed by the owner with the server key).
create table if not exists public.deletion_requests (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------- Public website content (edited from /admin) ----------
create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.site_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.site_plans (
  id text primary key,
  name text not null,
  price_label text not null,
  period text not null default 'per month',
  tagline text not null default '',
  features text[] not null default '{}',
  highlighted boolean not null default false,
  sort_order int not null default 0
);

create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- Security rules (Row Level Security)
-- =====================================================================

alter table public.profiles enable row level security;
drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles for select using (id = auth.uid());
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
-- Users may change only these columns, so nobody can make themselves admin or change their own plan.
revoke update on public.profiles from authenticated, anon;
grant update (display_name, timezone, week_start, date_format, theme, updated_at) on public.profiles to authenticated;

do $$
declare t text;
begin
  foreach t in array array[
    'life_areas','goals','milestones','tasks','schedule_blocks','block_records','habits','habit_logs',
    'journal_entries','gratitude_entries','reflections','events','notifications','dashboard_widgets'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "owner only" on public.%I', t);
    execute format('create policy "owner only" on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;

alter table public.notification_prefs enable row level security;
drop policy if exists "owner only" on public.notification_prefs;
create policy "owner only" on public.notification_prefs for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.deletion_requests enable row level security;
drop policy if exists "owner only" on public.deletion_requests;
create policy "owner only" on public.deletion_requests for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "admin read" on public.deletion_requests;
create policy "admin read" on public.deletion_requests for select using (public.is_admin());

alter table public.subscriptions enable row level security;
drop policy if exists "own subscription read" on public.subscriptions;
create policy "own subscription read" on public.subscriptions for select using (user_id = auth.uid());

-- Website content: everyone can read published content; only admins can change it.
alter table public.site_settings enable row level security;
drop policy if exists "public read" on public.site_settings;
create policy "public read" on public.site_settings for select using (true);
drop policy if exists "admin write" on public.site_settings;
create policy "admin write" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

alter table public.site_faqs enable row level security;
drop policy if exists "public read" on public.site_faqs;
create policy "public read" on public.site_faqs for select using (published or public.is_admin());
drop policy if exists "admin write" on public.site_faqs;
create policy "admin write" on public.site_faqs for all using (public.is_admin()) with check (public.is_admin());

alter table public.site_plans enable row level security;
drop policy if exists "public read" on public.site_plans;
create policy "public read" on public.site_plans for select using (true);
drop policy if exists "admin write" on public.site_plans;
create policy "admin write" on public.site_plans for all using (public.is_admin()) with check (public.is_admin());

alter table public.admin_audit_log enable row level security;
drop policy if exists "admin only" on public.admin_audit_log;
create policy "admin only" on public.admin_audit_log for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- New account: create a profile and the default life areas
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, timezone)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1)),
    coalesce(nullif(new.raw_user_meta_data ->> 'timezone', ''), 'UTC')
  )
  on conflict (id) do nothing;

  insert into public.life_areas (user_id, name, color, is_default, sort_order)
  values
    (new.id, 'Faith', '#7B4BC9', true, 0),
    (new.id, 'Career', '#E8590C', true, 1),
    (new.id, 'Education', '#2F6FDE', true, 2),
    (new.id, 'Health', '#0B8F7F', true, 3),
    (new.id, 'Family', '#D6336C', true, 4),
    (new.id, 'Growth', '#B8860B', true, 5),
    (new.id, 'Finance', '#4F7F12', true, 6);

  insert into public.notification_prefs (user_id) values (new.id) on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Starting website content (edit later from /admin)
-- =====================================================================
insert into public.site_settings (key, value) values
  ('hero_badge', 'Your personal command center'),
  ('hero_title', 'Your entire life, finally in one place.'),
  ('hero_subtitle', 'Plan your days. Build your future. Track your growth. Understand your life.'),
  ('cta_label', 'Start Managing Your Life'),
  ('founder_name', '[Founder name]'),
  ('founder_bio', '[A few lines about who is building this product and why.]'),
  ('contact_email', '[YOUR EMAIL]')
on conflict (key) do nothing;

insert into public.site_plans (id, name, price_label, period, tagline, features, highlighted, sort_order) values
  ('free', 'Free', '$0', 'forever', 'Everything you need to start.',
   array['Basic daily planner','Limited goals','Basic habits','Basic journaling','Simple progress tracking'], false, 0),
  ('premium', 'Premium', '$4.99', 'per month', 'The complete life system.',
   array['Unlimited planning and life areas','Advanced Life Audit','Advanced analytics','Full habit history','Advanced reminders','Custom dashboard','Extended journaling'], true, 1),
  ('pro', 'Pro', '$9.99', 'per month', 'Premium plus your AI assistant.',
   array['Everything in Premium','AI life assistant','Personalized insights','AI monthly and yearly reports','Fitness and self-development programs','Advanced templates and challenges'], false, 2)
on conflict (id) do nothing;

insert into public.site_faqs (question, answer, sort_order)
select q, a, o from (values
  ('What is Life Audit?', 'Life Audit is an all-in-one personal life management platform. It combines a planner, goals, tasks, habits, a journal and progress analytics, so you can plan your life and see how you actually spend it.', 0),
  ('How is it different from a to-do list or a habit tracker?', 'Those tools each hold one piece. Life Audit links yearly goals to monthly targets and an hourly schedule, then compares what you planned with what you actually did.', 1),
  ('Is my journal private?', 'Yes. Journal and gratitude entries belong to your account only. Other users can never see them, and they are never shown to search engines.', 2),
  ('Can I create my own life areas?', 'Yes. The default areas (faith, career, education, health, family, growth and finance) are a starting point. You can rename, archive or add your own.', 3),
  ('What happens to my data if I downgrade?', 'Everything you have already recorded stays readable and exportable. A downgrade only limits creating new items beyond the free plan.', 4),
  ('Does the AI assistant make things up about me?', 'No. The assistant is planned for a later release and is designed to use only the activity you recorded. With too little data it says so.', 5)
) as v(q, a, o)
where not exists (select 1 from public.site_faqs);

-- =====================================================================
-- After you sign up on the website, make yourself the admin.
-- Replace the email below with yours, then run just this line:
--   update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
-- =====================================================================

-- ---------- Table permissions for the app (added after launch) ----------
-- New Supabase projects do not grant table access automatically. Row Level Security above
-- still limits every signed-in user to their own rows.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
revoke insert, update, delete on public.profiles from authenticated;
grant update (display_name, timezone, week_start, date_format, theme, updated_at) on public.profiles to authenticated;
revoke insert, update, delete on public.subscriptions from authenticated;
grant select on public.site_settings, public.site_faqs, public.site_plans to anon;
grant execute on function public.is_admin() to anon, authenticated;
