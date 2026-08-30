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

alter table notification_channels enable row level security;
alter table notification_deliveries enable row level security;

do $$ begin
  create policy "public read notification_channels" on notification_channels for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read notification_deliveries" on notification_deliveries for select using (true);
exception when duplicate_object then null; end $$;
