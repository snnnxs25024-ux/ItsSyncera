-- Its Syncera Supabase schema
-- Run in Supabase SQL Editor for project aulljwxosjdaixtzcqjx.

create table if not exists servers (
  id text primary key,
  name text not null,
  status text not null default 'waiting' check (status in ('active', 'warning', 'critical', 'maintenance', 'waiting')),
  os text not null default 'Unknown OS',
  ip_address text not null,
  provider text not null default 'Unknown Provider',
  location text not null default 'Unknown Location',
  cpu_usage numeric not null default 0,
  memory_usage numeric not null default 0,
  storage_usage numeric not null default 0,
  network_traffic text not null default '-',
  last_check text not null default 'Never',
  connection_type text not null default 'ssh' check (connection_type in ('ssh', 'agent', 'proxmox')),
  connection_status text not null default 'Waiting for Backend',
  uptime_30d text not null default '-',
  backup_status text not null default 'Not configured',
  ssl_status text not null default 'Not checked',
  last_seen text not null default 'Never',
  services jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table servers add column if not exists proxmox_token text;
alter table servers add column if not exists proxmox_host text;
alter table servers add column if not exists proxmox_port text default '8006';
alter table servers add column if not exists proxmox_url_mode text default 'hostPort';

create table if not exists alerts (
  id text primary key,
  severity text not null default 'information' check (severity in ('critical', 'warning', 'information')),
  title text not null,
  server text not null,
  detected_at text not null default '-',
  status text not null default 'Monitoring' check (status in ('Monitoring', 'Resolved', 'Investigating')),
  action_taken text not null default '-',
  created_at timestamptz not null default now()
);

create table if not exists metric_snapshots (
  id text primary key,
  server_id text not null references servers(id) on delete cascade,
  server_name text not null,
  cpu_usage numeric not null default 0,
  memory_usage numeric not null default 0,
  storage_usage numeric not null default 0,
  network_traffic text not null default '-',
  created_at timestamptz not null default now()
);

create index if not exists metric_snapshots_server_time_idx on metric_snapshots(server_id, created_at desc);

create table if not exists notification_channels (
  id text primary key,
  server_id text not null references servers(id) on delete cascade,
  channel text not null default 'email' check (channel in ('email')),
  recipient text not null,
  enabled boolean not null default true,
  severity_filter text not null default 'critical' check (severity_filter in ('critical', 'warning', 'all')),
  cooldown_minutes integer not null default 60 check (cooldown_minutes between 15 and 1440),
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notification_channels_server_idx on notification_channels(server_id, enabled);

create table if not exists notification_deliveries (
  id text primary key,
  channel_id text not null references notification_channels(id) on delete cascade,
  alert_ids text[] not null default '{}',
  recipient text not null,
  status text not null default 'sent' check (status in ('sent', 'failed', 'skipped')),
  message text not null default '-',
  sent_at timestamptz not null default now()
);

create index if not exists notification_deliveries_channel_time_idx on notification_deliveries(channel_id, sent_at desc);

create table if not exists automations (
  id text primary key,
  name text not null,
  type text not null check (type in ('backup', 'restart', 'cleanup', 'health_check', 'monitoring')),
  status text not null check (status in ('active', 'paused', 'running')),
  schedule text not null,
  last_execution text not null default '-',
  history_count integer not null default 0
);

create table if not exists automation_rules (
  id text primary key,
  name text not null,
  metric text not null check (metric in ('cpu', 'memory', 'disk', 'website', 'ssl', 'service')),
  condition text not null default '>',
  threshold text not null,
  action text not null,
  severity text not null default 'warning' check (severity in ('critical', 'warning', 'information')),
  approval_required boolean not null default false,
  status text not null default 'active' check (status in ('active', 'paused')),
  updated_at timestamptz not null default now()
);

create table if not exists automation_runs (
  id text primary key,
  automation_id text references automations(id) on delete set null,
  automation_name text not null,
  target_server text not null default '-',
  status text not null check (status in ('success', 'failed', 'running', 'blocked')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  message text not null default '-'
);

create index if not exists automation_runs_started_idx on automation_runs(started_at desc);

create table if not exists maintenances (
  id text primary key,
  title text not null,
  "scheduledDate" text not null,
  "targetServer" text not null,
  status text not null check (status in ('Scheduled', 'Completed', 'In Progress')),
  "engineerAction" text,
  result text
);

create table if not exists backups (
  id text primary key,
  date text not null,
  server text not null,
  size text not null,
  status text not null check (status in ('Success', 'Failed', 'Verifying'))
);

create table if not exists support_tickets (
  id text primary key,
  "ticketNumber" text not null,
  subject text not null,
  category text not null check (category in ('Server Issue', 'Maintenance Request', 'Configuration Request', 'General Question')),
  status text not null check (status in ('Open', 'In Progress', 'Resolved')),
  "lastUpdated" text not null,
  messages jsonb not null default '[]'::jsonb
);

create table if not exists billing_accounts (
  id text primary key,
  company_name text not null default '-',
  plan_id text not null default '',
  plan_name text not null default 'No active plan',
  status text not null default 'not_configured' check (status in ('active', 'trial', 'past_due', 'cancelled', 'not_configured')),
  billing_cycle text not null default 'manual' check (billing_cycle in ('monthly', 'yearly', 'manual')),
  price text not null default '-',
  currency text not null default 'IDR',
  renewal_date text not null default '-',
  server_limit integer,
  payment_provider text not null default 'not configured',
  payment_status text not null default 'not_configured' check (payment_status in ('configured', 'not_configured', 'failed')),
  updated_at timestamptz not null default now()
);

create table if not exists billing_plans (
  id text primary key,
  name text not null,
  price text not null default '-',
  currency text not null default 'IDR',
  billing_cycle text not null default 'manual' check (billing_cycle in ('monthly', 'yearly', 'manual')),
  server_limit integer,
  monitoring_interval text not null default '-',
  support_level text not null default '-',
  backup_retention text not null default '-',
  features jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'archived'))
);

create table if not exists billing_invoices (
  id text primary key,
  invoice_number text not null unique,
  date text not null default '-',
  due_date text not null default '-',
  amount text not null default '-',
  currency text not null default 'IDR',
  status text not null default 'unpaid' check (status in ('paid', 'unpaid', 'overdue', 'void'))
);

create table if not exists billing_plan_requests (
  id text primary key,
  current_plan text not null default '-',
  requested_plan text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  requested_at timestamptz not null default now(),
  note text not null default '-'
);

create index if not exists billing_plan_requests_requested_idx on billing_plan_requests(requested_at desc);

create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  phone text not null,
  company_name text not null,
  company_address text not null,
  company_phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, full_name, phone, company_name, company_address, company_phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'company_name', ''),
    coalesce(new.raw_user_meta_data->>'company_address', ''),
    coalesce(new.raw_user_meta_data->>'company_phone', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    phone = excluded.phone,
    company_name = excluded.company_name,
    company_address = excluded.company_address,
    company_phone = excluded.company_phone,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

insert into billing_plans (id, name, price, currency, billing_cycle, server_limit, monitoring_interval, support_level, backup_retention, features, status)
values
  ('basic', 'BASIC', 'Rp350.000', 'IDR', 'monthly', 1, '5 menit', 'Jam kerja, respons 1x24 jam', 'Status check', '["CPU, RAM, disk monitoring", "Website uptime check", "Dashboard alert basic", "Backup status check", "Laporan bulanan"]'::jsonb, 'active'),
  ('pro', 'PRO', 'Rp800.000', 'IDR', 'monthly', 5, '1 menit', 'Prioritas, respons 6 jam', 'Detail monitoring', '["Semua fitur BASIC", "SSL/domain status", "Backup monitoring detail", "Maintenance reminder", "Laporan mingguan", "Rekomendasi optimasi server"]'::jsonb, 'active'),
  ('ultimate', 'ULTIMATE', 'Rp1.500.000', 'IDR', 'monthly', 15, '1 menit', 'Prioritas tinggi, respons 2 jam', 'Detail monitoring + review', '["Semua fitur PRO", "Automation rules dengan approval", "Auto health-check via connector aktif", "Incident report", "Security monitoring basic", "Monthly performance review", "Custom workflow ringan"]'::jsonb, 'active')
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  currency = excluded.currency,
  billing_cycle = excluded.billing_cycle,
  server_limit = excluded.server_limit,
  monitoring_interval = excluded.monitoring_interval,
  support_level = excluded.support_level,
  backup_retention = excluded.backup_retention,
  features = excluded.features,
  status = excluded.status;

alter table servers enable row level security;
alter table alerts enable row level security;
alter table metric_snapshots enable row level security;
alter table notification_channels enable row level security;
alter table notification_deliveries enable row level security;
alter table automations enable row level security;
alter table automation_rules enable row level security;
alter table automation_runs enable row level security;
alter table maintenances enable row level security;
alter table backups enable row level security;
alter table support_tickets enable row level security;
alter table billing_accounts enable row level security;
alter table billing_plans enable row level security;
alter table billing_invoices enable row level security;
alter table billing_plan_requests enable row level security;
alter table user_profiles enable row level security;

do $$ begin
  create policy "public read servers" on servers for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read alerts" on alerts for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read metric_snapshots" on metric_snapshots for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read notification_channels" on notification_channels for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read notification_deliveries" on notification_deliveries for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read automations" on automations for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read automation_rules" on automation_rules for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read automation_runs" on automation_runs for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read maintenances" on maintenances for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read backups" on backups for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read support_tickets" on support_tickets for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read billing_accounts" on billing_accounts for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read billing_plans" on billing_plans for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read billing_invoices" on billing_invoices for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read billing_plan_requests" on billing_plan_requests for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "users read own profile" on user_profiles for select using (auth.uid() = id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "users update own profile" on user_profiles for update using (auth.uid() = id) with check (auth.uid() = id);
exception when duplicate_object then null; end $$;
