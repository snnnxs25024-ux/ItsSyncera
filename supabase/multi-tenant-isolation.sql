-- Its Syncera multi-tenant isolation
-- Run once in Supabase SQL Editor before deploying scoped API.

create extension if not exists pgcrypto;

alter table if exists incident_events add column if not exists occurred_at timestamptz not null default now();
alter table if exists notification_deliveries add column if not exists sent_at timestamptz not null default now();
alter table if exists automation_runs add column if not exists started_at timestamptz not null default now();
alter table if exists billing_plan_requests add column if not exists requested_at timestamptz not null default now();

do $$
declare
  fallback_owner uuid;
  tbl text;
begin
  select id into fallback_owner
  from auth.users
  where email = 'pratama@ipt.solutions'
  order by created_at
  limit 1;

  foreach tbl in array array[
    'servers', 'alerts', 'metric_snapshots', 'notification_channels', 'notification_deliveries',
    'incident_events', 'automations', 'automation_rules', 'automation_runs', 'maintenances',
    'backups', 'support_tickets', 'billing_accounts', 'billing_invoices', 'billing_plan_requests'
  ] loop
    if to_regclass('public.' || tbl) is not null then
      execute format('alter table %I add column if not exists owner_user_id uuid references auth.users(id) on delete cascade', tbl);
      if fallback_owner is not null then
        execute format('update %I set owner_user_id = $1 where owner_user_id is null', tbl) using fallback_owner;
      end if;
      execute format('alter table %I enable row level security', tbl);
      execute format('drop policy if exists %I on %I', 'public read ' || tbl, tbl);
      execute format('drop policy if exists %I on %I', 'owners read ' || tbl, tbl);
      execute format('create policy %I on %I for select using (auth.uid() = owner_user_id)', 'owners read ' || tbl, tbl);
      execute format('create index if not exists %I on %I(owner_user_id)', tbl || '_owner_idx', tbl);
    end if;
  end loop;

  if to_regclass('public.metric_snapshots') is not null and to_regclass('public.servers') is not null then
    update metric_snapshots m set owner_user_id = s.owner_user_id
    from servers s
    where m.server_id = s.id and m.owner_user_id is null and s.owner_user_id is not null;
  end if;

  if to_regclass('public.notification_channels') is not null and to_regclass('public.servers') is not null then
    update notification_channels n set owner_user_id = s.owner_user_id
    from servers s
    where n.server_id = s.id and n.owner_user_id is null and s.owner_user_id is not null;
  end if;

  if to_regclass('public.notification_deliveries') is not null and to_regclass('public.notification_channels') is not null then
    update notification_deliveries d set owner_user_id = n.owner_user_id
    from notification_channels n
    where d.channel_id = n.id and d.owner_user_id is null and n.owner_user_id is not null;
  end if;

  if to_regclass('public.incident_events') is not null and to_regclass('public.servers') is not null then
    update incident_events i set owner_user_id = s.owner_user_id
    from servers s
    where i.server_id = s.id and i.owner_user_id is null and s.owner_user_id is not null;
  end if;
end $$;

do $$
begin
  if to_regclass('public.metric_snapshots') is not null then
    execute 'create index if not exists metric_snapshots_owner_time_idx on metric_snapshots(owner_user_id, server_id, created_at desc)';
  end if;
  if to_regclass('public.notification_channels') is not null then
    execute 'create index if not exists notification_channels_owner_server_idx on notification_channels(owner_user_id, server_id, enabled)';
  end if;
  if to_regclass('public.notification_deliveries') is not null then
    execute 'create index if not exists notification_deliveries_owner_time_idx on notification_deliveries(owner_user_id, sent_at desc)';
  end if;
  if to_regclass('public.incident_events') is not null then
    execute 'create index if not exists incident_events_owner_time_idx on incident_events(owner_user_id, occurred_at desc)';
  end if;
  if to_regclass('public.automation_runs') is not null then
    execute 'create index if not exists automation_runs_owner_time_idx on automation_runs(owner_user_id, started_at desc)';
  end if;
  if to_regclass('public.billing_plan_requests') is not null then
    execute 'create index if not exists billing_plan_requests_owner_time_idx on billing_plan_requests(owner_user_id, requested_at desc)';
  end if;
end $$;

select
  (select count(*) from servers where owner_user_id is null) as unowned_servers,
  (select count(*) from alerts where owner_user_id is null) as unowned_alerts,
  (select count(*) from automation_runs where owner_user_id is null) as unowned_runs,
  (select count(*) from incident_events where owner_user_id is null) as unowned_incidents;
