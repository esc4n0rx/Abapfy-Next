-- Abapfy Chat Mode - Database objects
-- Cria as estruturas necessárias para projetos, sessões e mensagens do consultor virtual

create extension if not exists "uuid-ossp";

create table if not exists chat_projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists chat_projects_user_id_idx on chat_projects(user_id);

create table if not exists chat_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references chat_projects(id) on delete set null,
  title text not null,
  provider text not null,
  model text not null,
  system_prompt text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_activity_at timestamptz not null default timezone('utc', now())
);

create index if not exists chat_sessions_user_id_idx on chat_sessions(user_id);
create index if not exists chat_sessions_project_id_idx on chat_sessions(project_id);
create index if not exists chat_sessions_last_activity_idx on chat_sessions(last_activity_at desc);

create table if not exists chat_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('system','user','assistant')),
  content text not null,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists chat_messages_session_idx on chat_messages(session_id, created_at);
create index if not exists chat_messages_user_idx on chat_messages(user_id);

create or replace function handle_updated_at()
returns trigger as
$$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger chat_projects_set_timestamp
before update on chat_projects
for each row execute procedure handle_updated_at();

create trigger chat_sessions_set_timestamp
before update on chat_sessions
for each row execute procedure handle_updated_at();
