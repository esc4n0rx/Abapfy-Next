-- supabase/project_specifications.sql
-- Criação da tabela utilizada pelo gerador de especificações

create table if not exists public.project_specifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  project_type text,
  summary text not null,
  specification text not null,
  context jsonb not null default '{}'::jsonb,
  preferences jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_specifications_user_idx
  on public.project_specifications (user_id, created_at desc);

create trigger set_project_specifications_updated_at
  before update on public.project_specifications
  for each row
  execute procedure public.set_updated_at();
