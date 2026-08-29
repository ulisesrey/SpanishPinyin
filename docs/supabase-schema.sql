-- Run this once in the Supabase SQL editor.
--
-- The app is a static site with no backend, so the anon key is public and every write comes
-- from an untrusted browser. These policies therefore allow insert and nothing else: no
-- select, no update, no delete. See docs/adr/0001-static-site-with-insert-only-supabase.md.

create table if not exists participants (
  id uuid primary key,
  country text not null,
  dialect_self_description text,
  mandarin_exposure text not null check (
    mandarin_exposure in ('none', 'heard', 'studied_some', 'fluent')
  ),
  knows_pinyin boolean not null,
  created_at timestamptz not null default now(),
  constraint country_length check (char_length(country) <= 64),
  constraint dialect_length check (char_length(dialect_self_description) <= 200)
);

create table if not exists transcriptions (
  id bigint generated always as identity primary key,
  participant_id uuid not null references participants (id),
  clip_id text not null,
  text text,
  skipped boolean not null,
  replays integer not null check (replays >= 0),
  ms_to_submit integer not null check (ms_to_submit >= 0),
  batch_number integer not null check (batch_number > 0),
  position_in_batch integer not null check (position_in_batch > 0),
  created_at timestamptz not null default now(),
  constraint clip_id_length check (char_length(clip_id) <= 128),
  constraint text_length check (char_length(text) <= 200),
  -- A Skip carries no text, and a Transcription is not a Skip.
  constraint skip_has_no_text check ((skipped and text is null) or (not skipped and text is not null))
);

create index if not exists transcriptions_clip_id_idx on transcriptions (clip_id);
create index if not exists transcriptions_participant_id_idx on transcriptions (participant_id);

alter table participants enable row level security;
alter table transcriptions enable row level security;

grant insert on table participants to anon, authenticated;
grant insert on table transcriptions to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Scoped to public rather than anon: a publishable key may resolve to either role, and the
-- restriction that matters is the command, not the role.
drop policy if exists "anon can insert participants" on participants;
drop policy if exists "anyone can insert participants" on participants;
create policy "anyone can insert participants" on participants
  for insert to public with check (true);

drop policy if exists "anon can insert transcriptions" on transcriptions;
drop policy if exists "anyone can insert transcriptions" on transcriptions;
create policy "anyone can insert transcriptions" on transcriptions
  for insert to public with check (true);
