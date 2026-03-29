create extension if not exists "pgcrypto";

create type conversation_status as enum ('active', 'archived');
create type message_role as enum ('user', 'assistant', 'system');

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  name          text,
  avatar_url    text,
  provider      text not null default 'google',
  provider_id   text not null unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger users_updated_at
before update on users
for each row execute function update_updated_at();

create table conversations (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  model         text not null,
  title         text not null,
  token_count   int not null default 0,
  status        conversation_status not null default 'active',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger conversations_updated_at
before update on conversations
for each row execute function update_updated_at();

create table messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role            message_role not null,
  content         jsonb not null,
  token_estimate  int not null default 0,
  sequence        int not null,
  created_at      timestamptz not null default now()
);

create index messages_conversation_id_sequence_idx on messages(conversation_id, sequence);
