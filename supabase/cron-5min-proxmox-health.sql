create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule(jobid)
from cron.job
where jobname = 'syncera-proxmox-health';

select cron.schedule(
  'syncera-proxmox-health',
  '*/5 * * * *',
  $$
  select pg_net.http_post(
    url := 'https://sync.ipt.solutions/api/automation/run',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{"type":"proxmox_health_check"}'::jsonb
  );
  $$
);
