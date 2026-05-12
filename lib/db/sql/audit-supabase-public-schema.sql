select schemaname || '.' || tablename as table_name, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

select
  grantee,
  table_name,
  string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
group by grantee, table_name
order by grantee, table_name;
