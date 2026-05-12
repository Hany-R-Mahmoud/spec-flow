begin;

alter table public.projects enable row level security;
alter table public.projects force row level security;

alter table public.sessions enable row level security;
alter table public.sessions force row level security;

alter table public.workflow_artifacts enable row level security;
alter table public.workflow_artifacts force row level security;

alter table public.settings enable row level security;
alter table public.settings force row level security;

alter table public.export_packages enable row level security;
alter table public.export_packages force row level security;

alter table public.export_items enable row level security;
alter table public.export_items force row level security;

alter table public.integration_config enable row level security;
alter table public.integration_config force row level security;

revoke all privileges on table public.projects from anon, authenticated;
revoke all privileges on table public.sessions from anon, authenticated;
revoke all privileges on table public.workflow_artifacts from anon, authenticated;
revoke all privileges on table public.settings from anon, authenticated;
revoke all privileges on table public.export_packages from anon, authenticated;
revoke all privileges on table public.export_items from anon, authenticated;
revoke all privileges on table public.integration_config from anon, authenticated;

alter default privileges in schema public revoke all on tables from anon, authenticated;

commit;
