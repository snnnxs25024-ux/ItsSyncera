-- Its Syncera Supabase schema
-- Run in Supabase SQL Editor before enabling real data.

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

create table if not exists automations (
  id text primary key,
  name text not null,
  type text not null check (type in ('backup', 'restart', 'cleanup', 'health_check', 'monitoring')),
  status text not null check (status in ('active', 'paused', 'running')),
  schedule text not null,
  "lastExecution" text not null,
  "historyCount" integer not null default 0
);

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

alter table servers enable row level security;
alter table alerts enable row level security;
alter table metric_snapshots enable row level security;
alter table automations enable row level security;
alter table maintenances enable row level security;
alter table backups enable row level security;
alter table support_tickets enable row level security;

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
  create policy "public read automations" on automations for select using (true);
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
