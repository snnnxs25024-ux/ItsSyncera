create table if not exists incident_events (
  id text primary key,
  server_id text references servers(id) on delete set null,
  server_name text not null default '-',
  incident_key text not null,
  severity text not null default 'information' check (severity in ('critical', 'warning', 'information')),
  event_type text not null default 'note' check (event_type in ('detected', 'action', 'resolved', 'note')),
  title text not null,
  detail text not null default '-',
  actor text not null default 'Syncera',
  occurred_at timestamptz not null default now()
);

create index if not exists incident_events_time_idx on incident_events(occurred_at desc);
create index if not exists incident_events_key_idx on incident_events(incident_key, occurred_at desc);

alter table incident_events enable row level security;

do $$ begin
  create policy "public read incident_events" on incident_events for select using (true);
exception when duplicate_object then null; end $$;
